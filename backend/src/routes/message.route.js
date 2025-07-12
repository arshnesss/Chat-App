import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { getMessages, getUsersForSidebar, sendMessage, toggleLikeMessage } from "../controllers/message.controller.js";

const router = express.Router();

router.get("/users", protectRoute, getUsersForSidebar);
router.get("/:id", protectRoute, getMessages); //dynamic value

router.post("/send/:id", protectRoute, sendMessage);

router.patch("/like/:messageId", protectRoute, toggleLikeMessage);

export default router;