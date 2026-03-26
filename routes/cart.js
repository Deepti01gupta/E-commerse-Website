
const express=require('express');
const router = express.Router(); //mini instance
const {isLoggedIn, isBuyer} = require('../middleware');
const Product = require('../models/Product');
const User = require('../models/User');
const Stripe = require('stripe');

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


router.post('/checkout', isLoggedIn, isBuyer, async (req,res)=>{
    try {
        if (!stripe) {
            req.flash('error', 'Payment gateway is not configured. Please add STRIPE_SECRET_KEY.');
            return res.redirect('/user/cart');
        }

        const user = await User.findById(req.user._id).populate('cart');

        if (!user || !user.cart || user.cart.length === 0) {
            req.flash('error', 'Your cart is empty.');
            return res.redirect('/user/cart');
        }

        const lineItems = user.cart.map((item) => ({
            price_data: {
                currency: 'inr',
                product_data: {
                    name: item.name,
                    images: item.img ? [item.img] : []
                },
                unit_amount: Math.round(Number(item.price) * 100)
            },
            quantity: 1
        }));

        const baseUrl = `${req.protocol}://${req.get('host')}`;

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'payment',
            line_items: lineItems,
            success_url: `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${baseUrl}/user/cart`
        });

        res.redirect(303, session.url);
    } catch (e) {
        res.status(500).render('error', {err: e.message});
    }
});


router.get('/checkout/success', isLoggedIn, isBuyer, async (req,res)=>{
    try {
        if (!stripe) {
            req.flash('error', 'Payment gateway is not configured.');
            return res.redirect('/user/cart');
        }

        const sessionId = req.query.session_id;
        if (!sessionId) {
            req.flash('error', 'Invalid payment session.');
            return res.redirect('/user/cart');
        }

        const session = await stripe.checkout.sessions.retrieve(sessionId);
        if (session.payment_status === 'paid') {
            await User.findByIdAndUpdate(req.user._id, {cart: []});
            req.flash('success', 'Payment successful! Order placed.');
            return res.redirect('/products');
        }

        req.flash('error', 'Payment not completed.');
        res.redirect('/user/cart');
    } catch (e) {
        res.status(500).render('error', {err: e.message});
    }
});



module.exports = router;
