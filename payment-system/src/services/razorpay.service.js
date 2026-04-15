const Razorpay = require("razorpay");
const crypto = require("crypto");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

const createOrder = async ({ amount, orderId, userEmail, userName }) => {
  const order = await razorpay.orders.create({
    amount: Math.round(amount * 100),
    currency: "INR",
    receipt: orderId,
    notes: {
      orderId,
      userEmail,
      userName
    }
  });

  return order;
};

const fetchPayment = async (paymentId) => {
  return await razorpay.payments.fetch(paymentId);
};

const verifySignature = (orderId, paymentId, signature) => {
  const data = `${orderId}|${paymentId}`;
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(data)
    .digest("hex");

  return expectedSignature === signature;
};

const createTransfer = async ({ amount, accountId, recipients }) => {
  return await razorpay.transfers.create({
    account: accountId,
    amount: Math.round(amount * 100),
    currency: "INR",
    recipients
  });
};

module.exports = {
  createOrder,
  fetchPayment,
  verifySignature,
  createTransfer
};
