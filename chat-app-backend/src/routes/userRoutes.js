// src/routes/userRoutes.js
const express = require("express");
const router = express.Router();
const {
  getProfile,
  searchUsers,
  getAllUsers,
  updateProfile,
} = require("../controllers/userController");
const { authenticate } = require("../middleware/authMiddleware");
router.use(authenticate); // All user routes require authentication
router.get("/profile", getProfile);
router.get("/search", searchUsers);
router.get("/all", getAllUsers);
router.put("/profile", updateProfile);
module.exports = router;
