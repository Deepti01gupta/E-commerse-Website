
const express=require('express');
const User = require('../models/User');
const passport = require('passport');
const router=express.Router(); // mini instance


// to show the form of signup
router.get('/register', (req,res)=>{
    res.render('auth/signup');
})


// actually want to register a user in mu DB
router.post('/register',async (req,res)=>{
    try{
        let {email, password, username} = req.body;
        const user = new User({email,username});
        const newUser = await User.register(user,password);
        // res.send(newUser);  // new user k data send kr rhe h

        // res.redirect('/login');   // register krne k baad login bhi krna hoga

        req.login(newUser, function(err){  // register krne k baad seedhe products wala page open up hoga
            if(err){
                return next(err);
            }
            req.flash('success','welcome, you are successfully registered');
            return res.redirect('/products');
        } );
    }
    catch(e){
        req.flash('error', e.message);
        // res.status(500).render('error',{err:e.message});
        return res.redirect('/signup');
    }
    
})

// to get login form
router.get('/login', (req,res)=>{
    res.render('auth/login');
})


// to actually login via the DB
router.post('/login', 
    passport.authenticate('local', { 
        failureRedirect: '/login', 
        failureMessage: true 
    }),
    (req,res)=>{
        // console.log(req.user,'sam');
        req.flash('success',"welcome back");
        res.redirect('/products');
    }
)


// logout
router.get('/logout', (req,res)=>{
    ()=>{
        req.logOut();
    }
    req.flash('success', 'goodbye friends, see you again');
    res.redirect('/login');
})

module.exports = router;