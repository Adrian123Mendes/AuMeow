import { db } from "../db.js";
import bcrypt from "bcrypt";

export const criarUsuario = async (req, res) => {
  const nome = req.body.nome?.trim();
  const email = req.body.email?.trim().toLowerCase();
  const senha = req.body.senha;
  const telefone = req.body.telefone?.trim() || null;

  if (!nome || !email || !senha) {
    return res.status(400).json({ error: "Nome, e-mail e senha são obrigatórios." });
  }

  try {
    const senhaCriptografada = await bcrypt.hash(senha, 10);
    const [result] = await db.query(
      "INSERT INTO usuarios (nome, email, senha, telefone) VALUES (?, ?, ?, ?)",
      [nome, email, senhaCriptografada, telefone]
    );

    res.status(201).json({
      message: "Usuário criado com sucesso!",
      usuario: {
        id: result.insertId,
        nome,
        email,
        telefone
      }
    });
  } catch (error) {
    console.error("Erro ao criar usuário:", error);

    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ error: "Já existe um usuário com esse e-mail." });
    }

    res.status(500).json({ error: "Erro ao criar usuário." });
  }
};

export const listarUsuarios = async (req, res) => {
  const [rows] = await db.query("SELECT id, nome, email, telefone, criado_em FROM usuarios");
  res.json(rows);
};

export const buscarUsuario = async (req, res) => {
  const { id } = req.params;

  const [rows] = await db.query(
    "SELECT id, nome, email, telefone, criado_em FROM usuarios WHERE id = ?",
    [id]
  );

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
