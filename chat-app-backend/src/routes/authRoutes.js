const express = require("express");
const router = express.Router();
const {
  register,
  login,
  logout,
  registerValidation,
  loginValidation,
} = require("../controllers/authController");
const { authenticate } = require("../middleware/authMiddleware");
router.post("/register", registerValidation, register);
router.post("/login", loginValidation, login);
router.post("/logout", authenticate, logout);
module.exports = router;
