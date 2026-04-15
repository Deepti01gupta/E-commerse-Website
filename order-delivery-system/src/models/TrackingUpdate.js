const mongoose = require('mongoose');

// Real-time tracking updates for live tracking
const trackingUpdateSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
      index: true
    },
    
    // Location Data
    location: {
      latitude: Number,
      longitude: Number,
      address: String,
      city: String,
      state: String
    },
    
    // Tracking Event
    event: {
      type: String,
      enum: ['pickup', 'in_transit', 'checkpoint', 'out_for_delivery', 'delivered'],
      required: true
    },
    message: String,
    
    // Timestamp
    timestamp: { type: Date, default: Date.now, index: true },
    
    // Metadata
    source: String, // 'gps', 'manual', 'api'
    accuracy: Number // in meters
  },
  { timestamps: true }
);

module.exports = mongoose.model('TrackingUpdate', trackingUpdateSchema);
