# 📚 Seller Dashboard - Quick API Reference

## Base URL
```
http://localhost:8080/api/seller
```

## Authentication
All endpoints require valid authentication:
- **Session-based**: Passport.js session (cookie)
- **JWT-based**: `Authorization: Bearer {token}` header

## Role Requirements
- ✅ Seller (role: 'seller')
- ✅ Admin (role: 'admin') - full access to all sellers

---

## Endpoints

### 1️⃣  GET `/api/seller/`
Get API documentation

**Response:**
```json
{
  "success": true,
  "message": "Seller Orders API",
  "endpoints": { /* endpoint list */ }
}
```

**Status**: 200 OK

---

### 2️⃣  GET `/api/seller/orders`
Fetch all orders for the seller (with filtering & pagination)

**Query Parameters:**
```
?status=pending              // pending|processing|shipped|delivered
&startDate=2024-01-01       // ISO date format
&endDate=2024-12-31         // ISO date format
&page=1                      // Page number (default: 1)
&limit=10                    // Items per page (default: 10)
```

**Example:**
```
GET /api/seller/orders?status=shipped&page=1&limit=20
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "orders": [
      {
        "_id": "507f1f77bcf86cd799439011",
        "orderId": "ORD-1234567890-abc",
        "buyer": {
          "_id": "507f1f77bcf86cd799439012",
          "username": "john_doe",
          "email": "john@example.com"
        },
        "items": [
          {
            "productId": "...",
            "name": "iPhone 14",
            "price": 50000,
            "quantity": 1,
            "sellerStatus": "shipped"
          }
        ],
        "pricing": {
          "subtotal": 50000,
          "tax": 9000,
          "shippingCharge": 0,
          "total": 59000
        },
        "createdAt": "2024-01-15T10:30:00Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "total": 150,
      "pages": 8,
      "limit": 20
    }
  }
}
```

**Status Codes:**
- `200` - Success
- `401` - Not authenticated
- `403` - Not a seller

---

### 3️⃣  GET `/api/seller/orders/:orderId`
Get detailed information about a specific order

**Parameters:**
```
:orderId    Order MongoDB ID (e.g., "507f1f77bcf86cd799439011")
```

**Example:**
```
GET /api/seller/orders/507f1f77bcf86cd799439011
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "orderId": "ORD-1234567890-abc",
    "buyer": {
      "username": "john_doe",
      "email": "john@example.com"
    },
    "items": [
      {
        "productId": "507f1f77bcf86cd799439013",
        "sellerId": "507f1f77bcf86cd799439010",
        "name": "iPhone 14 Pro",
        "price": 99999,
        "quantity": 1,
        "image": "https://...",
        "subtotal": 99999,
        "sellerStatus": "processing",
        "sellerStatusHistory": [
          {
            "status": "pending",
            "timestamp": "2024-01-15T10:30:00Z",
            "note": "Order received"
          },
          {
            "status": "processing",
            "timestamp": "2024-01-15T11:00:00Z",
            "note": "Preparing items"
          }
        ]
      }
    ],
    "shippingAddress": {
      "fullName": "John Doe",
      "street": "123 Main St",
      "city": "Mumbai",
      "state": "Maharashtra",
      "pincode": "400001",
      "phone": "9876543210"
    },
    "trackingNumber": "TRK-ABC123XYZ",
    "carrier": "FedEx",
    "statusHistory": [...],
    "pricing": {
      "subtotal": 99999,
      "tax": 17999,
      "shippingCharge": 0,
      "total": 117998
    }
  }
}
```

**Status Codes:**
- `200` - Success
- `401` - Not authenticated
- `403` - Unauthorized access
- `404` - Order not found

---

### 4️⃣  PATCH `/api/seller/orders/:orderId/items/:itemIndex/status`
Update the status of a seller's product in an order

**Parameters:**
```
:orderId     Order MongoDB ID
:itemIndex   Item index in order.items array (0, 1, 2, ...)
```

**Request Body:**
```json
{
  "status": "shipped",
  "note": "Shipped via FedEx, tracking #123456"
}
```

**Valid Status Transitions:**
```
pending → processing
processing → shipped
shipped → delivered
```

**Example:**
```
PATCH /api/seller/orders/507f1f77bcf86cd799439011/items/0/status
Content-Type: application/json

{
  "status": "shipped",
  "note": "Shipped with tracking"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Status updated to shipped",
  "data": {
    "orderId": "507f1f77bcf86cd799439011",
    "itemIndex": 0,
    "newStatus": "shipped",
    "statusHistory": [
      {
        "status": "pending",
        "timestamp": "2024-01-15T10:30:00Z",
        "note": "Order received"
      },
      {
        "status": "shipped",
        "timestamp": "2024-01-15T12:00:00Z",
        "note": "Shipped with tracking"
      }
    ]
  }
}
```

**Error Responses:**
```json
// Invalid status (400)
{
  "success": false,
  "message": "Invalid status. Must be one of: pending, processing, shipped, delivered"
}

// Invalid status progression (400)
{
  "success": false,
  "message": "Cannot move to a previous status"
}

// Not authorized (403)
{
  "success": false,
  "message": "Unauthorized: You can only update your own products"
}
```

**Status Codes:**
- `200` - Success
- `400` - Invalid request
- `401` - Not authenticated
- `403` - Unauthorized (not product owner)
- `404` - Order/Item not found

---

### 5️⃣  GET `/api/seller/dashboard/stats`
Get dashboard statistics for the seller

**Query Parameters (Optional):**
```
?startDate=2024-01-01    // Filter stats from this date
&endDate=2024-12-31      // Filter stats until this date
```

**Example:**
```
GET /api/seller/dashboard/stats?startDate=2024-01-01&endDate=2024-12-31
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "totalOrders": 150,
    "totalRevenue": 7500000,
    "statusBreakdown": [
      {
        "_id": "delivered",
        "count": 130
      },
      {
        "_id": "shipped",
        "count": 15
      },
      {
        "_id": "processing",
        "count": 4
      },
      {
        "_id": "pending",
        "count": 1
      }
    ],
    "topProducts": [
      {
        "_id": "507f1f77bcf86cd799439013",
        "productName": "iPhone 14 Pro",
        "totalSold": 45,
        "revenue": 4499955
      },
      {
        "_id": "507f1f77bcf86cd799439014",
        "productName": "iPhone 14",
        "totalSold": 32,
        "revenue": 1600000
      },
      {
        "_id": "507f1f77bcf86cd799439015",
        "productName": "AirPods Pro",
        "totalSold": 28,
        "revenue": 252000
      }
    ]
  }
}
```

**Status Codes:**
- `200` - Success
- `401` - Not authenticated
- `403` - Not a seller

---

### 6️⃣  GET `/api/seller/orders/status/:status`
Get all orders with a specific seller status

**Parameters:**
```
:status    Order status (pending|processing|shipped|delivered)
```

**Example:**
```
GET /api/seller/orders/status/pending
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "status": "pending",
    "count": 5,
    "orders": [
      {
        "_id": "507f1f77bcf86cd799439011",
        "orderId": "ORD-1234567890-abc",
        "buyer": { /* buyer info */ },
        "items": [ /* seller's items */ ],
        "createdAt": "2024-01-15T10:30:00Z"
      }
    ]
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Invalid status. Must be one of: pending, processing, shipped, delivered"
}
```

**Status Codes:**
- `200` - Success
- `400` - Invalid status
- `401` - Not authenticated
- `403` - Not a seller

---

## Common Response Formats

### Success Response
```json
{
  "success": true,
  "data": { /* response data */ }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error (if available)"
}
```

---

## HTTP Status Codes

| Code | Meaning | Action |
|------|---------|--------|
| 200 | OK | Request successful |
| 400 | Bad Request | Invalid parameters or data |
| 401 | Unauthorized | Not logged in |
| 403 | Forbidden | Not authorized for this resource |
| 404 | Not Found | Resource doesn't exist |
| 500 | Server Error | Internal server error |

---

## Example Usage

### Using cURL

```bash
# 1. Get all orders
curl -X GET "http://localhost:8080/api/seller/orders?page=1&limit=10" \
  -H "Cookie: connect.sid=your_session_id" \
  -H "Accept: application/json"

# 2. Get order details
curl -X GET "http://localhost:8080/api/seller/orders/507f1f77bcf86cd799439011" \
  -H "Cookie: connect.sid=your_session_id"

# 3. Update product status
curl -X PATCH "http://localhost:8080/api/seller/orders/507f1f77bcf86cd799439011/items/0/status" \
  -H "Cookie: connect.sid=your_session_id" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "shipped",
    "note": "Shipped with FedEx"
  }'

# 4. Get statistics
curl -X GET "http://localhost:8080/api/seller/dashboard/stats" \
  -H "Cookie: connect.sid=your_session_id"

# 5. Get pending orders
curl -X GET "http://localhost:8080/api/seller/orders/status/pending" \
  -H "Cookie: connect.sid=your_session_id"
```

### Using JavaScript/Fetch

```javascript
const token = localStorage.getItem('authToken');

// Get orders
fetch('http://localhost:8080/api/seller/orders?status=pending', {
  method: 'GET',
  credentials: 'include',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
})
.then(res => res.json())
.then(data => console.log(data));

// Update status
fetch('http://localhost:8080/api/seller/orders/id/items/0/status', {
  method: 'PATCH',
  credentials: 'include',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    status: 'shipped',
    note: 'Shipped'
  })
})
.then(res => res.json())
.then(data => console.log(data));
```

---

## Pagination

All list endpoints support pagination:

**Query Parameters:**
```
page=1    // Page number (starts at 1)
limit=10  // Items per page
```

**Response Includes:**
```json
{
  "pagination": {
    "currentPage": 1,
    "total": 150,
    "pages": 15,
    "limit": 10
  }
}
```

---

## Filtering

**By Status:**
```
GET /api/seller/orders?status=pending
GET /api/seller/orders?status=shipped
```

**By Date Range:**
```
GET /api/seller/orders?startDate=2024-01-01&endDate=2024-12-31
```

**Combined:**
```
GET /api/seller/orders?status=pending&startDate=2024-01-01&page=1&limit=20
```

---

## Error Troubleshooting

| Error | Cause | Solution |
|-------|-------|----------|
| `"Not authenticated"` | Not logged in | Login first |
| `"Seller access required"` | Not a seller | Change user role |
| `"Order not found"` | Invalid Order ID | Use correct Order ID |
| `"Unauthorized"` | Not product owner | Can only update own products |
| `"Invalid status"` | Wrong status value | Use: pending, processing, shipped, delivered |
| `"Cannot move to previous status"` | Backward status change | Status can only move forward |

---

## Rate Limiting (Optional)

To prevent abuse, implement rate limiting:

```javascript
// Max 100 requests per 15 minutes
GET /api/seller/orders - 10 requests/min
PATCH /api/seller/orders/*/status - 50 requests/min
```

---

## Testing Checklist

✅ GET /api/seller/ → Returns endpoint info  
✅ GET /api/seller/orders → Returns list of orders  
✅ GET /api/seller/orders/:id → Returns order details  
✅ PATCH /api/seller/orders/:id/items/:idx/status → Updates status  
✅ GET /api/seller/dashboard/stats → Returns statistics  
✅ GET /api/seller/orders/status/:status → Returns filtered orders  

---

**Last Updated**: April 15, 2026  
**Version**: 1.0  
**API Status**: ✅ Production Ready
