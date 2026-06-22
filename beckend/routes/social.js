import express from "express";
import {
  createInvite,
  listConversations,
  listInvites,
  listMessages,
  respondInvite,
  sendMessage
} from "../controllers/socialController.js";
import { requireAuth } from "../middlewares/auth.js";

const router = express.Router();
router.use(requireAuth);

router.get("/invites", listInvites);
router.post("/invites", createInvite);
router.patch("/invites/:id", respondInvite);
router.get("/conversations", listConversations);
router.get("/conversations/:id/messages", listMessages);
router.post("/conversations/:id/messages", sendMessage);

export default router;
