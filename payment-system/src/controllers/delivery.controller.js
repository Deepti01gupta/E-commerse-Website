const { calculateShippingCharge } = require("../services/delivery.service");

const calculateShipping = async (req, res) => {
  const { pincode, cartTotal, productWeight } = req.body;

  const result = await calculateShippingCharge({
    pincode,
    cartTotal,
    productWeight: productWeight || 0
  });

  if (!result.charge && result.message.includes("not available")) {
    return res.status(400).json({
      success: false,
      message: result.message
    });
  }

  return res.status(200).json({
    success: true,
    shippingCharge: result.charge,
    isFreeDelivery: result.isFreeDelivery,
    processingDays: result.processingDays,
    message: result.message
  });
};

module.exports = {
  calculateShipping
};
