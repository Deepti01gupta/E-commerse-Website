
const express=require('express');
const router = express.Router(); //mini instance
const {isLoggedIn, isBuyer} = require('../middleware');
const Product = require('../models/Product');
const User = require('../models/User');
const Order = require('../models/Order');
const BookedOrder = require('../models/BookedOrder');
const Stripe = require('stripe');
const { v4: uuidv4 } = require('uuid');

const stripe = process.env.STRIPE_SECRET_KEY
    ? new Stripe(process.env.STRIPE_SECRET_KEY)
    : null;


// route to see the cart
router.get('/user/cart', isLoggedIn, isBuyer, async (req,res)=>{
    let user = await User.findById(req.user._id).populate('cart');
    res.render('cart/cart', {user});
})

// actually adding the product to the cart
router.post('/user/:productId/add', isLoggedIn, isBuyer, async (req,res)=>{
    let {productId} = req.params;
    let userId = req.user._id;
    let product = await Product.findById(productId);
    let user = await User.findById(userId);
    user.cart.push(product);
    await user.save();
    res.redirect('/user/cart');
})


// Show checkout page with payment method selection
router.get('/checkout', isLoggedIn, isBuyer, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate('cart');

        if (!user || !user.cart || user.cart.length === 0) {
            req.flash('error', 'Your cart is empty.');
            return res.redirect('/user/cart');
        }

        // Calculate pricing
        const subtotal = user.cart.reduce((sum, item) => sum + item.price, 0);
        const tax = subtotal * 0.18;
        const shipping = subtotal > 500 ? 0 : 50;
        const total = subtotal + tax + shipping;

        res.render('cart/checkout', {
            user,
            items: user.cart,
            subtotal,
            tax,
            shipping,
            total
        });
    } catch (e) {
        res.status(500).render('error', { err: e.message });
    }
});

// Process checkout - handles all payment methods
router.post('/checkout/process', isLoggedIn, isBuyer, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate('cart');
        const { paymentMethod, shippingAddress, expectedDate, bookingNotes } = req.body;

        if (!user || !user.cart || user.cart.length === 0) {
            req.flash('error', 'Your cart is empty.');
            return res.redirect('/user/cart');
        }

        // Calculate pricing
        const subtotal = user.cart.reduce((sum, item) => sum + item.price, 0);
        const tax = subtotal * 0.18;
        const shipping = subtotal > 500 ? 0 : 50;
        const total = subtotal + tax + shipping;

        const pricing = {
            subtotal,
            tax,
            shippingCharge: shipping,
            discountAmount: 0,
            total
        };

        // Format cart items for order
        const orderItems = user.cart.map(item => ({
            productId: item._id,
            name: item.name,
            price: item.price,
            quantity: 1,
            image: item.img,
            subtotal: item.price
        }));

        switch (paymentMethod) {
            case 'stripe':
                return handleStripePayment(req, res, user, orderItems, pricing, shippingAddress);
            
            case 'cod':
                return handleCODPayment(req, res, user, orderItems, pricing, shippingAddress);
            
            case 'book_order':
                return handleBookOrder(req, res, user, orderItems, pricing, shippingAddress, expectedDate, bookingNotes);
            
            default:
                req.flash('error', 'Invalid payment method selected');
                res.redirect('/checkout');
        }
    } catch (e) {
        res.status(500).render('error', { err: e.message });
    }
});

// ======================== PAYMENT METHOD HANDLERS ========================

// Handle Stripe Payment
async function handleStripePayment(req, res, user, orderItems, pricing, shippingAddress) {
    try {
        if (!stripe) {
            req.flash('error', 'Payment gateway is not configured. Please add STRIPE_SECRET_KEY.');
            return res.redirect('/user/cart');
        }

        const lineItems = orderItems.map((item) => ({
            price_data: {
                currency: 'inr',
                product_data: {
                    name: item.name,
                    images: item.image ? [item.image] : []
                },
                unit_amount: Math.round(Number(item.price) * 100)
            },
            quantity: item.quantity
        }));

        // Add tax and shipping as line items
        if (pricing.tax > 0) {
            lineItems.push({
                price_data: {
                    currency: 'inr',
                    product_data: { name: 'Tax (18%)' },
                    unit_amount: Math.round(pricing.tax * 100)
                },
                quantity: 1
            });
        }

        if (pricing.shippingCharge > 0) {
            lineItems.push({
                price_data: {
                    currency: 'inr',
                    product_data: { name: 'Shipping Charge' },
                    unit_amount: Math.round(pricing.shippingCharge * 100)
                },
                quantity: 1
            });
        }

        const baseUrl = `${req.protocol}://${req.get('host')}`;

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'payment',
            line_items: lineItems,
            success_url: `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}&shippingData=${encodeURIComponent(JSON.stringify(shippingAddress))}`,
            cancel_url: `${baseUrl}/user/cart`,
            metadata: {
                userId: user._id.toString(),
                items: JSON.stringify(orderItems)
            }
        });

        res.redirect(303, session.url);
    } catch (e) {
        res.status(500).render('error', { err: e.message });
    }
}

// Handle Cash on Delivery
async function handleCODPayment(req, res, user, orderItems, pricing, shippingAddress) {
    try {
        // Create order with COD payment method
        const order = new Order({
            orderId: `ORD-${Date.now()}-${uuidv4().slice(0, 8)}`,
            userId: user._id,
            items: orderItems,
            shippingAddress,
            pricing,
            paymentMethod: 'cash_on_delivery',
            paymentStatus: 'pending', // Will be marked completed when payment is received
            status: 'confirmed',
            trackingNumber: `TRK-${uuidv4().slice(0, 12).toUpperCase()}`
        });

        await order.save();

        // Clear user cart
        await User.findByIdAndUpdate(user._id, { cart: [] });

        // Set success message
        req.flash('success', `✅ Order #${order.orderId} confirmed! Pay ₹${pricing.total.toFixed(2)} at delivery.`);
        
        // Redirect to order details
        res.redirect(`/order/${order._id}`);
    } catch (e) {
        res.status(500).render('error', { err: e.message });
    }
}

// Handle Book Order
async function handleBookOrder(req, res, user, orderItems, pricing, shippingAddress, expectedDate, bookingNotes) {
    try {
        // Validate expected date
        if (!expectedDate) {
            req.flash('error', 'Please select an expected delivery date for booking');
            return res.redirect('/checkout');
        }

        // Create booked order
        const bookedOrder = new BookedOrder({
            bookingId: `BOOK-${Date.now()}-${uuidv4().slice(0, 8)}`,
            userId: user._id,
            items: orderItems,
            bookingAddress: shippingAddress,
            pricing,
            expectedBookingDate: new Date(expectedDate),
            notes: bookingNotes || '',
            status: 'pending'
        });

        await bookedOrder.save();

        // Clear user cart
        await User.findByIdAndUpdate(user._id, { cart: [] });

        // Set success message
        req.flash('success', `📅 Order booked successfully! Booking ID: ${bookedOrder.bookingId}`);
        
        // Redirect to booking details
        res.redirect(`/booking/${bookedOrder._id}`);
    } catch (e) {
        res.status(500).render('error', { err: e.message });
    }
}

// ======================== PAYMENT SUCCESS/CANCELLATION HANDLERS ========================

// Handle Stripe success
router.get('/checkout/success', isLoggedIn, isBuyer, async (req, res) => {
    try {
        if (!stripe) {
            req.flash('error', 'Payment gateway is not configured.');
            return res.redirect('/user/cart');
        }

        const sessionId = req.query.session_id;
        const shippingData = req.query.shippingData ? JSON.parse(decodeURIComponent(req.query.shippingData)) : null;

        if (!sessionId) {
            req.flash('error', 'Invalid payment session.');
            return res.redirect('/user/cart');
        }

        const session = await stripe.checkout.sessions.retrieve(sessionId);
        if (session.payment_status === 'paid') {
            const user = await User.findById(req.user._id).populate('cart');
            
            // Parse metadata
            const orderItems = JSON.parse(session.metadata.items);
            
            // Calculate pricing
            const subtotal = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            const tax = subtotal * 0.18;
            const shipping = subtotal > 500 ? 0 : 50;
            const total = subtotal + tax + shipping;

            const pricing = {
                subtotal,
                tax,
                shippingCharge: shipping,
                discountAmount: 0,
                total
            };

            // Create order
            const order = new Order({
                orderId: `ORD-${Date.now()}-${uuidv4().slice(0, 8)}`,
                userId: req.user._id,
                items: orderItems,
                shippingAddress: shippingData || {},
                pricing,
                paymentMethod: 'stripe',
                paymentId: sessionId,
                paymentStatus: 'completed',
                status: 'confirmed',
                trackingNumber: `TRK-${uuidv4().slice(0, 12).toUpperCase()}`
            });

            await order.save();
            
            // Clear cart
            await User.findByIdAndUpdate(req.user._id, { cart: [] });

            req.flash('success', `✅ Payment successful! Order #${order.orderId} placed.`);
            return res.redirect(`/order/${order._id}`);
        }

        req.flash('error', 'Payment not completed.');
        res.redirect('/user/cart');
    } catch (e) {
        res.status(500).render('error', { err: e.message });
    }
});



// Remove product from cart
router.post('/user/:productId/remove', isLoggedIn, isBuyer, async (req, res) => {
    try {
        const { productId } = req.params;
        await User.findByIdAndUpdate(
            req.user._id, 
            { $pull: { cart: productId } }
        );
        req.flash('info', 'Product removed from cart');
        res.redirect('/user/cart');
    } catch (e) {
        res.status(500).render('error', { err: e.message });
    }
});

// ======================== BOOKED ORDERS MANAGEMENT ========================

// Get user's booked orders
router.get('/user/bookings', isLoggedIn, isBuyer, async (req, res) => {
    try {
        const bookings = await BookedOrder.find({ userId: req.user._id })
            .populate('items.productId')
            .sort({ createdAt: -1 });
        
        res.render('cart/bookings', { bookings });
    } catch (e) {
        res.status(500).render('error', { err: e.message });
    }
});

// ======================== ORDER MANAGEMENT (WEB VIEWS) ========================

// Get user's all orders
router.get('/user/orders', isLoggedIn, isBuyer, async (req, res) => {
    try {
        const orders = await Order.find({ userId: req.user._id })
            .sort({ createdAt: -1 });

        res.render('orders/orders-list', { orders, user: req.user });
    } catch (error) {
        res.status(500).render('error', { err: error.message });
    }
});

// Get single order details
router.get('/order/:orderId', isLoggedIn, isBuyer, async (req, res) => {
    try {
        const order = await Order.findById(req.params.orderId)
            .populate('userId')
            .populate('items.productId');

        if (!order) {
            req.flash('error', 'Order not found');
            return res.redirect('/user/orders');
        }

        // Verify ownership
        if (order.userId._id.toString() !== req.user._id.toString()) {
            req.flash('error', 'Unauthorized to view this order');
            return res.redirect('/user/orders');
        }

        res.render('orders/order-details', { order, user: req.user });
    } catch (error) {
        res.status(500).render('error', { err: error.message });
    }
});

// ======================== BOOKED ORDERS MANAGEMENT ========================
router.get('/booking/:bookingId', isLoggedIn, isBuyer, async (req, res) => {
    try {
        const booking = await BookedOrder.findById(req.params.bookingId)
            .populate('items.productId')
            .populate('userId');
        
        if (!booking) {
            req.flash('error', 'Booking not found');
            return res.redirect('/user/bookings');
        }

        // Verify ownership
        if (booking.userId._id.toString() !== req.user._id.toString()) {
            req.flash('error', 'Unauthorized');
            return res.redirect('/user/bookings');
        }

        res.render('cart/booking-details', { booking });
    } catch (e) {
        res.status(500).render('error', { err: e.message });
    }
});

// Convert booking to order
router.post('/booking/:bookingId/convert-to-order', isLoggedIn, isBuyer, async (req, res) => {
    try {
        const booking = await BookedOrder.findById(req.params.bookingId);

        if (!booking) {
            req.flash('error', 'Booking not found');
            return res.redirect('/user/bookings');
        }

        // Verify ownership
        if (booking.userId.toString() !== req.user._id.toString()) {
            req.flash('error', 'Unauthorized');
            return res.redirect('/user/bookings');
        }

        if (booking.status === 'converted_to_purchase') {
            req.flash('info', 'This booking has already been converted to an order');
            return res.redirect(`/booking/${booking._id}`);
        }

        // Create actual order from booking
        const order = new Order({
            orderId: `ORD-${Date.now()}-${uuidv4().slice(0, 8)}`,
            userId: booking.userId,
            items: booking.items,
            shippingAddress: booking.bookingAddress,
            pricing: booking.pricing,
            paymentMethod: 'cod', // Can be changed based on payment selection
            paymentStatus: 'pending',
            status: 'confirmed',
            trackingNumber: `TRK-${uuidv4().slice(0, 12).toUpperCase()}`
        });

        await order.save();

        // Mark booking as converted
        await booking.convertToOrder(order._id);

        req.flash('success', `✅ Booking converted to Order #${order.orderId}`);
        res.redirect(`/order/${order._id}`);
    } catch (e) {
        res.status(500).render('error', { err: e.message });
    }
});

// Cancel booking
router.post('/booking/:bookingId/cancel', isLoggedIn, isBuyer, async (req, res) => {
    try {
        const booking = await BookedOrder.findById(req.params.bookingId);

        if (!booking) {
            req.flash('error', 'Booking not found');
            return res.redirect('/user/bookings');
        }

        // Verify ownership
        if (booking.userId.toString() !== req.user._id.toString()) {
            req.flash('error', 'Unauthorized');
            return res.redirect('/user/bookings');
        }

        if (booking.status === 'cancelled') {
            req.flash('info', 'Booking is already cancelled');
            return res.redirect(`/booking/${booking._id}`);
        }

        if (booking.status === 'converted_to_purchase') {
            req.flash('error', 'Cannot cancel a booking that has been converted to order');
            return res.redirect(`/booking/${booking._id}`);
        }

        const reason = req.body.reason || 'Cancelled by user';
        await booking.cancelBooking(reason);

        req.flash('success', '✅ Booking cancelled successfully');
        res.redirect('/user/bookings');
    } catch (e) {
        res.status(500).render('error', { err: e.message });
    }
});

module.exports = router;
