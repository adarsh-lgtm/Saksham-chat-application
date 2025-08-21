const { body, validationResult } = require("express-validator");
const User = require("../models/postgresql/User");
const { generateToken } = require("../utils/tokenUtils");
// Validation rules
const registerValidation = [
  body("username").isLength({ min: 3 }).trim().escape(),
  body("email").isEmail().normalizeEmail(),
  body("password").isLength({ min: 6 }),
  body("phoneNumber").optional().isMobilePhone(),
];
const loginValidation = [
  body("email").isEmail().normalizeEmail(),
  body("password").notEmpty(),
];
// Register controller
const register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { username, email, password, phoneNumber } = req.body;
    // Check if user exists
    const existingUser = await User.findOne({
      where: {
        [require("sequelize").Op.or]: [{ email }, { username }],
      },
    });
    if (existingUser) {
      return res.status(400).json({
        error: "User with this email or username already exists",
      });
    }
    // Create new user
    const user = await User.create({
      username,
      email,
      password,
      phoneNumber,
    });
    // Generate token
    const token = generateToken(user.id);
    res.status(201).json({
      message: "User registered successfully",
      user: user.toJSON(),
      token,
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Registration failed" });
  }
};
// Login controller
const login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { email, password } = req.body;
    // Find user
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    // Validate password
    const isValid = await user.validatePassword(password);
    if (!isValid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    // Update online status
    await user.update({ isOnline: true });
    // Generate token
    const token = generateToken(user.id);
    res.json({
      message: "Login successful",
      user: user.toJSON(),
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Login failed" });
  }
};
// Logout controller
const logout = async (req, res) => {
  try {
    await req.user.update({
      isOnline: false,
      lastSeen: new Date(),
      socketId: null,
    });
    res.json({ message: "Logout successful" });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ error: "Logout failed" });
  }
};
module.exports = {
  register,
  login,
  logout,
  registerValidation,
  loginValidation,
};
