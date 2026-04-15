# 🏪 Seller Dashboard Implementation Guide

## Overview
This document provides complete implementation details for the Seller Dashboard feature in your e-commerce application. The Seller Dashboard enables sellers to view and manage orders for their products with role-based access control.

---

## 📋 Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Database Schema Changes](#database-schema-changes)
3. [Backend Implementation](#backend-implementation)
4. [Frontend Implementation](#frontend-implementation)
5. [API Endpoints](#api-endpoints)
6. [Installation & Setup](#installation--setup)
7. [Usage Guide](#usage-guide)
8. [Security Considerations](#security-considerations)

---

## Architecture Overview

### MVC Architecture
The implementation follows the **Model-View-Controller** pattern:

```
Models (Database Layer)
├── User (with role field: admin, seller, customer)
├── Product (with sellerId reference)
├── Order (with seller-wise item tracking)
└── TrackingUpdate

Controllers (Business Logic)
├── sellerOrdersController
│   ├── getSellerOrders()
│   ├── getSellerOrderDetail()
│   ├── updateSellerItemStatus()
│   ├── getSellerDashboardStats()
│   └── getOrdersByStatus()

Routes (API Endpoints)
├── /api/seller/orders (GET, POST)
├── /api/seller/orders/:orderId (GET)
├── /api/seller/orders/:orderId/items/:itemIndex/status (PATCH)
├── /api/seller/dashboard/stats (GET)
└── /api/seller/orders/status/:status (GET)

Middleware (Security Layer)
├── authenticateToken() - JWT verification
├── isSeller() - Seller role check
├── isAdmin() - Admin role check
└── isCustomer() - Customer role check

Frontend (React Components)
├── SellerDashboard.jsx (Main container)
├── OrdersList.jsx (Table view)
├── OrderDetail.jsx (Detailed view)
├── StatusFilter.jsx (Filtering controls)
└── DashboardStats.jsx (Analytics)
```

---

## Database Schema Changes

### 1. User Model Enhancement

**Current Status**: Already has `role` field

```javascript
{
  username: String,
  email: String,
  role: String,  // Values: 'admin', 'seller', 'customer'
  cart: [ObjectId],
  // other fields...
}
```

### 2. Product Model Enhancement

**Updated** with explicit `sellerId` field:

```javascript
{
  name: String,
  price: Number,
  desc: String,
  img: String,
  author: ObjectId (ref: User),     // Legacy field
  sellerId: ObjectId (ref: User),   // New explicit seller reference
  reviews: [ObjectId],
  createdAt: Date
}
```

### 3. Order Model Enhancement

**Updated** with seller-wise item tracking:

```javascript
{
  orderId: String (unique),
  userId: ObjectId (ref: User),
  items: [
    {
      productId: ObjectId,
      sellerId: ObjectId (ref: User),  // NEW: Seller of this product
      name: String,
      price: Number,
      quantity: Number,
      image: String,
      subtotal: Number,
      sellerStatus: String,             // NEW: Seller-specific status
      sellerStatusHistory: [
        {
          status: String,
          timestamp: Date,
          note: String
        }
      ]
    }
  ],
  // ... other existing fields
}
```

**Seller Status Values**:
- `pending` - Order received, awaiting seller action
- `processing` - Seller is preparing the order
- `shipped` - Seller has shipped the order
- `delivered` - Order delivered to customer

---

## Backend Implementation

### 1. File Structure

```
middleware/
├── rbac.js                    # Role-based access control middleware

controllers/
├── sellerOrdersController.js  # Seller order business logic

routes/
├── seller.js                  # Seller routes
```

### 2. Middleware: rbac.js

**Location**: `middleware/rbac.js`

**Exports**:
```javascript
authenticateToken()    // Verify JWT or session
isSeller()            // Check if user is seller or admin
isAdmin()             // Check if user is admin
isCustomer()          // Check if user is customer
```

**Usage**:
```javascript
router.get('/orders', isSeller, sellerOrdersController.getSellerOrders);
```

### 3. Controller: sellerOrdersController.js

**Location**: `controllers/sellerOrdersController.js`

**Methods**:

#### getSellerOrders(req, res)
Gets all orders containing seller's products with filtering

**Query Parameters**:
- `status`: Filter by seller item status (pending, processing, shipped, delivered)
- `startDate`: Filter orders from this date
- `endDate`: Filter orders until this date
- `page`: Pagination page (default: 1)
- `limit`: Items per page (default: 10)

**MongoDB Aggregation Pipeline**:
1. Match orders containing seller's products
2. Filter items to only seller's products
3. Populate buyer information
4. Sort by creation date
5. Apply pagination

**Response**:
```json
{
  "success": true,
  "data": {
    "orders": [...],
    "pagination": {
      "currentPage": 1,
      "total": 50,
      "pages": 5,
      "limit": 10
    }
  }
}
```

#### getSellerOrderDetail(req, res)
Get detailed information about a specific order

**Parameters**:
- `orderId`: Order ID

**Response**:
```json
{
  "success": true,
  "data": { /* full order object */ }
}
```

#### updateSellerItemStatus(req, res)
Update seller status for a product in an order

**Parameters**:
- `orderId`: Order ID
- `itemIndex`: Index of item in order.items array

**Request Body**:
```json
{
  "status": "shipped",
  "note": "Item shipped via FedEx"
}
```

**Status Progression Validation**:
- pending → processing (✓)
- processing → shipped (✓)
- shipped → delivered (✓)
- processing → pending (✗ - cannot go backwards)

#### getSellerDashboardStats(req, res)
Get dashboard statistics using MongoDB facet aggregation

**Returns**:
```json
{
  "success": true,
  "data": {
    "totalOrders": 150,
    "totalRevenue": 450000,
    "statusBreakdown": [
      { "_id": "delivered", "count": 100 },
      { "_id": "shipped", "count": 30 },
      { "_id": "processing", "count": 15 },
      { "_id": "pending", "count": 5 }
    ],
    "topProducts": [
      {
        "productName": "iPhone 14",
        "totalSold": 45,
        "revenue": 225000
      }
    ]
  }
}
```

#### getOrdersByStatus(req, res)
Get all orders with a specific status

**Parameters**:
- `status`: One of (pending, processing, shipped, delivered)

---

## Frontend Implementation

### 1. React Component Structure

```
SellerDashboard.jsx (Main Container)
├── State Management (orders, stats, filters, loading)
├── API Calls (fetch orders, stats, update status)
├── Tabs (Orders & Statistics)
│
├─ Orders Tab
│  ├── StatusFilter.jsx (Filtering controls)
│  └── Conditional Render:
│      ├── OrdersList.jsx (Table view)
│      └── OrderDetail.jsx (Detailed view)
│
└─ Stats Tab
   └── DashboardStats.jsx (Analytics & charts)
```

### 2. Component Details

#### SellerDashboard.jsx (Main)

**Features**:
- Tab-based interface (Orders & Statistics)
- Error handling and loading states
- Filter management
- API communication

**Key Methods**:
```javascript
fetchOrders()              // Get seller's orders
fetchStats()               // Get dashboard statistics
fetchOrderDetail()         // Get single order details
updateProductStatus()      // Update product status
handleFilterChange()       // Apply filters
```

#### OrdersList.jsx

**Features**:
- Table view of orders
- Expandable rows for detailed product info
- Quick status update dropdown
- Empty state handling

**Displays**:
- Order ID, Date, Product count, Buyer name
- Status badges, Total amount
- Expandable shipping address and product details

#### OrderDetail.jsx

**Features**:
- Comprehensive order information display
- Order timeline with status history
- Buyer and shipping details
- Product-wise status management
- Status history tracking

#### StatusFilter.jsx

**Features**:
- Status dropdown (All, Pending, Processing, Shipped, Delivered)
- Date range picker
- Reset filters button

#### DashboardStats.jsx

**Features**:
- Key metrics cards (Total Orders, Revenue, Avg Order Value)
- Status breakdown with progress bars
- Top 5 products table
- Empty state for no data

### 3. CSS Styling

**Location**: `views/SellerDashboard.css`

**Features**:
- Responsive grid layout
- Color-coded status badges
- Smooth animations and transitions
- Mobile-friendly (480px, 768px breakpoints)
- Dark theme elements with light accents

---

## API Endpoints

### Base URL
```
http://localhost:8080/api/seller
```

### 1. GET /api/seller/
Info endpoint

**Response**:
```json
{
  "success": true,
  "message": "Seller Orders API",
  "endpoints": { /* ... */ }
}
```

### 2. GET /api/seller/orders
Get all seller orders

**Query Params**:
- `status`: pending|processing|shipped|delivered
- `startDate`: YYYY-MM-DD
- `endDate`: YYYY-MM-DD
- `page`: 1-n
- `limit`: 1-100

**Example**:
```
GET /api/seller/orders?status=pending&page=1&limit=10
```

### 3. GET /api/seller/orders/:orderId
Get order details

**Example**:
```
GET /api/seller/orders/ORD-1234567890-abc123
```

### 4. PATCH /api/seller/orders/:orderId/items/:itemIndex/status
Update product status

**Body**:
```json
{
  "status": "shipped",
  "note": "Shipped via courier"
}
```

**Example**:
```
PATCH /api/seller/orders/ORD-1234567890-abc123/items/0/status
```

### 5. GET /api/seller/dashboard/stats
Get dashboard statistics

**Query Params**:
- `startDate`: YYYY-MM-DD (optional)
- `endDate`: YYYY-MM-DD (optional)

### 6. GET /api/seller/orders/status/:status
Get orders by specific status

**Status Values**: pending, processing, shipped, delivered

---

## Installation & Setup

### 1. Backend Setup

**Step 1**: Verify models are updated

```bash
# Models should already be updated:
# - User: has role field
# - Product: has sellerId field
# - Order: has seller info in items
```

**Step 2**: Ensure middleware is created

```bash
mkdir -p middleware
# middleware/rbac.js should be created
```

**Step 3**: Ensure controller is created

```bash
mkdir -p controllers
# controllers/sellerOrdersController.js should be created
```

**Step 4**: Ensure routes are created

```bash
# routes/seller.js should be created
```

**Step 5**: Update app.js

```javascript
const sellerRoutes = require('./routes/seller');

// Mount routes
app.use('/api/seller', sellerRoutes);
```

**Step 6**: Verify dependencies

```bash
npm list express mongoose jwt
# All should be installed
```

### 2. Frontend Setup

**Step 1**: Create components folder

```bash
mkdir -p views/components
```

**Step 2**: Create React components

```bash
# views/SellerDashboard.jsx
# views/components/OrdersList.jsx
# views/components/OrderDetail.jsx
# views/components/StatusFilter.jsx
# views/components/DashboardStats.jsx
# views/SellerDashboard.css
```

**Step 3**: Import in your React app

```javascript
import SellerDashboard from './views/SellerDashboard';

function App() {
  return (
    <div>
      <SellerDashboard />
    </div>
  );
}
```

---

## Usage Guide

### For Sellers

**Step 1: Login**
- Use your seller credentials to login
- System checks `user.role === 'seller'`

**Step 2: Access Seller Dashboard**
- Navigate to `/seller/dashboard` or `/api/seller`
- Dashboard loads with "Orders" tab selected

**Step 3: View Orders**
- All orders containing your products are displayed
- Only YOUR products are shown (not other sellers' items in same order)

**Step 4: Filter Orders**
- Filter by status (Pending, Processing, Shipped, Delivered)
- Filter by date range
- Click "Reset Filters" to clear

**Step 5: Update Product Status**
- Click "View" to see order details
- Or expand row to see products
- Click status dropdown to update
- Optionally add a note
- Status updates automatically in order history

**Step 6: View Statistics**
- Click "Statistics" tab
- View total orders and revenue
- See order breakdown by status
- Check top 5 selling products

### Testing with cURL

```bash
# 1. Get all orders for seller
curl -X GET http://localhost:8080/api/seller/orders \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Cookie: connect.sid=YOUR_SESSION_ID"

# 2. Get specific order detail
curl -X GET http://localhost:8080/api/seller/orders/ORD-123 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# 3. Update product status
curl -X PATCH http://localhost:8080/api/seller/orders/ORD-123/items/0/status \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "shipped",
    "note": "Shipped via FedEx"
  }'

# 4. Get dashboard stats
curl -X GET http://localhost:8080/api/seller/dashboard/stats \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## Security Considerations

### 1. Authentication

**Method**: JWT + Session-based (Passport.js)

```javascript
// Middleware checks both
if (!req.user) {
  return res.status(401).json({ message: 'Not authenticated' });
}
```

### 2. Authorization

**Seller-Only Routes**:
```javascript
router.get('/orders', isSeller, controller.method);
```

**Ownership Verification**:
```javascript
if (item.sellerId.toString() !== req.user._id.toString()) {
  return res.status(403).json({ message: 'Unauthorized' });
}
```

### 3. Data Isolation

**Query Filtering**:
```javascript
// Only returns orders with seller's products
db.find({ 'items.sellerId': session.userId })
```

### 4. Status Progression Validation

**Prevents**:
- Backward status updates
- Invalid status values
- Unauthorized status changes

### 5. Input Validation

**Query Parameters**:
```javascript
// Validates date formats
// Validates status enum values
// Validates pagination limits
```

### 6. Rate Limiting (Optional)

**Recommendation**: Add rate limiting to prevent abuse

```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // 100 requests per window
});

router.use(limiter);
```

---

## MongoDB Aggregation Queries Used

### 1. Filter Orders by Seller

```javascript
db.orders.aggregate([
  {
    $match: {
      'items.sellerId': ObjectId(sellerId)
    }
  },
  {
    $addFields: {
      items: {
        $filter: {
          input: '$items',
          as: 'item',
          cond: {
            $eq: ['$$item.sellerId', ObjectId(sellerId)]
          }
        }
      }
    }
  }
])
```

### 2. Get Dashboard Statistics

```javascript
db.orders.aggregate([
  { $match: { 'items.sellerId': ObjectId(sellerId) } },
  {
    $facet: {
      totalOrders: [{ $count: 'count' }],
      totalRevenue: [
        {
          $group: {
            _id: null,
            revenue: { $sum: { $sum: '$items.subtotal' } }
          }
        }
      ],
      statusBreakdown: [
        { $unwind: '$items' },
        {
          $group: {
            _id: '$items.sellerStatus',
            count: { $sum: 1 }
          }
        }
      ]
    }
  }
])
```

---

## Error Handling

### Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| 401 Unauthorized | Not logged in | Login first |
| 403 Forbidden | Not a seller | Change user role |
| 404 Not Found | Order doesn't exist | Check Order ID |
| 400 Bad Request | Invalid status | Use valid status values |

### Response Format

**Success**:
```json
{
  "success": true,
  "data": { /* ... */ }
}
```

**Error**:
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error info"
}
```

---

## Performance Optimization

### 1. MongoDB Indexes

**Recommended Indexes**:
```javascript
// Order model
db.orders.createIndex({ 'items.sellerId': 1, createdAt: -1 })
db.orders.createIndex({ orderId: 1 })
db.orders.createIndex({ userId: 1, createdAt: -1 })

// Product model
db.products.createIndex({ sellerId: 1 })
```

### 2. Query Optimization

- Use aggregation pipeline for complex queries
- Limit returned fields with projection
- Apply filters early in pipeline
- Implement pagination

### 3. Caching (Future Enhancement)

```javascript
// Cache seller stats for 1 hour
cache.set(`seller-stats-${sellerId}`, stats, 3600);
```

---

## Testing Scenarios

### Scenario 1: Multi-Seller Order

**Setup**:
- Order contains products from 2 sellers

**Test**:
- Seller A sees only their products
- Seller B sees only their products
- Status update for Seller A doesn't affect Seller B

### Scenario 2: Status Progression

**Test**:
- Update from pending → processing (✓)
- Update from processing → shipped (✓)
- Update from shipped → delivered (✓)
- Try to update from shipped → pending (✗)

### Scenario 3: Filtering

**Test**:
- Filter by status → correct results
- Filter by date range → correct results
- Combine multiple filters → correct results
- Reset filters → all results shown

---

## Future Enhancements

1. **Email Notifications**: Notify customers when status changes
2. **Bulk Actions**: Update multiple orders at once
3. **Shipping Integration**: Auto-update status from carrier
4. **Commission Tracking**: Calculate seller earnings
5. **Return Management**: Sellers can approve/reject returns
6. **Dispute Resolution**: Handle customer disputes
7. **Performance Analytics**: Advanced charts and trends
8. **API Keys**: For third-party integrations

---

## Support

For issues or questions:
1. Check error messages in browser console
2. Check server logs in terminal
3. Verify middleware is applied correctly
4. Ensure models are updated with seller fields
5. Test API endpoints with cURL first

---

**Last Updated**: April 15, 2026
**Version**: 1.0
**Status**: ✅ Complete and Production-Ready
