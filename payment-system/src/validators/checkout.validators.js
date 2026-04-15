const Joi = require("joi");

const initiateCheckoutSchema = Joi.object({
  items: Joi.array()
    .items(
      Joi.object({
        productId: Joi.string().required(),
        name: Joi.string().required(),
        price: Joi.number().positive().required(),
        quantity: Joi.number().integer().min(1).required()
      })
    )
    .min(1)
    .required(),
  shippingAddress: Joi.object({
    fullName: Joi.string().required(),
    email: Joi.string().email().required(),
    phone: Joi.string().regex(/^\d{10}$/).required(),
    street: Joi.string().required(),
    city: Joi.string().required(),
    pincode: Joi.string().regex(/^\d{6}$/).required(),
    state: Joi.string().required(),
    country: Joi.string().required()
  }).required(),
  paymentMethod: Joi.string()
    .valid("stripe", "razorpay", "upi", "netbanking", "wallet")
    .required(),
  couponCode: Joi.string().optional()
});

const createRazorpayOrderSchema = Joi.object({
  razorpayOrderId: Joi.string().required(),
  razorpayPaymentId: Joi.string().required(),
  razorpaySignature: Joi.string().required()
});

const applyCouponSchema = Joi.object({
  code: Joi.string().trim().required(),
  cartTotal: Joi.number().positive().required()
});

const calculateShippingSchema = Joi.object({
  pincode: Joi.string().regex(/^\d{6}$/).required(),
  cartTotal: Joi.number().positive().required(),
  productWeight: Joi.number().optional()
});

module.exports = {
  initiateCheckoutSchema,
  createRazorpayOrderSchema,
  applyCouponSchema,
  calculateShippingSchema
};
