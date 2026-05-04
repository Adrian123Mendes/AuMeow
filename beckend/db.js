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
}

export { db, ensureDatabaseSchema };
