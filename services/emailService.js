/**
 * Email Notification Service
 * Handles sending emails via Nodemailer
 */

const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

// Create transporter based on environment
const createTransporter = () => {
  if (process.env.EMAIL_SERVICE === 'gmail') {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD
      }
    });
  } else if (process.env.EMAIL_SERVICE === 'sendgrid') {
    return nodemailer.createTransport({
      host: 'smtp.sendgrid.net',
      port: 587,
      auth: {
        user: 'apikey',
        pass: process.env.SENDGRID_API_KEY
      }
    });
  } else {
    // Generic SMTP
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD
      }
    });
  }
};

const transporter = createTransporter();

/**
 * Email Templates
 */
const templates = {
  orderPlaced: ({ userName, orderId, orderTotal, items }) => ({
    subject: `Order Confirmation #${orderId}`,
    html: `
      <html>
        <body style="font-family: Arial, sans-serif; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2>Order Confirmed!</h2>
            <p>Hi ${userName},</p>
            <p>Thank you for your order. Here are your order details:</p>
            
            <div style="background: #f5f5f5; padding: 15px; border-radius: 5px;">
              <p><strong>Order ID:</strong> ${orderId}</p>
              <p><strong>Order Total:</strong> ₹${orderTotal}</p>
              <p><strong>Items:</strong> ${items}</p>
            </div>
            
            <p>You will receive a shipping confirmation email shortly with your tracking information.</p>
            
            <p>Need help? <a href="${process.env.SUPPORT_EMAIL_LINK}">Contact us</a></p>
            
            <footer style="border-top: 1px solid #ddd; margin-top: 20px; padding-top: 20px; font-size: 12px; color: #666;">
              <p>© 2026 E-Commerce. All rights reserved.</p>
            </footer>
          </div>
        </body>
      </html>
    `
  }),

  orderShipped: ({ userName, orderId, trackingNumber, trackingUrl, carrier }) => ({
    subject: `Your Order #${orderId} Has Been Shipped!`,
    html: `
      <html>
        <body style="font-family: Arial, sans-serif; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2>Your Order is On Its Way!</h2>
            <p>Hi ${userName},</p>
            <p>Great news! Your order has been shipped.</p>
            
            <div style="background: #f5f5f5; padding: 15px; border-radius: 5px;">
              <p><strong>Order ID:</strong> ${orderId}</p>
              <p><strong>Carrier:</strong> ${carrier}</p>
              <p><strong>Tracking Number:</strong> ${trackingNumber}</p>
            </div>
            
            <p style="margin-top: 20px;">
              <a href="${trackingUrl}" style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Track Your Package
              </a>
            </p>
            
            <p>Expected delivery: 3-5 business days</p>
            
            <footer style="border-top: 1px solid #ddd; margin-top: 20px; padding-top: 20px; font-size: 12px; color: #666;">
              <p>© 2026 E-Commerce. All rights reserved.</p>
            </footer>
          </div>
        </body>
      </html>
    `
  }),

  orderDelivered: ({ userName, orderId, deliveryDate }) => ({
    subject: `Your Order #${orderId} Has Been Delivered!`,
    html: `
      <html>
        <body style="font-family: Arial, sans-serif; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2>Delivery Successful! 🎉</h2>
            <p>Hi ${userName},</p>
            <p>Your order has been successfully delivered!</p>
            
            <div style="background: #f5f5f5; padding: 15px; border-radius: 5px;">
              <p><strong>Order ID:</strong> ${orderId}</p>
              <p><strong>Delivery Date:</strong> ${deliveryDate}</p>
            </div>
            
            <p style="margin-top: 20px;">We hope you love your purchase! If you have any feedback or issues, please <a href="${process.env.SUPPORT_EMAIL_LINK}">let us know</a>.</p>
            
            <footer style="border-top: 1px solid #ddd; margin-top: 20px; padding-top: 20px; font-size: 12px; color: #666;">
              <p>© 2026 E-Commerce. All rights reserved.</p>
            </footer>
          </div>
        </body>
      </html>
    `
  }),

  passwordReset: ({ userName, resetLink, expiryHours = 24 }) => ({
    subject: 'Password Reset Request',
    html: `
      <html>
        <body style="font-family: Arial, sans-serif; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2>Password Reset Request</h2>
            <p>Hi ${userName},</p>
            <p>We received a request to reset your password. Click the link below to proceed:</p>
            
            <p style="margin-top: 20px;">
              <a href="${resetLink}" style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Reset Password
              </a>
            </p>
            
            <p style="color: #666; font-size: 14px;">
              This link will expire in ${expiryHours} hours.
            </p>
            
            <p style="color: #999; font-size: 12px;">
              If you didn't request this, please ignore this email or <a href="${process.env.SUPPORT_EMAIL_LINK}">contact us</a>.
            </p>
            
            <footer style="border-top: 1px solid #ddd; margin-top: 20px; padding-top: 20px; font-size: 12px; color: #666;">
              <p>© 2026 E-Commerce. All rights reserved.</p>
            </footer>
          </div>
        </body>
      </html>
    `
  }),

  offerAvailable: ({ userName, offerTitle, offerDescription, offerLink, discountPercentage }) => ({
    subject: `Special Offer: ${discountPercentage}% Off on ${offerTitle}!`,
    html: `
      <html>
        <body style="font-family: Arial, sans-serif; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #e74c3c;">🎁 Exclusive Offer for You!</h2>
            <p>Hi ${userName},</p>
            <p>We have an exclusive offer just for you:</p>
            
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 5px; text-align: center;">
              <h3 style="margin: 0;">${offerTitle}</h3>
              <p>${offerDescription}</p>
              <h2 style="margin: 10px 0; font-size: 40px;">${discountPercentage}% OFF</h2>
            </div>
            
            <p style="margin-top: 20px; text-align: center;">
              <a href="${offerLink}" style="background: #e74c3c; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                Shop Now
              </a>
            </p>
            
            <p style="color: #999; font-size: 12px; text-align: center;">
              Offer valid for limited time only!
            </p>
            
            <footer style="border-top: 1px solid #ddd; margin-top: 20px; padding-top: 20px; font-size: 12px; color: #666;">
              <p>© 2026 E-Commerce. All rights reserved.</p>
            </footer>
          </div>
        </body>
      </html>
    `
  })
};

/**
 * Email Service Functions
 */
const EmailService = {
  /**
   * Send email asynchronously (non-blocking)
   */
  send: async (to, subject, html, attachments = []) => {
    try {
      const info = await transporter.sendMail({
        from: process.env.EMAIL_FROM || 'noreply@ecommerce.com',
        to,
        subject,
        html,
        attachments
      });

      console.log('✅ Email sent:', info.messageId);
      return {
        success: true,
        messageId: info.messageId,
        timestamp: new Date()
      };
    } catch (error) {
      console.error('❌ Email send failed:', error);
      return {
        success: false,
        error: {
          code: error.code,
          message: error.message
        }
      };
    }
  },

  /**
   * Send order confirmation email
   */
  sendOrderConfirmation: async (email, orderData) => {
    const { subject, html } = templates.orderPlaced({
      userName: orderData.userName,
      orderId: orderData.orderId,
      orderTotal: orderData.orderTotal,
      items: orderData.items
        .map((item) => `${item.name} (${item.quantity}x)`)
        .join(', ')
    });

    return EmailService.send(email, subject, html);
  },

  /**
   * Send order shipped email with tracking
   */
  sendOrderShipped: async (email, shippingData) => {
    const { subject, html } = templates.orderShipped({
      userName: shippingData.userName,
      orderId: shippingData.orderId,
      trackingNumber: shippingData.trackingNumber,
      trackingUrl: shippingData.trackingUrl || `${process.env.FRONTEND_URL}/track/${shippingData.trackingNumber}`,
      carrier: shippingData.carrier || 'Standard Shipping'
    });

    return EmailService.send(email, subject, html);
  },

  /**
   * Send order delivered email
   */
  sendOrderDelivered: async (email, deliveryData) => {
    const { subject, html } = templates.orderDelivered({
      userName: deliveryData.userName,
      orderId: deliveryData.orderId,
      deliveryDate: new Date(deliveryData.deliveryDate).toLocaleDateString()
    });

    return EmailService.send(email, subject, html);
  },

  /**
   * Send password reset email
   */
  sendPasswordReset: async (email, resetData) => {
    const { subject, html } = templates.passwordReset({
      userName: resetData.userName,
      resetLink: resetData.resetLink,
      expiryHours: resetData.expiryHours || 24
    });

    return EmailService.send(email, subject, html);
  },

  /**
   * Send offer/promotion email
   */
  sendOffer: async (email, offerData) => {
    const { subject, html } = templates.offerAvailable({
      userName: offerData.userName,
      offerTitle: offerData.offerTitle,
      offerDescription: offerData.offerDescription,
      offerLink: offerData.offerLink || `${process.env.FRONTEND_URL}/offers`,
      discountPercentage: offerData.discountPercentage
    });

    return EmailService.send(email, subject, html);
  },

  /**
   * Test email connection
   */
  verifyConnection: async () => {
    try {
      await transporter.verify();
      console.log('✅ Email service is ready');
      return true;
    } catch (error) {
      console.error('❌ Email service error:', error);
      return false;
    }
  }
};

module.exports = EmailService;
