#!/usr/bin/env bash

# Setup Test Data Script
# Inserts sample coupons and delivery zones into MongoDB

set -e

echo "📦 Setting up test data..."
echo "=========================="

# Check if mongosh is available
if ! command -v mongosh &> /dev/null && ! command -v mongo &> /dev/null; then
    echo "❌ MongoDB CLI (mongosh) not found. Please install it first."
    exit 1
fi

# Determine which command to use
if command -v mongosh &> /dev/null; then
    MONGO_CMD="mongosh"
else
    MONGO_CMD="mongo"
fi

echo "Using command: $MONGO_CMD"
echo ""

# Create JavaScript file with setup commands
cat > /tmp/setup-test-data.js << 'EOF'
// Connect to ecommerce-payment database
db = db.getSiblingDB('ecommerce-payment');

// Clear existing data
print("🗑️  Clearing old test data...");
db.coupons.deleteMany({});
db.deliveryzones.deleteMany({});

// Insert test coupons
print("📋 Inserting test coupons...");
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
    code: "SAVE50",
    discountType: "percentage",
    discountValue: 50,
    maxDiscountAmount: 2500,
    minOrderValue: 5000,
    usageLimit: 20,
    usageCount: 0,
    validFrom: new Date(),
    validUpto: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    applicableCategories: [],
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
]);

// Insert delivery zones
print("🚚 Inserting delivery zones...");
db.deliveryzones.insertMany([
  {
    pincodes: ["110001", "110002", "110003", "110004", "110005", "110006", "110007", "110008", "110009"],
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
    pincodes: ["400001", "400002", "400003", "400004", "400005"],
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
    pincodes: ["560001", "560002", "560003", "560004"],
    city: "Bangalore",
    state: "Karnataka",
    chargePerUnit: 15,
    chargeFlat: 40,
    freeDeliveryAbove: 2000,
    processingDays: "1-2",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    pincodes: ["700001", "700002", "700003"],
    city: "Kolkata",
    state: "West Bengal",
    chargePerUnit: 18,
    chargeFlat: 45,
    freeDeliveryAbove: 2500,
    processingDays: "2-3",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    pincodes: ["500001", "500002", "500003"],
    city: "Hyderabad",
    state: "Telangana",
    chargePerUnit: 20,
    chargeFlat: 50,
    freeDeliveryAbove: 2500,
    processingDays: "2-3",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
]);

print("✅ Test data setup complete!");

// Display summary
print("\n📊 Test Data Summary:");
print("Coupons inserted: " + db.coupons.countDocuments({}));
print("Delivery zones inserted: " + db.deliveryzones.countDocuments({}));

print("\n🎟️  Available Coupons:");
db.coupons.find({}, {code: 1, discountType: 1, discountValue: 1, minOrderValue: 1, isActive: 1}).forEach(c => {
  print(`  • ${c.code} - ${c.discountType} ${c.discountValue}% (Min: ₹${c.minOrderValue})`);
});

print("\n📍 Available Delivery Zones:");
db.deliveryzones.find({}, {city: 1, state: 1, freeDeliveryAbove: 1, processingDays: 1}).forEach(z => {
  print(`  • ${z.city}, ${z.state} - Free above ₹${z.freeDeliveryAbove} (${z.processingDays} days)`);
});
EOF

# Run the setup script
$MONGO_CMD mongodb://localhost:27017 /tmp/setup-test-data.js

# Cleanup
rm /tmp/setup-test-data.js

echo ""
echo "✅ Test data setup complete!"
echo ""
echo "You can now test these coupon codes:"
echo "  • WELCOME20 - 20% discount (min ₹500)"
echo "  • FLAT100 - ₹100 flat discount (min ₹1000)"
echo "  • SAVE50 - 50% discount (min ₹5000)"
echo ""
echo "You can now test these pincodes for shipping:"
echo "  • Delhi: 110001-110009"
echo "  • Mumbai: 400001-400005"
echo "  • Bangalore: 560001-560004"
echo "  • Kolkata: 700001-700003"
echo "  • Hyderabad: 500001-500003"
