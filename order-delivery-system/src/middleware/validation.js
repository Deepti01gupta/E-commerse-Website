/**
 * Validation Middleware
 */
const validate = (schema) => {
  return (req, res, next) => {
    try {
      const { error, value } = schema.validate(req.body, {
        abortEarly: false,
        stripUnknown: true
      });
      
      if (error) {
        const errors = error.details.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }));
        
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors
        });
      }
      
      req.body = value;
      next();
    } catch (err) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        error: err.message
      });
    }
  };
};

module.exports = {
  validate
};
