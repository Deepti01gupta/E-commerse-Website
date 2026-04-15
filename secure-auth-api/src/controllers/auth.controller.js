const speakeasy = require("speakeasy");
const User = require("../models/User");
const { sendMail } = require("../services/email.service");
const { signToken, verifyToken, cookieOptions } = require("../services/token.service");
const { generateRandomToken, hashToken } = require("../utils/crypto.util");

const cookieName = process.env.COOKIE_NAME || "auth_token";

const safeUser = (user) => ({
  id: user._id,
  username: user.username,
  email: user.email,
  role: user.role,
  authProvider: user.authProvider,
  twoFactorEnabled: user.twoFactorEnabled
});

const issueAuthCookie = (res, user) => {
  // Keep JWT in an HTTP-only cookie to reduce XSS token theft risk.
  const token = signToken({ sub: user._id, role: user.role });
  res.cookie(cookieName, token, cookieOptions());
  return token;
};

const register = async (req, res) => {
  const { username, email, password, role } = req.body;

  const existingUser = await User.findOne({
    $or: [{ email: email.toLowerCase() }, { username }]
  });

  if (existingUser) {
    return res.status(409).json({
      success: false,
      message: "User with this email or username already exists"
    });
  }

  const user = await User.create({
    username,
    email: email.toLowerCase(),
    password,
    role,
    authProvider: "local"
  });

  issueAuthCookie(res, user);

  return res.status(201).json({
    success: true,
    message: "Registration successful",
    user: safeUser(user)
  });
};

const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({
      success: false,
      message: "Invalid email or password"
    });
  }

  if (user.twoFactorEnabled && user.twoFactorSecret) {
    // Generate time-based OTP (5-minute step) and send it via email.
    const otp = speakeasy.totp({
      secret: user.twoFactorSecret,
      encoding: "base32",
      step: 300
    });

    await sendMail({
      to: user.email,
      subject: "Your login OTP",
      html: `<p>Your OTP is <strong>${otp}</strong>. It expires in 5 minutes.</p>`
    });

    const tempToken = signToken({
      sub: user._id,
      purpose: "2fa",
      role: user.role
    }, "10m");

    return res.status(200).json({
      success: true,
      message: "OTP sent to your email",
      requires2FA: true,
      tempToken
    });
  }

  issueAuthCookie(res, user);

  return res.status(200).json({
    success: true,
    message: "Login successful",
    user: safeUser(user)
  });
};

const verify2FA = async (req, res) => {
  const { tempToken, otp } = req.body;

  let payload;
  try {
    payload = verifyToken(tempToken);
  } catch (_error) {
    return res.status(401).json({ success: false, message: "Invalid temporary token" });
  }

  if (payload.purpose !== "2fa") {
    return res.status(401).json({ success: false, message: "Invalid token purpose" });
  }

  const user = await User.findById(payload.sub);
  if (!user || !user.twoFactorSecret) {
    return res.status(404).json({ success: false, message: "User not found for 2FA" });
  }

  const verified = speakeasy.totp.verify({
    secret: user.twoFactorSecret,
    encoding: "base32",
    token: otp,
    step: 300,
    window: 1
  });

  if (!verified) {
    return res.status(401).json({ success: false, message: "Invalid or expired OTP" });
  }

  issueAuthCookie(res, user);

  return res.status(200).json({
    success: true,
    message: "2FA verification successful",
    user: safeUser(user)
  });
};

const setup2FA = async (req, res) => {
  const secret = speakeasy.generateSecret({
    name: `Shop Security (${req.user.email})`,
    length: 20
  });

  const user = await User.findById(req.user._id);
  user.twoFactorTempSecret = secret.base32;
  await user.save();

  return res.status(200).json({
    success: true,
    message: "2FA setup generated",
    secret: secret.base32,
    otpauthUrl: secret.otpauth_url
  });
};

const enable2FA = async (req, res) => {
  const { otp } = req.body;

  const user = await User.findById(req.user._id);
  if (!user?.twoFactorTempSecret) {
    return res.status(400).json({
      success: false,
      message: "2FA setup not initiated"
    });
  }

  const verified = speakeasy.totp.verify({
    secret: user.twoFactorTempSecret,
    encoding: "base32",
    token: otp,
    window: 1
  });

  if (!verified) {
    return res.status(400).json({ success: false, message: "Invalid OTP" });
  }

  user.twoFactorEnabled = true;
  user.twoFactorSecret = user.twoFactorTempSecret;
  user.twoFactorTempSecret = null;
  await user.save();

  return res.status(200).json({ success: true, message: "2FA enabled successfully" });
};

const disable2FA = async (req, res) => {
  const user = await User.findById(req.user._id);
  user.twoFactorEnabled = false;
  user.twoFactorSecret = null;
  user.twoFactorTempSecret = null;
  await user.save();

  return res.status(200).json({ success: true, message: "2FA disabled" });
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    return res.status(200).json({
      success: true,
      message: "If the email exists, a reset link has been sent"
    });
  }

  const rawToken = generateRandomToken(32);
  const tokenHash = hashToken(rawToken);

  // Store only hashed reset token, never the raw token.
  user.passwordResetTokenHash = tokenHash;
  user.passwordResetExpiresAt = new Date(Date.now() + 15 * 60 * 1000);
  await user.save();

  const resetLink = `${process.env.CLIENT_URL}/reset-password?token=${rawToken}&id=${user._id}`;

  await sendMail({
    to: user.email,
    subject: "Password reset request",
    html: `
      <p>You requested a password reset.</p>
      <p>Click the link below to reset your password (valid for 15 minutes):</p>
      <a href="${resetLink}">${resetLink}</a>
    `
  });

  return res.status(200).json({
    success: true,
    message: "If the email exists, a reset link has been sent"
  });
};

const resetPassword = async (req, res) => {
  const { userId, token, newPassword } = req.body;

  const user = await User.findById(userId);
  if (!user || !user.passwordResetTokenHash || !user.passwordResetExpiresAt) {
    return res.status(400).json({ success: false, message: "Invalid reset request" });
  }

  const isExpired = user.passwordResetExpiresAt.getTime() < Date.now();
  const incomingHash = hashToken(token);

  if (isExpired || incomingHash !== user.passwordResetTokenHash) {
    return res.status(400).json({ success: false, message: "Token is invalid or expired" });
  }

  user.password = newPassword;
  user.passwordResetTokenHash = null;
  user.passwordResetExpiresAt = null;
  await user.save();

  return res.status(200).json({ success: true, message: "Password reset successful" });
};

const logout = async (_req, res) => {
  res.clearCookie(cookieName, cookieOptions());
  return res.status(200).json({ success: true, message: "Logged out" });
};

const oauthSuccess = async (req, res) => {
  const user = req.user;
  issueAuthCookie(res, user);

  const redirectURL = `${process.env.CLIENT_URL}/oauth/success`;
  return res.redirect(redirectURL);
};

const oauthFailure = async (_req, res) => {
  const redirectURL = `${process.env.CLIENT_URL}/oauth/failure`;
  return res.redirect(redirectURL);
};

module.exports = {
  register,
  login,
  verify2FA,
  setup2FA,
  enable2FA,
  disable2FA,
  forgotPassword,
  resetPassword,
  logout,
  oauthSuccess,
  oauthFailure
};
