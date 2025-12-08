import { db } from "../db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const login = async (req, res) => {
  const { email, senha } = req.body;

  try {
    // Procurando usuário na tabela usuarios
    const [rows] = await db.query(
      "SELECT * FROM usuarios WHERE email = ?",
      [email]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: "Usuário não encontrado." });
    }

    const usuario = rows[0];

    // Comparar senhas
    const senhaMatch = await bcrypt.compare(senha, usuario.senha);

    if (!senhaMatch) {
      return res.status(401).json({ error: "Senha incorreta." });
    }

    // Criar token
    const token = jwt.sign(
      { id: usuario.id, nome: usuario.nome },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    );

    res.json({
      message: "Login realizado com sucesso.",
      token,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email
      }
    });

  } catch (error) {
    console.error("Erro no login:", error);
    res.status(500).json({ error: "Erro interno no servidor." });
  }
};
