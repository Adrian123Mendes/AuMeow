import express from "express";
import { generateResponse } from "./beckend/controllers/iaController.js";

const app = express();
app.use(express.json());

// Rota da IA
app.post("/chat", generateResponse);

// Teste rápido
app.get("/", (req, res) => {
  res.send("API rodando");
});

app.listen(3000, () => {
  console.log("Servidor rodando em http://localhost:3000");
});
