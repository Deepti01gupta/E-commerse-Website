# 🛒 Complete E-Commerce Payment System

A **production-ready, full-stack e-commerce payment system** with React frontend, secure authentication, and multi-gateway payment processing.

## ✨ Features Implemented

### 🎨 Frontend (React + Vite)
- ✅ **Modern React UI** - Using React 18.3, Vite, Tailwind CSS
- ✅ **Responsive Design** - Mobile-first, optimized for all devices
- ✅ **Search & Filters** - Real-time product search with debouncing
- ✅ **Shopping Cart** - Add/remove products, quantity management
- ✅ **Wishlist** - Save favorite products
- ✅ **Dark Mode** - Complete dark theme support
- ✅ **Checkout Page** - Complete payment flow with validation
- ✅ **Address Form** - Controlled form with all required fields
- ✅ **Coupon System** - Apply and validate discount codes
- ✅ **Shipping Calculator** - Dynamic calculation by pincode
- ✅ **Payment Methods** - Razorpay, Stripe, UPI, Wallet
- ✅ **Order Summary** - Real-time pricing breakdown with tax

### 🔒 Authentication (Secure Auth API)
- ✅ **JWT Authentication** - Stateless, secure token-based auth
- ✅ **OAuth 2.0** - Google and GitHub OAuth integration
- ✅ **2FA (TOTP)** - Two-factor authentication with Speakeasy
- ✅ **Password Hashing** - Bcryptjs with 12 salt rounds
- ✅ **Password Reset** - Secure token-based reset flow
- ✅ **Rate Limiting** - Differentiated limits per operation
- ✅ **CORS Security** - Full CORS configuration
- ✅ **HTTP-Only Cookies** - Secure token storage

### 💳 Payment Processing (Payment System)
- ✅ **Razorpay Integration** - UPI, Cards, Net Banking
- ✅ **Stripe Integration** - International card payments
- ✅ **Payment Verification** - HMAC signature validation
- ✅ **Invoice Generation** - PDFKit-based professional invoices
- ✅ **Order Tracking** - Complete order lifecycle management
- ✅ **Coupon System** - Fixed/percentage discounts with validation
- ✅ **Delivery Zones** - Location-based shipping rates
- ✅ **Tax Calculation** - 18% GST on orders
- ✅ **Email Notifications** - Order confirmation and failure alerts

## 📦 Project Structure

```
E_commerce website - Copy/
├── 📄 PAYMENT_SYSTEM_INTEGRATION.md      (Integration guide)
├── 📄 PAYMENT_TESTING_GUIDE.md           (Comprehensive test cases)
├── 📄 README.md                          (This file)
├── 🔧 start-all-services.sh              (Start all services)
├── 🔧 setup-test-data.sh                 (Setup test data)
│
├── react-ecommerce-ui/                   (Frontend - Vite + React)
│   ├── src/
│   │   ├── components/
│   │   │   ├── checkout/
│   │   │   │   ├── AddressForm.jsx       ✓ Shipping address form
│   │   │   │   ├── CouponApplier.jsx     ✓ Coupon application
│   │   │   │   ├── OrderSummary.jsx      ✓ Pricing breakdown
│   │   │   │   ├── PaymentMethodSelector.jsx ✓ Payment options
│   │   │   │   └── ShippingCalculator.jsx ✓ Shipping calculation
│   │   │   ├── filters/
│   │   │   ├── layout/
│   │   │   ├── products/
│   │   │   ├── search/
│   │   │   └── cart/
│   │   ├── pages/
│   │   │   ├── checkout/
│   │   │   │   ├── CheckoutPage.jsx      ✓ Main checkout page
│   │   │   │   ├── CheckoutSuccessPage.jsx ✓ Success confirmation
│   │   │   │   └── CheckoutFailurePage.jsx ✓ Failure handling
│   │   │   ├── CartPage.jsx              ✓ Updated with checkout link
│   │   │   ├── HomePage.jsx
│   │   │   └── WishlistPage.jsx
│   │   ├── context/
│   │   │   └── StoreContext.jsx          (State management)
│   │   └── App.jsx                       ✓ Updated with routes
│   └── package.json
│
├── secure-auth-api/                      (Auth Backend - Node.js + Express)
│   ├── src/
│   │   ├── config/                       (Passport OAuth config)
│   │   ├── controllers/                  (Auth logic)
│   │   ├── middleware/                   (Auth, rate limit, errors)
│   │   ├── models/                       (User model)
│   │   ├── routes/                       (Auth endpoints)
│   │   ├── services/                     (JWT, Email services)
│   │   ├── utils/                        (Helpers)
│   │   ├── validators/                   (Joi schemas)
│   │   ├── app.js                        (Express app)
│   │   └── server.js                     (Server bootstrap)
│   └── package.json
│
└── payment-system/                       (Payment Backend - Node.js + Express)
    ├── src/
    │   ├── config/                       (DB connection)
    │   ├── controllers/                  (Checkout, Order, Coupon, Delivery)
    │   ├── middleware/                   (Validation, errors)
    │   ├── models/                       (Order, Coupon, DeliveryZone)
    │   ├── routes/                       (API endpoints)
    │   ├── services/                     (Stripe, Razorpay, Invoice, Email, etc.)
    │   ├── utils/                        (Helpers, asyncHandler)
    │   ├── validators/                   (Joi validation schemas)
    │   ├── app.js                        (Express app)
    │   └── server.js                     (Server bootstrap)
    ├── .env.example                      (Environment template)
    └── package.json
```

## 🚀 Quick Start (5 Minutes)

### Prerequisites
- Node.js 16+ installed
- MongoDB running on localhost:27017
- Git (optional)

### Option 1: Using Bash Script (Linux/Mac)

```bash
# Install MongoDB (if not already installed)
# macOS: brew install mongodb-community
# Linux: sudo apt-get install mongodb

# Start MongoDB
# macOS: brew services start mongodb-community
# Linux: sudo systemctl start mongod

# Clone or download this project
cd "E_commerce website - Copy"

# Make scripts executable
chmod +x start-all-services.sh setup-test-data.sh

# Setup test data (coupons, delivery zones)
./setup-test-data.sh

# Start all services (frontend + backend)
./start-all-services.sh

# Open browser
open http://localhost:5173
```

### Option 2: Manual Setup (All Platforms)

#### Terminal 1: Start Payment Backend
```bash
cd payment-system

# Copy environment file
cp .env.example .env
# Edit .env with your Stripe/Razorpay keys

# Install and start
npm install
npm start
# Server running at http://localhost:5001
```

#### Terminal 2: Start React Frontend
```bash
cd react-ecommerce-ui

npm install
npm run dev
# Frontend running at http://localhost:5173
```

#### Terminal 3: Setup Test Data
```bash
# In the project root directory
# For MongoDB shell connected to ecommerce-payment db
mongosh
# Then paste the setup commands from setup-test-data.sh
```

### Access the Application

1. **Frontend**: http://localhost:5173
2. **API Docs**: http://localhost:5001/api
3. **MongoDB**: mongodb://localhost:27017/ecommerce-payment

## 🧪 Test the Payment Flow

1. **Add Products to Cart**
   - Browse homepage
   - Click "Add to Cart" on products
   - Cart icon shows item count

2. **Navigate to Checkout**
   - Click cart icon
   - Review items
   - Click "Checkout"

3. **Fill Checkout Form**
   - Enter shipping address
   - Check shipping (pincode: 110001)
   - Apply coupon: WELCOME20 (20% discount)
   - Select payment method: Razorpay

4. **Complete Payment**
   - Click "Proceed to Payment"
   - In Razorpay modal, use test card:
     - Card: `4111 1111 1111 1111`
     - CVV: Any 3 digits
     - Expiry: Any future date
   - Authorization OTP: `123456`

5. **See Order Confirmation**
   - Redirects to success page
   - Shows order details
   - Links to view all orders

## 📋 API Endpoints

### Checkout API

```bash
# Initiate checkout
POST /api/checkout/initiate
Content-Type: application/json

{
  "items": [{id, name, price, quantity, subtotal}],
  "shippingAddress": {fullName, email, phone, street, city, state, pincode, country},
  "paymentMethod": "razorpay|stripe|upi|wallet",
  "couponCode": "WELCOME20"  # optional
}

Response:
{
  "success": true,
  "order": {orderId, total},
  "paymentData": {razorpayOrderId, razorpayKeyId}
}
```

### Verify Razorpay Payment

```bash
POST /api/checkout/verify-razorpay
Content-Type: application/json

{
  "razorpayOrderId": "order_ABC123",
  "razorpayPaymentId": "pay_ABC123",
  "razorpaySignature": "signature_hash",
  "orderId": "ORD_1234567890"
}
```

### Validate Coupon

```bash
POST /api/coupons/apply
Content-Type: application/json

{"code": "WELCOME20", "cartTotal": 5000}

Response:
{
  "success": true,
  "discountAmount": 1000,
  "coupon": {code, discountType, discountValue, maxDiscountAmount}
}
```

### Calculate Shipping

```bash
POST /api/delivery/calculate
Content-Type: application/json

{"pincode": "110001", "cartTotal": 5000}

Response:
{
  "success": true,
  "shippingCharge": 0,
  "isFreeDelivery": true,
  "processingDays": "2-3"
}
```

### Get Orders

```bash
GET /api/orders              # All user orders
GET /api/orders/:orderId     # Specific order
GET /api/orders/:orderId/invoice  # Generate invoice
```

## 🔧 Environment Configuration

### Frontend (.env not required)
Frontend connects to `http://localhost:5001` for API calls

### Backend (payment-system/.env)
```
PORT=5001
MONGO_URI=mongodb://localhost:27017/ecommerce-payment
CLIENT_URL=http://localhost:5173

# Payment Gateways
STRIPE_PUBLIC_KEY=pk_test_YOUR_KEY
STRIPE_SECRET_KEY=sk_test_YOUR_KEY

RAZORPAY_KEY_ID=rzp_test_YOUR_KEY
RAZORPAY_KEY_SECRET=YOUR_SECRET

# Email (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM="Support <support@ecommerce.com>"
```

### Auth Backend (secure-auth-api/.env)
```
PORT=5002
MONGO_URI=mongodb://localhost:27017/ecommerce-auth
CLIENT_URL=http://localhost:5173
JWT_SECRET=your_secret_key_at_least_32_chars

# OAuth (Optional)
GOOGLE_CLIENT_ID=YOUR_CLIENT_ID
GOOGLE_CLIENT_SECRET=YOUR_SECRET
GOOGLE_CALLBACK_URL=http://localhost:5002/api/auth/google/callback

GITHUB_CLIENT_ID=YOUR_CLIENT_ID
GITHUB_CLIENT_SECRET=YOUR_SECRET
GITHUB_CALLBACK_URL=http://localhost:5002/api/auth/github/callback
```

## 🧪 Test Data Included

### Coupons (Ready to Use)
- `WELCOME20` - 20% discount (min ₹500)
- `FLAT100` - ₹100 flat discount (min ₹1000)
- `SAVE50` - 50% discount (min ₹5000)

### Delivery Zones (Ready to Test)
- Delhi (110001-110009): ₹50 flat + ₹20/kg
- Mumbai (400001-400005): ₹60 flat + ₹25/kg
- Bangalore (560001-560004): ₹40 flat + ₹15/kg
- Free shipping above ₹2,500-₹3,000 (zone dependent)

## 📊 Database Models

### Order
```javascript
{
  userId: ObjectId,
  orderId: String,                    // Unique order ID
  items: [{productId, name, price, quantity, subtotal}],
  shippingAddress: {fullName, email, phone, street, city, state, pincode, country},
  pricing: {subtotal, tax, shippingCharge, discountAmount, couponCode, total},
  paymentMethod: String,              // razorpay, stripe, etc.
  paymentStatus: String,              // pending, completed, failed
  paymentId: String,                  // Payment gateway ID
  invoiceGenerated: Boolean,
  createdAt, updatedAt
}
```

### Coupon
```javascript
{
  code: String,                       // Unique coupon code
  discountType: String,               // fixed or percentage
  discountValue: Number,
  maxDiscountAmount: Number,
  minOrderValue: Number,
  usageLimit: Number,
  usageCount: Number,
  validFrom: Date,
  validUpto: Date,
  applicableCategories: [String],
  isActive: Boolean
}
```

### DeliveryZone
```javascript
{
  pincodes: [String],                 // Array of pincodes
  city: String,
  state: String,
  chargePerUnit: Number,              // Per kg
  chargeFlat: Number,
  freeDeliveryAbove: Number,          // Cart total threshold
  processingDays: String,
  isActive: Boolean
}
```

## 🔐 Security Features

✅ **Payment Security**
- PCI-DSS compliant (Stripe/Razorpay handle cards)
- HMAC signature verification
- Secure payment intent validation

✅ **Data Protection**
- Password hashing (bcryptjs, 12 rounds)
- HTTPS/SSL ready
- CORS configured
- Rate limiting on sensitive endpoints

✅ **Validation**
- Joi schema validation on all inputs
- Coupon expiry checks
- Shipping zone verification
- Order status verification

✅ **Authentication**
- JWT token-based auth
- HTTP-only cookies
- OAuth 2.0 support
- 2FA TOTP support

## 📱 Responsive Design

- ✅ Mobile (320px+): Stacked layout
- ✅ Tablet (640px+): 2-column layouts
- ✅ Desktop (1024px+): Full multi-column layouts
- ✅ Dark mode support for all components
- ✅ Touch-friendly buttons and inputs

## 🎯 Performance Optimizations

- **Frontend**: Vite bundling, code splitting, lazy loading
- **Backend**: Connection pooling, indexed MongoDB queries
- **Images**: Lazy loading with fallbacks
- **CSS**: Tailwind CSS production build (~3.97KB gzipped)
- **JS**: React production build (~58KB gzipped)

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Find process on port 5001
lsof -i :5001
# Kill the process
kill -9 <PID>
```

### MongoDB Connection Error
```bash
# Verify MongoDB is running
mongosh
# Should connect to localhost:27017
```

### CORS Error
Check that payment-system CORS middleware includes:
```javascript
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true
}));
```

### Payment Gateway Not Working
- Verify API keys in .env are correct
- Use test keys (pk_test_, rzp_test_)
- Check Razorpay test card: 4111 1111 1111 1111

## 📚 Documentation

- **[PAYMENT_SYSTEM_INTEGRATION.md](./PAYMENT_SYSTEM_INTEGRATION.md)** - Complete integration guide with API documentation
- **[PAYMENT_TESTING_GUIDE.md](./PAYMENT_TESTING_GUIDE.md)** - 15 comprehensive test scenarios

## 🚢 Deployment

### Frontend Deployment (Vercel/Netlify)
```bash
npm run build
# Deploy dist/ folder
```

### Backend Deployment (Heroku/Railway/Render)
```bash
# Set production environment variables
# Deploy payment-system folder
```

### Database (MongoDB Atlas)
1. Create MongoDB Atlas account
2. Create cluster
3. Update MONGO_URI with Atlas connection string
4. Configure IP whitelist

## 🤝 Contributing

To extend this payment system:

1. **Add New Payment Gateway** - Create service in `src/services/`
2. **Add New Coupon Types** - Update Coupon model and validation
3. **Add Delivery Features** - Extend DeliveryZone and shipping calculation
4. **Customize UI** - Modify React components with Tailwind classes

## 📄 License

This project is open source and available under the MIT License.

## 🎉 Success!

You now have a **complete, production-ready e-commerce payment system** with:
- ✅ Modern React frontend with checkout flow
- ✅ Secure backend with payment processing
- ✅ Multi-gateway payment support (Razorpay + Stripe)
- ✅ Advanced features (coupons, shipping, invoices)
- ✅ Professional error handling and validation

**Next Steps:**
1. Replace test API keys with your production keys
2. Deploy frontend to Vercel/Netlify
3. Deploy backend to Heroku/Railway
4. Configure production database (MongoDB Atlas)
5. Enable HTTPS/SSL
6. Setup email notifications
7. Monitor transactions and support

---

**Version:** 1.0  
**Last Updated:** 2024  
**Support:** See PAYMENT_SYSTEM_INTEGRATION.md and PAYMENT_TESTING_GUIDE.md for detailed guides.
