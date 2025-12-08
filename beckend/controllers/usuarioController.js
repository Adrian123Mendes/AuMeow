import { db } from "../db.js";
import bcrypt from "bcrypt";

export const criarUsuario = async (req, res) => {
  const { nome, email, senha, telefone } = req.body;

  try {
    const senhaCriptografada = await bcrypt.hash(senha, 10);

    await db.query(
      "INSERT INTO usuarios (nome, email, senha, telefone) VALUES (?, ?, ?, ?)",
      [nome, email, senhaCriptografada, telefone]
    );

    res.json({ message: "Usuário criado com sucesso!" });

  } catch (error) {
    console.error("Erro ao criar usuário:", error);
    res.status(500).json({ error: "Erro ao criar usuário." });
  }
};

export const listarUsuarios = async (req, res) => {
  const [rows] = await db.query("SELECT * FROM usuarios");
  res.json(rows);
};

export const buscarUsuario = async (req, res) => {
  const { id } = req.params;

  const [rows] = await db.query("SELECT * FROM usuarios WHERE id = ?", [id]);

  if (rows.length === 0) {
    return res.status(404).json({ error: "Usuário não encontrado" });
  }

  res.json(rows[0]);
};

export const deletarUsuario = async (req, res) => {
  const { id } = req.params;

  await db.query("DELETE FROM usuarios WHERE id = ?", [id]);

  res.json({ message: "Usuário removido com sucesso" });
};
