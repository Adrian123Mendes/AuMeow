import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const db = mysql.createPool({
  host: process.env.DB_HOST ?? 'localhost',
  port: Number(process.env.DB_PORT ?? 3306),
  user: process.env.DB_USER ?? 'root',
  password: process.env.DB_PASSWORD ?? 'sua_senha',
  database: process.env.DB_NAME ?? 'seu_banco',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

async function ensureDatabaseSchema() {
  const databaseName = process.env.DB_NAME ?? 'seu_banco';

  const [columns] = await db.query(
    `SELECT COLUMN_NAME
       FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = ?
        AND TABLE_NAME = 'lembretes'
        AND COLUMN_NAME = 'id_usuario'`,
    [databaseName]
  );

  if (columns.length === 0) {
    await db.query(`
      ALTER TABLE lembretes
      ADD COLUMN id_usuario INT NOT NULL DEFAULT 1,
      ADD CONSTRAINT fk_lembretes_usuario
        FOREIGN KEY (id_usuario) REFERENCES usuarios(id)
        ON DELETE CASCADE
    `);
  }

  await db.query(`
    CREATE TABLE IF NOT EXISTS social_convites (
      id INT AUTO_INCREMENT PRIMARY KEY,
      id_remetente INT NOT NULL,
      id_destinatario INT NOT NULL,
      status ENUM('pending', 'accepted', 'rejected') NOT NULL DEFAULT 'pending',
      criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      respondido_em TIMESTAMP NULL,
      CONSTRAINT fk_social_convites_remetente
        FOREIGN KEY (id_remetente) REFERENCES usuarios(id)
        ON DELETE CASCADE,
      CONSTRAINT fk_social_convites_destinatario
        FOREIGN KEY (id_destinatario) REFERENCES usuarios(id)
        ON DELETE CASCADE,
      INDEX idx_social_convites_destinatario_status (id_destinatario, status),
      INDEX idx_social_convites_remetente_status (id_remetente, status)
    )
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS social_conversas (
      id INT AUTO_INCREMENT PRIMARY KEY,
      criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS social_conversa_participantes (
      id_conversa INT NOT NULL,
      id_usuario INT NOT NULL,
      criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id_conversa, id_usuario),
      CONSTRAINT fk_social_participantes_conversa
        FOREIGN KEY (id_conversa) REFERENCES social_conversas(id)
        ON DELETE CASCADE,
      CONSTRAINT fk_social_participantes_usuario
        FOREIGN KEY (id_usuario) REFERENCES usuarios(id)
        ON DELETE CASCADE,
      INDEX idx_social_participantes_usuario (id_usuario)
    )
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS social_mensagens (
      id INT AUTO_INCREMENT PRIMARY KEY,
      id_conversa INT NOT NULL,
      id_usuario INT NOT NULL,
      conteudo TEXT NOT NULL,
      criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT fk_social_mensagens_conversa
        FOREIGN KEY (id_conversa) REFERENCES social_conversas(id)
        ON DELETE CASCADE,
      CONSTRAINT fk_social_mensagens_usuario
        FOREIGN KEY (id_usuario) REFERENCES usuarios(id)
        ON DELETE CASCADE,
      INDEX idx_social_mensagens_conversa_criado (id_conversa, criado_em)
    )
  `);
}

export { db, ensureDatabaseSchema };
