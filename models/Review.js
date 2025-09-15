const mongoose = require('mongoose');

const reviewSchema=new mongoose.Schema({  // schema creation
    rating: {
        type: Number,
        min: 0,
        max: 5
    },
    comment: {
        type: String,
        trim: true
    }
}, {timestamps:true}); // time dene k liye


let Review=mongoose.model('Review',reviewSchema);
module.exports=Review;  // module ko export krne k liye







// har review ko alag alag krne k liye object.id use krte hai
// ham pura data store nahi krte hai just id se pura data excess kr lete hai






