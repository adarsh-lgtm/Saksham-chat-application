import React from "react";
import { AppBar, Toolbar, Typography, Button, IconButton } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import ChatIcon from "@mui/icons-material/Chat";
import LogoutIcon from "@mui/icons-material/Logout";
import { logout } from "../../store/authSlice";
import socketService from "../../services/socket";
const Navbar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const handleLogout = () => {
    socketService.disconnect();
    dispatch(logout());
    navigate("/login");
  };
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Chat Application
        </Typography>
        <Typography variant="body1" sx={{ mr: 2 }}>
          {user?.username}
        </Typography>
        <Button
          color="inherit"
          startIcon={<ChatIcon />}
          onClick={() => navigate("/chat")}
        >
          CHAT
        </Button>
        <IconButton color="inherit" onClick={handleLogout} aria-label="logout">
          <LogoutIcon />
        </IconButton>
      </Toolbar>
    </AppBar>
  );
};
export default Navbar;
