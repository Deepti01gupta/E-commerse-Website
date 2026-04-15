const express = require("express");
const validate = require("../middleware/validate.middleware");
const asyncHandler = require("../utils/asyncHandler");
const { protect } = require("../middleware/auth.middleware");
const { authLimiter, loginLimiter } = require("../middleware/rateLimit.middleware");
const {
  registerSchema,
  loginSchema,
  verify2faSchema,
  setup2faSchema,
  forgotPasswordSchema,
  resetPasswordSchema
} = require("../validators/auth.validators");
const {
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
} = require("../controllers/auth.controller");
const { passport } = require("../config/passport");

const router = express.Router();

const ensureOAuthStrategy = (strategyName) => (req, res, next) => {
  if (!passport._strategy(strategyName)) {
    return res.status(503).json({
      success: false,
      message: `${strategyName} OAuth is not configured on this server`
    });
  }
  return next();
};

router.post("/register", authLimiter, validate(registerSchema), asyncHandler(register));
router.post("/login", loginLimiter, validate(loginSchema), asyncHandler(login));
router.post("/verify-2fa", loginLimiter, validate(verify2faSchema), asyncHandler(verify2FA));
router.post("/forgot-password", authLimiter, validate(forgotPasswordSchema), asyncHandler(forgotPassword));
router.post("/reset-password", authLimiter, validate(resetPasswordSchema), asyncHandler(resetPassword));
router.post("/logout", asyncHandler(logout));

router.post("/2fa/setup", protect, asyncHandler(setup2FA));
router.post("/2fa/enable", protect, validate(setup2faSchema), asyncHandler(enable2FA));
router.post("/2fa/disable", protect, asyncHandler(disable2FA));

router.get(
  "/google",
  ensureOAuthStrategy("google"),
  passport.authenticate("google", { scope: ["profile", "email"], session: false })
);
router.get(
  "/google/callback",
  ensureOAuthStrategy("google"),
  passport.authenticate("google", { session: false, failureRedirect: "/api/auth/oauth/failure" }),
  asyncHandler(oauthSuccess)
);

router.get(
  "/github",
  ensureOAuthStrategy("github"),
  passport.authenticate("github", { session: false })
);
router.get(
  "/github/callback",
  ensureOAuthStrategy("github"),
  passport.authenticate("github", { session: false, failureRedirect: "/api/auth/oauth/failure" }),
  asyncHandler(oauthSuccess)
);

router.get("/oauth/failure", asyncHandler(oauthFailure));

module.exports = router;
