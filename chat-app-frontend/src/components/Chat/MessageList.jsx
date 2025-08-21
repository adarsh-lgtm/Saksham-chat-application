import React, { useEffect, useRef } from "react";
import { Box, Typography, Paper, Avatar } from "@mui/material";
import moment from "moment";
const MessageList = ({ messages, currentUserId }) => {
  const messagesEndRef = useRef(null);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  return (
    <Box sx={{ flexGrow: 1, overflow: "auto", p: 2 }}>
      {messages.map((message, index) => {
        const isOwn = message.senderId === currentUserId;
        return (
          <Box
            key={message._id || index}
            sx={{
              display: "flex",
              justifyContent: isOwn ? "flex-end" : "flex-start",
              mb: 2,
            }}
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: isOwn ? "row-reverse" : "row",
                alignItems: "flex-start",
                maxWidth: "70%",
              }}
            >
              <Avatar
                sx={{
                  width: 32,
                  height: 32,
                  mx: 1,
                  bgcolor: isOwn ? "primary.main" : "secondary.main",
                }}
              >
                {message.senderName?.[0]?.toUpperCase()}
              </Avatar>
              <Paper
                sx={{
                  p: 1.5,
                  bgcolor: isOwn ? "primary.main" : "grey.100",
                  color: isOwn ? "white" : "text.primary",
                }}
              >
                <Typography variant="caption" display="block" sx={{ mb: 0.5 }}>
                  {message.senderName}
                </Typography>
                <Typography variant="body2">{message.message}</Typography>
                <Typography
                  variant="caption"
                  sx={{
                    mt: 0.5,
                    display: "block",
                    opacity: 0.7,
                  }}
                >
                  {moment(message.createdAt).format("HH:mm")}
                </Typography>
              </Paper>
            </Box>
          </Box>
        );
      })}
      <div ref={messagesEndRef} />
    </Box>
  );
};
export default MessageList;
