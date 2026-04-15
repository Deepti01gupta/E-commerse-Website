const mongoose = require("mongoose");

const deliveryZoneSchema = new mongoose.Schema(
  {
    pincodes: {
      type: [String],
      required: true,
      index: true
    },
    city: String,
    state: String,
    chargePerUnit: {
      type: Number,
      default: 0
    },
    chargeFlat: {
      type: Number,
      default: 50
    },
    freeDeliveryAbove: {
      type: Number,
      default: 2500
    },
    processingDays: {
      type: Number,
      default: 3
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("DeliveryZone", deliveryZoneSchema);
