const { required, types } = require('joi');
const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');

const userSchema=new mongoose.Schema({  // schema creation
    email: {
        type: String,
        trim: true,
        required:true
    },
    role: {
        type: String,
        required: true
    },
    cart: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product'
        }
    ]
})

userSchema.plugin(passportLocalMongoose);

let User=mongoose.model('User',userSchema);
module.exports=User;  // module ko export krne k liye







// har review ko alag alag krne k liye object.id use krte hai
// ham pura data store nahi krte hai just id se pura data excess kr lete hai






