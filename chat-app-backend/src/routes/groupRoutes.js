// src/routes/groupRoutes.js
const express = require("express");
const router = express.Router();
const {
  createGroup,
  getUserGroups,
  addMember,
  removeMember,
  getGroupDetails,
} = require("../controllers/groupController");
const { authenticate } = require("../middleware/authMiddleware");
router.use(authenticate); // All group routes require authentication
router.post("/create", createGroup);
router.get("/my-groups", getUserGroups);
router.get("/:groupId", getGroupDetails);
router.post("/:groupId/members", addMember);
router.delete("/:groupId/members/:memberId", removeMember);
module.exports = router;
