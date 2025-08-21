import React, { useState } from "react";
import {
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Typography,
  Box,
  TextField,
  Badge,
} from "@mui/material";
import { useSelector } from "react-redux";
const UserList = ({ onSelectUser }) => {
  const { users, onlineUsers } = useSelector((state) => state.user);
  const { user: currentUser } = useSelector((state) => state.auth);
  const [searchTerm, setSearchTerm] = useState("");
  const filteredUsers = users.filter(
    (user) =>
      user.id !== currentUser.id &&
      user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );
  return (
    <Box>
      <Typography variant="h6" sx={{ p: 2 }}>
        Users
      </Typography>
      <Box sx={{ px: 2, pb: 1 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Search users..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </Box>
      <List>
        {filteredUsers.map((user) => (
          <ListItem
            key={user.id}
            button
            onClick={() => onSelectUser(user.id)}
            sx={{
              "&:hover": {
                bgcolor: "action.hover",
              },
            }}
          >
            <ListItemAvatar>
              <Badge
                color="success"
                variant="dot"
                invisible={!user.isOnline && !onlineUsers[user.id]}
                anchorOrigin={{
                  vertical: "bottom",
                  horizontal: "right",
                }}
              >
                <Avatar>{user.username[0].toUpperCase()}</Avatar>
              </Badge>
            </ListItemAvatar>
            <ListItemText
              primary={user.username}
              secondary={
                user.isOnline || onlineUsers[user.id] ? "Online" : "Offline"
              }
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );
};
export default UserList;
