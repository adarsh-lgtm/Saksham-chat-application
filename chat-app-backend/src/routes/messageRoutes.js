// src/routes/messageRoutes.js
const express = require("express");
const router = express.Router();
const {
  getMessages,
  sendMessage,
  markAsRead,
  getConversations,
} = require("../controllers/messageController");
const { authenticate } = require("../middleware/authMiddleware");
router.use(authenticate); // All message routes require authentication
router.get("/conversations", getConversations);
router.get("/:conversationType/:conversationId", getMessages);
router.post("/send", sendMessage);
router.put("/read/:conversationId", markAsRead);
module.exports = router;