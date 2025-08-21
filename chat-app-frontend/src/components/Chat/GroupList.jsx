import React, { useState } from 'react';
import {
List,
ListItem,
ListItemText,
ListItemAvatar,
Avatar,
Typography,
Box,
Button,
Divider
} from '@mui/material';
import GroupIcon from '@mui/icons-material/Group';
import AddIcon from '@mui/icons-material/Add';
import { useSelector } from 'react-redux';
import CreateGroup from './CreateGroup';
const GroupList = ({ onSelectGroup }) => {
const { groups } = useSelector((state) => state.user);
const [openCreateGroup, setOpenCreateGroup] = useState(false);
return (
<Box>
<Divider />
<Box sx={{
p: 2,
display: 'flex',
justifyContent: 'space-between',
alignItems: 'center'
}}>
<Typography variant="h6">
Groups
</Typography>
<Button
size="small"
startIcon={<AddIcon />}
onClick={() => setOpenCreateGroup(true)}
>
Create
</Button>
</Box>
<List>
{groups.map((group) => (
<ListItem
key={group.id}
button
onClick={() => onSelectGroup(group.id)}
sx={{
'&:hover': {
bgcolor: 'action.hover'
}
}}
>
<ListItemAvatar>
<Avatar>
<GroupIcon />
</Avatar>
</ListItemAvatar>
<ListItemText
primary={group.name}
secondary={`${group.members?.length || 0} members`}
/>
</ListItem>
))}
</List>
<CreateGroup
open={openCreateGroup}
onClose={() => setOpenCreateGroup(false)}
/>
</Box>
);
};
export default GroupList;