import { db } from "../db.js";

const MAX_MESSAGE_LENGTH = 1000;

function normalizeMessage(content) {
  return typeof content === "string" ? content.trim() : "";
}

async function userParticipatesInConversation(conversationId, userId, connection = db) {
  const [rows] = await connection.query(
    `SELECT 1
       FROM social_conversa_participantes
      WHERE id_conversa = ?
        AND id_usuario = ?
      LIMIT 1`,
    [conversationId, userId]
  );

  return rows.length > 0;
}

async function findDirectConversation(userAId, userBId, connection = db) {
  const [rows] = await connection.query(
    `SELECT c.id
       FROM social_conversas c
       JOIN social_conversa_participantes p1
         ON p1.id_conversa = c.id
        AND p1.id_usuario = ?
       JOIN social_conversa_participantes p2
         ON p2.id_conversa = c.id
        AND p2.id_usuario = ?
      WHERE (
        SELECT COUNT(*)
          FROM social_conversa_participantes p3
         WHERE p3.id_conversa = c.id
      ) = 2
      LIMIT 1`,
    [userAId, userBId]
  );

  return rows[0]?.id || null;
}

async function createDirectConversation(userAId, userBId, connection = db) {
  const existingId = await findDirectConversation(userAId, userBId, connection);
  if (existingId) return existingId;

  const [result] = await connection.query("INSERT INTO social_conversas () VALUES ()");
  const conversationId = result.insertId;

  await connection.query(
    `INSERT INTO social_conversa_participantes (id_conversa, id_usuario)
     VALUES (?, ?), (?, ?)`,
    [conversationId, userAId, conversationId, userBId]
  );

  return conversationId;
}

async function getMessageById(messageId, currentUserId, connection = db) {
  const [rows] = await connection.query(
    `SELECT
        m.id,
        m.id_conversa,
        m.id_usuario,
        u.nome AS usuario_nome,
        m.conteudo,
        m.criado_em,
        CASE WHEN m.id_usuario = ? THEN 1 ELSE 0 END AS enviada_por_mim
       FROM social_mensagens m
       JOIN usuarios u ON u.id = m.id_usuario
      WHERE m.id = ?`,
    [currentUserId, messageId]
  );

  return rows[0] || null;
}

export async function listInvites(req, res) {
  try {
    const [rows] = await db.query(
      `SELECT
          c.id,
          c.criado_em,
          u.id AS remetente_id,
          u.nome AS remetente_nome,
          u.email AS remetente_email
         FROM social_convites c
         JOIN usuarios u ON u.id = c.id_remetente
        WHERE c.id_destinatario = ?
          AND c.status = 'pending'
        ORDER BY c.criado_em DESC`,
      [req.user.id]
    );

    res.json(rows);
  } catch (error) {
    console.error("Erro ao listar convites sociais:", error);
    res.status(500).json({ error: "Erro ao listar convites." });
  }
}

export async function createInvite(req, res) {
  const email = req.body.email?.trim().toLowerCase();

  if (!email) {
    return res.status(400).json({ error: "Informe o e-mail do amigo." });
  }

  try {
    const [users] = await db.query(
      "SELECT id, nome, email FROM usuarios WHERE email = ?",
      [email]
    );

    if (users.length === 0) {
      return res.status(404).json({ error: "Usuário não encontrado." });
    }

    const target = users[0];
    if (target.id === req.user.id) {
      return res.status(400).json({ error: "Você não pode adicionar a si mesmo." });
    }

    const existingConversationId = await findDirectConversation(req.user.id, target.id);
    if (existingConversationId) {
      return res.status(409).json({ error: "Você já possui uma conversa com este usuário." });
    }

    const [pending] = await db.query(
      `SELECT id, id_remetente, id_destinatario
         FROM social_convites
        WHERE status = 'pending'
          AND (
            (id_remetente = ? AND id_destinatario = ?)
            OR
            (id_remetente = ? AND id_destinatario = ?)
          )
        LIMIT 1`,
      [req.user.id, target.id, target.id, req.user.id]
    );

    if (pending.length > 0) {
      return res.status(409).json({ error: "Já existe um convite pendente entre vocês." });
    }

    const [result] = await db.query(
      `INSERT INTO social_convites (id_remetente, id_destinatario)
       VALUES (?, ?)`,
      [req.user.id, target.id]
    );

    res.status(201).json({
      id: result.insertId,
      destinatario: target,
      message: "Convite enviado."
    });
  } catch (error) {
    console.error("Erro ao criar convite social:", error);
    res.status(500).json({ error: "Erro ao enviar convite." });
  }
}

export async function respondInvite(req, res) {
  const { id } = req.params;
  const action = req.body.action;

  if (!["accept", "reject"].includes(action)) {
    return res.status(400).json({ error: "Ação inválida." });
  }

  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const [invites] = await connection.query(
      `SELECT *
         FROM social_convites
        WHERE id = ?
          AND id_destinatario = ?
          AND status = 'pending'
        FOR UPDATE`,
      [id, req.user.id]
    );

    if (invites.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: "Convite não encontrado." });
    }

    const invite = invites[0];
    const newStatus = action === "accept" ? "accepted" : "rejected";
    let conversationId = null;

    await connection.query(
      `UPDATE social_convites
          SET status = ?,
              respondido_em = CURRENT_TIMESTAMP
        WHERE id = ?`,
      [newStatus, invite.id]
    );

    if (action === "accept") {
      conversationId = await createDirectConversation(
        invite.id_remetente,
        invite.id_destinatario,
        connection
      );

      await connection.query(
        `UPDATE social_convites
            SET status = 'rejected',
                respondido_em = CURRENT_TIMESTAMP
          WHERE status = 'pending'
            AND (
              (id_remetente = ? AND id_destinatario = ?)
              OR
              (id_remetente = ? AND id_destinatario = ?)
            )`,
        [
          invite.id_remetente,
          invite.id_destinatario,
          invite.id_destinatario,
          invite.id_remetente
        ]
      );
    }

    await connection.commit();
    res.json({
      message: action === "accept" ? "Convite aceito." : "Convite recusado.",
      conversationId
    });
  } catch (error) {
    await connection.rollback();
    console.error("Erro ao responder convite social:", error);
    res.status(500).json({ error: "Erro ao responder convite." });
  } finally {
    connection.release();
  }
}

export async function listConversations(req, res) {
  try {
    const [rows] = await db.query(
      `SELECT
          c.id,
          c.criado_em,
          u.id AS outro_usuario_id,
          u.nome AS outro_usuario_nome,
          u.email AS outro_usuario_email,
          m.id AS ultima_mensagem_id,
          m.conteudo AS ultima_mensagem,
          m.criado_em AS ultima_mensagem_em,
          m.id_usuario AS ultima_mensagem_usuario_id
         FROM social_conversas c
         JOIN social_conversa_participantes atual
           ON atual.id_conversa = c.id
          AND atual.id_usuario = ?
         JOIN social_conversa_participantes outro
           ON outro.id_conversa = c.id
          AND outro.id_usuario <> ?
         JOIN usuarios u ON u.id = outro.id_usuario
         LEFT JOIN social_mensagens m
           ON m.id = (
             SELECT sm.id
               FROM social_mensagens sm
              WHERE sm.id_conversa = c.id
              ORDER BY sm.criado_em DESC, sm.id DESC
              LIMIT 1
           )
        ORDER BY COALESCE(m.criado_em, c.criado_em) DESC, c.id DESC`,
      [req.user.id, req.user.id]
    );

    res.json(rows);
  } catch (error) {
    console.error("Erro ao listar conversas sociais:", error);
    res.status(500).json({ error: "Erro ao listar conversas." });
  }
}

export async function listMessages(req, res) {
  const { id } = req.params;

  try {
    const allowed = await userParticipatesInConversation(id, req.user.id);
    if (!allowed) {
      return res.status(404).json({ error: "Conversa não encontrada." });
    }

    const [rows] = await db.query(
      `SELECT
          m.id,
          m.id_conversa,
          m.id_usuario,
          u.nome AS usuario_nome,
          m.conteudo,
          m.criado_em,
          CASE WHEN m.id_usuario = ? THEN 1 ELSE 0 END AS enviada_por_mim
         FROM social_mensagens m
         JOIN usuarios u ON u.id = m.id_usuario
        WHERE m.id_conversa = ?
        ORDER BY m.criado_em ASC, m.id ASC`,
      [req.user.id, id]
    );

    res.json(rows);
  } catch (error) {
    console.error("Erro ao listar mensagens sociais:", error);
    res.status(500).json({ error: "Erro ao listar mensagens." });
  }
}

export async function sendMessage(req, res) {
  const { id } = req.params;
  const content = normalizeMessage(req.body.content);

  if (!content) {
    return res.status(400).json({ error: "Mensagem obrigatória." });
  }

  if (content.length > MAX_MESSAGE_LENGTH) {
    return res.status(400).json({ error: `Mensagem limitada a ${MAX_MESSAGE_LENGTH} caracteres.` });
  }

  try {
    const allowed = await userParticipatesInConversation(id, req.user.id);
    if (!allowed) {
      return res.status(404).json({ error: "Conversa não encontrada." });
    }

    const [result] = await db.query(
      `INSERT INTO social_mensagens (id_conversa, id_usuario, conteudo)
       VALUES (?, ?, ?)`,
      [id, req.user.id, content]
    );

    const message = await getMessageById(result.insertId, req.user.id);
    res.status(201).json(message);
  } catch (error) {
    console.error("Erro ao enviar mensagem social:", error);
    res.status(500).json({ error: "Erro ao enviar mensagem." });
  }
}
