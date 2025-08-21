// import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
// import api from "../services/api";
// export const fetchMessages = createAsyncThunk(
//   "chat/fetchMessages",
//   async ({ conversationType, conversationId }) => {
//     const response = await api.get(
//       `/messages/${conversationType}/${conversationId}`
//     );
//     return response.data;
//   }
// );
// export const fetchConversations = createAsyncThunk(
//   "chat/fetchConversations",
//   async () => {
//     const response = await api.get("/messages/conversations");
//     return response.data;
//   }
// );
// export const sendMessage = createAsyncThunk(
//   "chat/sendMessage",
//   async (messageData) => {
//     const response = await api.post("/messages/send", messageData);
//     return response.data;
//   }
// );
// const chatSlice = createSlice({
//   name: "chat",
//   initialState: {
//     messages: [],
//     conversations: [],
//     activeConversation: null,
//     typingUsers: {},
//     loading: false,
//     error: null,
//   },
//   reducers: {
//     setActiveConversation: (state, action) => {
//       state.activeConversation = action.payload;
//     },
//     addMessage: (state, action) => {
//       state.messages.push(action.payload);
//     },
//     updateTypingStatus: (state, action) => {
//       const { userId, isTyping } = action.payload;
//       if (isTyping) {
//         state.typingUsers[userId] = true;
//       } else {
//         delete state.typingUsers[userId];
//       }
//     },
//     markMessagesAsRead: (state, action) => {
//       const { messageIds } = action.payload;
//       state.messages = state.messages.map((msg) =>
//         messageIds.includes(msg._id) ? { ...msg, isRead: true } : msg
//       );
//     },
//   },
//   extraReducers: (builder) => {
//     builder
//       .addCase(fetchMessages.fulfilled, (state, action) => {
//         state.messages = action.payload.messages;
//       })
//       .addCase(fetchConversations.fulfilled, (state, action) => {
//         state.conversations = action.payload.conversations;
//       })
//       .addCase(sendMessage.fulfilled, (state, action) => {
//         state.messages.push(action.payload.message);
//       });
//   },
// });
// export const {
//   setActiveConversation,
//   addMessage,
//   updateTypingStatus,
//   markMessagesAsRead,
// } = chatSlice.actions;
// export default chatSlice.reducer;



// --------------------------

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../services/api";

export const fetchMessages = createAsyncThunk(
  "chat/fetchMessages",
  async ({ conversationType, conversationId }) => {
    const response = await api.get(
      `/messages/${conversationType}/${conversationId}`
    );
    return response.data;
  }
);

export const fetchConversations = createAsyncThunk(
  "chat/fetchConversations",
  async () => {
    const response = await api.get("/messages/conversations");
    return response.data;
  }
);

export const sendMessage = createAsyncThunk(
  "chat/sendMessage",
  async (messageData) => {
    const response = await api.post("/messages/send", messageData);
    return response.data;
  }
);

const chatSlice = createSlice({
  name: "chat",
  initialState: {
    messages: [],
    conversations: [],
    activeConversation: {
      id: null,
      type: null // 'private' or 'group'
    },
    typingUsers: {},
    unreadMessages: {}, // NEW: Track unread messages per conversation
    loading: false,
    error: null,
  },
  reducers: {
    setActiveConversation: (state, action) => {
      state.activeConversation = action.payload;
      // Clear messages when switching conversations
      state.messages = [];
    },
    
    addMessage: (state, action) => {
      const message = action.payload;
      const { activeConversation } = state;
      
      // IMPORTANT: Only add message if it belongs to the active conversation
      if (activeConversation.type === 'private') {
        // For private messages, check if the message is part of current conversation
        const messageSenderId = message.senderId || message.sender?.id || message.sender;
        const messageReceiverId = message.receiverId || message.receiver?.id || message.receiver;
        
        // Create conversation ID from message
        const messageConversationId = [messageSenderId, messageReceiverId]
          .filter(id => id) // Remove undefined/null values
          .sort()
          .join('-');
        
        // Check if this message belongs to active conversation
        if (messageConversationId === activeConversation.id) {
          state.messages.push(message);
        } else {
          // Message is for a different conversation, add to unread
          if (!state.unreadMessages[messageConversationId]) {
            state.unreadMessages[messageConversationId] = [];
          }
          state.unreadMessages[messageConversationId].push(message);
        }
      } else if (activeConversation.type === 'group') {
        // For group messages, check if it's for the active group
        const messageGroupId = message.groupId || message.group?.id || message.group;
        
        if (messageGroupId === activeConversation.id) {
          state.messages.push(message);
        } else {
          // Message is for a different group, add to unread
          if (!state.unreadMessages[messageGroupId]) {
            state.unreadMessages[messageGroupId] = [];
          }
          state.unreadMessages[messageGroupId].push(message);
        }
      } else {
        // If no active conversation, store in unread
        const conversationId = message.groupId || 
          [message.senderId, message.receiverId].filter(id => id).sort().join('-');
        
        if (conversationId) {
          if (!state.unreadMessages[conversationId]) {
            state.unreadMessages[conversationId] = [];
          }
          state.unreadMessages[conversationId].push(message);
        }
      }
    },
    
    clearUnreadMessages: (state, action) => {
      const conversationId = action.payload;
      if (state.unreadMessages[conversationId]) {
        // Move unread messages to main messages array if they match active conversation
        if (conversationId === state.activeConversation.id) {
          state.messages.push(...state.unreadMessages[conversationId]);
        }
        delete state.unreadMessages[conversationId];
      }
    },
    
    updateTypingStatus: (state, action) => {
      const { userId, isTyping, conversationId } = action.payload;
      
      if (!state.typingUsers[conversationId]) {
        state.typingUsers[conversationId] = {};
      }
      
      if (isTyping) {
        state.typingUsers[conversationId][userId] = true;
      } else {
        delete state.typingUsers[conversationId][userId];
        
        // Clean up empty objects
        if (Object.keys(state.typingUsers[conversationId]).length === 0) {
          delete state.typingUsers[conversationId];
        }
      }
    },
    
    markMessagesAsRead: (state, action) => {
      const { messageIds } = action.payload;
      state.messages = state.messages.map((msg) =>
        messageIds.includes(msg._id || msg.id) ? { ...msg, isRead: true } : msg
      );
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.messages = action.payload.messages || [];
        // Clear any unread messages for this conversation since we're fetching fresh
        const conversationId = state.activeConversation.id;
        if (conversationId && state.unreadMessages[conversationId]) {
          delete state.unreadMessages[conversationId];
        }
      })
      .addCase(fetchConversations.fulfilled, (state, action) => {
        state.conversations = action.payload.conversations;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        // Only add if it's for the active conversation
        const message = action.payload.message;
        const activeConvId = state.activeConversation.id;
        
        if (state.activeConversation.type === 'private') {
          const messageConvId = [message.senderId, message.receiverId]
            .filter(id => id)
            .sort()
            .join('-');
          
          if (messageConvId === activeConvId) {
            state.messages.push(message);
          }
        } else if (state.activeConversation.type === 'group' && message.groupId === activeConvId) {
          state.messages.push(message);
        }
      });
  },
});

export const {
  setActiveConversation,
  addMessage,
  updateTypingStatus,
  markMessagesAsRead,
  clearUnreadMessages,
} = chatSlice.actions;

export default chatSlice.reducer;
 
