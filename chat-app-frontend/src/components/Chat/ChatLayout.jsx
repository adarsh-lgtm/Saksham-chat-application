import React, { useEffect, useState } from "react";
import { Grid, Paper, Box } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import UserList from "./UserList";
import GroupList from "./GroupList";
import ChatWindow from "./ChatWindow";
import Navbar from "../Dashboard/Navbar";
import socketService from "../../services/socket";
import {
  fetchUsers,
  updateUserOnlineStatus,
  fetchGroups,
} from "../../store/userSlice";
import {
  addMessage,
  updateTypingStatus,
  markMessagesAsRead,
} from "../../store/chatSlice";
const ChatLayout = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [selectedChat, setSelectedChat] = useState(null);
  const [chatType, setChatType] = useState(null); // 'private' or 'group'
  useEffect(() => {
    // Connect to socket
    const socket = socketService.connect();
    // Fetch initial data
    dispatch(fetchUsers());
    dispatch(fetchGroups());
    // Socket event listeners
    socketService.on("userOnline", (userId) => {
      dispatch(updateUserOnlineStatus({ userId, isOnline: true }));
    });
    socketService.on("userOffline", (userId) => {
      dispatch(updateUserOnlineStatus({ userId, isOnline: false }));
    });
    socketService.on("newMessage", (message) => {
      dispatch(addMessage(message));
    });
    socketService.on("newGroupMessage", (message) => {
      dispatch(addMessage(message));
    });
    socketService.on("userTyping", ({ userId, username, isTyping }) => {
      dispatch(updateTypingStatus({ userId, isTyping }));
    });
    socketService.on("messagesRead", ({ messageIds }) => {
      dispatch(markMessagesAsRead({ messageIds }));
    });
    return () => {
      socketService.disconnect();
    };
  }, [dispatch]);
  const handleSelectUser = (userId) => {
    setSelectedChat(userId);
    setChatType("private");
    socketService.joinPrivateRoom(user.id, userId);
  };
  const handleSelectGroup = (groupId) => {
    setSelectedChat(groupId);
    setChatType("group");
    socketService.joinGroup(groupId);
  };
  return (
    <>
      <Navbar />
      <Box sx={{ height: "calc(100vh - 64px)", display: "flex" }}>
        <Grid container sx={{ height: "100%" }}>
          <Grid
            item
            xs={3}
            sx={{ height: "100%", borderRight: 1, borderColor: "divider" }}
          >
            <Paper sx={{ height: "100%", overflow: "auto" }}>
              <UserList onSelectUser={handleSelectUser} />
              <GroupList onSelectGroup={handleSelectGroup} />
            </Paper>
          </Grid>
          <Grid item xs={9} sx={{ height: "100%" }}>
            <ChatWindow selectedChat={selectedChat} chatType={chatType} />
          </Grid>
        </Grid>
      </Box>
    </>
  );
};
export default ChatLayout;
