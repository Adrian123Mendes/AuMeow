import express from "express";
import {
  criarUsuario,
  listarUsuarios,
  buscarUsuario,
  deletarUsuario
} from "../controllers/usuarioController.js";

const router = express.Router();

router.post("/", criarUsuario);
router.get("/", listarUsuarios);
router.get("/:id", buscarUsuario);
router.delete("/:id", deletarUsuario);

export default router;
