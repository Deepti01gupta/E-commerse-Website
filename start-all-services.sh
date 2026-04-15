#!/usr/bin/env bash

# Quick Start Script for E-Commerce Payment System
# Run this script to setup and start all services

set -e

echo "🚀 E-Commerce Payment System - Quick Start"
echo "==========================================="

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}→${NC} $1"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# Check if Node.js is installed
print_status "Checking Node.js installation..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 16+ first."
    exit 1
fi
print_success "Node.js $(node -v) found"

# Check if MongoDB is running
print_status "Checking MongoDB connection..."
if ! command -v mongosh &> /dev/null && ! command -v mongo &> /dev/null; then
    print_warning "MongoDB CLI not found. Skipping database check."
else
    print_success "MongoDB appears to be available"
fi

# Setup Payment System Backend
print_status "Setting up Payment System Backend..."
cd payment-system

# Copy .env if not exists
if [ ! -f .env ]; then
    cp .env.example .env
    print_warning ".env created from .env.example - PLEASE UPDATE WITH YOUR KEYS"
fi

# Install dependencies
print_status "Installing payment-system dependencies..."
npm install --silent
print_success "Payment system dependencies installed"

print_status "Starting Payment Backend on port 5001..."
npm start &
PAYMENT_PID=$!
echo $PAYMENT_PID > ../payment-backend.pid
sleep 2

# Setup React Frontend
print_status "Setting up React Frontend..."
cd ../react-ecommerce-ui

# Install dependencies
print_status "Installing React dependencies..."
npm install --silent
print_success "React dependencies installed"

print_status "Starting React Frontend on port 5173..."
npm run dev &
FRONTEND_PID=$!
echo $FRONTEND_PID > ../react-frontend.pid
sleep 3

# Display startup information
echo ""
echo -e "${GREEN}============================================${NC}"
echo -e "${GREEN}  ✓ All Services Started Successfully!${NC}"
echo -e "${GREEN}============================================${NC}"
echo ""
echo "📱 Frontend URL:    http://localhost:5173"
echo "🔌 Backend API:     http://localhost:5001"
echo "📊 MongoDB URI:     mongodb://localhost:27017/ecommerce-payment"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo "1. Open http://localhost:5173 in your browser"
echo "2. Add products to cart"
echo "3. Click Cart → Checkout"
echo "4. Fill shipping details"
echo "5. Apply coupon code: WELCOME20"
echo "6. Select payment method"
echo "7. Review order and proceed to payment"
echo ""
echo -e "${YELLOW}Setup Coupons & Delivery Zones:${NC}"
echo "Run: ./setup-test-data.sh"
echo ""
echo -e "${YELLOW}Test Credentials:${NC}"
echo "• Razorpay Card: 4111 1111 1111 1111"
echo "• CVV: Any 3 digits"
echo "• Expiry: Any future date"
echo ""
echo "To stop all services, press Ctrl+C"
echo ""

# Wait for services to keep running
wait
