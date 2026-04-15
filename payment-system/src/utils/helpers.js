const generateOrderId = () => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  return `ORD-${timestamp}-${random}`;
};

const calculateTax = (subtotal, taxRate = 0.18) => {
  return Math.round(subtotal * taxRate * 100) / 100;
};

const calculateOrderTotal = ({ subtotal, tax, shippingCharge, discountAmount }) => {
  return subtotal + tax + shippingCharge - discountAmount;
};

module.exports = {
  generateOrderId,
  calculateTax,
  calculateOrderTotal
};
