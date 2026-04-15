const User = require("../models/User");
const { verifyToken } = require("../services/token.service");

const extractToken = (req) => {
  const cookieName = process.env.COOKIE_NAME || "auth_token";

  if (req.cookies?.[cookieName]) {
    return req.cookies[cookieName];
  }

  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice(7);
  }

  return null;
};

const protect = async (req, res, next) => {
  try {
    const token = extractToken(req);
    if (!token) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const payload = verifyToken(token);
    if (!payload?.sub) {
      return res.status(401).json({ success: false, message: "Invalid token" });
    }

    const user = await User.findById(payload.sub).select("-password");
    if (!user) {
      return res.status(401).json({ success: false, message: "User not found" });
    }

    req.user = user;
    next();
  } catch (_error) {
    return res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
};

module.exports = { protect };
