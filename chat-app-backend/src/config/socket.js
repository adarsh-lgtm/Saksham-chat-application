const socketIO = require('socket.io');
const { verifyToken } = require('../utils/tokenUtils');
const User = require('../models/postgresql/User');
const Message = require('../models/mongodb/Message');
const { Group } = require('../models/postgresql/Group');
const configureSocket = (server) => {
const io = socketIO(server, {
cors: {
origin: process.env.CLIENT_URL,
methods: ['GET', 'POST'],
credentials: true
}
});
// Socket authentication middleware
io.use(async (socket, next) => {
try {
const token = socket.handshake.auth.token;
if (!token) {
return next(new Error('Authentication required'));
}
const decoded = verifyToken(token);
const user = await User.findByPk(decoded.userId, {
attributes: { exclude: ['password'] }
});
if (!user) {
return next(new Error('User not found'));
}
socket.userId = user.id;
socket.user = user;
next();
} catch (error) {
next(new Error('Invalid token'));
}
});
return io;
};
module.exports = configureSocket;