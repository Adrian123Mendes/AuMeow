import express from "express";
import {
  criarPet,
  listarPets,
  buscarPet,
  atualizarPet,
  deletarPet
} from "../controllers/petController.js";

import upload from "../middlewares/uploadPetPhoto.js"; // <-- ADICIONE ESTA LINHA

const router = express.Router();

// CRUD Pets
router.post("/add", upload.single("foto"), criarPet);   // <-- ALTERAR ESTA LINHA
router.get("/", listarPets);
router.get("/:id", buscarPet);
router.put("/:id", atualizarPet);
router.delete("/:id", deletarPet);

export default router;
