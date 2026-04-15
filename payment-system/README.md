# Payment & Checkout System

Production-ready payment processing backend with Stripe & Razorpay, coupon system, delivery calculations, and invoice generation.

## Setup

1. Install dependencies:
   npm install

2. Copy environment template:
   cp .env.example .env

3. Update all environment variables in .env.

4. Start dev server:
   npm run dev

## Features

- **Multiple Payment Gateways**: Stripe and Razorpay
- **Payment Methods**: Stripe (card), Razorpay (UPI, cards, net banking)
- **Dynamic Shipping**: Location-based delivery charges
- **Coupon System**: Fixed/percentage discounts with validation
- **Invoice Generation**: PDF invoices after successful payment
- **Order Management**: Create, track, and download invoices

## Folder Structure

src/
- config/
  - db.js
- controllers/
  - checkout.controller.js
  - order.controller.js
  - coupon.controller.js
  - delivery.controller.js
- middleware/
  - error.middleware.js
  - validate.middleware.js
- models/
  - Order.js
  - Coupon.js
  - DeliveryZone.js
- routes/
  - checkout.routes.js
  - order.routes.js
  - coupon.routes.js
  - delivery.routes.js
- services/
  - stripe.service.js
  - razorpay.service.js
  - invoice.service.js
  - delivery.service.js
  - coupon.service.js
  - email.service.js
- utils/
  - asyncHandler.js
  - helpers.js
- validators/
  - checkout.validators.js
- app.js
- server.js

## Main APIs

### Checkout
- POST /api/checkout/initiate - Start checkout process
- POST /api/checkout/verify-razorpay - Verify Razorpay payment

### Orders
- GET /api/orders - Get user orders
- GET /api/orders/:orderId - Get specific order
- GET /api/orders/:orderId/invoice - Generate invoice
- GET /api/orders/:orderId/download-invoice - Download invoice

### Coupons
- POST /api/coupons/apply - Validate and apply coupon

### Delivery
- POST /api/delivery/calculate - Calculate shipping charge

## Notes

- Orders are created in pending status before payment
- Payment gateway integration handles payment processing
- Invoices are generated as PDF using pdfkit
- Coupons support fixed and percentage discounts
- Shipping is calculated based on pincode and cart total
