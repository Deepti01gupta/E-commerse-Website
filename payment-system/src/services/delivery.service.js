const DeliveryZone = require("../models/DeliveryZone");

const calculateShippingCharge = async ({ pincode, cartTotal, productWeight }) => {
  const zone = await DeliveryZone.findOne({
    pincodes: pincode,
    isActive: true
  });

  if (!zone) {
    return {
      charge: 0,
      isFreeDelivery: false,
      message: "Delivery not available in this area"
    };
  }

  if (cartTotal >= zone.freeDeliveryAbove) {
    return {
      charge: 0,
      isFreeDelivery: true,
      message: "Free delivery available"
    };
  }

  const charge = zone.chargeFlat + (productWeight || 0) * zone.chargePerUnit;

  return {
    charge,
    isFreeDelivery: false,
    processingDays: zone.processingDays
  };
};

const getDeliveryZoneByPincode = async (pincode) => {
  return await DeliveryZone.findOne({
    pincodes: pincode,
    isActive: true
  });
};

module.exports = {
  calculateShippingCharge,
  getDeliveryZoneByPincode
};
