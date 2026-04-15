const Coupon = require("../models/Coupon");

const validateCoupon = async ({ code, cartTotal }) => {
  const coupon = await Coupon.findOne({ code: code.toUpperCase() });

  if (!coupon) {
    return {
      valid: false,
      message: "Coupon not found"
    };
  }

  if (!coupon.isActive) {
    return {
      valid: false,
      message: "Coupon is inactive"
    };
  }

  const now = new Date();
  if (coupon.validFrom > now || coupon.validUpto < now) {
    return {
      valid: false,
      message: "Coupon has expired or is not yet valid"
    };
  }

  if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
    return {
      valid: false,
      message: "Coupon usage limit reached"
    };
  }

  if (cartTotal < coupon.minOrderValue) {
    return {
      valid: false,
      message: `Minimum cart value of ₹${coupon.minOrderValue} required`
    };
  }

  let discountAmount = 0;
  if (coupon.discountType === "fixed") {
    discountAmount = coupon.discountValue;
  } else {
    discountAmount = (cartTotal * coupon.discountValue) / 100;
    if (coupon.maxDiscountAmount) {
      discountAmount = Math.min(discountAmount, coupon.maxDiscountAmount);
    }
  }

  return {
    valid: true,
    coupon,
    discountAmount: Math.round(discountAmount * 100) / 100
  };
};

const incrementCouponUsage = async (code) => {
  await Coupon.updateOne(
    { code: code.toUpperCase() },
    { $inc: { usageCount: 1 } }
  );
};

module.exports = {
  validateCoupon,
  incrementCouponUsage
};
