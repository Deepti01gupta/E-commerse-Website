const Joi = require("joi");

const registerSchema = Joi.object({
  username: Joi.string().trim().min(3).max(40).required(),
  email: Joi.string().email().required(),
  password: Joi.string()
    .min(8)
    .pattern(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z\d]).+$/)
    .required()
    .messages({
      "string.pattern.base":
        "Password must contain letters, numbers, and a special character"
    }),
  role: Joi.string().valid("buyer", "seller", "admin").default("buyer")
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

const verify2faSchema = Joi.object({
  tempToken: Joi.string().required(),
  otp: Joi.string().length(6).required()
});

const setup2faSchema = Joi.object({
  otp: Joi.string().length(6).required()
});

const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().required()
});

const resetPasswordSchema = Joi.object({
  userId: Joi.string().required(),
  token: Joi.string().required(),
  newPassword: Joi.string()
    .min(8)
    .pattern(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z\d]).+$/)
    .required()
});

module.exports = {
  registerSchema,
  loginSchema,
  verify2faSchema,
  setup2faSchema,
  forgotPasswordSchema,
  resetPasswordSchema
};
