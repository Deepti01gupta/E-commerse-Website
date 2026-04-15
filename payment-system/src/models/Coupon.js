const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      unique: true,
      required: true,
      trim: true,
      uppercase: true
    },
    discountType: {
      type: String,
      enum: ["fixed", "percentage"],
      required: true
    },
    discountValue: {
      type: Number,
      required: true,
      min: 0
    },
    maxDiscountAmount: {
      type: Number,
      min: 0
    },
    minOrderValue: {
      type: Number,
      default: 0
    },
    usageLimit: {
      type: Number,
      default: null
    },
    usageCount: {
      type: Number,
      default: 0
    },
    validFrom: {
      type: Date,
      required: true
    },
    validUpto: {
      type: Date,
      required: true
    },
    applicableCategories: [String],
    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Coupon", couponSchema);
