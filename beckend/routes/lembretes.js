import express from "express";
import {
    getAll,
    getById,
    create,
    update,
    remove
} from "../controllers/lembreteController.js";
import { requireAuth } from "../middlewares/auth.js";

const router = express.Router();
router.use(requireAuth);

// ROTAS CRUD
router.get("/", getAll);        // Listar todos
router.get("/:id", getById);    // Buscar por ID
router.post("/", create);       // Criar
router.put("/:id", update);     // Atualizar
router.delete("/:id", remove);  // Deletar

export default router;
