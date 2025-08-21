const mongoose = require("mongoose");
const messageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: String,
      required: true,
      index: true,
    },
    conversationType: {
      type: String,
      enum: ["private", "group"],
      required: true,
    },
    senderId: {
      type: String,
      required: true,
    },
    senderName: {
      type: String,
      required: true,
    },
    receiverId: {
      type: String,
      default: null, // For private messages
    },
    groupId: {
      type: String,
      default: null, // For group messages
    },
    message: {
      type: String,
      required: true,
    },
    messageType: {
      type: String,
      enum: ["text", "image", "file"],
      default: "text",
    },
    fileUrl: {
      type: String,
      default: null,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    readBy: [
      {
        userId: String,
        readAt: Date,
      },
    ],
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
    editedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);
// Indexes for better query performance
messageSchema.index({ conversationId: 1, createdAt: -1 });
messageSchema.index({ senderId: 1, receiverId: 1 });
messageSchema.index({ groupId: 1, createdAt: -1 });
const Message = mongoose.model("Message", messageSchema);
module.exports = Message;
