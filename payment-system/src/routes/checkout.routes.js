const express = require("express");
const validate = require("../middleware/validate.middleware");
const asyncHandler = require("../utils/asyncHandler");
const {
  initiateCheckout,
  verifyRazorpayPayment
} = require("../controllers/checkout.controller");
const {
  initiateCheckoutSchema,
  createRazorpayOrderSchema
} = require("../validators/checkout.validators");

const router = express.Router();

router.post("/initiate", validate(initiateCheckoutSchema), asyncHandler(initiateCheckout));
router.post("/verify-razorpay", validate(createRazorpayOrderSchema), asyncHandler(verifyRazorpayPayment));

module.exports = router;
