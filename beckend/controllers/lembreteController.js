import { db } from "../db.js";

// ==============================
// LISTAR TODOS
// ==============================
export const getAll = async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT * FROM lembretes
            ORDER BY data_hora ASC
        `);
        res.json(rows);
    } catch (err) {
        console.error("Erro ao listar lembretes:", err);
        res.status(500).json({ error: "Erro ao listar lembretes" });
    }
};


// ==============================
// BUSCAR POR ID
// ==============================
export const getById = async (req, res) => {
    const { id } = req.params;

    try {
        const [rows] = await db.query("SELECT * FROM lembretes WHERE id = ?", [id]);
        if (rows.length === 0) {
            return res.status(404).json({ error: "Lembrete não encontrado" });
        }

        res.json(rows[0]);
    } catch (err) {
        console.error("Erro ao buscar lembrete:", err);
        res.status(500).json({ error: "Erro ao buscar lembrete" });
    }
};

// ==============================
// CRIAR NOVO
// ==============================
export const create = async (req, res) => {
    const { titulo, tipo, dataHora, localEvento, descricao } = req.body;

    if (!titulo || !tipo || !dataHora) {
        return res.status(400).json({ error: "Campos obrigatórios: titulo, tipo, dataHora" });
    }

    try {
        const [result] = await db.query(
            "INSERT INTO lembretes (titulo, tipo, data_hora, local_evento, descricao) VALUES (?, ?, ?, ?, ?)",
            [titulo, tipo, dataHora, localEvento, descricao]
        );

        const insertedId = result.insertId;
        const [novo] = await db.query("SELECT * FROM lembretes WHERE id = ?", [insertedId]);

        res.status(201).json(novo[0]);
    } catch (err) {
        console.error("Erro ao criar lembrete:", err);
        res.status(500).json({ error: "Erro ao criar lembrete" });
    }
};

// ==============================
// ATUALIZAR
// ==============================
export const update = async (req, res) => {
    const { id } = req.params;
    const { titulo, tipo, dataHora, localEvento, descricao } = req.body;

    try {
        const [result] = await db.query(
            "UPDATE lembretes SET titulo=?, tipo=?, data_hora=?, local_evento=?, descricao=? WHERE id=?",
            [titulo, tipo, dataHora, localEvento, descricao, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Lembrete não encontrado" });
        }

        const [atualizado] = await db.query("SELECT * FROM lembretes WHERE id = ?", [id]);

        res.json(atualizado[0]);
    } catch (err) {
        console.error("Erro ao atualizar lembrete:", err);
        res.status(500).json({ error: "Erro ao atualizar lembrete" });
    }
};

// ==============================
// DELETAR
// ==============================
export const remove = async (req, res) => {
    const { id } = req.params;

    try {
        const [result] = await db.query("DELETE FROM lembretes WHERE id = ?", [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Lembrete não encontrado" });
        }

        res.json({ message: "Lembrete removido com sucesso" });
    } catch (err) {
        console.error("Erro ao remover lembrete:", err);
        res.status(500).json({ error: "Erro ao remover lembrete" });
    }
};
