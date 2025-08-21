import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../services/api";
export const fetchUsers = createAsyncThunk("user/fetchUsers", async () => {
  const response = await api.get("/users/all");
  return response.data;
});
export const searchUsers = createAsyncThunk(
  "user/searchUsers",
  async (query) => {
    const response = await api.get(`/users/search?query=${query}`);
    return response.data;
  }
);
export const fetchGroups = createAsyncThunk("user/fetchGroups", async () => {
  const response = await api.get("/groups/my-groups");
  return response.data;
});
export const createGroup = createAsyncThunk(
  "user/createGroup",
  async (groupData) => {
    const response = await api.post("/groups/create", groupData);
    return response.data;
  }
);
const userSlice = createSlice({
  name: "user",
  initialState: {
    users: [],
    groups: [],
    onlineUsers: {},
    searchResults: [],
    loading: false,
    error: null,
  },
  reducers: {
    updateUserOnlineStatus: (state, action) => {
      const { userId, isOnline } = action.payload;
      state.onlineUsers[userId] = isOnline;
    },
    clearSearchResults: (state) => {
      state.searchResults = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.users = action.payload.users;
      })
      .addCase(searchUsers.fulfilled, (state, action) => {
        state.searchResults = action.payload.users;
      })
      .addCase(fetchGroups.fulfilled, (state, action) => {
        state.groups = action.payload.groups;
      })
      .addCase(createGroup.fulfilled, (state, action) => {
        state.groups.push(action.payload.group);
      });
  },
});
export const { updateUserOnlineStatus, clearSearchResults } = userSlice.actions;
export default userSlice.reducer;
