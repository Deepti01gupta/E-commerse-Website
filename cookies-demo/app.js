
const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');



// cookies
// app.use(cookieParser());

// app.get('/', (req,res)=>{
//     res.send('root connected');
// })

// app.get('/setcookies',(req,res)=>{
//     res.cookie('mode','dark');
//     res.cookie('location','delhi');
//     res.cookie('username','samarth');
//     res.send('server sent you cookies.');
// })

// app.get('/getcookies',(req,res)=>{
//     let {mode,location,username} = req.cookies;
//     res.send(`name is ${username}, stay in ${location} and theme is ${mode} `);

// })



// signed cookies 
app.use(cookieParser('youneedabettersecret'));

app.get('/', (req,res)=>{
    console.log(req.cookies);
    // res.send(req.cookies); // all easy cookies
    res.send(req.signedCookies);  // all signed cookies
})

app.get('/getsignedcookies',(req,res)=>{
    res.cookie('bindas','sachine',{signed:true});
    res.send('cookies sent successfully.');
})

app.get('/getcookies',(req,res)=>{
    let {mode,location,username} = req.cookies;
    res.send(`name is ${username}, stay in ${location} and theme is ${mode} `);
    
})



const PORT = 8080;
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});






