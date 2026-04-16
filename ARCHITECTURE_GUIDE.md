# System Architecture & Component Interaction

## 🏗️ Overall System Architecture

**A Single-Tier Monolithic Node.js/Express Application**

```
┌─────────────────────────────────────────────────────────────────┐
│                      BROWSER (Client Layer)                     │
│                 Renders EJS Templates + CSS/JS                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  HTML Pages:                                                    │
│  ├─ Login/Signup (auth/login.ejs, auth/signup.ejs)            │
│  ├─ Product Listing (products/index.ejs)                       │
│  ├─ Product Details (products/show.ejs)                        │
│  ├─ Shopping Cart (cart/cart.ejs)                              │
│  ├─ Checkout (cart/checkout.ejs) ⭐                            │
│  ├─ Order History (orders/orders-list.ejs)                     │
│  ├─ Seller Dashboard (SellerDashboard.jsx)                     │
│  └─ Notifications (components/NotificationCenter.jsx)          │
│                                                                 │
│  Client-Side Features:                                          │
│  ├─ Form Validation & Submission                               │
│  ├─ Cart Management (add/remove items)                         │
│  ├─ Flash Messages (success/error)                             │
│  ├─ Push Notifications (Firebase Service Worker)               │
│  └─ Real-time Updates (Socket.io)                              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                            │
                            ▼ HTTP Request/Response
┌─────────────────────────────────────────────────────────────────┐
│             EXPRESS.JS BACKEND (Port 5000)                      │
│          Node.js + Express + MongoDB + EJS                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │              MIDDLEWARE STACK                           │  │
│  ├─────────────────────────────────────────────────────────┤  │
│  │                                                         │  │
│  │  1. express.json() / express.urlencoded()              │  │
│  │     └─ Parse request body                              │  │
│  │                                                         │  │
│  │  2. express-session + Passport.js                      │  │
│  │     ├─ User session management                         │  │
│  │     └─ Serialize/deserialize user                      │  │
│  │                                                         │  │
│  │  3. Custom Middleware (middleware.js)                  │  │
│  │     ├─ isLoggedIn - Check authentication               │  │
│  │     ├─ isBuyer - Verify buyer role                     │  │
│  │     ├─ isSeller - Verify seller role                   │  │
│  │     └─ isAdmin - Verify admin role                     │  │
│  │                                                         │  │
│  │  4. RBAC Middleware (middleware/rbac.js)               │  │
│  │     ├─ Role-based access control                       │  │
│  │     └─ Permission validation                           │  │
│  │                                                         │  │
│  │  5. Error Handling                                     │  │
│  │     └─ Global error middleware                         │  │
│  │                                                         │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │              ROUTE HANDLERS                             │  │
│  ├─────────────────────────────────────────────────────────┤  │
│  │                                                         │  │
│  │  Authentication Routes (routes/auth.js)                │  │
│  │  ├─ POST /signup - Create new user                    │  │
│  │  ├─ POST /login - Authenticate user                   │  │
│  │  └─ GET /logout - Destroy session                     │  │
│  │                                                         │  │
│  │  Product Routes (routes/product.js)                    │  │
│  │  ├─ GET /products - List all products                 │  │
│  │  ├─ GET /products/:id - Get product details           │  │
│  │  ├─ POST /products - Create new product (seller)      │  │
│  │  ├─ PUT /products/:id - Update product (seller)       │  │
│  │  └─ DELETE /products/:id - Delete product (seller)    │  │
│  │                                                         │  │
│  │  Cart Routes (routes/cart.js) ⭐                      │  │
│  │  ├─ GET /user/cart - View cart                        │  │
│  │  ├─ POST /user/:productId/add - Add to cart           │  │
│  │  ├─ GET /checkout - Show checkout form                │  │
│  │  ├─ POST /checkout/process - Process payment          │  │
│  │  │  ├─ Validate address                               │  │
│  │  │  ├─ Route to payment handler:                       │  │
│  │  │  │  ├─ handleStripePayment()                        │  │
│  │  │  │  ├─ handleCODPayment()                           │  │
│  │  │  │  └─ handleBookOrder()                            │  │
│  │  │  └─ Create Order/BookedOrder                        │  │
│  │  └─ POST /checkout/success - Payment confirmation      │  │
│  │                                                         │  │
│  │  Order Routes (routes/order.js)                        │  │
│  │  ├─ GET /orders - Get user orders                     │  │
│  │  ├─ GET /orders/:orderId - Get order details           │  │
│  │  ├─ POST /orders/:orderId/cancel - Cancel order        │  │
│  │  └─ GET /orders/:orderId/track - Track order           │  │
│  │                                                         │  │
│  │  Seller Routes (routes/seller.js)                      │  │
│  │  ├─ GET /seller/dashboard - Seller analytics           │  │
│  │  ├─ GET /seller/orders - Seller's orders               │  │
│  │  ├─ POST /seller/products - Add product                │  │
│  │  └─ PUT /seller/products/:id - Edit product            │  │
│  │                                                         │  │
│  │  Notification Routes (routes/notifications.js)         │  │
│  │  ├─ GET /notifications - Get notifications             │  │
│  │  ├─ POST /notifications/subscribe - Subscribe to push  │  │
│  │  └─ DELETE /notifications/:id - Delete notification    │  │
│  │                                                         │  │
│  │  Return/Refund Routes (routes/return.js, refund.js)    │  │
│  │  ├─ GET /returns - View returns                        │  │
│  │  ├─ POST /returns/:orderId - Request return            │  │
│  │  ├─ GET /refunds - View refunds                        │  │
│  │  └─ POST /refunds/:orderId - Request refund            │  │
│  │                                                         │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │              CONTROLLERS (Business Logic)               │  │
│  ├─────────────────────────────────────────────────────────┤  │
│  │                                                         │  │
│  │  notificationController.js                              │  │
│  │  ├─ sendNotification()                                 │  │
│  │  ├─ getNotifications()                                 │  │
│  │  └─ handleNotificationEvents()                         │  │
│  │                                                         │  │
│  │  sellerOrdersController.js                              │  │
│  │  ├─ getSellerDashboard()                               │  │
│  │  ├─ getSellerOrders()                                  │  │
│  │  └─ updateOrderStatus()                                │  │
│  │                                                         │  │
│  │  (Route files contain inline controller logic)          │  │
│  │                                                         │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │              SERVICES (Integrations)                    │  │
│  ├─────────────────────────────────────────────────────────┤  │
│  │                                                         │  │
│  │  emailService.js                                        │  │
│  │  ├─ sendOrderConfirmation()                            │  │
│  │  ├─ sendPaymentFailure()                               │  │
│  │  └─ sendRefundNotification()                           │  │
│  │                                                         │  │
│  │  pushNotificationService.js                             │  │
│  │  ├─ subscribeDevice()                                  │  │
│  │  ├─ sendPushNotification()                             │  │
│  │  └─ broadcastNotification()                            │  │
│  │                                                         │  │
│  │  smsService.js                                          │  │
│  │  ├─ sendOrderSMS()                                     │  │
│  │  └─ sendDeliveryAlert()                                │  │
│  │                                                         │  │
│  │  notificationEmitter.js                                 │  │
│  │  ├─ Event listeners for order events                   │  │
│  │  ├─ Triggers multiple notification channels             │  │
│  │  └─ Socket.io emission for real-time updates           │  │
│  │                                                         │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │              MONGODB MODELS & SCHEMAS                   │  │
│  ├─────────────────────────────────────────────────────────┤  │
│  │                                                         │  │
│  │  User.js                                                │  │
│  │  ├─ email, password (encrypted)                        │  │
│  │  ├─ role (buyer/seller/admin)                          │  │
│  │  ├─ cart (array of product references)                 │  │
│  │  └─ profile (name, phone, address)                     │  │
│  │                                                         │  │
│  │  Product.js                                             │  │
│  │  ├─ name, description, price                           │  │
│  │  ├─ seller (reference to User)                         │  │
│  │  ├─ category, image                                    │  │
│  │  └─ stockQuantity                                      │  │
│  │                                                         │  │
│  │  Order.js                                               │  │
│  │  ├─ orderId, userId (reference)                        │  │
│  │  ├─ items (array), pricing (subtotal, tax, shipping)   │  │
│  │  ├─ shippingAddress                                    │  │
│  │  ├─ paymentMethod (stripe/cod/book)                    │  │
│  │  ├─ paymentStatus (pending/completed)                  │  │
│  │  ├─ status (placed/confirmed/shipped/delivered)        │  │
│  │  ├─ trackingNumber, trackingUpdates                    │  │
│  │  └─ timestamps (createdAt, updatedAt)                  │  │
│  │                                                         │  │
│  │  BookedOrder.js                                         │  │
│  │  ├─ bookingId, userId                                  │  │
│  │  ├─ items, expectedDeliveryDate                        │  │
│  │  ├─ status (pending/converted/cancelled)               │  │
│  │  └─ orderId (after conversion)                         │  │
│  │                                                         │  │
│  │  Review.js                                              │  │
│  │  ├─ productId, userId, rating, text                    │  │
│  │  └─ createdAt, updatedAt                               │  │
│  │                                                         │  │
│  │  Return.js & Refund.js                                  │  │
│  │  ├─ orderId, userId                                    │  │
│  │  ├─ reason, status                                     │  │
│  │  └─ timestamps                                         │  │
│  │                                                         │  │
│  │  Notification.js                                        │  │
│  │  ├─ userId, type (order/payment/delivery)              │  │
│  │  ├─ message, read status                               │  │
│  │  └─ createdAt                                          │  │
│  │                                                         │  │
│  │  DeviceToken.js                                         │  │
│  │  ├─ userId, token (Firebase registration token)         │  │
│  │  └─ device info                                        │  │
│  │                                                         │  │
│  │  TrackingUpdate.js                                      │  │
│  │  ├─ orderId, trackingNumber                            │  │
│  │  ├─ status, location, timestamp                        │  │
│  │  └─ estimatedDelivery                                  │  │
│  │                                                         │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │              EXTERNAL INTEGRATIONS                      │  │
│  ├─────────────────────────────────────────────────────────┤  │
│  │                                                         │  │
│  │  ✅ Stripe (src/firebase-config.js)                    │  │
│  │     └─ Card payment processing                         │  │
│  │                                                         │  │
│  │  ✅ Firebase Admin SDK                                 │  │
│  │     ├─ Push notification delivery                      │  │
│  │     └─ Multi-device support                            │  │
│  │                                                         │  │
│  │  ✅ Nodemailer                                         │  │
│  │     └─ Email notification delivery                     │  │
│  │                                                         │  │
│  │  ✅ Twilio                                             │  │
│  │     └─ SMS notification delivery                       │  │
│  │                                                         │  │
│  │  ✅ Socket.io                                          │  │
│  │     └─ Real-time event broadcasting                    │  │
│  │                                                         │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                   MONGODB DATABASE                              │
│         shopping-sam-app (Local or Cloud Atlas)                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Collections:                                                   │
│  ├─ users                      (10+ indexed fields)             │
│  ├─ products                   (50-100 products)                │
│  ├─ orders                     (All customer orders)            │
│  ├─ bookedorders               (Future pre-bookings)            │
│  ├─ reviews                    (Product reviews)                │
│  ├─ returns                    (Return requests)                │
│  ├─ refunds                    (Refund records)                 │
│  ├─ notifications              (Notification history)           │
│  ├─ devicetokens              (Firebase tokens)                 │
│  ├─ tracingupdates            (Delivery tracking)               │
│  └─ (indices for fast lookup)                                   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## 🔄 Key Data Flows

### 1. Payment Processing Flow

```
User Adds Items to Cart
    ↓
User Clicks "Checkout"
    ↓
GET /checkout
    ├─ Load user's cart from DB
    ├─ Render checkout.ejs form
    └─ Show payment method options
    ↓
User Selects Payment Method & Fills Address
    ↓
POST /checkout/process
    ├─ Validate input (Joi schema in schema.js)
    ├─ Switch on paymentMethod:
    │
    ├─ CASE "stripe":
    │  ├─ Create Stripe checkout session
    │  ├─ Redirect to Stripe payment page
    │  ├─ User enters card details on Stripe
    │  ├─ Stripe confirms payment
    │  ├─ POST /checkout/success callback
    │  └─ Create Order (status: confirmed, paymentStatus: completed)
    │
    ├─ CASE "cod":
    │  ├─ Create Order (status: confirmed, paymentStatus: pending)
    │  ├─ Email confirmation sent
    │  ├─ SMS alert sent (if configured)
    │  ├─ Push notification sent
    │  └─ Redirect to success page
    │
    └─ CASE "book_order":
       ├─ Create BookedOrder (status: pending)
       ├─ Reserve items
       ├─ Send booking confirmation
       └─ User converts to order later
    ↓
Order Created in MongoDB
    ↓
Notifications Triggered (Email, SMS, Push)
    ↓
Customer Receives Confirmation
```

### 2. Seller Dashboard Flow

```
Seller Logs In
    ↓
GET /seller/dashboard
    ├─ Check role (middleware/rbac.js)
    ├─ Fetch seller's orders from DB
    ├─ Calculate metrics (total sales, pending orders)
    ├─ Render SellerDashboard.jsx
    └─ Display analytics with charts
    ↓
Seller Views Orders
    ├─ GET /seller/orders
    ├─ Query Order collection (seller filter)
    └─ Display order list
    ↓
Seller Updates Order Status
    ├─ POST /seller/orders/:orderId/status
    ├─ Update order status in DB
    ├─ Trigger notification to buyer
    ├─ Email buyer about status change
    └─ Send SMS alert (if configured)
```

### 3. Notification Flow

```
Order Event Triggered
(orderCreated, orderShipped, orderDelivered, etc.)
    ↓
notificationEmitter.js listens to events
    ↓
Parallel Notifications Sent:
    ├─ 📧 Email (emailService.js via Nodemailer)
    ├─ 📱 Push (pushNotificationService.js via Firebase)
    ├─ 📲 SMS (smsService.js via Twilio)
    └─ 🔔 In-App (Socket.io broadcast)
    ↓
Notification Stored in DB
    ↓
Notification Center Updated
```

## 🗄️ Database Schema Relationships

```
User
├─ Has Many: Products (seller)
├─ Has Many: Orders (buyer)
├─ Has Many: BookedOrders
├─ Has Many: Reviews
├─ Has Many: Notifications
└─ Has Many: DeviceTokens

Product
├─ Belongs To: User (seller)
└─ Has Many: Reviews

Order
├─ Belongs To: User
├─ Has Many: Items (embedded)
├─ Has Many: TrackingUpdates
├─ Has One: Return (if initiated)
└─ Has One: Refund (if processed)

BookedOrder
├─ Belongs To: User
├─ Links To: Order (after conversion)
└─ Has Many: Items (embedded)

Notification
├─ Belongs To: User
└─ References: Order (orderId)

DeviceToken
└─ Belongs To: User
```

## 🔐 Authentication & Authorization Flow

```
User Visits App (No Session)
    ↓
Redirected to GET /login
    ↓
User Submits Credentials (POST /login)
    ├─ Passport.js authenticates against User model
    ├─ Password hashed with bcryptjs
    ├─ User serialized into session
    └─ Session created (express-session)
    ↓
Session Stored on Server
    ↓
Subsequent Requests Include Session
    ├─ middleware.isLoggedIn checks req.user
    ├─ Allows access if authenticated
    └─ Redirects to /login if not
    ↓
Route-Level Authorization (middleware/rbac.js)
    ├─ isBuyer - Only buyers can checkout
    ├─ isSeller - Only sellers can access dashboard
    ├─ isAdmin - Only admins can manage users
    └─ Custom roles for other endpoints
```

## 📊 Payment Processing Architecture

```
Payment Handler Functions in routes/cart.js:

handleStripePayment()
├─ Create line items from cart
├─ Add tax and shipping
├─ Create Stripe session
├─ Return session URL to client
└─ Client redirects to Stripe

handleCODPayment()
├─ Create Order with status="confirmed"
├─ Set paymentStatus="pending"
├─ Clear user's cart
├─ Send notifications
└─ Redirect to success page

handleBookOrder()
├─ Create BookedOrder with status="pending"
├─ Reserve items (don't create Order yet)
├─ Set expectedDeliveryDate
├─ Send booking confirmation
└─ Return to booking details page
```

## 🚀 Deployment Architecture Recommendations

### Development
- Single machine: Node.js + MongoDB local

### Production
- **Tier 1**: Node.js app (multiple instances behind load balancer)
- **Tier 2**: MongoDB (Atlas or self-managed with replication)
- **Tier 3**: CDN for static assets (CSS, JS, images)
- **External**: Firebase, Stripe, Twilio (cloud-based)

### Environment Separation
```
Development (.env)
├─ NODE_ENV=development
├─ MONGODB_URI=mongodb://localhost:27017
└─ DEBUG=true

Production (.env.production)
├─ NODE_ENV=production
├─ MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net
└─ DEBUG=false
```

## 🔄 Session & State Management

### Server-Side Session
- Express-session stores session data
- Default in-memory storage (use connect-mongo for production)
- Session ID in HTTP-only cookie
- Expires after 7 days of inactivity

### Client-Side State
- Shopping cart stored in browser memory
- Lost on page refresh (consider localStorage enhancement)
- Can be persisted to User.cart in DB

