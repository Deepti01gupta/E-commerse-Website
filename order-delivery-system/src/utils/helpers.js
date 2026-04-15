/**
 * Utility Functions - Helper methods for Order & Delivery System
 */

/**
 * Calculate shipping cost based on distance
 * @param {Number} distance - Distance in km
 * @returns {Number} Shipping cost
 */
const calculateShippingCost = (distance) => {
  const baseCost = 50; // Base shipping cost
  const perKmCost = 5;
  return baseCost + (distance * perKmCost);
};

/**
 * Calculate delivery time estimate based on distance and traffic
 * @param {Number} distance - Distance in km
 * @param {String} trafficLevel - low, medium, high
 * @returns {Number} Estimated hours
 */
const estimateDeliveryTime = (distance, trafficLevel = 'medium') => {
  const avgSpeed = {
    low: 60,
    medium: 40,
    high: 20
  };
  
  const baseTime = distance / avgSpeed[trafficLevel];
  const additionalTime = 1; // 1 hour for handling and pickup
  
  return Math.ceil(baseTime + additionalTime);
};

/**
 * Calculate distance between two coordinates (Haversine formula)
 * @param {Number} lat1 - Latitude 1
 * @param {Number} lon1 - Longitude 1
 * @param {Number} lat2 - Latitude 2
 * @param {Number} lon2 - Longitude 2
 * @returns {Number} Distance in km
 */
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

/**
 * Check if return is within eligibility window
 * @param {Date} deliveryDate - Order delivery date
 * @param {Number} windowDays - Return window in days (default 7)
 * @returns {Boolean} Whether return is eligible
 */
const isReturnEligible = (deliveryDate, windowDays = 7) => {
  const deadlineDate = new Date(deliveryDate);
  deadlineDate.setDate(deadlineDate.getDate() + windowDays);
  
  return new Date() <= deadlineDate;
};

/**
 * Get days remaining in return window
 * @param {Date} deliveryDate - Order delivery date
 * @param {Number} windowDays - Return window in days
 * @returns {Number} Days remaining
 */
const getDaysRemainingInWindow = (deliveryDate, windowDays = 7) => {
  const deadlineDate = new Date(deliveryDate);
  deadlineDate.setDate(deadlineDate.getDate() + windowDays);
  
  const now = new Date();
  const msPerDay = 24 * 60 * 60 * 1000;
  
  return Math.ceil((deadlineDate - now) / msPerDay);
};

/**
 * Generate tracking number
 * @returns {String} Unique tracking number
 */
const generateTrackingNumber = () => {
  return `TRK${Date.now()}${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
};

/**
 * Format order status for display
 * @param {String} status - Order status
 * @returns {String} Formatted status
 */
const formatOrderStatus = (status) => {
  const statusMap = {
    placed: 'Order Placed',
    confirmed: 'Confirmed',
    shipped: 'Shipped',
    out_for_delivery: 'Out for Delivery',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
    returned: 'Returned'
  };
  
  return statusMap[status] || status;
};

/**
 * Get status badge color for UI
 * @param {String} status - Order status
 * @returns {String} Color code
 */
const getStatusColor = (status) => {
  const colorMap = {
    placed: '#FFA500',      // Orange
    confirmed: '#1E90FF',   // Dodger Blue
    shipped: '#32CD32',     // Lime Green
    out_for_delivery: '#FFD700', // Gold
    delivered: '#228B22',   // Forest Green
    cancelled: '#DC143C',   // Crimson
    returned: '#696969'     // Dim Gray
  };
  
  return colorMap[status] || '#808080';
};

/**
 * Calculate refund eligibility based on return reason
 * @param {String} reason - Return reason
 * @returns {Object} Refund details
 */
const calculateRefundEligibility = (reason) => {
  const refundRules = {
    defective_product: { eligible: true, percentage: 100 },
    not_as_described: { eligible: true, percentage: 100 },
    damaged_in_shipping: { eligible: true, percentage: 100 },
    wrong_item_received: { eligible: true, percentage: 100 },
    changed_mind: { eligible: true, percentage: 80 }, // Restocking fee
    other: { eligible: false, percentage: 0 }
  };
  
  return refundRules[reason] || { eligible: false, percentage: 0 };
};

/**
 * Calculate final refund amount
 * @param {Number} orderTotal - Total order amount
 * @param {Number} refundPercentage - Refund percentage
 * @returns {Number} Refund amount
 */
const calculateRefundAmount = (orderTotal, refundPercentage) => {
  return (orderTotal * refundPercentage) / 100;
};

/**
 * Get time elapsed since date
 * @param {Date} date - Start date
 * @returns {String} Human readable time elapsed
 */
const getTimeElapsed = (date) => {
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);
  
  let interval = Math.floor(seconds / 31536000);
  if (interval > 1) return `${interval} years ago`;
  
  interval = Math.floor(seconds / 2592000);
  if (interval > 1) return `${interval} months ago`;
  
  interval = Math.floor(seconds / 86400);
  if (interval > 1) return `${interval} days ago`;
  
  interval = Math.floor(seconds / 3600);
  if (interval > 1) return `${interval} hours ago`;
  
  interval = Math.floor(seconds / 60);
  if (interval > 1) return `${interval} minutes ago`;
  
  return 'just now';
};

/**
 * Validate order items
 * @param {Array} items - Order items
 * @returns {Boolean} Valid items format
 */
const validateOrderItems = (items) => {
  if (!Array.isArray(items) || items.length === 0) {
    return false;
  }
  
  return items.every(item => {
    return item.productId &&
           item.quantity > 0 &&
           item.price > 0;
  });
};

/**
 * Validate shipping address
 * @param {Object} address - Shipping address
 * @returns {Boolean} Valid address format
 */
const validateShippingAddress = (address) => {
  return address &&
         address.name &&
         address.phone &&
         address.address &&
         address.city &&
         address.state &&
         address.zipCode;
};

/**
 * Calculate order progress percentage
 * @param {String} status - Current order status
 * @returns {Number} Progress percentage (0-100)
 */
const calculateOrderProgress = (status) => {
  const progressMap = {
    placed: 10,
    confirmed: 20,
    shipped: 40,
    out_for_delivery: 75,
    delivered: 100,
    cancelled: 0,
    returned: 50
  };
  
  return progressMap[status] || 0;
};

/**
 * Get next expected status
 * @param {String} currentStatus - Current status
 * @returns {String|null} Next expected status
 */
const getNextExpectedStatus = (currentStatus) => {
  const statusFlow = {
    placed: 'confirmed',
    confirmed: 'shipped',
    shipped: 'out_for_delivery',
    out_for_delivery: 'delivered',
    delivered: null,
    cancelled: null,
    returned: null
  };
  
  return statusFlow[currentStatus] || null;
};

/**
 * Format currency amount
 * @param {Number} amount - Amount in currency
 * @param {String} currency - Currency code (default INR)
 * @returns {String} Formatted currency
 */
const formatCurrency = (amount, currency = 'INR') => {
  const formatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency
  });
  
  return formatter.format(amount);
};

/**
 * Check if delivery is late
 * @param {Date} estimatedDate - Estimated delivery date
 * @returns {Boolean} Whether delivery is late
 */
const isDeliveryLate = (estimatedDate) => {
  return new Date() > new Date(estimatedDate);
};

module.exports = {
  calculateShippingCost,
  estimateDeliveryTime,
  calculateDistance,
  isReturnEligible,
  getDaysRemainingInWindow,
  generateTrackingNumber,
  formatOrderStatus,
  getStatusColor,
  calculateRefundEligibility,
  calculateRefundAmount,
  getTimeElapsed,
  validateOrderItems,
  validateShippingAddress,
  calculateOrderProgress,
  getNextExpectedStatus,
  formatCurrency,
  isDeliveryLate
};
