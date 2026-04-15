# Order & Delivery Management System - API Documentation

## Overview
Complete RESTful API for managing orders, returns, refunds, and real-time delivery tracking. Built with Node.js, Express, MongoDB, and Socket.io.

## Base URL
```
http://localhost:5000/api/v1
```

## Authentication
All endpoints (except `/health`) require JWT Bearer token in Authorization header:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Response Format
All responses follow a consistent format:
```json
{
  "success": true/false,
  "message": "Response message",
  "data": {},
  "errors": []
}
```

---

## 📦 ORDER ENDPOINTS

### Create Order
**POST** `/orders`

Creates a new order and sets initial status to "placed".

**Request Body:**
```json
{
  "items": [
    {
      "productId": "product123",
      "quantity": 2,
      "price": 99.99,
      "title": "Product Name"
    }
  ],
  "shippingAddress": {
    "name": "John Doe",
    "phone": "+1234567890",
    "address": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "country": "USA",
    "latitude": 40.7128,
    "longitude": -74.0060
  },
  "paymentDetails": {
    "method": "credit_card",
    "amount": 199.98,
    "currency": "INR"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Order created successfully",
  "data": {
    "_id": "...",
    "orderId": "ORD_1234567890_abc123",
    "userId": "...",
    "status": "placed",
    "statusHistory": [
      {
        "status": "placed",
        "timestamp": "2024-01-15T10:30:00Z",
        "message": "Order placed successfully"
      }
    ],
    "pricing": {
      "subtotal": 199.98,
      "tax": 0,
      "shipping": 0,
      "total": 199.98
    },
    "createdAt": "2024-01-15T10:30:00Z",
    "returnDeadline": "2024-01-22T10:30:00Z"
  }
}
```

---

### Get Order History
**GET** `/orders?status=placed&startDate=2024-01-01&endDate=2024-01-31`

Retrieves user's order history with optional filters.

**Query Parameters:**
- `status` (optional) - Filter by status (placed, confirmed, shipped, out_for_delivery, delivered, cancelled)
- `startDate` (optional) - Start date for filtering (ISO format)
- `endDate` (optional) - End date for filtering (ISO format)

**Response:**
```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "orderId": "ORD_1234567890_abc123",
      "status": "delivered",
      "pricing": { "total": 199.98 },
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

---

### Get Order Details
**GET** `/orders/:orderId`

Retrieves complete order information including status history and current location.

**Response:**
```json
{
  "success": true,
  "data": {
    "orderId": "ORD_1234567890_abc123",
    "userId": "...",
    "status": "out_for_delivery",
    "items": [...],
    "shippingAddress": {...},
    "currentLocation": {
      "latitude": 40.7128,
      "longitude": -74.0060,
      "address": "Out for Delivery",
      "city": "New York",
      "state": "NY",
      "updatedAt": "2024-01-15T14:00:00Z"
    },
    "statusHistory": [...],
    "estimatedDeliveryDate": "2024-01-15T18:00:00Z",
    "actualDeliveryDate": null,
    "returnDeadline": "2024-01-22T10:30:00Z",
    "trackingNumber": "TRACK123456"
  }
}
```

---

### Get Order Tracking
**GET** `/orders/:orderId/track`

Gets comprehensive tracking information including timeline, current location, and statistics.

**Response:**
```json
{
  "success": true,
  "data": {
    "orderId": "ORD_1234567890_abc123",
    "status": "out_for_delivery",
    "tracking": [
      {
        "event": "pickup",
        "message": "Package picked up",
        "location": {...},
        "timestamp": "2024-01-15T08:00:00Z"
      },
      {
        "event": "in_transit",
        "message": "Package in transit",
        "location": {...},
        "timestamp": "2024-01-15T10:30:00Z"
      }
    ],
    "latestLocation": {
      "location": {...},
      "event": "out_for_delivery",
      "timestamp": "2024-01-15T14:00:00Z"
    },
    "stats": {
      "totalUpdates": 5,
      "eventCounts": {
        "pickup": 1,
        "in_transit": 2,
        "out_for_delivery": 1
      }
    }
  }
}
```

---

### Update Order Status (Admin)
**PATCH** `/orders/:orderId/status`

Updates order status with validation and status history recording.

**Request Body:**
```json
{
  "newStatus": "shipped",
  "message": "Order shipped from warehouse",
  "location": {
    "latitude": 40.7128,
    "longitude": -74.0060,
    "address": "Warehouse, NYC",
    "city": "New York",
    "state": "NY"
  }
}
```

**Valid Status Transitions:**
```
placed → confirmed, cancelled
confirmed → shipped, cancelled
shipped → out_for_delivery
out_for_delivery → delivered
delivered → returned
```

---

### Cancel Order
**POST** `/orders/:orderId/cancel`

Cancels an order. Only possible if order is in "placed" or "confirmed" status.

**Response:**
```json
{
  "success": true,
  "message": "Order cancelled successfully",
  "data": { ... }
}
```

---

## 📋 RETURN ENDPOINTS

### Create Return Request
**POST** `/returns`

Creates a return request for a delivered order within 7-day window.

**Request Body:**
```json
{
  "orderId": "507f1f77bcf86cd799439011",
  "reason": "defective_product",
  "items": [
    {
      "productId": "product123",
      "quantity": 1
    }
  ],
  "comments": "Item arrived damaged"
}
```

**Return Reasons:**
- `defective_product` - Product is defective
- `not_as_described` - Not matching description
- `damaged_in_shipping` - Damaged during shipping
- `wrong_item_received` - Wrong item received
- `changed_mind` - Changed mind about purchase
- `other` - Other reason

**Response:**
```json
{
  "success": true,
  "message": "Return request created successfully",
  "data": {
    "returnId": "RET_1234567890_abc123",
    "orderId": "507f1f77bcf86cd799439011",
    "status": "initiated",
    "reason": "defective_product",
    "returnAmount": 199.98,
    "createdAt": "2024-01-15T15:00:00Z"
  }
}
```

---

### Get User Returns
**GET** `/returns?status=approved`

Retrieves user's return requests.

**Query Parameters:**
- `status` (optional) - Filter by status

---

### Check Return Eligibility
**GET** `/returns/check-eligibility/:orderId`

Checks if an order is eligible for return (within 7-day window, status=delivered).

**Response:**
```json
{
  "success": true,
  "eligibility": true,
  "details": {
    "eligible": true,
    "reason": null,
    "daysSinceDelivery": 3,
    "daysRemaining": 4
  }
}
```

---

### Approve Return (Admin)
**PATCH** `/returns/:returnId/approve`

Approves a return request.

**Request Body:**
```json
{
  "notes": "Return approved - item is defective"
}
```

---

### Reject Return (Admin)
**PATCH** `/returns/:returnId/reject`

Rejects a return request.

**Request Body:**
```json
{
  "reason": "Return period expired"
}
```

---

### Initiate Refund for Return
**POST** `/returns/:returnId/initiate-refund`

Creates a refund entry for an approved return.

**Response:**
```json
{
  "success": true,
  "message": "Refund initiated",
  "data": {
    "refundId": "REF_1234567890_abc123",
    "amount": 199.98,
    "status": "pending",
    "createdAt": "2024-01-15T16:00:00Z"
  }
}
```

---

## 💰 REFUND ENDPOINTS

### Get User Refunds
**GET** `/refunds?status=completed`

Retrieves user's refunds.

**Query Parameters:**
- `status` (optional) - Filter by status (pending, processed, completed, failed, cancelled)

---

### Get Refund Details
**GET** `/refunds/:refundId`

Retrieves complete refund information.

**Response:**
```json
{
  "success": true,
  "data": {
    "refundId": "REF_1234567890_abc123",
    "orderId": "507f1f77bcf86cd799439011",
    "userId": "507f1f77bcf86cd799439012",
    "amount": 199.98,
    "status": "completed",
    "refundType": "full",
    "originalPaymentMethod": "credit_card",
    "refundTransactionId": "TXN_1234567890_xyz789",
    "statusHistory": [
      {
        "status": "pending",
        "timestamp": "2024-01-15T16:00:00Z",
        "message": "Refund initiated"
      },
      {
        "status": "completed",
        "timestamp": "2024-01-15T18:00:00Z",
        "message": "Refund completed successfully"
      }
    ],
    "completedAt": "2024-01-15T18:00:00Z"
  }
}
```

---

### Track Refund Status
**GET** `/refunds/:refundId/track`

Quick tracking endpoint for refund status.

**Response:**
```json
{
  "success": true,
  "data": {
    "refundId": "REF_1234567890_abc123",
    "status": "completed",
    "amount": 199.98,
    "statusHistory": [...],
    "transactionId": "TXN_1234567890_xyz789",
    "completedAt": "2024-01-15T18:00:00Z"
  }
}
```

---

### Process Refund (Admin)
**PATCH** `/refunds/:refundId/process`

Processes a pending refund through payment gateway.

**Request Body:**
```json
{
  "transactionId": "TXN_1234567890_xyz789"
}
```

---

### Complete Refund (Admin)
**PATCH** `/refunds/:refundId/complete`

Marks a processed refund as completed when payment gateway confirms.

---

### Create Manual Refund (Admin Only)
**POST** `/refunds`

Creates a standalone refund not linked to a return.

**Request Body:**
```json
{
  "orderId": "507f1f77bcf86cd799439011",
  "amount": 50.00,
  "reason": "Promotional discount applied"
}
```

---

## 📍 TRACKING ENDPOINTS

### Get Latest Location
**GET** `/tracking/:orderId/latest`

Gets the most recent location update for an order.

**Response:**
```json
{
  "success": true,
  "data": {
    "location": {
      "latitude": 40.7128,
      "longitude": -74.0060,
      "address": "Out For Delivery",
      "city": "New York",
      "state": "NY"
    },
    "event": "out_for_delivery",
    "timestamp": "2024-01-15T14:30:00Z",
    "message": "Package out for delivery"
  }
}
```

---

### Get Tracking Timeline
**GET** `/tracking/:orderId/timeline?limit=50`

Gets complete tracking timeline in chronological order.

**Query Parameters:**
- `limit` (optional) - Number of updates to return (default: 50)

**Response:**
```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "event": "pickup",
      "message": "Package picked up",
      "location": {...},
      "timestamp": "2024-01-15T08:00:00Z"
    },
    {
      "event": "in_transit",
      "message": "Package in transit",
      "location": {...},
      "timestamp": "2024-01-15T10:30:00Z"
    }
  ]
}
```

---

### Add Location Update (Delivery Partner)
**POST** `/tracking`

Adds a new location update for real-time tracking.

**Request Body:**
```json
{
  "orderId": "507f1f77bcf86cd799439011",
  "location": {
    "latitude": 40.7128,
    "longitude": -74.0060,
    "address": "Manhattan District",
    "city": "New York",
    "state": "NY"
  },
  "event": "in_transit",
  "message": "Package heading to delivery zone",
  "eventDescription": "GPS update",
  "source": "gps"
}
```

---

### Get Tracking Statistics
**GET** `/tracking/:orderId/stats`

Gets tracking statistics including progress.

**Response:**
```json
{
  "success": true,
  "data": {
    "orderId": "ORD_1234567890_abc123",
    "totalUpdates": 5,
    "eventCounts": {
      "pickup": 1,
      "in_transit": 2,
      "checkpoint": 1,
      "out_for_delivery": 1
    },
    "firstUpdate": "2024-01-15T08:00:00Z",
    "lastUpdate": "2024-01-15T14:30:00Z",
    "totalTimeMinutes": 390,
    "currentStatus": "out_for_delivery",
    "estimatedDelivery": "2024-01-15T18:00:00Z"
  }
}
```

---

### Mark Order as Delivered
**POST** `/tracking/:orderId/mark-delivered`

Marks an order as delivered with delivery confirmation.

**Request Body:**
```json
{
  "location": {
    "latitude": 40.7128,
    "longitude": -74.0060,
    "address": "123 Main St, New York, NY 10001",
    "city": "New York",
    "state": "NY"
  },
  "signature": "base64_encoded_signature_image",
  "notes": "Left at front door"
}
```

---

### Get Delivery Geofence Data
**GET** `/tracking/:orderId/geofence`

Gets geofence data for delivery zone (250m radius).

**Response:**
```json
{
  "success": true,
  "data": {
    "center": {
      "latitude": 40.7128,
      "longitude": -74.0060
    },
    "radius": 250,
    "address": "123 Main St, New York, NY 10001",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001"
  }
}
```

---

### Simulate Tracking Updates (Development)
**POST** `/tracking/:orderId/simulate`

Simulates realistic tracking updates for testing (Admin only).

**Response:**
```json
{
  "success": true,
  "message": "Tracking simulated successfully",
  "count": 5,
  "data": [...]
}
```

---

## 🔌 WebSocket Events

### Connection
```javascript
const socket = io('http://localhost:5000');

socket.on('connect', () => {
  console.log('Connected to server');
});
```

### Subscribe to Order Tracking
```javascript
socket.emit('join_order', 'ORDER_ID');

socket.on('location_update', (data) => {
  console.log('New location:', data);
  // {
  //   "orderId": "...",
  //   "location": {...},
  //   "message": "...",
  //   "event": "...",
  //   "timestamp": "..."
  // }
});

socket.on('status_change', (data) => {
  console.log('Status changed:', data);
});
```

### Unsubscribe from Order Tracking
```javascript
socket.emit('leave_order', 'ORDER_ID');
```

---

## Error Responses

### Validation Error
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "items",
      "message": "must contain at least 1 item"
    }
  ]
}
```

### Unauthorized
```json
{
  "success": false,
  "message": "Invalid token"
}
```

### Not Found
```json
{
  "success": false,
  "message": "Order not found"
}
```

### Business Logic Error
```json
{
  "success": false,
  "message": "Invalid status transition from placed to delivered"
}
```

---

## Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Server Error

---

## Rate Limiting (Future)
- 100 requests per minute per IP
- 1000 requests per hour per authenticated user

---

## Pagination (Future)
```
GET /orders?page=2&limit=20
```

---

## Sorting (Future)
```
GET /orders?sort=-createdAt,status
```

---

## Implementation Example

### Create Order and Track
```bash
# 1. Create order
curl -X POST http://localhost:5000/api/v1/orders \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ ... }'

# 2. Get tracking
curl http://localhost:5000/api/v1/orders/ORDER_ID/track \
  -H "Authorization: Bearer TOKEN"

# 3. Connect WebSocket
# See WebSocket section above

# 4. Request return (after 7 days max)
curl -X POST http://localhost:5000/api/v1/returns \
  -H "Authorization: Bearer TOKEN" \
  -d '{ ... }'

# 5. Admin approves return
curl -X PATCH http://localhost:5000/api/v1/returns/RETURN_ID/approve \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -d '{ ... }'

# 6. Create refund
curl -X POST http://localhost:5000/api/v1/returns/RETURN_ID/initiate-refund \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

---

## Support
For issues or questions, contact: support@ecommerce-platform.com
