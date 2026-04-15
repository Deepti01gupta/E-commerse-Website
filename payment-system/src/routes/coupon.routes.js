const express = require("express");
const validate = require("../middleware/validate.middleware");
const asyncHandler = require("../utils/asyncHandler");
const { applyCoupon } = require("../controllers/coupon.controller");
const { applyCouponSchema } = require("../validators/checkout.validators");

const router = express.Router();

router.post("/apply", validate(applyCouponSchema), asyncHandler(applyCoupon));

module.exports = router;
