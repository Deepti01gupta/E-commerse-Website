# Order & Delivery Management System

Production-ready order tracking, returns, and refund management system with real-time WebSocket updates.

## Features

### ✅ Order Tracking
- 5-step order lifecycle (Placed → Confirmed → Shipped → Out for Delivery → Delivered)
- Real-time location tracking with GPS updates
- Estimated delivery time predictions
- Delivery attempt logging
- Multiple status transition validations

### ✅ Return Management
- 7-day return eligibility window (auto-calculated from delivery date)
- Multiple return reasons (defective, not as described, damaged, etc.)
- Admin approval workflow
- Return status tracking (initiated → approved → shipped back → received → completed)
- Return address management with tracking

### ✅ Refund Processing
- Full and partial refund support
- Multi-step refund workflow (pending → processed → completed)
- Payment gateway integration ready
- Transaction ID tracking
- Refund status history

### ✅ Real-Time Tracking
- WebSocket integration for live location updates
- Event-based tracking (pickup, in transit, checkpoint, out for delivery, delivered)
- Geofencing data for delivery zones
- Multiple update sources (GPS, manual, API, delivery provider)

## Project Structure

```
order-delivery-system/
├── src/
│   ├── controllers/        # API request handlers
│   │   ├── order.controller.js
│   │   ├── return.controller.js
│   │   ├── refund.controller.js
│   │   └── tracking.controller.js
│   ├── models/            # MongoDB schemas
│   │   ├── Order.js
│   │   ├── Return.js
│   │   ├── Refund.js
│   │   └── TrackingUpdate.js
│   ├── services/          # Business logic
│   │   ├── order.service.js
│   │   ├── returnRefund.service.js
│   │   ├── tracking.service.js
│   │   └── analytics.service.js
│   ├── routes/            # API routes
│   │   ├── order.routes.js
│   │   ├── return.routes.js
│   │   ├── refund.routes.js
│   │   ├── tracking.routes.js
│   │   └── index.js
│   ├── middleware/        # Express middleware
│   │   ├── auth.js       # JWT authentication
│   │   └── validation.js  # Joi validation
│   ├── validators/        # Joi schemas
│   │   └── validators.js
│   └── index.js          # Main server entry point
└── README.md
```

## API Endpoints

### Orders
- `POST /api/v1/orders` - Create new order
- `GET /api/v1/orders` - Get user's order history
- `GET /api/v1/orders/:orderId` - Get order details
- `GET /api/v1/orders/:orderId/track` - Get tracking info
- `PATCH /api/v1/orders/:orderId/status` - Update status (Admin)
- `POST /api/v1/orders/:orderId/cancel` - Cancel order

### Returns
- `POST /api/v1/returns` - Create return request
- `GET /api/v1/returns` - Get user's returns
- `GET /api/v1/returns/check-eligibility/:orderId` - Check eligibility
- `PATCH /api/v1/returns/:returnId/approve` - Approve (Admin)
- `PATCH /api/v1/returns/:returnId/reject` - Reject (Admin)

### Refunds
- `POST /api/v1/refunds` - Create manual refund (Admin)
- `GET /api/v1/refunds` - Get user's refunds
- `GET /api/v1/refunds/:refundId` - Get refund details
- `PATCH /api/v1/refunds/:refundId/process` - Process refund (Admin)
- `PATCH /api/v1/refunds/:refundId/complete` - Complete refund (Admin)

### Tracking
- `POST /api/v1/tracking` - Add location update
- `GET /api/v1/tracking/:orderId/latest` - Get latest location
- `GET /api/v1/tracking/:orderId/timeline` - Get tracking timeline
- `GET /api/v1/tracking/:orderId/stats` - Get tracking stats
- `POST /api/v1/tracking/:orderId/mark-delivered` - Mark delivered

## Data Models

### Order
```javascript
{
  orderId: String,
  userId: ObjectId,
  items: Array,
  shippingAddress: Object,
  status: String (enum: placed, confirmed, shipped, out_for_delivery, delivered, cancelled, returned),
  statusHistory: Array,
  currentLocation: Object,
  trackingNumber: String,
  estimatedDeliveryDate: Date,
  actualDeliveryDate: Date,
  returnDeadline: Date (auto-set: delivery date + 7 days)
}
```

### Return
```javascript
{
  returnId: String,
  orderId: ObjectId,
  userId: ObjectId,
  reason: String (enum),
  status: String (enum: initiated, approved, rejected, shipped_back, received, completed),
  returnAmount: Number,
  statusHistory: Array
}
```

### Refund
```javascript
{
  refundId: String,
  orderId: ObjectId,
  returnId: ObjectId,
  userId: ObjectId,
  amount: Number,
  status: String (enum: pending, processed, completed, failed),
  originalPaymentId: String,
  refundTransactionId: String,
  statusHistory: Array
}
```

### TrackingUpdate
```javascript
{
  orderId: ObjectId,
  event: String (enum: pickup, in_transit, checkpoint, out_for_delivery, delivered),
  location: Object,
  message: String,
  source: String (gps, manual, api, delivery_provider),
  timestamp: Date
}
```

## WebSocket Events

### Client Events
- `join_order` - Subscribe to order tracking
- `leave_order` - Unsubscribe from order tracking
- `location_update` - Emit location update
- `status_change` - Emit status change
- `delivery_estimate` - Emit delivery estimate

### Server Events
- `location_update` - Real-time location data
- `status_change` - Order status changed
- `delivery_estimate` - Updated delivery time

## Authentication

All endpoints (except health check) require JWT Bearer token:
```
Authorization: Bearer <token>
```

### User Roles
- `customer` - Can view own orders, create returns, track packages
- `admin` - Can manage all orders, approve/reject returns, process refunds
- `delivery_partner` - Can update tracking, log deliveries

## Environment Variables

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/ecommerce-order-system
JWT_SECRET=your_jwt_secret_key
CLIENT_URL=http://localhost:3000
NODE_ENV=development
```

## Installation

```bash
cd order-delivery-system
npm install
```

## Running the Server

```bash
# Development
npm run dev

# Production
npm start
```

## Testing

Use Postman, Insomnia, or curl to test endpoints:

```bash
# Create order
curl -X POST http://localhost:5000/api/v1/orders \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "items": [...],
    "shippingAddress": {...},
    "paymentDetails": {...}
  }'

# Get order tracking
curl http://localhost:5000/api/v1/orders/{orderId}/track \
  -H "Authorization: Bearer <token>"

# Create return
curl -X POST http://localhost:5000/api/v1/returns \
  -H "Authorization: Bearer <token>" \
  -d '{
    "orderId": "...",
    "reason": "defective_product"
  }'
```

## Key Capabilities

### Status Workflow Validation
- Enforces valid status transitions
- Prevents invalid order movements
- Maintains complete audit trail in statusHistory

### Return Eligibility
- Auto-calculates 7-day return window from delivery
- Validates order status before return creation
- Tracks eligibility checks with notes

### Refund Integration
- Supports multiple refund attempts
- Integrates with payment gateway transaction IDs
- Separation of concerns: Returns → Refunds → Payment Gateway

### Real-Time Tracking
- WebSocket-based live location updates
- Independent from order status (can update location without changing status)
- Multiple event types for detailed tracking

### Analytics Ready
- Aggregation pipelines for insights
- Customer lifetime value calculations
- Delivery performance metrics
- Return reason analysis

## Security Features

- JWT authentication on all protected routes
- Role-based access control (customer, admin, delivery_partner)
- Input validation with Joi schemas
- MongoDB injection prevention via Mongoose
- CORS configuration for frontend integration

## Performance Optimization

- Indexed fields: userId, orderId, status, timestamp
- Aggregation pipelines for analytics
- Lean queries for list endpoints
- Socket.io room-based broadcasting for real-time efficiency

## Future Enhancements

- [ ] Notification system (email, SMS, push)
- [ ] Real payment gateway integration
- [ ] Map integration for location visualization
- [ ] Mobile app support with offline sync
- [ ] Inventory management integration
- [ ] Machine learning for delivery time prediction
- [ ] Advanced geofencing with alerts
- [ ] Multi-warehouse order distribution

## License

MIT
