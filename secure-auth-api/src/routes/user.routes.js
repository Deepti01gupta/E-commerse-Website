const express = require("express");
const asyncHandler = require("../utils/asyncHandler");
const { protect } = require("../middleware/auth.middleware");
const { getMe } = require("../controllers/user.controller");

const router = express.Router();

router.get("/me", protect, asyncHandler(getMe));

module.exports = router;
