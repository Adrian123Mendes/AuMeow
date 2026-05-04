import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import petRoutes from "./routes/pets.js";
import iaRoutes from "./routes/ia.js";
import lembreteRoutes from "./routes/lembretes.js";
import authRoutes from "./routes/auth.js";
import usuarioRoutes from "./routes/usuarios.js";
import { ensureDatabaseSchema } from "./db.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use("/uploads/pets", express.static("uploads/pets"));

app.use("/api/auth", authRoutes);
app.use("/api/usuarios", usuarioRoutes);
app.use("/api/pets", petRoutes);
app.use("/api/ia", iaRoutes);
app.use("/api/lembretes", lembreteRoutes);

app.get("/", (req, res) => {
  res.send("API AuMeow funcionando");
});

const PORT = process.env.PORT || 3000;

async function startServer() {
  await ensureDatabaseSchema();
  app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
}

startServer().catch((error) => {
  console.error("Falha ao iniciar o servidor:", error);
  process.exit(1);
});
