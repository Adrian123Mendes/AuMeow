import { db } from "../db.js";

export const getAll = async (req, res) => {
    try {
        const [rows] = await db.query(
            `SELECT * FROM lembretes
             WHERE id_usuario = ?
             ORDER BY data_hora ASC`,
            [req.user.id]
        );
        res.json(rows);
    } catch (err) {
        console.error("Erro ao listar lembretes:", err);
        res.status(500).json({ error: "Erro ao listar lembretes" });
    }
};

export const getById = async (req, res) => {
    const { id } = req.params;

    try {
        const [rows] = await db.query(
            "SELECT * FROM lembretes WHERE id = ? AND id_usuario = ?",
            [id, req.user.id]
        );
        if (rows.length === 0) {
            return res.status(404).json({ error: "Lembrete nao encontrado" });
        }

        res.json(rows[0]);
    } catch (err) {
        console.error("Erro ao buscar lembrete:", err);
        res.status(500).json({ error: "Erro ao buscar lembrete" });
    }
};

export const create = async (req, res) => {
    const { titulo, tipo, dataHora, localEvento, descricao } = req.body;

    if (!titulo || !tipo || !dataHora) {
        return res.status(400).json({ error: "Campos obrigatorios: titulo, tipo, dataHora" });
    }

    try {
        const [result] = await db.query(
            `INSERT INTO lembretes (titulo, tipo, data_hora, local_evento, descricao, id_usuario)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [titulo, tipo, dataHora, localEvento, descricao, req.user.id]
        );

        const insertedId = result.insertId;
        const [novo] = await db.query(
            "SELECT * FROM lembretes WHERE id = ? AND id_usuario = ?",
            [insertedId, req.user.id]
        );

        res.status(201).json(novo[0]);
    } catch (err) {
        console.error("Erro ao criar lembrete:", err);
        res.status(500).json({ error: "Erro ao criar lembrete" });
    }
};

export const update = async (req, res) => {
    const { id } = req.params;
    const { titulo, tipo, dataHora, localEvento, descricao } = req.body;

    try {
        const [result] = await db.query(
            `UPDATE lembretes
                SET titulo = ?, tipo = ?, data_hora = ?, local_evento = ?, descricao = ?
              WHERE id = ? AND id_usuario = ?`,
            [titulo, tipo, dataHora, localEvento, descricao, id, req.user.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Lembrete nao encontrado" });
        }

        const [atualizado] = await db.query(
            "SELECT * FROM lembretes WHERE id = ? AND id_usuario = ?",
            [id, req.user.id]
        );

        res.json(atualizado[0]);
    } catch (err) {
        console.error("Erro ao atualizar lembrete:", err);
        res.status(500).json({ error: "Erro ao atualizar lembrete" });
    }
};

export const remove = async (req, res) => {
    const { id } = req.params;

    try {
        const [result] = await db.query(
            "DELETE FROM lembretes WHERE id = ? AND id_usuario = ?",
            [id, req.user.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Lembrete nao encontrado" });
        }

        res.json({ message: "Lembrete removido com sucesso" });
    } catch (err) {
        console.error("Erro ao remover lembrete:", err);
        res.status(500).json({ error: "Erro ao remover lembrete" });
    }
};
