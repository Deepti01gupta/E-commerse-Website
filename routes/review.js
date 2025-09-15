
const express=require('express');
const Product = require('../models/Product');
const Review = require('../models/Review');
const router=express.Router(); // mini instance
const {validateReview} = require('../middleware');

// to post reviews
router.post('/products/:id/review', validateReview, async(req,res)=>{
    try{
        let {id}=req.params;
        let {rating,comment}=req.body;
        const product=await Product.findById(id);
        const review=new Review({rating,comment});

        await review.save();
        product.reviews.push(review);
        await product.save();

        res.redirect(`/products/${id}`);
    }
    catch(e){
        res.status(500).render('error',{err:e.message});
    }
    
})


module.exports=router; // exporting router







