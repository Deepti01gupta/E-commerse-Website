# System Architecture & Component Interaction

## 🏗️ Overall System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      CLIENT BROWSER (Port 5173)                 │
│                  React + Vite + Tailwind CSS                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │           React Component Tree                           │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │                                                          │  │
│  │  App.jsx (Router)                                        │  │
│  │  ├─ HomePage                                             │  │
│  │  ├─ CartPage ──► [Checkout Button]                       │  │
│  │  ├─ WishlistPage                                         │  │
│  │  └─ CheckoutPage (NEW)                                   │  │
│  │     ├─ AddressForm ◄──────┐                              │  │
│  │     ├─ ShippingCalculator ◄┤─ onShippingChange           │  │
│  │     ├─ PaymentMethodSelector ◄┤                          │  │
│  │     ├─ CouponApplier ◄┤─ onCouponApply                   │  │
│  │     ├─ OrderSummary (displays totals)                    │  │
│  │     └─ [Proceed to Payment Button]                       │  │
│  │        │                                                 │  │
│  │        └─► API Call: POST /api/checkout/initiate         │  │
│  │            Response: {orderId, paymentData}              │  │
│  │              │                                           │  │
│  │              ├─► Razorpay: Load checkout modal           │  │
│  │              └─► Stripe: Load payment form               │  │
│  │                                                          │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              StoreContext (State Management)             │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │  • cartDetails (items & subtotals)                       │  │
│  │  • filteredProducts (search results)                     │  │
│  │  • wishlist (saved items)                                │  │
│  │  • theme (dark/light mode)                               │  │
│  │  Functions:                                              │  │
│  │  • addToCart() • removeFromCart() • updateQuantity()     │  │
│  │  • toggleWishlist() • resetFilters() • setTheme()        │  │
│  │  Persistence: localStorage                              │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                            │
           ┌────────────────┼────────────────┐
           │                │                │
           ▼                ▼                ▼
      [Razorpay]       [Stripe]        [Payment]
    (Payment Modal)  (Payment Form)    (Backend)
           │                │                │
           └────────────────┼────────────────┘
                            │
                            ▼
    ┌─────────────────────────────────────────────────────────┐
    │         PAYMENT BACKEND (Port 5001)                    │
    │      Node.js + Express + MongoDB                       │
    ├─────────────────────────────────────────────────────────┤
    │                                                         │
    │  ┌─────────────────────────────────────────────────┐   │
    │  │            API Routes                           │   │
    │  ├─────────────────────────────────────────────────┤   │
    │  │                                                 │   │
    │  │  Checkout Routes                                │   │
    │  │  ├─ POST /api/checkout/initiate                │   │
    │  │  │  ├─ Validate input (Joi schema)             │   │
    │  │  │  ├─ Create Order doc (status: pending)      │   │
    │  │  │  ├─ Apply coupon (if provided)              │   │
    │  │  │  ├─ Calculate shipping                      │   │
    │  │  │  ├─ Calculate tax (18%)                     │   │
    │  │  │  ├─ Create Razorpay order OR Stripe intent │   │
    │  │  │  └─ Return orderId + paymentData            │   │
    │  │  │                                              │   │
    │  │  └─ POST /api/checkout/verify-razorpay        │   │
    │  │     ├─ Verify HMAC signature                  │   │
    │  │     ├─ Validate payment status                │   │
    │  │     ├─ Update Order (paymentStatus: completed) │   │
    │  │     └─ Return updated order                   │   │
    │  │                                                 │   │
    │  │  Coupon Routes                                  │   │
    │  │  └─ POST /api/coupons/apply                   │   │
    │  │     ├─ Validate coupon exists & active         │   │
    │  │     ├─ Check expiry                            │   │
    │  │     ├─ Check min order value                   │   │
    │  │     ├─ Calculate discount                      │   │
    │  │     └─ Return discountAmount                   │   │
    │  │                                                 │   │
    │  │  Delivery Routes                                │   │
    │  │  └─ POST /api/delivery/calculate               │   │
    │  │     ├─ Find zone by pincode                    │   │
    │  │     ├─ Check free delivery threshold           │   │
    │  │     ├─ Calculate shipping charge               │   │
    │  │     └─ Return shippingCharge                   │   │
    │  │                                                 │   │
    │  │  Order Routes                                   │   │
    │  │  ├─ GET /api/orders                            │   │
    │  │  ├─ GET /api/orders/:orderId                   │   │
    │  │  └─ GET /api/orders/:orderId/invoice           │   │
    │  │                                                 │   │
    │  └─────────────────────────────────────────────────┘   │
    │                     │                                   │
    │           ┌─────────┼─────────┐                         │
    │           ▼         ▼         ▼                         │
    │                                                         │
    │  ┌──────────────────────────────────────────────┐      │
    │  │   Middleware & Controllers                   │      │
    │  ├──────────────────────────────────────────────┤      │
    │  │                                              │      │
    │  │  Controllers:                                │      │
    │  │  ├─ checkout.controller.js                  │      │
    │  │  │  ├─ initiateCheckout()                   │      │
    │  │  │  └─ verifyRazorpayPayment()             │      │
    │  │  ├─ coupon.controller.js                    │      │
    │  │  │  └─ applyCoupon()                        │      │
    │  │  ├─ delivery.controller.js                  │      │
    │  │  │  └─ calculateShipping()                  │      │
    │  │  └─ order.controller.js                     │      │
    │  │     └─ getOrders(), generateInvoice()       │      │
    │  │                                              │      │
    │  │  Middleware:                                 │      │
    │  │  ├─ validate.middleware.js (Joi schemas)    │      │
    │  │  ├─ error.middleware.js (Error handler)     │      │
    │  │  └─ asyncHandler.js (Async wrapper)         │      │
    │  │                                              │      │
    │  └──────────────────────────────────────────────┘      │
    │                     │                                   │
    │           ┌─────────┼─────────┐                         │
    │           ▼         ▼         ▼                         │
    │                                                         │
    │  ┌──────────────────────────────────────────────┐      │
    │  │   Services Layer                             │      │
    │  ├──────────────────────────────────────────────┤      │
    │  │                                              │      │
    │  │  Payment Services:                           │      │
    │  │  ├─ stripe.service.js                        │      │
    │  │  │  ├─ createPaymentIntent()                │      │
    │  │  │  ├─ confirmPaymentIntent()               │      │
    │  │  │  └─ retrievePaymentIntent()              │      │
    │  │  │                                           │      │
    │  │  ├─ razorpay.service.js                      │      │
    │  │  │  ├─ createOrder()                        │      │
    │  │  │  ├─ fetchPayment()                       │      │
    │  │  │  └─ verifySignature()                    │      │
    │  │  │                                           │      │
    │  │  Business Services:                          │      │
    │  │  ├─ coupon.service.js                        │      │
    │  │  │  ├─ validateCoupon()                     │      │
    │  │  │  └─ incrementCouponUsage()               │      │
    │  │  │                                           │      │
    │  │  ├─ delivery.service.js                      │      │
    │  │  │  ├─ calculateShippingCharge()            │      │
    │  │  │  └─ getDeliveryZoneByPincode()           │      │
    │  │  │                                           │      │
    │  │  ├─ invoice.service.js                       │      │
    │  │  │  └─ generateInvoicePDF()                 │      │
    │  │  │                                           │      │
    │  │  └─ email.service.js                         │      │
    │  │     ├─ sendOrderConfirmationEmail()         │      │
    │  │     └─ sendPaymentFailureEmail()            │      │
    │  │                                              │      │
    │  └──────────────────────────────────────────────┘      │
    │                     │                                   │
    │           ┌─────────┼─────────┐                         │
    │           ▼         ▼         ▼                         │
    │                                                         │
    │  ┌──────────────────────────────────────────────┐      │
    │  │   Data Models                                │      │
    │  ├──────────────────────────────────────────────┤      │
    │  │                                              │      │
    │  │  ├─ Order.js (MongoDB Schema)                │      │
    │  │  │  Fields: userId, orderId, items,          │      │
    │  │  │  shippingAddress, pricing,                │      │
    │  │  │  paymentStatus, paymentIds                │      │
    │  │  │                                           │      │
    │  │  ├─ Coupon.js (MongoDB Schema)               │      │
    │  │  │  Fields: code, discountType,              │      │
    │  │  │  discountValue, usageLimit, validUpto    │      │
    │  │  │                                           │      │
    │  │  └─ DeliveryZone.js (MongoDB Schema)         │      │
    │  │     Fields: pincodes, city, state,           │      │
    │  │     chargePerUnit, freeDeliveryAbove         │      │
    │  │                                              │      │
    │  └──────────────────────────────────────────────┘      │
    │                     │                                   │
    │           ┌─────────┴─────────┐                         │
    │           ▼                   ▼                         │
    │      MongoDB              External APIs                │
    │   (ecommerce-payment)  (Razorpay, Stripe)              │
    │                                                         │
    └─────────────────────────────────────────────────────────┘
```

## 🔄 Checkout Flow Sequence Diagram

```
User                Frontend              Backend              Payment Gateway
 │                    │                    │                        │
 │  1. Fill Address   │                    │                        │
 │ ─────────────────► │                    │                        │
 │                    │                    │                        │
 │  2. Check Shipping │                    │                        │
 │ ─────────────────► │ 3. POST /delivery/calculate                 │
 │                    │ ───────────────────►│                        │
 │                    │                    │ 4. Lookup Zone         │
 │                    │                    │ 5. Calculate Fee       │
 │                    │◄─ 6. Response ─────│                        │
 │◄─ 7. Show Shipping │                    │                        │
 │                    │                    │                        │
 │  8. Apply Coupon   │                    │                        │
 │ ─────────────────► │ 9. POST /coupons/apply                      │
 │                    │ ───────────────────►│                        │
 │                    │                    │ 10. Validate Coupon   │
 │                    │◄─ 11. Response ────│                        │
 │◄─ 12. Show Discount│                    │                        │
 │                    │                    │                        │
 │  13. Proceed       │                    │                        │
 │ ─────────────────► │ 14. POST /checkout/initiate                 │
 │                    │ ───────────────────►│                        │
 │                    │                    │ 15. Validate Input    │
 │                    │                    │ 16. Calculate Total   │
 │                    │                    │ 17. Create Order Doc  │
 │                    │                    │ 18. Create Payment    │
 │                    │                    │ ───────────────────────►
 │                    │                    │ 19. Payment Intent/Order
 │                    │◄─ 20. Response ────│◄───────────────────────
 │◄─ 21. Show Payment │                    │                        │
 │    Form/Modal      │                    │                        │
 │                    │                    │                        │
 │  22. Enter Card    │                    │                        │
 │      Details       │                    │                        │
 │ ─────────────────► │ 23. Complete Payment                        │
 │                    │ ─────────────────────────────────────────────►
 │                    │                    │                        │
 │                    │                    │                        │ 24. Process
 │                    │                    │                        │ 25. Verify
 │                    │                    │                        │ 26. Auth
 │                    │                    │                        │ 27. Capture
 │                    │                    │                        │
 │                    │                    │◄──── 28. Payment Success
 │                    │ 29. Verify Signature
 │                    │ 30. Update Order Status
 │                    │ 31. Send Confirmation Email
 │                    │ 32. Generate Invoice
 │                    │ 33. Response
 │◄─ 34. Success Page ◄────────────────────│                        │
 │   (CheckoutSuccessPage)                │                        │
```

## 📦 Component Data Flow

### Checkout Component Hierarchy

```
CheckoutPage
├─ AddressForm
│  ├─ State: address (controlled)
│  ├─ Props: onAddressChange()
│  └─ onChange: Updates parent
│
├─ ShippingCalculator
│  ├─ State: localPincode, error
│  ├─ Props: onShippingChange()
│  └─ onClick Calculate: Calls /api/delivery/calculate
│
├─ PaymentMethodSelector
│  ├─ State: selectedMethod
│  ├─ Props: onMethodChange()
│  └─ onChange: Updates parent
│
├─ CouponApplier
│  ├─ State: code, loading, message
│  ├─ Props: onCouponApply(), appliedCoupon
│  └─ onClick Apply: Calls /api/coupons/apply
│
├─ OrderSummary (Memo)
│  ├─ Props: pricing (calculated), items
│  ├─ Displays:
│  │  ├─ Item list with quantities
│  │  ├─ Subtotal
│  │  ├─ Tax (18%)
│  │  ├─ Shipping (or "Free")
│  │  ├─ Discount (if coupon)
│  │  └─ Total
│  └─ Updates reactively when pricing changes
│
└─ [Proceed to Payment Button]
   ├─ Validates all fields
   ├─ Calls /api/checkout/initiate
   └─ Redirects to payment gateway

State Management in CheckoutPage:
├─ address: {fullName, email, phone, street, city, state, pincode, country}
├─ paymentMethod: "razorpay" | "stripe" | "upi" | "wallet"
├─ pricing: {subtotal, tax, shippingCharge, discountAmount, couponCode, total}
├─ appliedCoupon: couponCode | null
├─ loading: boolean
└─ error: string
```

## 🔌 API Integration Points

### Frontend → Backend

```javascript
// 1. Shipping Calculation
fetch('http://localhost:5001/api/delivery/calculate', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    pincode: "110001",
    cartTotal: 5000
  })
})

// 2. Coupon Validation
fetch('http://localhost:5001/api/coupons/apply', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    code: "WELCOME20",
    cartTotal: 5000
  })
})

// 3. Checkout Initiation
fetch('http://localhost:5001/api/checkout/initiate', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    items: cartDetails,
    shippingAddress: address,
    paymentMethod: "razorpay",
    couponCode: "WELCOME20"
  })
})

// 4. Razorpay Payment Verification
fetch('http://localhost:5001/api/checkout/verify-razorpay', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    razorpayOrderId: "order_ABC123",
    razorpayPaymentId: "pay_ABC123",
    razorpaySignature: "signature_hash",
    orderId: "ORD_1234567890"
  })
})
```

## 💾 Database Query Flow

### Order Creation Flow

```
1. POST /api/checkout/initiate received
   │
   ├─► Validate input (Joi schema)
   │
   ├─► Calculate Totals:
   │   ├─ Subtotal = sum of (price × quantity)
   │   ├─ If couponCode:
   │   │  └─ Query: db.coupons.findOne({code: couponCode})
   │   │  └─ Validate: expiry, minOrderValue, usageLimit
   │   │  └─ discountAmount = calculated
   │   ├─ Query: db.deliveryzones.findOne({pincodes: pincode})
   │   ├─ If exists:
   │   │  └─ shippingCharge = calculated based on cartTotal
   │   ├─ tax = (subtotal - discount) × 0.18
   │   └─ total = subtotal + tax + shipping - discount
   │
   ├─► Create Order Document:
   │   └─ Query: db.orders.insertOne({
   │       userId: "user_id",
   │       orderId: "ORD_" + timestamp,
   │       items: cartItems,
   │       shippingAddress: address,
   │       pricing: {subtotal, tax, shippingCharge, discountAmount, total},
   │       paymentMethod: "razorpay",
   │       paymentStatus: "pending",
   │       createdAt: now
   │     })
   │
   ├─► Create Payment Intent:
   │   ├─ For Razorpay:
   │   │  └─ POST razorpay/orders (amount, orderId as metadata)
   │   │  └─ Returns: razorpayOrderId, razorpayKeyId
   │   ├─ For Stripe:
   │   │  └─ POST stripe/payment_intents (amount, metadata)
   │   │  └─ Returns: clientSecret, intentId
   │   │
   │   └─► Update Order Document:
   │       └─ Query: db.orders.updateOne({orderId},
   │           {razorpayOrderId, stripeIntentId})
   │
   └─► Send Response with orderId + paymentData
```

### Payment Verification Flow

```
1. POST /api/checkout/verify-razorpay received
   │
   ├─► Verify Signature:
   │   ├─ HMAC-SHA256(orderId|paymentId, secretKey)
   │   ├─ Compare with signature from request
   │   └─ If mismatch: Return error
   │
   ├─► Fetch Payment Details:
   │   └─ Query: razorpay API for paymentId
   │   └─ Validate: status === "captured"
   │
   ├─► Increment Coupon Usage:
   │   └─ Query: db.coupons.updateOne({code},
   │       {$inc: {usageCount: 1}})
   │
   ├─► Update Order:
   │   └─ Query: db.orders.updateOne({orderId}, {
   │       paymentStatus: "completed",
   │       paymentId: razorpayPaymentId,
   │       updatedAt: now
   │     })
   │
   ├─► Generate Invoice:
   │   ├─ Create PDF with order details
   │   ├─ Upload/store invoice URL
   │   └─ Update Order: invoiceGenerated = true
   │
   ├─► Send Confirmation Email
   │   └─ nodemailer.sendOrderConfirmationEmail({order})
   │
   └─► Send Response with updated Order
```

## 🎯 State Management Pattern

### Using React Context (StoreContext)

```javascript
// StoreContext provides:
{
  // Products & Search
  products: Array,
  filteredProducts: Array (computed),
  searchTerm: String,
  
  // Filters
  filters: {
    priceRange: [min, max],
    ratingFilter: Number,
    categoryFilter: String,
    brandFilter: String
  },
  
  // Cart
  cartItems: [{id, productData}],
  cartDetails: [{id, name, price, quantity, subtotal}],
  cartTotal: Number (computed),
  
  // Wishlist
  wishlistIds: [String],
  
  // Theme
  theme: 'light' | 'dark',
  
  // Methods
  addToCart(product),
  removeFromCart(productId),
  updateQuantity(productId, quantity),
  toggleWishlist(productId),
  resetFilters(),
  setTheme(theme)
}

// Persistence:
- localStorage: shop_cart_items, shop_wishlist_ids, shop_theme
- Hydrates on app load
```

## 🔐 Payment Data Security

```
Frontend                Backend              Payment Gateway
   │                      │                        │
   │ Card Details         │                        │
   │ ─────────────────────► (DO NOT STORE)        │
   │                      │ ─────────────────────► │
   │                      │                        │ Tokenize
   │                      │                        │ Encrypt
   │  PaymentIntent/      │◄─── Token ────────────│
   │  PaymentMethodId     │                        │
   │                      │ Update Order           │
   │  OrderId + Token     │ with Payment ID        │
   │◄─────────────────────│                        │
   │                      │                        │
   │ Payment Confirmation │                        │
   │ (Payment Gateway)    │                        │
   │ ────────────────────────────────────────────► │
   │                      │                        │
   │                      │ Webhook Notification  │
   │                      │◄──────────────────────│
   │                      │ (Optional)             │
   │                      │ Verify Signature       │
   │                      │ Update Order Status    │
```

## 📊 Tax & Pricing Calculation

```
Checkout Flow:

1. User adds items to cart
   subtotal = sum(price × quantity for each item)

2. User enters address & gets shipping
   Query: db.deliveryzones.findOne({pincodes: {$in: [pincode]}})
   If found:
     if (cartTotal ≥ zone.freeDeliveryAbove)
       shippingCharge = 0
     else
       shippingCharge = zone.chargeFlat + (weight × zone.chargePerUnit)
   Else:
     return "Delivery not available"

3. User applies coupon
   Query: db.coupons.findOne({code: couponCode})
   Validate:
     if (!coupon || !coupon.isActive)
       return error
     if (now > coupon.validUpto)
       return "Expired"
     if (cartTotal < coupon.minOrderValue)
       return "Minimum order not met"
     if (coupon.usageCount ≥ coupon.usageLimit)
       return "Usage limit reached"
   
   Calculate discount:
     if (coupon.discountType === 'fixed')
       discount = coupon.discountValue
     else if (coupon.discountType === 'percentage')
       discount = Math.min(
         (subtotal × coupon.discountValue / 100),
         coupon.maxDiscountAmount
       )

4. Calculate final totals
   taxableAmount = subtotal - discount
   tax = taxableAmount × 0.18 (18% GST)
   total = subtotal + tax + shippingCharge - discount

5. Create order
   Order Schema: {
     items: [...],
     shippingAddress: {...},
     pricing: {
       subtotal,
       discountAmount: discount,
       couponCode,
       shippingCharge,
       tax,
       total
     },
     paymentStatus: "pending"
   }
```

## 🎨 Component Props & State

### CheckoutPage Main Component

```javascript
// Props: None (uses useStore() hook)

// State:
{
  address: {
    fullName: String,
    email: String,
    phone: String,
    street: String,
    city: String,
    state: String,
    pincode: String,
    country: String
  },
  paymentMethod: 'razorpay' | 'stripe' | 'upi' | 'wallet',
  pricing: {
    subtotal: Number,
    tax: Number,
    shippingCharge: Number,
    discountAmount: Number,
    couponCode: String | null,
    isFreeDelivery: Boolean,
    total: Number
  },
  appliedCoupon: String | null,
  loading: Boolean,
  error: String
}

// Handlers:
handleAddressChange(newAddress)
  ├─ Updates: address state
  └─ Enables: checkout button

handleShippingChange(shippingData)
  ├─ Updates: pricing.shippingCharge, isFreeDelivery
  ├─ Recalculates: tax, total
  └─ Updates: OrderSummary display

handleCouponApply(code, discountAmount)
  ├─ Updates: appliedCoupon, pricing.discountAmount
  ├─ Recalculates: total
  └─ Disables: coupon input

handleCheckout()
  ├─ Validates: all required fields
  ├─ API Call: POST /api/checkout/initiate
  ├─ Response: {orderId, paymentData}
  ├─ Razorpay: Redirect to /checkout/razorpay?orderId=...
  └─ Stripe: Redirect to /checkout/stripe?orderId=...
```

---

**This architecture ensures:**
- ✅ Clean separation of concerns
- ✅ Reusable components
- ✅ Efficient data flow
- ✅ Secure payment handling
- ✅ Scalable backend services
