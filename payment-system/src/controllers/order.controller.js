const Order = require("../models/Order");
const { generateInvoicePDF } = require("../services/invoice.service");
const { sendOrderConfirmationEmail } = require("../services/email.service");

const getOrderById = async (req, res) => {
  const { orderId } = req.params;

  const order = await Order.findById(orderId);

  if (!order) {
    return res.status(404).json({
      success: false,
      message: "Order not found"
    });
  }

  return res.status(200).json({
    success: true,
    order
  });
};

const getUserOrders = async (req, res) => {
  const orders = await Order.find({ userId: req.user._id }).sort({ createdAt: -1 });

  return res.status(200).json({
    success: true,
    orders
  });
};

const generateInvoice = async (req, res) => {
  const { orderId } = req.params;

  const order = await Order.findById(orderId);

  if (!order) {
    return res.status(404).json({
      success: false,
      message: "Order not found"
    });
  }

  if (order.paymentStatus !== "completed") {
    return res.status(400).json({
      success: false,
      message: "Invoice can only be generated for completed orders"
    });
  }

  const pdfBuffer = await generateInvoicePDF(order);

  res.set({
    "Content-Type": "application/pdf",
    "Content-Disposition": `attachment; filename="invoice-${order.orderId}.pdf"`
  });

  res.send(pdfBuffer);

  // Mark invoice as generated
  order.invoiceGenerated = true;
  order.invoiceUrl = `/api/orders/${orderId}/invoice`;
  await order.save();
};

const downloadInvoice = async (req, res) => {
  const { orderId } = req.params;

  const order = await Order.findById(orderId);

  if (!order || !order.invoiceGenerated) {
    return res.status(404).json({
      success: false,
      message: "Invoice not found"
    });
  }

  const pdfBuffer = await generateInvoicePDF(order);

  res.set({
    "Content-Type": "application/pdf",
    "Content-Disposition": `attachment; filename="invoice-${order.orderId}.pdf"`
  });

  res.send(pdfBuffer);
};

module.exports = {
  getOrderById,
  getUserOrders,
  generateInvoice,
  downloadInvoice
};
