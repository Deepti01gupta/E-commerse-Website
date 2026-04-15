const { validateCoupon } = require("../services/coupon.service");

const applyCoupon = async (req, res) => {
  const { code, cartTotal } = req.body;

  const result = await validateCoupon({
    code,
    cartTotal
  });

  if (!result.valid) {
    return res.status(400).json({
      success: false,
      message: result.message
    });
  }

  return res.status(200).json({
    success: true,
    message: "Coupon applied successfully",
    discountAmount: result.discountAmount,
    couponDetails: {
      code: result.coupon.code,
      discountType: result.coupon.discountType,
      discountValue: result.coupon.discountValue
    }
  });
};

module.exports = {
  applyCoupon
};
