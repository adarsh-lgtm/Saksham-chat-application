const Message = require("../models/mongodb/Message");
const { Group } = require("../models/postgresql/Group");
// Get messages for a conversation
const getMessages = async (req, res) => {
  try {
    const { conversationId, conversationType } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const skip = (page - 1) * limit;
    // For group messages, verify user is a member
    if (conversationType === "group") {
      const group = await Group.findByPk(conversationId, {
        include: ["members"],
      });
      if (!group) {
        return res.status(404).json({ error: "Group not found" });
      }
      const isMember = group.members.some((m) => m.id === req.user.id);
      if (!isMember) {
        return res.status(403).json({ error: "Not a member of this group" });
      }
    }
    const messages = await Message.find({
      conversationId,
      conversationType,
      isDeleted: false,
    })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);
    res.json({
      messages: messages.reverse(),
      page: parseInt(page),
      hasMore: messages.length === parseInt(limit),
    });
  } catch (error) {
    console.error("Get messages error:", error);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
};
// Send a message (handled mostly through Socket.io, this is for REST fallback)
const sendMessage = async (req, res) => {
  try {
    const {
      conversationId,
      conversationType,
      receiverId,
      groupId,
      message,
      messageType = "text",
    } = req.body;
    if (!message || !conversationId || !conversationType) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    // For group messages, verify user is admin if it's admin-only
    if (conversationType === "group" && groupId) {
      const group = await Group.findByPk(groupId);
      if (!group) {
        return res.status(404).json({ error: "Group not found" });
      }
      // Only admin can send messages in group
      if (group.adminId !== req.user.id) {
        return res
          .status(403)
          .json({ error: "Only admin can send messages in this group" });
      }
    }
    const newMessage = await Message.create({
      conversationId,
      conversationType,
      senderId: req.user.id,
      senderName: req.user.username,
      receiverId: conversationType === "private" ? receiverId : null,
      groupId: conversationType === "group" ? groupId : null,
      message,
      messageType,
    });
    res.status(201).json({ message: newMessage });
  } catch (error) {
    console.error("Send message error:", error);
    res.status(500).json({ error: "Failed to send message" });
  }
};
// Mark messages as read
const markAsRead = async (req, res) => {
  try {
    const { conversationId } = req.params;
    await Message.updateMany(
      {
        conversationId,
        receiverId: req.user.id,
        isRead: false,
      },
      {
        $set: { isRead: true },
        $push: {
          readBy: {
            userId: req.user.id,
            readAt: new Date(),
          },
        },
      }
    );
    res.json({ message: "Messages marked as read" });
  } catch (error) {
    console.error("Mark as read error:", error);
    res.status(500).json({ error: "Failed to mark messages as read" });
  }
};
// Get conversation list
const getConversations = async (req, res) => {
  try {
    const userId = req.user.id;
    // Get latest message from each private conversation
    const privateConversations = await Message.aggregate([
      {
        $match: {
          conversationType: "private",
          $or: [{ senderId: userId }, { receiverId: userId }],
          isDeleted: false,
        },
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $group: {
          _id: "$conversationId",
          lastMessage: { $first: "$$ROOT" },
          unreadCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$receiverId", userId] },
                    { $eq: ["$isRead", false] },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
    ]);
    res.json({ conversations: privateConversations });
  } catch (error) {
    console.error("Get conversations error:", error);
    res.status(500).json({ error: "Failed to fetch conversations" });
  }
};
module.exports = {
  getMessages,
  sendMessage,
  markAsRead,
  getConversations,
};
