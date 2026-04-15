const express = require("express");
const validate = require("../middleware/validate.middleware");
const asyncHandler = require("../utils/asyncHandler");
const { calculateShipping } = require("../controllers/delivery.controller");
const { calculateShippingSchema } = require("../validators/checkout.validators");

const router = express.Router();

router.post("/calculate", validate(calculateShippingSchema), asyncHandler(calculateShipping));

module.exports = router;
