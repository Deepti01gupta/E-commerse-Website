const jwt = require('jsonwebtoken');

/**
 * Authentication Middleware
 */
const authenticate = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key');
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
};

/**
 * Admin Authorization Middleware
 */
const isAdmin = (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }
    next();
  } catch (error) {
    return res.status(403).json({
      success: false,
      message: 'Unauthorized'
    });
  }
};

/**
 * Delivery Partner Authorization Middleware
 */
const isDeliveryPartner = (req, res, next) => {
  try {
    if (req.user.role !== 'delivery_partner' && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Delivery partner access required'
      });
    }
    next();
  } catch (error) {
    return res.status(403).json({
      success: false,
      message: 'Unauthorized'
    });
  }
};

/**
 * Error Handling Middleware
 */
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);
  
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: err.errors
    });
  }
  
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: 'Invalid ID'
    });
  }
  
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error'
  });
};

module.exports = {
  authenticate,
  isAdmin,
  isDeliveryPartner,
  errorHandler
};
