

const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/auth.middleware")
const chatController = require("../controllers/chat.controller")

// POST /api/chat/
// Middleware is used because, user can create chat only if he's logged in
router.post("/", authMiddleware.authUser, chatController.createChat)

// GET /api/chat/
router.get("/", authMiddleware.authUser, chatController.getChats)

// GET /api/chat/messages/:id
router.get("/messages/:id", authMiddleware.authUser, chatController.getMessages)

// DELETE /api/chat/:id
router.delete("/:chatId", authMiddleware.authUser, chatController.deleteChat)

module.exports = router;
