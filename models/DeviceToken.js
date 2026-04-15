/**
 * DeviceToken Model
 * Stores device tokens for push notifications
 */

const mongoose = require('mongoose');
const { Schema } = mongoose;

const deviceTokenSchema = new Schema({
  userId: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true, 
    index: true 
  },
  token: { 
    type: String, 
    required: true, 
    unique: true,
    index: true
  },
  deviceType: { 
    type: String, 
    enum: ['ios', 'android', 'web'], 
    required: true 
  },
  deviceName: { 
    type: String,
    default: 'Mobile Device'
  },
  deviceModel: {
    type: String
  },
  osVersion: {
    type: String
  },
  appVersion: {
    type: String
  },
  isActive: { 
    type: Boolean, 
    default: true,
    index: true
  },
  lastUsedAt: { 
    type: Date, 
    default: Date.now 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

/**
 * Compound indexes for efficient queries
 */
deviceTokenSchema.index({ userId: 1, isActive: 1 });
deviceTokenSchema.index({ createdAt: -1 });
deviceTokenSchema.index({ lastUsedAt: -1 });

/**
 * Statics
 */

/**
 * Register device token
 * Creates new or updates existing
 */
deviceTokenSchema.statics.registerDevice = async function(userId, token, deviceType, deviceData = {}) {
  try {
    let deviceToken = await this.findOne({ token });

    if (deviceToken) {
      // Update existing token
      deviceToken.userId = userId;
      deviceToken.isActive = true;
      deviceToken.lastUsedAt = new Date();
      deviceToken.deviceType = deviceType;
      
      if (deviceData.deviceName) deviceToken.deviceName = deviceData.deviceName;
      if (deviceData.deviceModel) deviceToken.deviceModel = deviceData.deviceModel;
      if (deviceData.osVersion) deviceToken.osVersion = deviceData.osVersion;
      if (deviceData.appVersion) deviceToken.appVersion = deviceData.appVersion;

      await deviceToken.save();
      return deviceToken;
    }

    // Create new token
    deviceToken = new this({
      userId,
      token,
      deviceType,
      ...deviceData
    });

    await deviceToken.save();
    return deviceToken;
  } catch (error) {
    console.error('Error registering device token:', error);
    throw error;
  }
};

/**
 * Get all active tokens for user
 */
deviceTokenSchema.statics.getActiveTokens = async function(userId) {
  try {
    return await this.find({ userId, isActive: true });
  } catch (error) {
    console.error('Error fetching active tokens:', error);
    throw error;
  }
};

/**
 * Deactivate device token
 */
deviceTokenSchema.statics.deactivateToken = async function(token) {
  try {
    return await this.updateOne({ token }, { isActive: false });
  } catch (error) {
    console.error('Error deactivating token:', error);
    throw error;
  }
};

/**
 * Remove device token
 */
deviceTokenSchema.statics.removeToken = async function(token) {
  try {
    return await this.deleteOne({ token });
  } catch (error) {
    console.error('Error removing token:', error);
    throw error;
  }
};

/**
 * Deactivate all user tokens
 */
deviceTokenSchema.statics.deactivateAllUserTokens = async function(userId) {
  try {
    return await this.updateMany(
      { userId }, 
      { isActive: false }
    );
  } catch (error) {
    console.error('Error deactivating user tokens:', error);
    throw error;
  }
};

/**
 * Get device count per user
 */
deviceTokenSchema.statics.getDeviceCount = async function(userId) {
  try {
    return await this.countDocuments({ userId, isActive: true });
  } catch (error) {
    console.error('Error getting device count:', error);
    throw error;
  }
};

/**
 * Remove old inactive tokens (older than 30 days)
 */
deviceTokenSchema.statics.cleanupInactiveTokens = async function(daysOld = 30) {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const result = await this.deleteMany({
      isActive: false,
      updatedAt: { $lt: cutoffDate }
    });

    console.log(`Cleaned up ${result.deletedCount} inactive tokens`);
    return result;
  } catch (error) {
    console.error('Error cleaning up tokens:', error);
    throw error;
  }
};

/**
 * Instance methods
 */

/**
 * Mark token as last used
 */
deviceTokenSchema.methods.updateLastUsed = async function() {
  try {
    this.lastUsedAt = new Date();
    await this.save();
    return this;
  } catch (error) {
    console.error('Error updating last used:', error);
    throw error;
  }
};

/**
 * Deactivate this token
 */
deviceTokenSchema.methods.deactivate = async function() {
  try {
    this.isActive = false;
    await this.save();
    return this;
  } catch (error) {
    console.error('Error deactivating token:', error);
    throw error;
  }
};

/**
 * Get user data with this device
 */
deviceTokenSchema.methods.getUserData = async function() {
  try {
    return await mongoose.model('User').findById(this.userId);
  } catch (error) {
    console.error('Error fetching user data:', error);
    throw error;
  }
};

module.exports = mongoose.model('DeviceToken', deviceTokenSchema);
