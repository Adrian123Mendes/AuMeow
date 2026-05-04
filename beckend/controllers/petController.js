import { db } from "../db.js";

function normalizePetPayload(body) {
  const nome = body.nome?.trim();
  const raca = body.raca?.trim() || null;
  const aniversario = body.aniversario?.trim() || null;
  const idadeRaw = typeof body.idade === "string" ? body.idade.trim() : body.idade;
  const idade = idadeRaw !== undefined && idadeRaw !== null && idadeRaw !== ""
    ? Number.parseInt(idadeRaw, 10)
    : null;
  const signo = aniversario ? body.signo?.trim() || null : null;

  return {
    nome,
    raca,
    aniversario,
    idade: Number.isNaN(idade) ? null : idade,
    signo
  };
}

export const criarPet = async (req, res) => {
  try {
    const { nome, raca, idade, aniversario, signo } = normalizePetPayload(req.body);

    if (!nome) {
      return res.status(400).json({ error: "Nome do pet e obrigatorio." });
    }

    const foto = req.file ? req.file.filename : null;
    const id_usuario = req.user.id;

    const [result] = await db.query(
      `INSERT INTO pets (nome, raca, idade, aniversario, foto, signo, id_usuario)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [nome, raca, idade, aniversario, foto, signo, id_usuario]
    );

    res.json({
      message: "Pet criado com sucesso!",
      id: result.insertId,
      foto
    });
  } catch (error) {
    console.error("Erro ao criar pet:", error);
    res.status(500).json({ error: "Erro ao criar pet" });
  }
};

export const listarPets = async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM pets WHERE id_usuario = ? ORDER BY criado_em DESC",
      [req.user.id]
    );
    res.json(rows);
  } catch (error) {
    console.error("Erro listarPets:", error);
    res.status(500).json({ error: "Erro ao listar pets." });
  }
};

export const buscarPet = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query(
      "SELECT * FROM pets WHERE id = ? AND id_usuario = ?",
      [id, req.user.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Pet nao encontrado." });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error("Erro buscarPet:", error);
    res.status(500).json({ error: "Erro ao buscar pet." });
  }
};

export const deletarPet = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await db.query(
      "DELETE FROM pets WHERE id = ? AND id_usuario = ?",
      [id, req.user.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Pet nao encontrado." });
    }

    res.json({ message: "Pet removido com sucesso." });
  } catch (error) {
    console.error("Erro deletarPet:", error);
    res.status(500).json({ error: "Erro ao remover pet." });
  }
};

export const atualizarPet = async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, raca, idade, aniversario, signo } = normalizePetPayload(req.body);
    const foto = req.body.foto?.trim() || null;

    const [result] = await db.query(
      `UPDATE pets SET nome = ?, raca = ?, idade = ?, aniversario = ?, foto = ?, signo = ?
       WHERE id = ? AND id_usuario = ?`,
      [nome, raca, idade, aniversario, foto, signo, id, req.user.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Pet nao encontrado." });
    }

    const [rows] = await db.query(
      "SELECT * FROM pets WHERE id = ? AND id_usuario = ?",
      [id, req.user.id]
    );
    res.json(rows[0]);
  } catch (error) {
    console.error("Erro atualizarPet:", error);
    res.status(500).json({ error: "Erro ao atualizar pet." });
  }
};
