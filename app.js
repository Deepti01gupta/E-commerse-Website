
const express = require('express');
const app=express();
const path=require('path');
const mongoose = require('mongoose');
const seedDB=require('./seed');
const productRoutes=require('./routes/product');
const reviewRoutes=require('./routes/review');
const ejsMate=require('ejs-mate');
const methodOverride=require('method-override');
const flash = require('connect-flash');
const session = require('express-session');


mongoose.connect('mongodb://127.0.0.1:27017/shopping-sam-app')  // database connection
.then(()=>{
    console.log("DB connected sucessfully");
})
.catch((err)=>{
    console.log("DB error");
    console.log(err);
})


// view engine ek engine hai jo express k pass default present hai
// ejs is not a engine it is a templeting language
// ejs mate is an engine we use here
app.engine('ejs',ejsMate); 
app.set('view engine','ejs');  // view engine kya dekh rha hai ejs ki file dekh rha hai
app.set('views',path.join(__dirname,'views'));  // views folder
app.use(express.static(path.join(__dirname,'public')));  // public folder

app.use(express.urlencoded({extended: true}));
app.use(methodOverride('_method'));


let configSession = {
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true
}
app.use(session(configSession));
app.use(flash());
app.use((req,res,next)=>{
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})


app.use(productRoutes);  // so that har incoming request ke liye path check kiya jaye
app.use(reviewRoutes);

// seeding DB
// seedDB();





const PORT = 8080;

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/products`);
});
















