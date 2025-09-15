
const {productSchema, reviewSchema} = require('./schema');

const validateProduct=(req,res,next)=>{
    let {name,img,price,desc} = req.body;
    const {error}= productSchema.validate({name,img,price,desc});
    if(error){
        return res.render('error');
    }
    next();
}

const validateReview=()=>{
    let {rating, comment} = req.body;
    const {error}= productSchema.validate({rating, comment});
    if(error){
        return res.render('error');
    }
    next();
}

module.exports= {validateProduct, validateReview};





















