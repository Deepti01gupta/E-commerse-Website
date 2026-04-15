# Payment System Testing Guide

Complete step-by-step testing procedures for the e-commerce payment system.

## 🛠️ Prerequisites

Before testing, ensure:
1. MongoDB is running locally (mongodb://localhost:27017)
2. Payment backend started on port 5001
3. React frontend running on port 5173
4. Test data created in MongoDB

## 📦 Create Test Data in MongoDB

Open MongoDB shell and run:

```javascript
// 1. Create test coupons
db.coupons.deleteMany({});
db.coupons.insertMany([
  {
    code: "WELCOME20",
    discountType: "percentage",
    discountValue: 20,
    maxDiscountAmount: 5000,
    minOrderValue: 500,
    usageLimit: 100,
    usageCount: 0,
    validFrom: new Date(),
    validUpto: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    applicableCategories: [],
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    code: "FLAT100",
    discountType: "fixed",
    discountValue: 100,
    maxDiscountAmount: 100,
    minOrderValue: 1000,
    usageLimit: 50,
    usageCount: 0,
    validFrom: new Date(),
    validUpto: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    applicableCategories: [],
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    code: "EXPIRED99",
    discountType: "percentage",
    discountValue: 99,
    maxDiscountAmount: 5000,
    minOrderValue: 100,
    usageLimit: 10,
    usageCount: 0,
    validFrom: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
    validUpto: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Expired
    applicableCategories: [],
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
]);

// 2. Create test delivery zones
db.deliveryzones.deleteMany({});
db.deliveryzones.insertMany([
  {
    pincodes: ["110001", "110002", "110003", "110004", "110005"],
    city: "Delhi",
    state: "Delhi",
    chargePerUnit: 20,
    chargeFlat: 50,
    freeDeliveryAbove: 2500,
    processingDays: "2-3",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    pincodes: ["400001", "400002", "400003"],
    city: "Mumbai",
    state: "Maharashtra",
    chargePerUnit: 25,
    chargeFlat: 60,
    freeDeliveryAbove: 3000,
    processingDays: "3-4",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    pincodes: ["560001", "560002"],
    city: "Bangalore",
    state: "Karnataka",
    chargePerUnit: 15,
    chargeFlat: 40,
    freeDeliveryAbove: 2000,
    processingDays: "1-2",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
]);

// 3. Verify test data
db.coupons.find().pretty();
db.deliveryzones.find().pretty();
```

## ✅ Test Scenarios

### Test 1: Simple Checkout with Razorpay

**Objective:** Test basic checkout flow without coupon

**Steps:**
1. Open http://localhost:5173
2. Add 2-3 products to cart (total > ₹2,500 for free shipping)
3. Click Cart icon or go to /cart
4. Click "Checkout" button
5. Fill Address Form:
   ```
   Full Name: John Doe
   Email: john@example.com
   Phone: 9876543210
   Street: 123 Main Street
   City: Delhi
   State: Delhi
   Pincode: 110001
   Country: India
   ```
6. Verify shipping calculator:
   - Enter pincode: 110001
   - Click "Check"
   - Should show: Free delivery (because subtotal > ₹2,500)
7. Leave coupon empty
8. Select "Razorpay (UPI, Cards, Net Banking)"
9. Review Order Summary: Subtotal + Tax (18%) + Free Shipping
10. Click "Proceed to Payment"

**Expected Result:**
- ✓ Order created in MongoDB with "pending" status
- ✓ Redirects to Razorpay payment page
- ✓ Order ID and payment data returned

**API Call Logged:**
```
POST /api/checkout/initiate
Request:
{
  items: [{id, name, price, quantity, subtotal}],
  shippingAddress: {fullName, email, phone, street, city, state, pincode, country},
  paymentMethod: "razorpay",
  couponCode: null
}

Response:
{
  success: true,
  order: {orderId: "ORD_...", total: ...},
  paymentData: {razorpayOrderId: "order_...", razorpayKeyId: "rzp_test_..."}
}
```

---

### Test 2: Checkout with Coupon (Percentage Discount)

**Objective:** Test coupon application and discount calculation

**Steps:**
1. Add products with subtotal around ₹5,000
2. Go to checkout
3. Fill shipping address with pincode 110001
4. Check shipping (should be Free if > ₹2,500)
5. In Coupon section:
   - Enter code: `WELCOME20`
   - Click "Apply"
6. Verify discount applied:
   - Should show: "✓ Discount of ₹1000 applied!" (20% of ₹5,000)
   - Order Summary should update
   - New Total = 5000 + 900 (tax) - 1000 (discount) = 4,900
7. Click "Proceed to Payment"

**Expected Result:**
- ✓ Discount validation message shown
- ✓ Discount amount calculated correctly
- ✓ Order total updated
- ✓ Coupon code saved to order

**Coupon Validation Flow:**
```
POST /api/coupons/apply
Request: {code: "WELCOME20", cartTotal: 5000}

Response:
{
  success: true,
  discountAmount: 1000,
  coupon: {
    code: "WELCOME20",
    discountType: "percentage",
    discountValue: 20,
    maxDiscountAmount: 5000
  }
}
```

---

### Test 3: Invalid Coupon (Error Case)

**Objective:** Test coupon validation error handling

**Steps:**
1. Go to checkout
2. In Coupon section:
   - Enter code: `INVALID123`
   - Click "Apply"

**Expected Result:**
- ✓ Error message displayed: "✗ Coupon not found"
- ✓ Coupon field remains empty
- ✓ No discount applied
- ✓ Order total unchanged

**API Response:**
```json
{
  "success": false,
  "message": "Coupon not found"
}
```

---

### Test 4: Expired Coupon (Error Case)

**Objective:** Test expiry validation

**Steps:**
1. Go to checkout
2. In Coupon section:
   - Enter code: `EXPIRED99`
   - Click "Apply"

**Expected Result:**
- ✓ Error message: "✗ Coupon has expired"
- ✓ No discount applied

**Validation Error:**
```json
{
  "success": false,
  "message": "Coupon has expired"
}
```

---

### Test 5: Fixed Amount Coupon

**Objective:** Test fixed discount coupon

**Steps:**
1. Add products with subtotal ₹3,000+
2. Go to checkout
3. Fill address, select shipping
4. Apply coupon: `FLAT100`
5. Verify discount: ₹100 flat discount

**Expected Result:**
- ✓ Discount = ₹100
- ✓ New Total = 3000 + 540 (18% tax) - 100 = 3,440
- ✓ Coupon code shows correctly

---

### Test 6: Shipping Calculation - Free Delivery

**Objective:** Test free shipping threshold

**Steps:**
1. Add products with subtotal ₹3,000 (> ₹2,500 threshold)
2. Go to checkout
3. Fill address
4. In Shipping section:
   - Enter pincode: 110001
   - Click "Check"

**Expected Result:**
- ✓ Message shows: "Free delivery"
- ✓ Shipping charge = ₹0
- ✓ Order total includes ₹0 shipping

**API Response:**
```json
{
  "success": true,
  "shippingCharge": 0,
  "isFreeDelivery": true,
  "processingDays": "2-3"
}
```

---

### Test 7: Shipping Calculation - Paid Delivery

**Objective:** Test shipping charge when below threshold

**Steps:**
1. Add 1 product with price ₹1,500 (< ₹2,500 threshold)
2. Go to checkout
3. Fill address
4. In Shipping section:
   - Enter pincode: 110001
   - Click "Check"

**Expected Result:**
- ✓ Calculate shipping: 50 (flat) + (weight × 20)
- ✓ For default weight 1kg: 50 + 20 = ₹70
- ✓ Total = 1500 + 270 (18% tax) + 70 = 1,840

---

### Test 8: Shipping Not Available (Error Case)

**Objective:** Test unavailable pincode

**Steps:**
1. Go to checkout
2. Fill address
3. In Shipping section:
   - Enter pincode: 999999 (non-existent)
   - Click "Check"

**Expected Result:**
- ✓ Error message: "✗ Delivery not available for this pincode"
- ✓ Shipping not calculated
- ✓ Cannot proceed to payment

**Error Response:**
```json
{
  "success": false,
  "message": "Delivery not available for this pincode"
}
```

---

### Test 9: Address Form Validation

**Objective:** Test required field validation

**Steps:**
1. Go to checkout
2. Leave address fields empty
3. Click "Proceed to Payment"

**Expected Result:**
- ✓ Error message: "Please fill in all address fields"
- ✓ Cannot proceed to payment
- ✓ Form validation visual feedback

---

### Test 10: Payment Method Selection - Stripe

**Objective:** Test Stripe payment method

**Steps:**
1. Add products to cart
2. Go to checkout
3. Fill all required fields
4. Select "Stripe (International Cards)"
5. Click "Proceed to Payment"

**Expected Result:**
- ✓ Order created with paymentMethod = "stripe"
- ✓ Stripe PaymentIntent created
- ✓ Frontend receives clientSecret
- ✓ Can redirect to Stripe payment form

---

### Test 11: Order Summary Display

**Objective:** Verify pricing breakdown

**Steps:**
1. Add products with known prices
   - Product 1: ₹500 × 2 = ₹1,000
   - Product 2: ₹1,500 × 1 = ₹1,500
   - Subtotal: ₹2,500
2. Go to checkout
3. Apply coupon: FLAT100 (₹100 discount)
4. Enter shipping pincode: 110001
5. Verify Order Summary shows:
   ```
   Product 1 x2     ₹1,000
   Product 2 x1     ₹1,500
   ───────────────────────
   Subtotal         ₹2,500
   Tax (18% GST)    ₹450
   Shipping         Free
   Discount (FLAT100) -₹100
   ───────────────────────
   Total            ₹2,850
   ```

**Expected Result:**
- ✓ All calculations correct
- ✓ Tax = Subtotal × 0.18
- ✓ Final total = Subtotal + Tax + Shipping - Discount
- ✓ Discount label shows coupon code

---

### Test 12: Multiple Products in Order Summary

**Objective:** Test order summary with various products

**Steps:**
1. Add 5 different products with different quantities
2. Go to checkout
3. Verify Order Summary shows all items with:
   - Product name
   - Quantity
   - Subtotal (price × qty)

**Expected Result:**
- ✓ All items displayed
- ✓ No items missing
- ✓ Line totals calculated correctly

---

### Test 13: Loading States

**Objective:** Verify UX feedback during API calls

**Steps:**
1. Go to checkout
2. Click shipping "Check" button → Should show "..."
3. Click coupon "Apply" button → Should show "..."
4. Click "Proceed to Payment" → Should show "Processing..."

**Expected Result:**
- ✓ Buttons show loading state
- ✓ Buttons disabled during API call
- ✓ Clear visual feedback to user

---

### Test 14: Success Page Navigation

**Objective:** Test successful payment flow

**Steps:**
1. Complete checkout with Razorpay
2. Use Razorpay test card (4111111111111111)
3. Complete payment in Razorpay modal
4. Verify signatures and update order status

**Expected Result:**
- ✓ Backend verifies Razorpay signature
- ✓ Order status changes to "completed"
- ✓ Redirects to `/checkout/success`
- ✓ Shows success message
- ✓ Links to view orders or continue shopping

---

### Test 15: Failure Page Navigation

**Objective:** Test failed payment handling

**Steps:**
1. Complete checkout
2. In Razorpay/Stripe payment, close without completing
3. Or use invalid card

**Expected Result:**
- ✓ Redirects to `/checkout/failure`
- ✓ Shows failure message
- ✓ Options to go back to cart or home

---

## 🔍 API Testing with cURL/Postman

### Test Coupon Validation

```bash
curl -X POST http://localhost:5001/api/coupons/apply \
  -H "Content-Type: application/json" \
  -d '{
    "code": "WELCOME20",
    "cartTotal": 5000
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "discountAmount": 1000,
  "coupon": {
    "code": "WELCOME20",
    "discountType": "percentage",
    "discountValue": 20,
    "maxDiscountAmount": 5000
  }
}
```

### Test Shipping Calculation

```bash
curl -X POST http://localhost:5001/api/delivery/calculate \
  -H "Content-Type: application/json" \
  -d '{
    "pincode": "110001",
    "cartTotal": 5000
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "shippingCharge": 0,
  "isFreeDelivery": true,
  "processingDays": "2-3"
}
```

### Test Checkout Initiation

```bash
curl -X POST http://localhost:5001/api/checkout/initiate \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {
        "id": "prod_1",
        "name": "Product 1",
        "price": 500,
        "quantity": 2,
        "subtotal": 1000
      }
    ],
    "shippingAddress": {
      "fullName": "John Doe",
      "email": "john@example.com",
      "phone": "9876543210",
      "street": "123 Main St",
      "city": "Delhi",
      "state": "Delhi",
      "pincode": "110001",
      "country": "India"
    },
    "paymentMethod": "razorpay",
    "couponCode": "WELCOME20"
  }'
```

---

## 📊 MongoDB Query Examples

### View all coupons
```javascript
db.coupons.find({}).pretty();
```

### View specific coupon
```javascript
db.coupons.findOne({code: "WELCOME20"});
```

### View all orders
```javascript
db.orders.find({}).pretty();
```

### View pending orders
```javascript
db.orders.find({paymentStatus: "pending"}).pretty();
```

### View completed orders
```javascript
db.orders.find({paymentStatus: "completed"}).pretty();
```

### View order by order ID
```javascript
db.orders.findOne({orderId: "ORD_1234567890"});
```

### Check coupon usage
```javascript
db.coupons.findOne({code: "WELCOME20"}, {usageCount: 1});
```

### Update coupon to active
```javascript
db.coupons.updateOne({code: "WELCOME20"}, {$set: {isActive: true}});
```

### Delete all test orders
```javascript
db.orders.deleteMany({});
```

---

## 🐛 Debugging Tips

### Enable Detailed Logging

Add to payment-system/src/app.js:
```javascript
// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
  console.log('Body:', req.body);
  next();
});
```

### Check Network Tab in Browser DevTools

1. Open Dev Tools (F12)
2. Go to Network tab
3. Perform checkout action
4. Click on API requests to see:
   - Request headers
   - Request body
   - Response status
   - Response body

### Monitor MongoDB

```bash
# Watch all operations
db.setProfilingLevel(1)

# View logs
db.system.profile.find().limit(5).sort({ts: -1}).pretty()
```

### Test Razorpay Webhook

Razorpay test webhook should be added after completing payment. Check:
- Payment intent verified
- Order status updated
- Order stored in MongoDB

### Common Test Issues

| Issue | Solution |
|-------|----------|
| "Delivery not available" | Check pincode in deliveryzones collection |
| "Coupon not found" | Verify coupon code exactly matches |
| "Coupon expired" | Check validUpto date is in future |
| Total calculation wrong | Verify tax = subtotal × 0.18 |
| CORS error | Check payment-system CORS config |
| Payment not pending | Check order was created before payment |

---

## ✨ Success Criteria Checklist

After testing all scenarios above, verify:

- [ ] All coupons validate correctly
- [ ] Shipping calculation works for all zones
- [ ] Discounts apply and calculate correctly
- [ ] Order totals are accurate
- [ ] Razorpay payment flow completes
- [ ] Stripe payment flow completes
- [ ] Success page displays after payment
- [ ] Failure page displays on payment error
- [ ] Orders saved in MongoDB with correct status
- [ ] Error messages display for invalid inputs
- [ ] Loading states show during API calls
- [ ] Mobile responsive design works
- [ ] Dark mode works for all components
- [ ] Cart items persist through checkout
- [ ] Order Summary updates dynamically

---

**Last Updated:** 2024
**Version:** 1.0
