const User = require("../models/postgresql/User");
const { Op } = require("sequelize");
// Get current user profile
const getProfile = async (req, res) => {
  try {
    res.json({ user: req.user });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch profile" });
  }
};
// Search users
const searchUsers = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query || query.length < 2) {
      return res.status(400).json({ error: "Search query too short" });
    }
    const users = await User.findAll({
      where: {
        [Op.and]: [
          {
            [Op.or]: [
              { username: { [Op.iLike]: `%${query}%` } },
              { email: { [Op.iLike]: `%${query}%` } },
              { phoneNumber: { [Op.like]: `%${query}%` } },
            ],
          },
          { id: { [Op.ne]: req.user.id } }, // Exclude current user
        ],
      },
      attributes: [
        "id",
        "username",
        "email",
        "phoneNumber",
        "profilePicture",
        "isOnline",
      ],
      limit: 20,
    });
    res.json({ users });
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({ error: "Search failed" });
  }
};
// Get all users except current user
const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      where: { id: { [Op.ne]: req.user.id } },
      attributes: [
        "id",
        "username",
        "email",
        "profilePicture",
        "isOnline",
        "lastSeen",
      ],
      order: [["username", "ASC"]],
    });
    res.json({ users });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
};
// Update user profile
const updateProfile = async (req, res) => {
  try {
    const { username, phoneNumber, profilePicture } = req.body;
    const updateData = {};
    if (username) updateData.username = username;
    if (phoneNumber) updateData.phoneNumber = phoneNumber;
    if (profilePicture) updateData.profilePicture = profilePicture;
    await req.user.update(updateData);
    res.json({
      message: "Profile updated successfully",
      user: req.user,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to update profile" });
  }
};
module.exports = {
  getProfile,
  searchUsers,
  getAllUsers,
  updateProfile,
};
