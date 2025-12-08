import express from "express";
import { generateResponse } from "../controllers/iaController.js";

const router = express.Router();

// Rota de teste IA
router.post("/chat", generateResponse);

export default router;
