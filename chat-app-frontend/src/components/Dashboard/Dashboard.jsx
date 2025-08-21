import React from "react";
import { Container, Grid, Paper, Typography, Box, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import ChatIcon from "@mui/icons-material/Chat";
import Navbar from "./Navbar";
const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  return (
    <>
      <Navbar />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h4" gutterBottom>
                Welcome, {user?.username}!
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                Your dashboard is ready. Start chatting with your friends and
                colleagues.
              </Typography>
              <Box sx={{ mt: 3 }}>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<ChatIcon />}
                  onClick={() => navigate("/chat")}
                >
                  Open Chat
                </Button>
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Profile Info
              </Typography>
              <Typography variant="body2">
                <strong>Username:</strong> {user?.username}
              </Typography>
              <Typography variant="body2">
                <strong>Email:</strong> {user?.email}
              </Typography>
              <Typography variant="body2">
                <strong>Phone:</strong> {user?.phoneNumber || "Not provided"}
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </>
  );
};
export default Dashboard;
