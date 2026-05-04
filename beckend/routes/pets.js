import express from "express";
import {
  criarPet,
  listarPets,
  buscarPet,
  atualizarPet,
  deletarPet
} from "../controllers/petController.js";
import upload from "../middlewares/uploadPetPhoto.js";
import { requireAuth } from "../middlewares/auth.js";

const router = express.Router();
router.use(requireAuth);

// CRUD Pets
router.post("/add", upload.single("foto"), criarPet);
router.get("/", listarPets);
router.get("/:id", buscarPet);
router.put("/:id", atualizarPet);
router.delete("/:id", deletarPet);

export default router;
