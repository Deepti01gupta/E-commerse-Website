# 🛒 Complete E-Commerce Platform

A **production-ready, full-stack e-commerce system** with Node.js/Express backend, EJS templating, MongoDB database, and comprehensive features for buyers and sellers.

## ✨ Features Implemented

### 🛍️ Core E-Commerce
- ✅ **Product Management** - Browse, search, filter products
- ✅ **Shopping Cart** - Add/remove products, quantity management
- ✅ **Wishlist** - Save favorite products for later
- ✅ **Product Reviews** - Rate and review purchased products
- ✅ **Inventory Management** - Track stock levels

### 🔒 Authentication & Authorization
- ✅ **User Registration** - Secure signup with email verification
- ✅ **Login/Logout** - Session-based authentication with Passport.js
- ✅ **Role-Based Access Control (RBAC)** - Buyer and Seller roles
- ✅ **Password Hashing** - Bcryptjs encryption
- ✅ **Session Management** - Secure HTTP-only cookies

### 💳 Payment Processing  
- ✅ **Stripe Integration** - Credit/Debit card payments
- ✅ **Cash on Delivery (COD)** - Pay at delivery option
- ✅ **Book Order** - Pre-book items with future delivery
- ✅ **Payment Verification** - Secure payment confirmation
- ✅ **Order Tracking** - Real-time order status and tracking
- ✅ **Tax Calculation** - 18% GST on all orders
- ✅ **Coupon System** - Apply discount codes

### 📦 Order Management
- ✅ **Order Creation** - Automated order generation
- ✅ **Order History** - View past and current orders
- ✅ **Order Cancellation** - Cancel pending orders
- ✅ **Returns & Refunds** - Process product returns
- ✅ **Order Details** - Complete order information display
- ✅ **Booking System** - Pre-book items for future purchase

### 🚚 Delivery & Shipping
- ✅ **Address Management** - Save shipping addresses
- ✅ **Shipping Calculation** - Zone-based shipping rates
- ✅ **Tracking Updates** - Real-time delivery tracking
- ✅ **Delivery Status** - Order fulfillment tracking

### 🔔 Notifications  
- ✅ **Firebase Push Notifications** - Real-time client-side alerts
- ✅ **Email Notifications** - Order updates via email
- ✅ **SMS Notifications** - Twilio-based text alerts
- ✅ **Notification Center** - In-app notification history
- ✅ **Device Token Management** - Multi-device support

### 👨‍💼 Seller Features
- ✅ **Seller Dashboard** - Sales analytics and metrics
- ✅ **Seller Orders** - View and manage seller's orders
- ✅ **Product Listings** - Add/edit/delete products
- ✅ **Seller Analytics** - Sales performance tracking
- ✅ **RBAC Protection** - Restricted seller access

### 📊 Admin Features
- ✅ **User Management** - Manage users and roles
- ✅ **Order Management** - Administrative order controls
- ✅ **Analytics Dashboard** - Sales and metrics overview

## 📦 Project Structure

```
E_commerce website - Copy/
├── 📄 Documentation Files
│   ├── COMPLETE_README.md              (This file - System overview)
│   ├── ARCHITECTURE_GUIDE.md           (System design & components)
│   ├── IMPLEMENTATION_SUMMARY.md       (Features implemented)
│   ├── PAYMENT_SYSTEM_INTEGRATION.md   (Payment gateway details)
│   ├── COD_AND_BOOKING_GUIDE.md        (COD & booking system)
│   ├── COD_BOOKING_QUICK_START.md      (Quick reference)
│   ├── SELLER_DASHBOARD_GUIDE.md       (Seller features)
│   ├── NOTIFICATION_INTEGRATION_GUIDE.md (Notifications setup)
│   ├── ORDER_DELIVERY_INTEGRATION_COMPLETE.md (Order tracking)
│   ├── INDEX.md                        (Documentation index)
│   ├── CODE_REVIEW_REPORT.md           (Code quality review)
│   └── PRODUCTION_DEPLOYMENT_CHECKLIST.md (Deployment guide)
│
├── 🔧 Startup Scripts
│   ├── start-all-services.sh           (Start main server)
│   ├── setup-test-data.sh              (Create test data)
│   └── test-notifications.js           (Test notification system)
│
├── 🎯 Core Files
│   ├── app.js                          (Main Express application)
│   ├── middleware.js                   (Global middleware)
│   ├── schema.js                        (Joi validation schemas)
│   ├── seed.js                          (Database seeding)
│   ├── package.json                     (Dependencies)
│   ├── .env                             (Environment variables)
│   └── serviceAccountKey.json           (Firebase admin credentials)
│
├── 🗂️ Controllers/ (Business Logic)
│   ├── notificationController.js        (Notification handling)
│   └── sellerOrdersController.js        (Seller order management)
│
├── 🔐 Middleware/ (Authentication & Authorization)
│   └── rbac.js                          (Role-based access control)
│
├── 📊 Models/ (MongoDB Schemas)
│   ├── User.js                          (User accounts)
│   ├── Product.js                       (Product catalog)
│   ├── Order.js                         (Orders)
│   ├── BookedOrder.js                   (Pre-booked orders)
│   ├── Review.js                        (Product reviews)
│   ├── Return.js                        (Return requests)
│   ├── Refund.js                        (Refund processing)
│   ├── TrackingUpdate.js                (Delivery tracking)
│   ├── Notification.js                  (Notification records)
│   └── DeviceToken.js                   (Firebase device tokens)
│
├── 🛣️ Routes/ (API Endpoints)
│   ├── auth.js                          (Authentication - signup/login)
│   ├── product.js                       (Product endpoints)
│   ├── cart.js                          (Cart & checkout) ⭐
│   ├── order.js                         (Order management)
│   ├── review.js                        (Review endpoints)
│   ├── seller.js                        (Seller operations)
│   ├── notifications.js                 (Notification endpoints)
│   ├── tracking.js                      (Order tracking)
│   ├── refund.js                        (Refund processing)
│   └── return.js                        (Return processing)
│
├── 🔧 Services/ (Business Logic Services)
│   ├── emailService.js                  (Email notifications)
│   ├── pushNotificationService.js       (Firebase push notifications)
│   ├── smsService.js                    (Twilio SMS alerts)
│   └── notificationEmitter.js           (Event-driven notifications)
│
├── 🔑 src/ (Configuration)
│   └── firebase-config.js               (Firebase initialization)
│
├── 👁️ Views/ (EJS Templates)
│   ├── layouts/
│   │   └── boilerplate.ejs              (Main layout)
│   │
│   ├── partials/
│   │   ├── navbar.ejs                   (Navigation bar)
│   │   └── flash.ejs                    (Flash messages)
│   │
│   ├── auth/
│   │   ├── login.ejs                    (Login form)
│   │   └── signup.ejs                   (Signup form)
│   │
│   ├── products/
│   │   ├── index.ejs                    (Product listing)
│   │   ├── show.ejs                     (Product details)
│   │   ├── new.ejs                      (Add new product)
│   │   └── edit.ejs                     (Edit product)
│   │
│   ├── cart/
│   │   ├── cart.ejs                     (Shopping cart)
│   │   ├── checkout.ejs                 (Checkout page) ⭐
│   │   ├── booking-details.ejs          (Booking details)
│   │   └── bookings.ejs                 (Bookings list)
│   │
│   ├── components/
│   │   ├── NotificationBell.jsx         (Notification indicator)
│   │   ├── NotificationCenter.jsx       (Notification history)
│   │   ├── OrdersList.jsx               (Order list display)
│   │   ├── OrderDetail.jsx              (Order details view)
│   │   ├── DashboardStats.jsx           (Analytics display)
│   │   ├── StatusFilter.jsx             (Filtering component)
│   │   └── PushPermissionRequest.jsx    (Permission prompt)
│   │
│   ├── orders/
│   │   ├── orders-list.ejs              (User's orders)
│   │   └── order-details.ejs            (Order details)
│   │
│   └── ...other views
│
├── 🎨 Public/ (Static Assets)
│   ├── css/
│   │   ├── app.css                      (Main styles)
│   │   ├── NotificationBell.css         (Notification styles)
│   │   ├── NotificationCenter.css       (Center styles)
│   │   ├── PushPermissionRequest.css    (Permission styles)
│   │   └── star.css                     (Rating styles)
│   │
│   ├── js/
│   │   └── .js files
│   │
│   └── firebase-messaging-sw.js         (Service worker for push notifications)
│
└── 📦 node_modules/
    └── Dependencies (installed packages)
```

## 🚀 Quick Start (10 Minutes)

### Prerequisites
- **Node.js** 16+ and npm
- **MongoDB** running locally (mongodb://127.0.0.1:27017/shopping-sam-app)
- **Stripe Account** (for card payments)
- **Firebase Project** (for push notifications)
- **Twilio Account** (optional, for SMS)
- **Nodemailer** compatible email (for email notifications)

### Installation Steps

#### Step 1: Clone/Download Project
```bash
# Navigate to project directory
cd "E_commerce website - Copy"
```

#### Step 2: Install Dependencies  
```bash
npm install
```

#### Step 3: Setup Environment Variables
Create a `.env` file in the root directory:
```env
# Database
MONGODB_URI=mongodb://127.0.0.1:27017/shopping-sam-app

# Payment Gateways
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_PUBLIC_KEY=your_stripe_public_key
RAZORPAY_SECRET_KEY=your_razorpay_secret
RAZORPAY_PUBLIC_KEY=your_razorpay_public

# Firebase (Push Notifications)
FIREBASE_PROJECT_ID=your_firebase_project
FIREBASE_PRIVATE_KEY=your_firebase_private_key
FIREBASE_CLIENT_EMAIL=your_firebase_email

# Email Service (Nodemailer)
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password

# SMS Service (Twilio - optional)
TWILIO_ACCOUNT_SID=your_twilio_account
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_PHONE_NUMBER=+1XXXXXXXXXX

# Server
PORT=5000
NODE_ENV=development
SESSION_SECRET=your_session_secret_key
```

#### Step 4: Start MongoDB
```bash
# macOS (with Homebrew)
brew services start mongodb-community

# Linux
sudo systemctl start mongod

# Windows
# MongoDB should auto-start or run: mongod
```

#### Step 5: Start Application
```bash
# Development mode (with nodemon)
npm start

# Production mode  
NODE_ENV=production npm start

# Server runs at http://localhost:5000
```

#### Step 6: Access the Application
```bash
# Browse to application
# Main app: http://localhost:5000
```

## 🧪 Testing the Application

### User Registration & Login
1. Navigate to http://localhost:5000
2. Click "Sign Up"
3. Fill in email, password, confirm password
4. Account created - now login
5. Accept push notification permissions (for notifications)

### Shopping Flow

#### 1. **Browse Products**
   - Homepage shows all products
   - Click on product to view details
   - Add to cart button on product page

#### 2. **Manage Cart**
   - Navigate to "Your Cart"
   - View cart items with prices
   - Update quantities or remove items
   - Proceed to checkout

#### 3. **Checkout Process**
   - Fill shipping address
   - Select payment method:
     - **Stripe** (Card payments)
     - **COD** (Cash on Delivery)
     - **Book Order** (Pre-book for future)

#### 4. **Stripe Payment** (If selected)
   - Redirected to Stripe
   - Test card: `4242 4242 4242 4242`
   - Any future expiry date
   - Any 3-digit CVC
   - Order created on success

#### 5. **View Order**
   - After payment, access "Your Orders"
   - See order status, items, tracking
   - Request return/refund if needed

### Seller Features

#### Login as Seller
1. During signup, select "Seller" role
2. Access Seller Dashboard
3. Manage products:
   - Add new products
   - Edit existing products
   - View seller analytics

#### Manage Orders
1. Dashboard shows seller orders
2. View order details
3. Update order status
4. Process refunds

### Notifications

#### Enable Push Notifications
1. Click notification bell icon
2. Grant browser permissions
3. Receive real-time order updates

#### Check Notification Center
1. Click notification bell
2. View notification history
3. See order status changes

## 🔑 Key Routes

### Authentication Routes
```
GET/POST  /signup          - User registration
GET/POST  /login           - User login
GET       /logout          - Logout user
```

### Product Routes
```
GET       /products        - List all products
GET       /products/:id    - Product details
POST      /products        - Create product (seller)
PUT       /products/:id    - Edit product (seller)
DELETE    /products/:id    - Delete product (seller)
POST      /reviews         - Add product review
```

### Cart & Checkout Routes
```
GET       /user/cart                      - View cart
POST      /user/:productId/add            - Add to cart
POST      /checkout/process               - Process checkout
POST      /checkout/success               - Payment success callback
POST      /booking/:bookingId/convert     - Convert booking to order
```

### Order Routes
```
GET       /orders                         - Get user orders
GET       /orders/:orderId                - Order details
GET       /orders/:orderId/track          - Order tracking
POST      /orders/:orderId/cancel         - Cancel order
```

### Seller Routes
```
GET       /seller/dashboard               - Seller analytics
GET       /seller/orders                  - Seller's orders
POST      /seller/products                - Create product
PUT       /seller/products/:id            - Edit product
```

### Notification Routes
```
GET       /notifications                  - Get user notifications
POST      /notifications/subscribe        - Subscribe to push
DELETE    /notifications/:id              - Delete notification
```

### Account Routes
```
GET       /returns                        - View returns
POST      /returns/:orderId               - Request return
GET       /refunds                        - View refunds
POST      /refunds/:orderId               - Request refund
```

## 📦 Dependencies

### Core Framework
- **express** ^5.1.0 - Web framework
- **mongoose** ^8.18.1 - MongoDB ODM
- **ejs** ^3.1.10 - Templating engine
- **ejs-mate** ^4.0.0 - EJS layout support

### Authentication & Security
- **passport** ^0.7.0 - Authentication middleware
- **passport-local** ^1.0.0 - Local strategy
- **passport-local-mongoose** ^8.0.0 - Mongoose plugin
- **bcryptjs** ^2.4.3 - Password hashing
- **jsonwebtoken** ^9.0.0 - JWT tokens
- **express-session** ^1.18.2 - Session management
- **cors** ^2.8.5 - CORS middleware

### Payment Processing
- **stripe** ^21.0.0 - Stripe payments
- **joi** ^18.0.1 - Schema validation

### Notifications
- **firebase-admin** ^13.8.0 - Firebase admin SDK
- **nodemailer** ^8.0.5 - Email service
- **twilio** ^5.13.1 - SMS service
- **socket.io** ^4.5.1 - Real-time events

### Utilities
- **dotenv** ^17.3.1 - Environment variables
- **uuid** ^9.0.0 - ID generation
- **connect-flash** ^0.1.1 - Flash messages
- **method-override** ^3.0.0 - HTTP method override
- **nodemon** ^3.1.10 - Development reload

## 🛠️ Development Commands

```bash
# Start development server
npm start

# Run tests (if configured)
npm test

# Lint code (if configured)
npm run lint

# View logs
npm run logs

# Database commands
node setup-test-data.sh    # Seed test data
mongosh                     # Connect to MongoDB
```

## 📚 Documentation

For more detailed information, refer to:

- [ARCHITECTURE_GUIDE.md](./ARCHITECTURE_GUIDE.md) - System architecture and data flow
- [PAYMENT_SYSTEM_INTEGRATION.md](./PAYMENT_SYSTEM_INTEGRATION.md) - Payment gateway integration details
- [COD_AND_BOOKING_GUIDE.md](./COD_AND_BOOKING_GUIDE.md) - COD and booking system documentation
- [SELLER_DASHBOARD_GUIDE.md](./SELLER_DASHBOARD_GUIDE.md) - Seller feature documentation
- [NOTIFICATION_INTEGRATION_GUIDE.md](./NOTIFICATION_INTEGRATION_GUIDE.md) - Notifications setup
- [ORDER_DELIVERY_INTEGRATION_COMPLETE.md](./ORDER_DELIVERY_INTEGRATION_COMPLETE.md) - Order tracking integration
- [PRODUCTION_DEPLOYMENT_CHECKLIST.md](./PRODUCTION_DEPLOYMENT_CHECKLIST.md) - Deployment guide
- [INDEX.md](./INDEX.md) - Complete documentation index

## 🐛 Troubleshooting

### MongoDB Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution:** Start MongoDB service:
- macOS: `brew services start mongodb-community`
- Linux: `sudo systemctl start mongod`

### Stripe Error: Missing API Key
```
Error: Payment gateway is not configured. Please add STRIPE_SECRET_KEY.
```
**Solution:** Add `STRIPE_SECRET_KEY` to `.env` file from your Stripe dashboard

### Firebase Push Notifications Not Working
```
Error: Firebase Admin SDK not configured
```
**Solution:** Upload `serviceAccountKey.json` from Firebase Console

### Port Already in Use
```
Error: listen EADDRINUSE :::5000
```
**Solution:** Change PORT in `.env` or kill process using port 5000

## 🤝 Contributing

1. Create a new branch for features (`git checkout -b feature/new-feature`)
2. Commit changes (`git commit -am 'Add new feature'`)
3. Push to branch (`git push origin feature/new-feature`)
4. Submit Pull Request

## 📄 License

This project is licensed under the ISC License.

## 👨‍💻 Author

**deepti gupta**

## 🙏 Support

For issues, questions, or suggestions, please reach out or open an issue in the repository.

---

**Last Updated:** April 16, 2026  
**Status:** ✅ Production Ready
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
