const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const socketIO = require('socket.io');

// Load environment variables
dotenv.config();

// Import routes
const apiRoutes = require('./routes/index');

// Import middleware
const { errorHandler } = require('./middleware/auth');

// Initialize Express app
const app = express();

// Create HTTP server for Socket.io
const server = http.createServer(app);

// Initialize Socket.io
const io = socketIO(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

// MongoDB Connection
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce-order-system';
    
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('✓ MongoDB connected successfully');
  } catch (error) {
    console.error('✗ MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// API Routes
app.use('/api/v1', apiRoutes);

// Socket.io Connection Handling
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  /**
   * Join order tracking room
   * Allows clients to subscribe to real-time updates for specific orders
   */
  socket.on('join_order', (orderId) => {
    socket.join(`order_${orderId}`);
    console.log(`Socket ${socket.id} joined order tracking: ${orderId}`);
    socket.emit('joined', { message: `Joined tracking for order ${orderId}` });
  });

  /**
   * Leave order tracking room
   */
  socket.on('leave_order', (orderId) => {
    socket.leave(`order_${orderId}`);
    console.log(`Socket ${socket.id} left order tracking: ${orderId}`);
  });

  /**
   * Real-time location update event
   */
  socket.on('location_update', (data) => {
    const { orderId, location, message, event } = data;
    
    // Broadcast to all clients tracking this order
    io.to(`order_${orderId}`).emit('location_update', {
      orderId,
      location,
      message,
      event,
      timestamp: new Date()
    });
    
    console.log(`Location update for order ${orderId}: ${message}`);
  });

  /**
   * Order status change event
   */
  socket.on('status_change', (data) => {
    const { orderId, status, message } = data;
    
    io.to(`order_${orderId}`).emit('status_change', {
      orderId,
      status,
      message,
      timestamp: new Date()
    });
    
    console.log(`Status change for order ${orderId}: ${status}`);
  });

  /**
   * Estimated delivery update event
   */
  socket.on('delivery_estimate', (data) => {
    const { orderId, estimatedTime, message } = data;
    
    io.to(`order_${orderId}`).emit('delivery_estimate', {
      orderId,
      estimatedTime,
      message,
      timestamp: new Date()
    });
    
    console.log(`Delivery estimate for order ${orderId}: ${estimatedTime}`);
  });

  /**
   * Disconnect handler
   */
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });

  /**
   * Error handler
   */
  socket.on('error', (error) => {
    console.error('Socket error:', error);
  });
});

// Global error handling middleware
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Start server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    // Start HTTP server
    server.listen(PORT, () => {
      console.log(`\n========================================`);
      console.log(`✓ Order & Delivery System Server Running`);
      console.log(`✓ Port: ${PORT}`);
      console.log(`✓ API Base URL: http://localhost:${PORT}/api/v1`);
      console.log(`✓ WebSocket: ws://localhost:${PORT}`);
      console.log(`========================================\n`);
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('\nSIGTERM signal received: closing HTTP server');
      server.close(() => {
        console.log('HTTP server closed');
        mongoose.connection.close(false, () => {
          console.log('MongoDB connection closed');
          process.exit(0);
        });
      });
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

// Export for testing
module.exports = { app, server, io };

// Start the server if this is the main module
if (require.main === module) {
  startServer();
}
