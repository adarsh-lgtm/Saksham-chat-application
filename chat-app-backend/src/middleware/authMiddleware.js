const { verifyToken } = require("../utils/tokenUtils");
const User = require("../models/postgresql/User");
const authenticate = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({ error: "Authentication required" });
    }
    const decoded = verifyToken(token);
    const user = await User.findByPk(decoded.userId, {
      attributes: { exclude: ["password"] },
    });
    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }
    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
};
module.exports = { authenticate };
