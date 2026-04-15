const express = require("express");
const asyncHandler = require("../utils/asyncHandler");
const {
  getOrderById,
  getUserOrders,
  generateInvoice,
  downloadInvoice
} = require("../controllers/order.controller");

const router = express.Router();

router.get("/", asyncHandler(getUserOrders));
router.get("/:orderId", asyncHandler(getOrderById));
router.get("/:orderId/invoice", asyncHandler(generateInvoice));
router.get("/:orderId/download-invoice", asyncHandler(downloadInvoice));

module.exports = router;
