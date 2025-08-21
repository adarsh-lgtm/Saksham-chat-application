import { io } from 'socket.io-client';
class SocketService {
socket = null;
connect() {
const token = localStorage.getItem('token');
const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';
this.socket = io(SOCKET_URL, {
auth: {
token: token
}
});
this.socket.on('connect', () => {
console.log('Connected to server');
});
this.socket.on('connect_error', (error) => {
console.error('Connection error:', error.message);
});
return this.socket;
}
disconnect() {
if (this.socket) {
this.socket.disconnect();
this.socket = null;
}
}
emit(event, data) {
if (this.socket) {
this.socket.emit(event, data);
}
}
on(event, callback) {
if (this.socket) {
this.socket.on(event, callback);
}
}
off(event, callback) {
if (this.socket) {
this.socket.off(event, callback);
}
}
joinPrivateRoom(userId1, userId2) {
this.emit('joinPrivateRoom', { userId1, userId2 });
}
joinGroup(groupId) {
this.emit('joinGroup', groupId);
}
sendPrivateMessage(data) {
this.emit('privateMessage', data);
}
sendGroupMessage(data) {
this.emit('groupMessage', data);
}
markAsRead(conversationId, messageIds) {
this.emit('markAsRead', { conversationId, messageIds });
}
typing(conversationId, isTyping) {
this.emit('typing', { conversationId, isTyping });
}
}
const socketService = new SocketService();
export default socketService;