const Joi = require('joi');

/**
 * Order Validators
 */
const orderValidators = {
  createOrder: Joi.object({
    items: Joi.array()
      .items(
        Joi.object({
          productId: Joi.string().required(),
          quantity: Joi.number().integer().min(1).required(),
          price: Joi.number().required(),
          title: Joi.string()
        })
      )
      .min(1)
      .required(),
    shippingAddress: Joi.object({
      name: Joi.string().required(),
      phone: Joi.string().required(),
      address: Joi.string().required(),
      city: Joi.string().required(),
      state: Joi.string().required(),
      zipCode: Joi.string().required(),
      country: Joi.string().default('India'),
      latitude: Joi.number(),
      longitude: Joi.number()
    }).required(),
    paymentDetails: Joi.object({
      method: Joi.string().valid('credit_card', 'debit_card', 'upi', 'wallet').required(),
      amount: Joi.number().required(),
      currency: Joi.string().default('INR')
    }).required()
  }),

  updateOrderStatus: Joi.object({
    newStatus: Joi.string()
      .valid('placed', 'confirmed', 'shipped', 'out_for_delivery', 'delivered', 'cancelled')
      .required(),
    message: Joi.string().required(),
    location: Joi.object({
      latitude: Joi.number(),
      longitude: Joi.number(),
      address: Joi.string(),
      city: Joi.string(),
      state: Joi.string()
    })
  }),

  updateLocation: Joi.object({
    location: Joi.object({
      latitude: Joi.number().required(),
      longitude: Joi.number().required(),
      address: Joi.string().required(),
      city: Joi.string().required(),
      state: Joi.string().required()
    }).required()
  })
};

/**
 * Return Validators
 */
const returnValidators = {
  createReturnRequest: Joi.object({
    orderId: Joi.string().required(),
    reason: Joi.string()
      .valid('defective_product', 'not_as_described', 'damaged_in_shipping', 'wrong_item_received', 'changed_mind', 'other')
      .required(),
    items: Joi.array()
      .items(
        Joi.object({
          productId: Joi.string().required(),
          quantity: Joi.number().integer().min(1).required()
        })
      ),
    comments: Joi.string().max(500)
  }),

  approveReturn: Joi.object({
    notes: Joi.string().max(500)
  }),

  rejectReturn: Joi.object({
    reason: Joi.string().required().max(500)
  }),

  updateReturnStatus: Joi.object({
    status: Joi.string()
      .valid('initiated', 'approved', 'rejected', 'shipped_back', 'received', 'completed', 'cancelled')
      .required(),
    message: Joi.string().required()
  })
};

/**
 * Refund Validators
 */
const refundValidators = {
  processRefund: Joi.object({
    transactionId: Joi.string()
  }),

  updateRefundStatus: Joi.object({
    status: Joi.string()
      .valid('pending', 'processed', 'completed', 'failed', 'cancelled')
      .required(),
    message: Joi.string().required()
  }),

  createManualRefund: Joi.object({
    orderId: Joi.string().required(),
    amount: Joi.number().required(),
    reason: Joi.string().required()
  })
};

/**
 * Tracking Validators
 */
const trackingValidators = {
  addLocationUpdate: Joi.object({
    orderId: Joi.string().required(),
    location: Joi.object({
      latitude: Joi.number().required(),
      longitude: Joi.number().required(),
      address: Joi.string().required(),
      city: Joi.string().required(),
      state: Joi.string().required()
    }).required(),
    event: Joi.string().valid('pickup', 'in_transit', 'checkpoint', 'out_for_delivery', 'delivered'),
    message: Joi.string(),
    eventDescription: Joi.string(),
    source: Joi.string().valid('gps', 'manual', 'api', 'simulated', 'delivery_provider')
  }),

  logDeliveryAttempt: Joi.object({
    status: Joi.string().valid('success', 'failed', 'no_answer').required(),
    notes: Joi.string().max(500)
  }),

  setEstimatedDelivery: Joi.object({
    estimatedHours: Joi.number().integer().min(1).max(168)
  }),

  markAsDelivered: Joi.object({
    location: Joi.object({
      latitude: Joi.number().required(),
      longitude: Joi.number().required(),
      address: Joi.string().required(),
      city: Joi.string().required(),
      state: Joi.string().required()
    }).required(),
    signature: Joi.string(),
    notes: Joi.string().max(500)
  })
};

module.exports = {
  orderValidators,
  returnValidators,
  refundValidators,
  trackingValidators
};
