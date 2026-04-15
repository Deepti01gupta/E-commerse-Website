const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

const sendOrderConfirmationEmail = async ({ to, orderDetails }) => {
  if (!process.env.SMTP_USER) {
    console.warn("Email skipped: SMTP not configured");
    return;
  }

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject: `Order Confirmation - ${orderDetails.orderId}`,
    html: `
      <h2>Order Confirmed!</h2>
      <p>Thank you for your order. Here are the details:</p>
      <p><strong>Order ID:</strong> ${orderDetails.orderId}</p>
      <p><strong>Total Amount:</strong> ₹${orderDetails.pricing.total}</p>
      <p><strong>Status:</strong> ${orderDetails.paymentStatus}</p>
      <p>Your invoice is attached or visit your account for details.</p>
    `
  });
};

const sendPaymentFailureEmail = async ({ to, orderDetails, reason }) => {
  if (!process.env.SMTP_USER) {
    console.warn("Email skipped: SMTP not configured");
    return;
  }

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject: `Payment Failed - ${orderDetails.orderId}`,
    html: `
      <p>Your payment for order <strong>${orderDetails.orderId}</strong> failed.</p>
      <p><strong>Reason:</strong> ${reason}</p>
      <p>Please try again or contact support.</p>
    `
  });
};

module.exports = {
  sendOrderConfirmationEmail,
  sendPaymentFailureEmail
};
