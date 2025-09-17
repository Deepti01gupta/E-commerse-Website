const mongoose = require('mongoose');
const Review = require('./Review');

const productSchema=new mongoose.Schema({  // schema creation
    name: {
        type: String,
        trim: true,
        required: true
    },
    img: {
        type: String,
        trim: true
        // default: 
    },
    price: {
        type: Number,
        min: 0,
        required: true,
    },
    desc: {
        type: String,
        trim: true
    },
    reviews: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Review'  // reference dete hai ki object id kaha s leni hai
        }
    ],
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
});


// middleware jo BTS mongodb operation karwane par use hota hai and iske ander pre and 
// post middleware hote hai which are basically used over the schema and before the mongoose.model
// is js class
// for devloper purpose
productSchema.post('findOneAndDelete',async function(product){
    if(product && product.reviews.length >0){
        await Review.deleteMany({_id:{$in:product.reviews}});
    }
})







let Product=mongoose.model('Product',productSchema);
module.exports=Product;  // module ko export krne k liye













