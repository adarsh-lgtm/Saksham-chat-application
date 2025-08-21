import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Avatar,
  IconButton,
  Button,
  Typography,
  Chip,
  Divider,
  Box,
  CircularProgress,
  Alert,
  TextField,
  InputAdornment,
} from "@mui/material";
import {
  Close as CloseIcon,
  PersonRemove as RemoveIcon,
  PersonAdd as AddIcon,
  AdminPanelSettings as AdminIcon,
  Search as SearchIcon,
  Group as GroupIcon,
} from "@mui/icons-material";

const GroupMembersDialog = ({
  open,
  onClose,
  group,
  currentUserId,
  onMemberRemoved,
  onMemberAdded,
}) => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [removing, setRemoving] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddMember, setShowAddMember] = useState(false);
  const [newMemberInput, setNewMemberInput] = useState("");
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");

  const isAdmin =
    group?.adminId === currentUserId || group?.admin?.id === currentUserId;

  useEffect(() => {
    if (open && group) {
      fetchGroupDetails();
    }
  }, [open, group]);

  const fetchGroupDetails = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`/api/groups/${group.id}/details`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch group details");
      }

      const data = await response.json();
      setMembers(data.group.members || []);
    } catch (error) {
      console.error("Error fetching group details:", error);
      setError("Failed to load members");
      // Fallback to members from the group prop if available
      if (group?.members) {
        setMembers(group.members);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async (memberId) => {
    if (!isAdmin) return;

    if (memberId === group.adminId || memberId === group.admin?.id) {
      setError("Cannot remove the group admin");
      return;
    }

    setRemoving(memberId);
    setError("");

    try {
      const response = await fetch(
        `/api/groups/${group.id}/members/${memberId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to remove member");
      }

      // Update local state
      setMembers(members.filter((m) => m.id !== memberId));

      // Notify parent component
      if (onMemberRemoved) {
        onMemberRemoved(memberId, group.id);
      }

      // Show success feedback
      console.log("Member removed successfully");
    } catch (error) {
      console.error("Error removing member:", error);
      setError(error.message);
    } finally {
      setRemoving(null);
    }
  };

  const handleAddMember = async () => {
    if (!isAdmin || !newMemberInput.trim()) return;

    setAdding(true);
    setError("");

    try {
      // Determine if input is email or username
      const isEmail = newMemberInput.includes("@");

      const response = await fetch(`/api/groups/${group.id}/members`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: isEmail ? newMemberInput : undefined,
          username: !isEmail ? newMemberInput : undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to add member");
      }

      const data = await response.json();

      // Refresh members list
      await fetchGroupDetails();

      // Clear input and hide add form
      setNewMemberInput("");
      setShowAddMember(false);

      // Notify parent component
      if (onMemberAdded) {
        onMemberAdded(data.member, group.id);
      }
    } catch (error) {
      console.error("Error adding member:", error);
      setError(error.message);
    } finally {
      setAdding(false);
    }
  };

  const filteredMembers = members.filter(
    (member) =>
      member.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={1}>
            <GroupIcon />
            <Typography variant="h6">{group?.name} - Members</Typography>
          </Box>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {error && (
          <Alert severity="error" onClose={() => setError("")} sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Search Bar */}
        <TextField
          fullWidth
          size="small"
          placeholder="Search members..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ mb: 2 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />

        {/* Add Member Section (Admin Only) */}
        {isAdmin && (
          <Box sx={{ mb: 2 }}>
            {!showAddMember ? (
              <Button
                startIcon={<AddIcon />}
                onClick={() => setShowAddMember(true)}
                variant="outlined"
                fullWidth
              >
                Add Member
              </Button>
            ) : (
              <Box sx={{ display: "flex", gap: 1 }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Enter email or username"
                  value={newMemberInput}
                  onChange={(e) => setNewMemberInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleAddMember()}
                  disabled={adding}
                />
                <Button
                  onClick={handleAddMember}
                  disabled={adding || !newMemberInput.trim()}
                  variant="contained"
                >
                  {adding ? <CircularProgress size={20} /> : "Add"}
                </Button>
                <Button
                  onClick={() => {
                    setShowAddMember(false);
                    setNewMemberInput("");
                  }}
                  disabled={adding}
                >
                  Cancel
                </Button>
              </Box>
            )}
          </Box>
        )}

        <Divider sx={{ mb: 2 }} />

        {/* Members List */}
        {loading ? (
          <Box display="flex" justifyContent="center" p={3}>
            <CircularProgress />
          </Box>
        ) : (
          <List sx={{ maxHeight: 400, overflow: "auto" }}>
            {filteredMembers.length === 0 ? (
              <ListItem>
                <ListItemText
                  primary="No members found"
                  secondary={
                    searchTerm
                      ? "Try a different search term"
                      : "Add members to get started"
                  }
                />
              </ListItem>
            ) : (
              filteredMembers.map((member) => {
                const isGroupAdmin =
                  member.id === group.adminId || member.id === group.admin?.id;
                const isCurrentUser = member.id === currentUserId;

                return (
                  <ListItem key={member.id}>
                    <ListItemAvatar>
                      <Avatar src={member.profilePicture}>
                        {member.username?.[0]?.toUpperCase()}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box display="flex" alignItems="center" gap={1}>
                          <Typography variant="body1">
                            {member.username}
                            {isCurrentUser && " (You)"}
                          </Typography>
                          {isGroupAdmin && (
                            <Chip
                              icon={<AdminIcon />}
                              label="Admin"
                              size="small"
                              color="primary"
                              variant="outlined"
                            />
                          )}
                        </Box>
                      }
                      secondary={member.email}
                    />
                    {isAdmin && !isGroupAdmin && !isCurrentUser && (
                      <ListItemSecondaryAction>
                        <IconButton
                          edge="end"
                          onClick={() => handleRemoveMember(member.id)}
                          disabled={removing === member.id}
                          color="error"
                        >
                          {removing === member.id ? (
                            <CircularProgress size={20} />
                          ) : (
                            <RemoveIcon />
                          )}
                        </IconButton>
                      </ListItemSecondaryAction>
                    )}
                  </ListItem>
                );
              })
            )}
          </List>
        )}

        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ mt: 2, display: "block" }}
        >
          Total members: {members.length}
        </Typography>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};


export default GroupMembersDialog;