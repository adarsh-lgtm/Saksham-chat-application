import React, { useState } from 'react';
import { Box, TextField, IconButton } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
const MessageInput = ({ onSendMessage, onTyping }) => {
const [message, setMessage] = useState('');
const handleSend = () => {
if (message.trim()) {
onSendMessage(message);
setMessage('');
}
};
const handleKeyPress = (e) => {
if (e.key === 'Enter' && !e.shiftKey) {
e.preventDefault();
handleSend();
}
};
const handleChange = (e) => {
setMessage(e.target.value);
onTyping(true);
};
return (
<Box sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
<TextField
fullWidth
multiline
maxRows={4}
value={message}
onChange={handleChange}
onKeyPress={handleKeyPress}
placeholder="Type a message..."
variant="outlined"
size="small"
/>
<IconButton
color="primary"
onClick={handleSend}
disabled={!message.trim()}
sx={{ ml: 1 }}
>
<SendIcon />
</IconButton>
</Box>
);
};
export default MessageInput;