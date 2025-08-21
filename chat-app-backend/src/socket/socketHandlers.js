const User = require("../models/postgresql/User");
const Message = require("../models/mongodb/Message");
const { Group, GroupMember } = require("../models/postgresql/Group");

const handleSocketConnection = (io) => {
  io.on("connection", async (socket) => {
    console.log(`User ${socket.user.username} connected`);

    // Update user online status
    await User.update(
      { isOnline: true, socketId: socket.id },
      { where: { id: socket.userId } }
    );

    // Join user to their personal room
    socket.join(socket.userId);

    // Join user to all their groups
    const user = await User.findByPk(socket.userId, {
      include: [{ model: Group, as: "groups" }],
    });

    if (user && user.groups) {
      for (const group of user.groups) {
        socket.join(`group-${group.id}`);
      }
    }

    // Emit online status to all connected users
    socket.broadcast.emit("userOnline", socket.userId);

    // Handle joining a private room
    socket.on("joinPrivateRoom", ({ userId1, userId2 }) => {
      const roomId = [userId1, userId2].sort().join("-");
      socket.join(roomId);
      console.log(`User joined private room: ${roomId}`);
    });

    // Handle joining a group room
    socket.on("joinGroup", async (groupId) => {
      // Verify user is member of the group
      const member = await GroupMember.findOne({
        where: { userId: socket.userId, groupId },
      });

      if (member) {
        socket.join(`group-${groupId}`);
        console.log(`User ${socket.user.username} joined group ${groupId}`);
      }
    });

    // Handle private messages
    socket.on("privateMessage", async (data) => {
      try {
        const { receiverId, message, messageType = "text" } = data;

        // Create conversation ID
        const conversationId = [socket.userId, receiverId].sort().join("-");

        // Save message to MongoDB
        const newMessage = await Message.create({
          conversationId,
          conversationType: "private",
          senderId: socket.userId,
          senderName: socket.user.username,
          receiverId,
          message,
          messageType,
        });

        // Emit to sender
        socket.emit("messageSent", newMessage);

        // Emit to receiver if online
        const receiver = await User.findByPk(receiverId);
        if (receiver && receiver.socketId) {
          io.to(receiver.socketId).emit("newMessage", newMessage);
        }
      } catch (error) {
        console.error("Private message error:", error);
        socket.emit("messageError", { error: "Failed to send message" });
      }
    });

    // Handle group messages
    socket.on("groupMessage", async (data) => {
      try {
        const { groupId, message, messageType = "text" } = data;

        // Verify user is admin of the group
        const group = await Group.findByPk(groupId);
        if (!group) {
          return socket.emit("messageError", { error: "Group not found" });
        }

        if (group.adminId !== socket.userId) {
          return socket.emit("messageError", {
            error: "Only admin can send messages in this group",
          });
        }

        // Save message to MongoDB
        const newMessage = await Message.create({
          conversationId: groupId,
          conversationType: "group",
          senderId: socket.userId,
          senderName: socket.user.username,
          groupId,
          message,
          messageType,
        });

        // Emit to all group members
        io.to(`group-${groupId}`).emit("newGroupMessage", newMessage);
      } catch (error) {
        console.error("Group message error:", error);
        socket.emit("messageError", { error: "Failed to send message" });
      }
    });

    // Handle typing indicators
    socket.on("typing", ({ conversationId, isTyping }) => {
      socket.to(conversationId).emit("userTyping", {
        userId: socket.userId,
        username: socket.user.username,
        isTyping,
      });
    });

    // Handle message read receipts
    socket.on("markAsRead", async ({ conversationId, messageIds }) => {
      try {
        await Message.updateMany(
          {
            _id: { $in: messageIds },
            receiverId: socket.userId,
          },
          {
            $set: { isRead: true },
            $push: {
              readBy: {
                userId: socket.userId,
                readAt: new Date(),
              },
            },
          }
        );

        // Notify sender about read receipt
        socket.to(conversationId).emit("messagesRead", {
          conversationId,
          messageIds,
          readBy: socket.userId,
        });
      } catch (error) {
        console.error("Mark as read error:", error);
      }
    });

    // Handle disconnect
    socket.on("disconnect", async () => {
      console.log(`User ${socket.user.username} disconnected`);

      // Update user offline status
      await User.update(
        {
          isOnline: false,
          lastSeen: new Date(),
          socketId: null,
        },
        { where: { id: socket.userId } }
      );

      // Emit offline status to all connected users
      socket.broadcast.emit("userOffline", socket.userId);
    });
  });
};

module.exports = handleSocketConnection;
