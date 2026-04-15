const validate = (schema, pick = "body") => (req, res, next) => {
  const { error, value } = schema.validate(req[pick], {
    abortEarly: false,
    stripUnknown: true
  });

  if (error) {
    return res.status(400).json({
      success: false,
      message: "Validation error",
      errors: error.details.map((item) => item.message)
    });
  }

  req[pick] = value;
  next();
};

module.exports = validate;
