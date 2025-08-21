require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const { connectMongoDB, connectPostgreSQL } = require('./src/config/database');
const configureSocket = require('./src/config/socket');
const handleSocketConnection = require('./src/socket/socketHandlers');
// Import routes
const authRoutes = require('./src/routes/authRoutes');
const userRoutes = require('./src/routes/userRoutes');
const groupRoutes = require('./src/routes/groupRoutes');
const messageRoutes = require('./src/routes/messageRoutes');
const app = express();
const server = http.createServer(app);
// Configure Socket.io
const io = configureSocket(server);
// Middleware
app.use(cors({
origin: process.env.CLIENT_URL,
credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/messages', messageRoutes);
// Health check endpoint
app.get('/health', (req, res) => {
res.json({ status: 'OK', message: 'Server is running' });
});
// Error handling middleware
app.use((err, req, res, next) => {
console.error(err.stack);
res.status(500).json({ error: 'Something went wrong!' });
});
// Socket.io connection handling
handleSocketConnection(io);
// Connect to databases and start server
const PORT = process.env.PORT || 5000;
const startServer = async () => {
try {
// Connect to MongoDB
await connectMongoDB();
// Connect to PostgreSQL
await connectPostgreSQL();
// Start server
server.listen(PORT, () => {
console.log(`Server is running on port ${PORT}`);
});
} catch (error) {
console.error('Failed to start server:', error);
process.exit(1);
}
};
startServer();