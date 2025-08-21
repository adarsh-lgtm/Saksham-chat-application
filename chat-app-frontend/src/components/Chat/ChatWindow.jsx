// import React, { useEffect, useState, useRef } from "react";
// import { Box, Paper, Typography, Divider } from "@mui/material";
// import { useDispatch, useSelector } from "react-redux";
// import MessageList from "./MessageList";
// import MessageInput from "./MessageInput";
// import { fetchMessages, setActiveConversation } from "../../store/chatSlice";
// import socketService from "../../services/socket";
// const ChatWindow = ({ selectedChat, chatType }) => {
//   const dispatch = useDispatch();
//   const { user } = useSelector((state) => state.auth);
//   const { users, groups } = useSelector((state) => state.user);
//   const { messages, typingUsers } = useSelector((state) => state.chat);
//   const [isTyping, setIsTyping] = useState(false);
//   const typingTimeoutRef = useRef(null);
//   useEffect(() => {
//     if (selectedChat && chatType) {
//       const conversationId =
//         chatType === "private"
//           ? [user.id, selectedChat].sort().join("-")
//           : selectedChat;
//       dispatch(setActiveConversation({ id: conversationId, type: chatType }));
//       dispatch(
//         fetchMessages({
//           conversationType: chatType,
//           conversationId,
//         })
//       );
//     }
//   }, [selectedChat, chatType, user.id, dispatch]);
//   const getRecipientName = () => {
//     if (!selectedChat) return "";
//     if (chatType === "private") {
//       const recipient = users.find((u) => u.id === selectedChat);
//       return recipient?.username || "";
//     } else {
//       const group = groups.find((g) => g.id === selectedChat);
//       return group?.name || "";
//     }
//   };
//   const handleSendMessage = (message) => {
//     if (!selectedChat || !message.trim()) return;
//     if (chatType === "private") {
//       socketService.sendPrivateMessage({
//         receiverId: selectedChat,
//         message,
//         messageType: "text",
//       });
//     } else {
//       socketService.sendGroupMessage({
//         groupId: selectedChat,
//         message,
//         messageType: "text",
//       });
//     }
//   };
//   const handleTyping = (typing) => {
//     const conversationId =
//       chatType === "private"
//         ? [user.id, selectedChat].sort().join("-")
//         : selectedChat;
//     if (typing && !isTyping) {
//       setIsTyping(true);
//       socketService.typing(conversationId, true);
//     }
//     if (typingTimeoutRef.current) {
//       clearTimeout(typingTimeoutRef.current);
//     }
//     typingTimeoutRef.current = setTimeout(() => {
//       if (isTyping) {
//         setIsTyping(false);
//         socketService.typing(conversationId, false);
//       }
//     }, 1000);
//   };
//   if (!selectedChat) {
//     return (
//       <Box
//         sx={{
//           height: "100%",
//           display: "flex",
//           alignItems: "center",
//           justifyContent: "center",
//         }}
//       >
//         <Typography variant="h6" color="text.secondary">
//           Select a user or group to start chatting
//         </Typography>
//       </Box>
//     );
//   }
//   return (
//     <Paper sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
//       {/* Chat Header */}
//       <Box sx={{ p: 2, borderBottom: 1, borderColor: "divider" }}>
//         <Typography variant="h6">{getRecipientName()}</Typography>
//         {Object.keys(typingUsers).length > 0 && (
//           <Typography variant="caption" color="text.secondary">
//             typing...
//           </Typography>
//         )}
//       </Box>
//       {/* Messages Area */}
//       <MessageList messages={messages} currentUserId={user.id} />
//       {/* Message Input */}
//       <Divider />
//       <MessageInput onSendMessage={handleSendMessage} onTyping={handleTyping} />
//     </Paper>
//   );
// };
// export default ChatWindow;

// --BELOW IS WORKING AS EXPECTED-----------------
// import React, { useEffect, useState, useRef } from "react";
// import { Box, Paper, Typography, Divider, Alert, Chip } from "@mui/material";
// import { useDispatch, useSelector } from "react-redux";
// import MessageList from "./MessageList";
// import MessageInput from "./MessageInput";
// import { fetchMessages, setActiveConversation } from "../../store/chatSlice";
// import socketService from "../../services/socket";

// const ChatWindow = ({ selectedChat, chatType }) => {
//   const dispatch = useDispatch();
//   const { user } = useSelector((state) => state.auth);
//   const { users, groups } = useSelector((state) => state.user);
//   const { messages, typingUsers } = useSelector((state) => state.chat);
//   const [isTyping, setIsTyping] = useState(false);
//   const [canSendMessage, setCanSendMessage] = useState(true);
//   const [currentGroup, setCurrentGroup] = useState(null);
//   const typingTimeoutRef = useRef(null);

//   useEffect(() => {
//     if (selectedChat && chatType) {
//       const conversationId =
//         chatType === "private"
//           ? [user.id, selectedChat].sort().join("-")
//           : selectedChat;

//       dispatch(setActiveConversation({ id: conversationId, type: chatType }));
//       dispatch(
//         fetchMessages({
//           conversationType: chatType,
//           conversationId,
//         })
//       );

//       // Check permissions for group chats
//       if (chatType === "group") {
//         const group = groups.find((g) => g.id === selectedChat);
//         setCurrentGroup(group);

//         if (group) {
//           // Check if current user is the admin
//           // The admin object has id, username properties based on your backend
//           const isAdmin = group.adminId === user.id || group.admin?.id === user.id;
//           setCanSendMessage(isAdmin);

//           console.log("=== GROUP PERMISSION CHECK ===");
//           console.log("Group:", group.name);
//           console.log("Group Admin ID:", group.adminId || group.admin?.id);
//           console.log("Current User ID:", user.id);
//           console.log("Can Send Messages:", isAdmin);
//           console.log("Group Admin Username:", group.admin?.username);
//         }
//       } else {
//         // For private chats, always allow messaging
//         setCanSendMessage(true);
//         setCurrentGroup(null);
//       }
//     }
//   }, [selectedChat, chatType, user.id, groups, dispatch]);

//   const getRecipientName = () => {
//     if (!selectedChat) return "";

//     if (chatType === "private") {
//       const recipient = users.find((u) => u.id === selectedChat);
//       return recipient?.username || "";
//     } else {
//       const group = groups.find((g) => g.id === selectedChat);
//       return group?.name || "";
//     }
//   };

//   const getGroupAdminName = () => {
//     if (currentGroup?.admin?.username) {
//       return currentGroup.admin.username;
//     }
//     // Fallback: find admin from members if admin object not populated
//     if (currentGroup?.members && currentGroup?.adminId) {
//       const admin = currentGroup.members.find(m => m.id === currentGroup.adminId);
//       return admin?.username || "Admin";
//     }
//     return "Admin";
//   };

//   const handleSendMessage = (message) => {
//     if (!selectedChat || !message.trim()) return;

//     // Check permission for group messages
//     if (chatType === "group" && !canSendMessage) {
//       console.log("Only admin can send messages in this group");
//       return;
//     }

//     if (chatType === "private") {
//       socketService.sendPrivateMessage({
//         receiverId: selectedChat,
//         message,
//         messageType: "text",
//       });
//     } else {
//       socketService.sendGroupMessage({
//         groupId: selectedChat,
//         message,
//         messageType: "text",
//       });
//     }
//   };

//   const handleTyping = (typing) => {
//     // Don't send typing events if user can't send messages
//     if (chatType === "group" && !canSendMessage) return;

//     const conversationId =
//       chatType === "private"
//         ? [user.id, selectedChat].sort().join("-")
//         : selectedChat;

//     if (typing && !isTyping) {
//       setIsTyping(true);
//       socketService.typing(conversationId, true);
//     }

//     if (typingTimeoutRef.current) {
//       clearTimeout(typingTimeoutRef.current);
//     }

//     typingTimeoutRef.current = setTimeout(() => {
//       if (isTyping) {
//         setIsTyping(false);
//         socketService.typing(conversationId, false);
//       }
//     }, 1000);
//   };

//   if (!selectedChat) {
//     return (
//       <Box
//         sx={{
//           height: "100%",
//           display: "flex",
//           alignItems: "center",
//           justifyContent: "center",
//         }}
//       >
//         <Typography variant="h6" color="text.secondary">
//           Select a user or group to start chatting
//         </Typography>
//       </Box>
//     );
//   }

//   return (
//     <Paper sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
//       {/* Chat Header */}
//       <Box sx={{ p: 2, borderBottom: 1, borderColor: "divider" }}>
//         <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
//           <Box>
//             <Typography variant="h6" component="div" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
//               {getRecipientName()}
//               {chatType === "group" && !canSendMessage && (
//                 <Chip
//                   label="View Only"
//                   size="small"
//                   color="warning"
//                   variant="outlined"
//                 />
//               )}
//             </Typography>
//             {chatType === "group" && currentGroup && (
//               <Typography variant="caption" color="text.secondary" display="block">
//                 Admin: {getGroupAdminName()}
//                 {canSendMessage && " (You)"}
//               </Typography>
//             )}
//           </Box>
//           {chatType === "group" && currentGroup && (
//             <Typography variant="caption" color="text.secondary">
//               {currentGroup.members?.length || 0} members
//             </Typography>
//           )}
//         </Box>
//         {Object.keys(typingUsers).length > 0 && (
//           <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
//             typing...
//           </Typography>
//         )}
//       </Box>

//       {/* Messages Area */}
//       <MessageList messages={messages} currentUserId={user.id} />

//       {/* Message Input or View-Only Notice */}
//       <Divider />

//       {chatType === "group" && !canSendMessage ? (
//         <Box
//           sx={{
//             p: 2,
//             bgcolor: "background.default",
//             borderTop: 1,
//             borderColor: "divider"
//           }}
//         >
//           <Alert
//             severity="info"
//             variant="outlined"
//             sx={{
//               justifyContent: "center",
//               "& .MuiAlert-message": {
//                 width: "100%",
//                 textAlign: "center"
//               }
//             }}
//           >
//             🔒 Only {getGroupAdminName()} can send messages in this group
//           </Alert>
//         </Box>
//       ) : (
//         <MessageInput
//           onSendMessage={handleSendMessage}
//           onTyping={handleTyping}
//         />
//       )}
//     </Paper>
//   );
// };

// export default ChatWindow;

import React, { useEffect, useState, useRef } from "react";
import {
  Box,
  Paper,
  Typography,
  Divider,
  Alert,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import {
  MoreVert as MoreVertIcon,
  Group as GroupIcon,
  PersonAdd as PersonAddIcon,
  ExitToApp as LeaveIcon,
  Info as InfoIcon,
} from "@mui/icons-material";
import { useDispatch, useSelector } from "react-redux";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import GroupMembersDialog from "./GroupMembersDialog";
import { fetchMessages, setActiveConversation } from "../../store/chatSlice";
import socketService from "../../services/socket";

const ChatWindow = ({ selectedChat, chatType }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { users, groups } = useSelector((state) => state.user);
  const { messages, typingUsers } = useSelector((state) => state.chat);
  const [isTyping, setIsTyping] = useState(false);
  const [canSendMessage, setCanSendMessage] = useState(true);
  const [currentGroup, setCurrentGroup] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [showMembersDialog, setShowMembersDialog] = useState(false);
  const typingTimeoutRef = useRef(null);

  const menuOpen = Boolean(anchorEl);

  useEffect(() => {
    if (selectedChat && chatType) {
      const conversationId =
        chatType === "private"
          ? [user.id, selectedChat].sort().join("-")
          : selectedChat;

      dispatch(setActiveConversation({ id: conversationId, type: chatType }));
      dispatch(
        fetchMessages({
          conversationType: chatType,
          conversationId,
        })
      );

      // Check permissions for group chats
      if (chatType === "group") {
        const group = groups.find((g) => g.id === selectedChat);
        setCurrentGroup(group);

        if (group) {
          const isAdmin =
            group.adminId === user.id || group.admin?.id === user.id;
          setCanSendMessage(isAdmin);
        }
      } else {
        setCanSendMessage(true);
        setCurrentGroup(null);
      }
    }
  }, [selectedChat, chatType, user.id, groups, dispatch]);

  const getRecipientName = () => {
    if (!selectedChat) return "";

    if (chatType === "private") {
      const recipient = users.find((u) => u.id === selectedChat);
      return recipient?.username || "";
    } else {
      const group = groups.find((g) => g.id === selectedChat);
      return group?.name || "";
    }
  };

  const getGroupAdminName = () => {
    if (currentGroup?.admin?.username) {
      return currentGroup.admin.username;
    }
    if (currentGroup?.members && currentGroup?.adminId) {
      const admin = currentGroup.members.find(
        (m) => m.id === currentGroup.adminId
      );
      return admin?.username || "Admin";
    }
    return "Admin";
  };

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleViewMembers = () => {
    setShowMembersDialog(true);
    handleMenuClose();
  };

  const handleSendMessage = (message) => {
    if (!selectedChat || !message.trim()) return;

    if (chatType === "group" && !canSendMessage) {
      console.log("Only admin can send messages in this group");
      return;
    }

    if (chatType === "private") {
      socketService.sendPrivateMessage({
        receiverId: selectedChat,
        message,
        messageType: "text",
      });
    } else {
      socketService.sendGroupMessage({
        groupId: selectedChat,
        message,
        messageType: "text",
      });
    }
  };

  const handleTyping = (typing) => {
    if (chatType === "group" && !canSendMessage) return;

    const conversationId =
      chatType === "private"
        ? [user.id, selectedChat].sort().join("-")
        : selectedChat;

    if (typing && !isTyping) {
      setIsTyping(true);
      socketService.typing(conversationId, true);
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      if (isTyping) {
        setIsTyping(false);
        socketService.typing(conversationId, false);
      }
    }, 1000);
  };

  const handleMemberRemoved = (memberId, groupId) => {
    // You can dispatch an action to update the group in Redux store
    console.log(`Member ${memberId} removed from group ${groupId}`);
    // dispatch(updateGroupMembers({ groupId, memberId, action: 'remove' }));
  };

  const handleMemberAdded = (member, groupId) => {
    // You can dispatch an action to update the group in Redux store
    console.log(`Member ${member.username} added to group ${groupId}`);
    // dispatch(updateGroupMembers({ groupId, member, action: 'add' }));
  };

  if (!selectedChat) {
    return (
      <Box
        sx={{
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography variant="h6" color="text.secondary">
          Select a user or group to start chatting
        </Typography>
      </Box>
    );
  }

  const isAdmin =
    currentGroup &&
    (currentGroup.adminId === user.id || currentGroup.admin?.id === user.id);

  return (
    <Paper sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {/* Chat Header */}
      <Box sx={{ p: 2, borderBottom: 1, borderColor: "divider" }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Box>
            <Typography
              variant="h6"
              component="div"
              sx={{ display: "flex", alignItems: "center", gap: 1 }}
            >
              {getRecipientName()}
              {chatType === "group" && !canSendMessage && (
                <Chip
                  label="View Only"
                  size="small"
                  color="warning"
                  variant="outlined"
                />
              )}
            </Typography>
            {chatType === "group" && currentGroup && (
              <Typography
                variant="caption"
                color="text.secondary"
                display="block"
              >
                Admin: {getGroupAdminName()}
                {canSendMessage && " (You)"}
              </Typography>
            )}
          </Box>

          {/* Group Menu */}
          {chatType === "group" && (
            <Box display="flex" alignItems="center" gap={1}>
              <Typography variant="caption" color="text.secondary">
                {currentGroup?.members?.length || 0} members
              </Typography>
              <IconButton onClick={handleMenuClick}>
                <MoreVertIcon />
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={menuOpen}
                onClose={handleMenuClose}
              >
                <MenuItem onClick={handleViewMembers}>
                  <ListItemIcon>
                    <GroupIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>View Members</ListItemText>
                </MenuItem>
                {isAdmin && (
                  <MenuItem onClick={handleViewMembers}>
                    <ListItemIcon>
                      <PersonAddIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Manage Members</ListItemText>
                  </MenuItem>
                )}
                <MenuItem onClick={handleMenuClose}>
                  <ListItemIcon>
                    <InfoIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Group Info</ListItemText>
                </MenuItem>
              </Menu>
            </Box>
          )}
        </Box>
        {Object.keys(typingUsers).length > 0 && (
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
            typing...
          </Typography>
        )}
      </Box>

      {/* Messages Area */}
      <MessageList messages={messages} currentUserId={user.id} />

      {/* Message Input or View-Only Notice */}
      <Divider />

      {chatType === "group" && !canSendMessage ? (
        <Box
          sx={{
            p: 2,
            bgcolor: "background.default",
            borderTop: 1,
            borderColor: "divider",
          }}
        >
          <Alert
            severity="info"
            variant="outlined"
            sx={{
              justifyContent: "center",
              "& .MuiAlert-message": {
                width: "100%",
                textAlign: "center",
              },
            }}
          >
            🔒 Only {getGroupAdminName()} can send messages in this group
          </Alert>
        </Box>
      ) : (
        <MessageInput
          onSendMessage={handleSendMessage}
          onTyping={handleTyping}
        />
      )}

      {/* Members Dialog */}
      {currentGroup && (
        <GroupMembersDialog
          open={showMembersDialog}
          onClose={() => setShowMembersDialog(false)}
          group={currentGroup}
          currentUserId={user.id}
          onMemberRemoved={handleMemberRemoved}
          onMemberAdded={handleMemberAdded}
        />
      )}
    </Paper>
  );
};

export default ChatWindow;
