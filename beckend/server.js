import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import petRoutes from "./routes/pets.js";
import iaRoutes from "./routes/ia.js";
import lembreteRoutes from "./routes/lembretes.js";  // ⭐ IMPORT NOVO

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use("/uploads/pets", express.static("uploads/pets"));

// Rotas
app.use("/api/pets", petRoutes);
app.use("/api/ia", iaRoutes);
app.use("/api/lembretes", lembreteRoutes);  // ⭐ REGISTRO NOVO

// Rota de teste
app.get("/", (req, res) => {
  res.send("API AuMeow funcionando 🚀");
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
