// import React, { useState } from "react";
// import {
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
//   TextField,
//   Button,
//   Box,
//   Chip,
//   Autocomplete,
//   Typography,
// } from "@mui/material";
// import { useDispatch, useSelector } from "react-redux";
// import { createGroup } from "../../store/userSlice";
// import toast from "react-hot-toast";
// const CreateGroup = ({ open, onClose }) => {
//   const dispatch = useDispatch();
//   const { users } = useSelector((state) => state.user);
//   const [groupName, setGroupName] = useState("");
//   const [description, setDescription] = useState("");
//   const [selectedMembers, setSelectedMembers] = useState([]);
//   const handleCreate = async () => {
//     if (!groupName.trim()) {
//       toast.error("Group name is required");
//       return;
//     }
//     try {
//       await dispatch(
//         createGroup({
//           name: groupName,
//           description,
//           memberIds: selectedMembers.map((m) => m.id),
//         })
//       ).unwrap();
//       toast.success("Group created successfully");
//       handleClose();
//     } catch (error) {
//       toast.error("Failed to create group");
//     }
//   };
//   const handleClose = () => {
//     setGroupName("");
//     setDescription("");
//     setSelectedMembers([]);
//     onClose();
//   };
//   return (
//     <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
//       <DialogTitle>Create New Group</DialogTitle>
//       <DialogContent>
//         <Box sx={{ mt: 2 }}>
//           <TextField
//             fullWidth
//             label="Group Name"
//             value={groupName}
//             onChange={(e) => setGroupName(e.target.value)}
//             margin="normal"
//           />
//           <TextField
//             fullWidth
//             label="Description (Optional)"
//             value={description}
//             onChange={(e) => setDescription(e.target.value)}
//             margin="normal"
//             multiline
//             rows={2}
//           />
//           <Autocomplete
//             multiple
//             options={users}
//             getOptionLabel={(option) => option.username}
//             value={selectedMembers}
//             onChange={(event, newValue) => setSelectedMembers(newValue)}
//             renderInput={(params) => (
//               <TextField
//                 {...params}
//                 variant="outlined"
//                 label="Add Members"
//                 placeholder="Search users"
//                 margin="normal"
//               />
//             )}
//             renderTags={(value, getTagProps) =>
//               value.map((option, index) => (
//                 <Chip
//                   variant="outlined"
//                   label={option.username}
//                   {...getTagProps({ index })}
//                 />
//               ))
//             }
//           />
//           <Typography variant="caption" color="text.secondary">
//             You will be the admin of this group
//           </Typography>
//         </Box>
//       </DialogContent>
//       <DialogActions>
//         <Button onClick={handleClose}>Cancel</Button>
//         <Button
//           onClick={handleCreate}
//           variant="contained"
//           disabled={!groupName.trim()}
//         >
//           Create Group
//         </Button>
//       </DialogActions>
//     </Dialog>
//   );
// };
// export default CreateGroup;

// ________________________________________

import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Chip,
  Autocomplete,
  Typography,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { createGroup } from "../../store/userSlice";
import toast from "react-hot-toast";

const CreateGroup = ({ open, onClose }) => {
  const dispatch = useDispatch();
  const { users } = useSelector((state) => state.user);
  const [groupName, setGroupName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedMembers, setSelectedMembers] = useState([]);

  const handleCreate = async () => {
    if (!groupName.trim()) {
      toast.error("Group name is required");
      return;
    }

    // Debug logs
    console.log("=== GROUP CREATION DEBUG ===");
    console.log("Group name:", groupName);
    console.log("Description:", description);
    console.log("Selected members:", selectedMembers);
    console.log(
      "Member IDs:",
      selectedMembers.map((m) => m.id)
    );
    console.log("Available users:", users);

    try {
      const result = await dispatch(
        createGroup({
          name: groupName,
          description,
          memberIds: selectedMembers.map((m) => m.id),
        })
      ).unwrap();

      console.log("Group creation result:", result);
      console.log("=== GROUP CREATION SUCCESS ===");

      toast.success("Group created successfully");
      handleClose();
    } catch (error) {
      console.error("Group creation error:", error);
      console.log("=== GROUP CREATION FAILED ===");
      toast.error("Failed to create group");
    }
  };

  const handleClose = () => {
    setGroupName("");
    setDescription("");
    setSelectedMembers([]);
    onClose();
  };

  // Debug log for member selection changes
  const handleMemberChange = (event, newValue) => {
    console.log("Members selected:", newValue);
    setSelectedMembers(newValue);
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Create New Group</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <TextField
            fullWidth
            label="Group Name"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Description (Optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            margin="normal"
            multiline
            rows={2}
          />
          <Autocomplete
            multiple
            options={users}
            getOptionLabel={(option) => option.username}
            value={selectedMembers}
            onChange={handleMemberChange}
            renderInput={(params) => (
              <TextField
                {...params}
                variant="outlined"
                label="Add Members"
                placeholder="Search users"
                margin="normal"
              />
            )}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => {
                const { key, ...chipProps } = getTagProps({ index });
                return (
                  <Chip
                    key={key}
                    variant="outlined"
                    label={option.username}
                    {...chipProps}
                  />
                );
              })
            }
          />
          <Typography variant="caption" color="text.secondary">
            You will be the admin of this group
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          onClick={handleCreate}
          variant="contained"
          disabled={!groupName.trim()}
        >
          Create Group
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateGroup;
