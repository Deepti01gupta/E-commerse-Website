# ✅ Seller Dashboard - Integration Checklist

## Pre-Integration Verification

Before using the Seller Dashboard, verify all components are in place:

### Backend Files Check
```
✅ middleware/rbac.js                         - RBAC middleware
✅ controllers/sellerOrdersController.js      - Business logic
✅ routes/seller.js                           - API routes
✅ models/Order.js                            - Updated with seller info
✅ models/Product.js                          - Updated with sellerId
✅ app.js                                     - Seller routes imported and mounted
```

### Frontend Files Check
```
✅ views/SellerDashboard.jsx                  - Main component
✅ views/SellerDashboard.css                  - Complete styling
✅ views/components/OrdersList.jsx            - Order table
✅ views/components/OrderDetail.jsx           - Order details
✅ views/components/StatusFilter.jsx          - Filtering
✅ views/components/DashboardStats.jsx        - Analytics
```

### Documentation Files Check
```
✅ SELLER_DASHBOARD_GUIDE.md                  - Comprehensive guide
✅ SELLER_DASHBOARD_SUMMARY.md                - Executive summary
✅ SELLER_API_REFERENCE.md                    - API reference
✅ SELLER_DASHBOARD_INTEGRATION_CHECKLIST.md  - This file
```

---

## Step-by-Step Integration

### Phase 1: Database Preparation

#### Step 1.1: Verify User Model
```javascript
// models/User.js - VERIFY it has:
const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  role: String,  // ✅ REQUIRED: admin, seller, customer
  cart: [ObjectId],
  // ... other fields
});
```

**Action**: ✅ Already exists - No changes needed

#### Step 1.2: Update Product Model
```javascript
// models/Product.js - ADD if not present:
const productSchema = new mongoose.Schema({
  // ... existing fields
  author: ObjectId,              // Keep existing
  sellerId: ObjectId,            // ✅ ADD THIS
  createdAt: { type: Date, default: Date.now }  // ✅ ADD THIS
});
```

**Status**: ✅ Already done - No action needed

#### Step 1.3: Update Order Model
```javascript
// models/Order.js - Modify items array:
items: [{
  productId: ObjectId,
  sellerId: ObjectId,           // ✅ ADD THIS
  name: String,
  price: Number,
  quantity: Number,
  image: String,
  subtotal: Number,
  sellerStatus: String,         // ✅ ADD THIS (pending, processing, shipped, delivered)
  sellerStatusHistory: [        // ✅ ADD THIS
    {
      status: String,
      timestamp: Date,
      note: String
    }
  ]
}]
```

**Status**: ✅ Already done - No action needed

#### Step 1.4: Create MongoDB Indexes

```bash
# Connect to MongoDB and run:
db.orders.createIndex({ 'items.sellerId': 1, createdAt: -1 })
db.orders.createIndex({ orderId: 1 })
db.products.createIndex({ sellerId: 1 })
```

**Action**: ⚡ RECOMMENDED for performance

---

### Phase 2: Backend Integration

#### Step 2.1: Copy Middleware File
```bash
# Create middleware/rbac.js
# Copy from: middleware/rbac.js
# Contains: authenticateToken, isSeller, isAdmin, isCustomer
```

**Status**: ✅ Already created

#### Step 2.2: Copy Controller File
```bash
# Create controllers/sellerOrdersController.js
# Copy from: controllers/sellerOrdersController.js
# Contains: 5 main functions for seller orders
```

**Status**: ✅ Already created

#### Step 2.3: Copy Routes File
```bash
# Create routes/seller.js
# Copy from: routes/seller.js
# Contains: 6 API endpoints
```

**Status**: ✅ Already created

#### Step 2.4: Update app.js

```javascript
// At the top, add:
const sellerRoutes = require('./routes/seller');

// In the routes section, add:
app.use('/api/seller', sellerRoutes);
```

**Status**: ✅ Already done

#### Step 2.5: Verify Dependencies

```bash
npm list express mongoose express-session passport cors uuid jsonwebtoken
```

**Required Packages**:
- ✅ express
- ✅ mongoose
- ✅ express-session
- ✅ passport
- ✅ jsonwebtoken
- ✅ uuid

**Install Missing**:
```bash
npm install uuid jsonwebtoken cors --save
```

**Status**: ✅ Check if all present

---

### Phase 3: Frontend Integration

#### Step 3.1: Create Components Folder
```bash
mkdir -p views/components
```

#### Step 3.2: Copy React Components
```bash
# Create views/SellerDashboard.jsx
# Create views/SellerDashboard.css
# Create views/components/OrdersList.jsx
# Create views/components/OrderDetail.jsx
# Create views/components/StatusFilter.jsx
# Create views/components/DashboardStats.jsx
```

**Status**: ✅ Already created

#### Step 3.3: Add to Your React App

**Option A: If you have a main React app (Next.js, Create React App)**

```javascript
// pages/seller-dashboard.js or src/pages/SellerDashboard.js
import SellerDashboard from '@/views/SellerDashboard';

export default function Page() {
  return <SellerDashboard />;
}
```

**Option B: If using EJS (non-React)**

Convert to a new route:
```javascript
// routes/seller-ui.js
router.get('/dashboard', (req, res) => {
  // Render Seller Dashboard EJS template
});
```

**Status**: ⏳ Depends on your current setup

#### Step 3.4: Update Navigation

Add link in your main navigation (navbar/menu):
```javascript
{
  href: '/seller/dashboard',
  label: '📦 Seller Dashboard',
  requiredRole: 'seller'
}
```

---

### Phase 4: Testing

#### Test 4.1: Backend API
```bash
# Start server
npm start

# Test endpoint (in another terminal)
curl -X GET http://localhost:8080/api/seller/orders \
  -H "Cookie: connect.sid=YOUR_SESSION_ID"

# Expected: JSON response with orders or empty array
```

#### Test 4.2: Database Records
```bash
# Verify seller-wise orders
db.orders.find({ 'items.sellerId': ObjectId('seller_id') })

# Should return orders with this seller's products
```

#### Test 4.3: Role-Based Access
```bash
# Test with customer account (should fail)
curl -X GET http://localhost:8080/api/seller/orders \
  -H "Cookie: connect.sid=CUSTOMER_SESSION_ID"

# Expected: 403 Forbidden with "Seller access required"
```

#### Test 4.4: Status Updates
```bash
# Try updating status
curl -X PATCH http://localhost:8080/api/seller/orders/{orderId}/items/0/status \
  -H "Cookie: connect.sid=YOUR_SESSION_ID" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "shipped",
    "note": "Test"
  }'

# Expected: 200 OK with updated status
```

---

### Phase 5: Configuration

#### Step 5.1: Environment Variables

Add to `.env`:
```env
# Seller Dashboard Settings
SELLER_DASHBOARD_ENABLED=true
SELLER_ROLE_NAME=seller
SELLER_API_BASE=/api/seller
```

#### Step 5.2: CORS Settings (if needed)

```javascript
// app.js
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

#### Step 5.3: Rate Limiting (Optional but Recommended)

```bash
npm install express-rate-limit
```

```javascript
// app.js
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});

app.use('/api/seller', limiter);
```

---

## Verification Checklist

### ✅ Backend Verification
- [ ] middleware/rbac.js exists and exports all functions
- [ ] controllers/sellerOrdersController.js exists with 5 functions
- [ ] routes/seller.js exists with all endpoints
- [ ] app.js imports and mounts seller routes
- [ ] npm start runs without errors
- [ ] MongoDB indexes created
- [ ] API endpoints respond to curl requests

### ✅ Frontend Verification
- [ ] SellerDashboard.jsx compiles without errors
- [ ] All sub-components import correctly
- [ ] CSS loads and renders properly
- [ ] Navigation links to dashboard work
- [ ] Dashboard loads without JavaScript errors
- [ ] All tabs and filters work

### ✅ Functional Verification
- [ ] Seller can login and access dashboard
- [ ] Customer cannot access seller dashboard
- [ ] Only seller's products shown in orders
- [ ] Status can be updated successfully
- [ ] Status history is tracked
- [ ] Statistics calculate correctly
- [ ] Filters work (status, date range)
- [ ] Pagination works

### ✅ Security Verification
- [ ] Authentication is required
- [ ] Seller role is verified
- [ ] Ownership is checked (can't access other seller's items)
- [ ] Status progression is validated
- [ ] Input validation works
- [ ] Error messages don't expose sensitive info

---

## Deployment Steps

### Production Checklist

#### Backend Deployment
```bash
# 1. Ensure all files are in place
ls middleware/rbac.js
ls controllers/sellerOrdersController.js
ls routes/seller.js

# 2. Update production dependencies
npm install --production

# 3. Create MongoDB indexes in production
# (Use MongoDB compass or mongosh)
db.orders.createIndex({ 'items.sellerId': 1, createdAt: -1 })

# 4. Set environment variables
export NODE_ENV=production
export SELLER_DASHBOARD_ENABLED=true

# 5. Start server
npm start
```

#### Frontend Deployment
```bash
# 1. Build React app (if applicable)
npm run build

# 2. Deploy to hosting
# (Vercel, Netlify, AWS, etc.)

# 3. Update API base URL for production
# In SellerDashboard.jsx:
const apiBaseUrl = 'https://api.yourdomain.com';
```

#### Database Migration
```bash
# 1. Backup existing data
mongodump --uri "mongodb://..." --out /backup

# 2. Update Order schema
# Add new fields to existing orders using migration

# 3. Add new fields to Product schema
```

---

## Troubleshooting

### Issue 1: "Cannot find module 'rbac'"
**Solution**: Ensure middleware/rbac.js exists and path is correct

```javascript
// Check in app.js
const { isSeller } = require('./middleware/rbac');
```

### Issue 2: "Seller access required" error
**Solution**: Verify user.role is set to 'seller'

```bash
db.users.findOne({ _id: ObjectId('user_id') })
# { role: 'seller' } should be present
```

### Issue 3: Orders not showing
**Solution 1**: Orders must have items with sellerId

```bash
db.orders.findOne({ 'items.sellerId': { $exists: true } })
```

**Solution 2**: Seller ID must match item sellerId

### Issue 4: CSS not loading in React
**Solution**: Verify import path is correct

```javascript
import './SellerDashboard.css';
// Not: import './SellerDashboard.css';
```

### Issue 5: API returns 404
**Solution**: Verify routes are mounted in app.js

```javascript
app.use('/api/seller', sellerRoutes);  // Must be present
```

### Issue 6: Filters not working
**Solution**: Verify query parameter names match controller

```javascript
// Valid: ?status=pending&page=1&limit=10
// Invalid: ?orderStatus=pending  // Wrong parameter name
```

---

## Performance Tuning

### Database Optimization
```bash
# View slow queries
db.setProfilingLevel(1, { slowms: 100 })
db.system.profile.find().sort({ ts: -1 }).limit(10)

# Add missing indexes
db.orders.createIndex({ 'items.sellerId': 1, createdAt: -1 })
```

### API Optimization
```javascript
// In controller, limit fields returned
const orders = await Order.find()
  .select('orderId userId items createdAt')
  .lean();  // Use lean() for better performance
```

### Frontend Optimization
```javascript
// Implement pagination to load data gradually
// Use React.memo() for components
// Lazy load components for future use
```

---

## Post-Deployment Monitoring

### Monitoring Checklist
- [ ] Server is running (pm2, systemd, or docker)
- [ ] Error logs are being collected
- [ ] API response times are normal (< 500ms)
- [ ] Database connections are pooled
- [ ] No memory leaks detected
- [ ] SSL/TLS certificates are valid
- [ ] Alerts are configured for failures

### Key Metrics to Monitor
```
GET /api/seller/orders        response time
PATCH /api/seller/orders/*/status   success rate
GET /api/seller/dashboard/stats      query time
database query latency
error rate < 1%
uptime > 99.9%
```

---

## Support Contacts

For issues or questions:
1. Check `SELLER_DASHBOARD_GUIDE.md` for detailed documentation
2. Check `SELLER_API_REFERENCE.md` for API details
3. Review server logs for error messages
4. Test with cURL before debugging frontend

---

## Rollback Plan

If you need to revert:

```bash
# 1. Remove seller routes from app.js
# Comment out: app.use('/api/seller', sellerRoutes);

# 2. Optionally, remove seller fields from orders
# Create a migration script if needed

# 3. Restart server
npm start

# 4. Database remains intact - no data loss
```

---

## Success Indicators

✅ **You're Done When:**
- Seller can login to dashboard
- All orders are visible
- Status can be updated
- Statistics display correctly
- Filters work properly
- Responsive design looks good on mobile
- No console errors
- All tests pass

---

## Next Steps

1. **Short-term**: Use the dashboard in production
2. **Medium-term**: Add email notifications
3. **Long-term**: Add advanced analytics

---

**Checklist Version**: 1.0  
**Last Updated**: April 15, 2026  
**Status**: ✅ Ready for Production

🎉 **Seller Dashboard is ready to use!**
