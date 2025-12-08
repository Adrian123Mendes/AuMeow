import { db } from "../db.js";

// Cria um novo pet
export const criarPet = async (req, res) => {
  try {
    const { nome, raca, idade, aniversario } = req.body;

    // Foto enviada pelo multer
    const foto = req.file ? req.file.filename : null;

    // ⚠️ TEMPORÁRIO: até o login estar pronto
    const id_usuario = 1;

    const [result] = await db.query(
      `INSERT INTO pets (nome, raca, idade, aniversario, foto, id_usuario)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [nome, raca, idade, aniversario, foto, id_usuario]
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

// Listar pets
export const listarPets = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM pets ORDER BY criado_em DESC");
    res.json(rows);
  } catch (error) {
    console.error("Erro listarPets:", error);
    res.status(500).json({ error: "Erro ao listar pets." });
  }
};

// Buscar pet por ID
export const buscarPet = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query("SELECT * FROM pets WHERE id = ?", [id]);

    if (rows.length === 0)
      return res.status(404).json({ error: "Pet não encontrado." });

    res.json(rows[0]);
  } catch (error) {
    console.error("Erro buscarPet:", error);
    res.status(500).json({ error: "Erro ao buscar pet." });
  }
};

// Deletar pet
export const deletarPet = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query("DELETE FROM pets WHERE id = ?", [id]);
    res.json({ message: "Pet removido com sucesso." });
  } catch (error) {
    console.error("Erro deletarPet:", error);
    res.status(500).json({ error: "Erro ao remover pet." });
  }
};
export const atualizarPet = async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, raca, idade, aniversario, foto, signo } = req.body;

    await db.query(
      `UPDATE pets SET nome = ?, raca = ?, idade = ?, aniversario = ?, foto = ?, signo = ?
       WHERE id = ?`,
      [nome, raca, idade, aniversario, foto, signo, id]
    );

    const [rows] = await db.query("SELECT * FROM pets WHERE id = ?", [id]);
    res.json(rows[0]);

  } catch (error) {
    console.error("Erro atualizarPet:", error);
    res.status(500).json({ error: "Erro ao atualizar pet." });
  }
};
