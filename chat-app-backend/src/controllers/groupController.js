// const { Group, GroupMember } = require("../models/postgresql/Group");
// const User = require("../models/postgresql/User");
// const { Op } = require("sequelize");

// // Create a new group
// const createGroup = async (req, res) => {
//   try {
//     const { name, description, memberIds = [] } = req.body;
    
//     // Add debug log
//     console.log("=== BACKEND CREATE GROUP DEBUG ===");
//     console.log("Group name:", name);
//     console.log("Description:", description);
//     console.log("Member IDs received:", memberIds);
//     console.log("Admin ID:", req.user.id);
    
//     if (!name) {
//       return res.status(400).json({ error: "Group name is required" });
//     }

//     // Create group with current user as admin
//     const group = await Group.create({
//       name,
//       description,
//       adminId: req.user.id,
//     });

//     console.log("Group created:", group.id);

//     // Add admin as first member
//     const membersToAdd = [req.user.id, ...memberIds];
//     const uniqueMemberIds = [...new Set(membersToAdd)];
    
//     console.log("Members to add:", uniqueMemberIds);

//     // Add members to group
//     for (const memberId of uniqueMemberIds) {
//       const memberAdded = await GroupMember.create({
//         userId: memberId,
//         groupId: group.id,
//       });
//       console.log("Added member:", memberAdded.dataValues);
//     }

//     // Fetch group with members
//     const groupWithMembers = await Group.findByPk(group.id, {
//       include: [
//         { model: User, as: "admin", attributes: ["id", "username", "email"] },
//         {
//           model: User,
//           as: "members",
//           attributes: ["id", "username", "email", "profilePicture"],
//         },
//       ],
//     });

//     console.log("Group with members found:", !!groupWithMembers);
//     console.log("Number of members included:", groupWithMembers?.members?.length || 0);
//     if (groupWithMembers?.members?.length > 0) {
//       console.log("Members:", groupWithMembers.members.map(m => ({ id: m.id, username: m.username })));
//     }
//     console.log("=== END BACKEND CREATE GROUP DEBUG ===");

//     res.status(201).json({
//       message: "Group created successfully",
//       group: groupWithMembers,
//     });
//   } catch (error) {
//     console.error("Create group error:", error);
//     res.status(500).json({ error: "Failed to create group" });
//   }
// };

// // Get user's groups - FIXED VERSION
// const getUserGroups = async (req, res) => {
//   try {
//     console.log("=== BACKEND GET USER GROUPS DEBUG (FIXED) ===");
//     console.log("User ID:", req.user.id);
    
//     // Get all groups where user is a member
//     const groupMembers = await GroupMember.findAll({
//       where: { userId: req.user.id }
//     });

//     console.log("Group memberships found:", groupMembers.length);

//     const groupIds = groupMembers.map(gm => gm.groupId);
    
//     if (groupIds.length === 0) {
//       console.log("User is not a member of any groups");
//       console.log("=== END GET USER GROUPS DEBUG ===");
//       return res.json({ groups: [] });
//     }

//     // Get all groups and manually get their members
//     const groups = await Group.findAll({
//       where: { id: groupIds },
//       include: [
//         { model: User, as: "admin", attributes: ["id", "username"] }
//       ]
//     });

//     // Manually add member count and member details to each group
//     const groupsWithMembers = await Promise.all(
//       groups.map(async (group) => {
//         // Get all members for this group
//         const members = await GroupMember.findAll({
//           where: { groupId: group.id },
//           include: [{
//             model: User,
//             attributes: ["id", "username", "profilePicture"]
//           }]
//         });

//         const memberUsers = members.map(m => m.User);
        
//         console.log(`Group "${group.name}": ${memberUsers.length} members`);
        
//         return {
//           ...group.toJSON(),
//           members: memberUsers
//         };
//       })
//     );

//     console.log("Total groups with members:", groupsWithMembers.length);
//     console.log("=== END GET USER GROUPS DEBUG ===");

//     res.json({ groups: groupsWithMembers });
//   } catch (error) {
//     console.error("Get groups error:", error);
//     res.status(500).json({ error: "Failed to fetch groups" });
//   }
// };

// // Alternative getUserGroups method (in case associations are the issue)
// const getUserGroupsAlternative = async (req, res) => {
//   try {
//     console.log("=== ALTERNATIVE GET GROUPS METHOD ===");
//     console.log("User ID:", req.user.id);

//     // Get all groups where user is a member
//     const groupMembers = await GroupMember.findAll({
//       where: { userId: req.user.id },
//       include: [{
//         model: Group,
//         include: [
//           { model: User, as: "admin", attributes: ["id", "username"] },
//           {
//             model: User,
//             as: "members",
//             attributes: ["id", "username", "profilePicture"],
//           },
//         ],
//       }]
//     });

//     const groups = groupMembers.map(gm => gm.Group);
    
//     console.log("Groups found via GroupMember:", groups.length);
//     groups.forEach((group, index) => {
//       console.log(`Group ${index + 1}: "${group.name}" - Members: ${group.members?.length || 0}`);
//     });
//     console.log("=== END ALTERNATIVE METHOD ===");

//     res.json({ groups });
//   } catch (error) {
//     console.error("Alternative get groups error:", error);
//     res.status(500).json({ error: "Failed to fetch groups" });
//   }
// };

// // Add member to group (admin only)
// const addMember = async (req, res) => {
//   try {
//     const { groupId } = req.params;
//     const { userId, email, phoneNumber } = req.body;

//     console.log("=== ADD MEMBER DEBUG ===");
//     console.log("Group ID:", groupId);
//     console.log("User ID to add:", userId);
//     console.log("Email:", email);
//     console.log("Phone:", phoneNumber);

//     // Find group
//     const group = await Group.findByPk(groupId);
//     if (!group) {
//       return res.status(404).json({ error: "Group not found" });
//     }

//     // Check if requester is admin
//     if (group.adminId !== req.user.id) {
//       return res.status(403).json({ error: "Only admin can add members" });
//     }

//     // Find user to add
//     let userToAdd;
//     if (userId) {
//       userToAdd = await User.findByPk(userId);
//     } else if (email) {
//       userToAdd = await User.findOne({ where: { email } });
//     } else if (phoneNumber) {
//       userToAdd = await User.findOne({ where: { phoneNumber } });
//     }

//     if (!userToAdd) {
//       return res.status(404).json({ error: "User not found" });
//     }

//     console.log("User to add found:", userToAdd.username);

//     // Check if user is already a member
//     const existingMember = await GroupMember.findOne({
//       where: { userId: userToAdd.id, groupId },
//     });

//     if (existingMember) {
//       return res.status(400).json({ error: "User is already a member" });
//     }

//     // Add member
//     const newMember = await GroupMember.create({
//       userId: userToAdd.id,
//       groupId,
//     });

//     console.log("Member added successfully:", newMember.dataValues);
//     console.log("=== END ADD MEMBER DEBUG ===");

//     res.json({
//       message: "Member added successfully",
//       member: {
//         id: userToAdd.id,
//         username: userToAdd.username,
//         email: userToAdd.email,
//       },
//     });
//   } catch (error) {
//     console.error("Add member error:", error);
//     res.status(500).json({ error: "Failed to add member" });
//   }
// };

// // Remove member from group (admin only)
// const removeMember = async (req, res) => {
//   try {
//     const { groupId, memberId } = req.params;

//     console.log("=== REMOVE MEMBER DEBUG ===");
//     console.log("Group ID:", groupId);
//     console.log("Member ID to remove:", memberId);

//     // Find group
//     const group = await Group.findByPk(groupId);
//     if (!group) {
//       return res.status(404).json({ error: "Group not found" });
//     }

//     // Check if requester is admin
//     if (group.adminId !== req.user.id) {
//       return res.status(403).json({ error: "Only admin can remove members" });
//     }

//     // Cannot remove admin
//     if (memberId === group.adminId) {
//       return res.status(400).json({ error: "Cannot remove group admin" });
//     }

//     // Remove member
//     const deleted = await GroupMember.destroy({
//       where: { userId: memberId, groupId },
//     });

//     console.log("Member removal result:", deleted);
//     console.log("=== END REMOVE MEMBER DEBUG ===");

//     if (!deleted) {
//       return res.status(404).json({ error: "Member not found in group" });
//     }

//     res.json({ message: "Member removed successfully" });
//   } catch (error) {
//     console.error("Remove member error:", error);
//     res.status(500).json({ error: "Failed to remove member" });
//   }
// };

// // Get group details
// const getGroupDetails = async (req, res) => {
//   try {
//     const { groupId } = req.params;

//     console.log("=== GET GROUP DETAILS DEBUG ===");
//     console.log("Group ID:", groupId);
//     console.log("Requesting user:", req.user.id);

//     const group = await Group.findByPk(groupId, {
//       include: [
//         { model: User, as: "admin", attributes: ["id", "username", "email"] },
//         {
//           model: User,
//           as: "members",
//           attributes: ["id", "username", "email", "profilePicture", "isOnline"],
//         },
//       ],
//     });

//     if (!group) {
//       return res.status(404).json({ error: "Group not found" });
//     }

//     console.log("Group found:", group.name);
//     console.log("Number of members:", group.members?.length || 0);
//     console.log("Admin:", group.admin?.username);

//     // Check if user is a member
//     const isMember = group.members.some((member) => member.id === req.user.id);
//     console.log("Is requesting user a member?", isMember);
//     console.log("=== END GROUP DETAILS DEBUG ===");

//     if (!isMember) {
//       return res
//         .status(403)
//         .json({ error: "You are not a member of this group" });
//     }

//     res.json({ group });
//   } catch (error) {
//     console.error("Get group details error:", error);
//     res.status(500).json({ error: "Failed to fetch group details" });
//   }
// };

// module.exports = {
//   createGroup,
//   getUserGroups,
//   getUserGroupsAlternative, // Alternative method for testing
//   addMember,
//   removeMember,
//   getGroupDetails,
// };

// ------------------


const { Group, GroupMember } = require("../models/postgresql/Group");
const User = require("../models/postgresql/User");
const { Op } = require("sequelize");

// Create a new group
const createGroup = async (req, res) => {
  try {
    const { name, description, memberIds = [] } = req.body;
    
    console.log("=== BACKEND CREATE GROUP DEBUG ===");
    console.log("Group name:", name);
    console.log("Description:", description);
    console.log("Member IDs received:", memberIds);
    console.log("Admin ID:", req.user.id);
    
    if (!name) {
      return res.status(400).json({ error: "Group name is required" });
    }

    // Create group with current user as admin
    const group = await Group.create({
      name,
      description,
      adminId: req.user.id,
    });

    console.log("Group created:", group.id);

    // Add admin as first member
    const membersToAdd = [req.user.id, ...memberIds];
    const uniqueMemberIds = [...new Set(membersToAdd)];
    
    console.log("Members to add:", uniqueMemberIds);

    // Add members to group
    for (const memberId of uniqueMemberIds) {
      const memberAdded = await GroupMember.create({
        userId: memberId,
        groupId: group.id,
      });
      console.log("Added member:", memberAdded.dataValues);
    }

    // Fetch admin user
    const admin = await User.findByPk(group.adminId, {
      attributes: ["id", "username", "email"]
    });

    // Fetch all members
    const memberRecords = await GroupMember.findAll({
      where: { groupId: group.id }
    });
    
    const memberUserIds = memberRecords.map(m => m.userId);
    const members = await User.findAll({
      where: { id: memberUserIds },
      attributes: ["id", "username", "email", "profilePicture"]
    });

    // Construct the response object
    const groupWithMembers = {
      ...group.toJSON(),
      admin,
      members
    };

    console.log("Group with members found:", !!groupWithMembers);
    console.log("Number of members included:", members.length);
    if (members.length > 0) {
      console.log("Members:", members.map(m => ({ id: m.id, username: m.username })));
    }
    console.log("=== END BACKEND CREATE GROUP DEBUG ===");

    res.status(201).json({
      message: "Group created successfully",
      group: groupWithMembers,
    });
  } catch (error) {
    console.error("Create group error:", error);
    res.status(500).json({ error: "Failed to create group" });
  }
};

// Get user's groups - FIXED VERSION WITHOUT ASSOCIATIONS
const getUserGroups = async (req, res) => {
  try {
    console.log("=== BACKEND GET USER GROUPS DEBUG (FIXED) ===");
    console.log("User ID:", req.user.id);
    
    // Step 1: Get all group memberships for the user
    const groupMembers = await GroupMember.findAll({
      where: { userId: req.user.id }
    });

    console.log("Group memberships found:", groupMembers.length);

    const groupIds = groupMembers.map(gm => gm.groupId);
    
    if (groupIds.length === 0) {
      console.log("User is not a member of any groups");
      console.log("=== END GET USER GROUPS DEBUG ===");
      return res.json({ groups: [] });
    }

    // Step 2: Get all groups
    const groups = await Group.findAll({
      where: { id: groupIds }
    });

    // Step 3: For each group, fetch admin and members separately
    const groupsWithMembers = await Promise.all(
      groups.map(async (group) => {
        // Fetch admin
        const admin = await User.findByPk(group.adminId, {
          attributes: ["id", "username"]
        });

        // Fetch all member records for this group
        const memberRecords = await GroupMember.findAll({
          where: { groupId: group.id }
        });

        // Get user IDs from member records
        const userIds = memberRecords.map(m => m.userId);
        
        // Fetch all users at once
        const memberUsers = await User.findAll({
          where: { id: userIds },
          attributes: ["id", "username", "profilePicture"]
        });
        
        console.log(`Group "${group.name}": ${memberUsers.length} members`);
        
        // Return group with admin and members
        return {
          ...group.toJSON(),
          admin,
          members: memberUsers
        };
      })
    );

    console.log("Total groups with members:", groupsWithMembers.length);
    console.log("=== END GET USER GROUPS DEBUG ===");

    res.json({ groups: groupsWithMembers });
  } catch (error) {
    console.error("Get groups error:", error);
    res.status(500).json({ error: "Failed to fetch groups" });
  }
};

// Alternative implementation with better performance (fewer queries)
const getUserGroupsOptimized = async (req, res) => {
  try {
    console.log("=== OPTIMIZED GET USER GROUPS ===");
    console.log("User ID:", req.user.id);
    
    // Get all group memberships for the user
    const userGroupMembers = await GroupMember.findAll({
      where: { userId: req.user.id }
    });

    const groupIds = userGroupMembers.map(gm => gm.groupId);
    
    if (groupIds.length === 0) {
      return res.json({ groups: [] });
    }

    // Fetch all groups at once
    const groups = await Group.findAll({
      where: { id: groupIds }
    });

    // Get ALL memberships for ALL these groups in one query
    const allGroupMembers = await GroupMember.findAll({
      where: { groupId: groupIds }
    });

    // Get all unique user IDs (including admins and members)
    const allUserIds = new Set();
    groups.forEach(g => allUserIds.add(g.adminId));
    allGroupMembers.forEach(gm => allUserIds.add(gm.userId));

    // Fetch ALL users in one query
    const allUsers = await User.findAll({
      where: { id: Array.from(allUserIds) },
      attributes: ["id", "username", "email", "profilePicture"]
    });

    // Create a map for quick user lookup
    const userMap = {};
    allUsers.forEach(user => {
      userMap[user.id] = user;
    });

    // Create a map of group members
    const groupMembersMap = {};
    allGroupMembers.forEach(gm => {
      if (!groupMembersMap[gm.groupId]) {
        groupMembersMap[gm.groupId] = [];
      }
      groupMembersMap[gm.groupId].push(gm.userId);
    });

    // Build the final response
    const groupsWithMembers = groups.map(group => {
      const memberIds = groupMembersMap[group.id] || [];
      const members = memberIds.map(userId => userMap[userId]).filter(Boolean);
      const admin = userMap[group.adminId];

      console.log(`Group "${group.name}": ${members.length} members`);

      return {
        ...group.toJSON(),
        admin,
        members
      };
    });

    console.log("Total groups:", groupsWithMembers.length);
    console.log("=== END OPTIMIZED GET USER GROUPS ===");

    res.json({ groups: groupsWithMembers });
  } catch (error) {
    console.error("Get groups error:", error);
    res.status(500).json({ error: "Failed to fetch groups" });
  }
};

// Add member to group (admin only)
const addMember = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { userId, email, phoneNumber } = req.body;

    console.log("=== ADD MEMBER DEBUG ===");
    console.log("Group ID:", groupId);
    console.log("User ID to add:", userId);
    console.log("Email:", email);
    console.log("Phone:", phoneNumber);

    // Find group
    const group = await Group.findByPk(groupId);
    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }

    // Check if requester is admin
    if (group.adminId !== req.user.id) {
      return res.status(403).json({ error: "Only admin can add members" });
    }

    // Find user to add
    let userToAdd;
    if (userId) {
      userToAdd = await User.findByPk(userId);
    } else if (email) {
      userToAdd = await User.findOne({ where: { email } });
    } else if (phoneNumber) {
      userToAdd = await User.findOne({ where: { phoneNumber } });
    }

    if (!userToAdd) {
      return res.status(404).json({ error: "User not found" });
    }

    console.log("User to add found:", userToAdd.username);

    // Check if user is already a member
    const existingMember = await GroupMember.findOne({
      where: { userId: userToAdd.id, groupId },
    });

    if (existingMember) {
      return res.status(400).json({ error: "User is already a member" });
    }

    // Add member
    const newMember = await GroupMember.create({
      userId: userToAdd.id,
      groupId,
    });

    console.log("Member added successfully:", newMember.dataValues);
    console.log("=== END ADD MEMBER DEBUG ===");

    res.json({
      message: "Member added successfully",
      member: {
        id: userToAdd.id,
        username: userToAdd.username,
        email: userToAdd.email,
      },
    });
  } catch (error) {
    console.error("Add member error:", error);
    res.status(500).json({ error: "Failed to add member" });
  }
};

// Remove member from group (admin only)
const removeMember = async (req, res) => {
  try {
    const { groupId, memberId } = req.params;

    console.log("=== REMOVE MEMBER DEBUG ===");
    console.log("Group ID:", groupId);
    console.log("Member ID to remove:", memberId);

    // Find group
    const group = await Group.findByPk(groupId);
    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }

    // Check if requester is admin
    if (group.adminId !== req.user.id) {
      return res.status(403).json({ error: "Only admin can remove members" });
    }

    // Cannot remove admin
    if (memberId === group.adminId) {
      return res.status(400).json({ error: "Cannot remove group admin" });
    }

    // Remove member
    const deleted = await GroupMember.destroy({
      where: { userId: memberId, groupId },
    });

    console.log("Member removal result:", deleted);
    console.log("=== END REMOVE MEMBER DEBUG ===");

    if (!deleted) {
      return res.status(404).json({ error: "Member not found in group" });
    }

    res.json({ message: "Member removed successfully" });
  } catch (error) {
    console.error("Remove member error:", error);
    res.status(500).json({ error: "Failed to remove member" });
  }
};

// Get group details without associations
const getGroupDetails = async (req, res) => {
  try {
    const { groupId } = req.params;

    console.log("=== GET GROUP DETAILS DEBUG ===");
    console.log("Group ID:", groupId);
    console.log("Requesting user:", req.user.id);

    // Fetch the group
    const group = await Group.findByPk(groupId);

    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }

    // Fetch admin
    const admin = await User.findByPk(group.adminId, {
      attributes: ["id", "username", "email"]
    });

    // Fetch all member records
    const memberRecords = await GroupMember.findAll({
      where: { groupId: group.id }
    });

    // Get user IDs and fetch users
    const userIds = memberRecords.map(m => m.userId);
    const members = await User.findAll({
      where: { id: userIds },
      attributes: ["id", "username", "email", "profilePicture", "isOnline"]
    });

    console.log("Group found:", group.name);
    console.log("Number of members:", members.length);
    console.log("Admin:", admin?.username);

    // Check if user is a member
    const isMember = members.some((member) => member.id === req.user.id);
    console.log("Is requesting user a member?", isMember);
    console.log("=== END GROUP DETAILS DEBUG ===");

    if (!isMember) {
      return res
        .status(403)
        .json({ error: "You are not a member of this group" });
    }

    // Construct response
    const groupWithDetails = {
      ...group.toJSON(),
      admin,
      members
    };

    res.json({ group: groupWithDetails });
  } catch (error) {
    console.error("Get group details error:", error);
    res.status(500).json({ error: "Failed to fetch group details" });
  }
};

module.exports = {
  createGroup,
  getUserGroups,
  getUserGroupsOptimized, // More efficient version
  addMember,
  removeMember,
  getGroupDetails,
};







