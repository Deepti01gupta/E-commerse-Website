const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const createPaymentIntent = async ({ amount, customerId, metadata }) => {
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(amount * 100),
    currency: "inr",
    customer: customerId,
    metadata
  });

  return paymentIntent;
};

const retrievePaymentIntent = async (intentId) => {
  return await stripe.paymentIntents.retrieve(intentId);
};

const confirmPaymentIntent = async (intentId, paymentMethodId) => {
  return await stripe.paymentIntents.confirm(intentId, {
    payment_method: paymentMethodId,
    return_url: `${process.env.CLIENT_URL}/checkout/success`
  });
};

module.exports = {
  createPaymentIntent,
  retrievePaymentIntent,
  confirmPaymentIntent
};
