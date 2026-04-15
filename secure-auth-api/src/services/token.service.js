const jwt = require("jsonwebtoken");

const signToken = (payload, expiresIn = process.env.JWT_EXPIRES_IN || "1d") =>
  jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });

const verifyToken = (token) => jwt.verify(token, process.env.JWT_SECRET);

const cookieOptions = () => ({
  httpOnly: true,
  secure: process.env.COOKIE_SECURE === "true",
  sameSite: "lax",
  maxAge: 24 * 60 * 60 * 1000
});

module.exports = {
  signToken,
  verifyToken,
  cookieOptions
};
