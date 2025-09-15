
const mongoose =require('mongoose');

const Product=require('./models/Product');

const products = [
    {
        name: "Iphone 14pro",
        img: "https://images.unsplash.com/photo-1607936854279-55e8a4c64888?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fGlwaG9uZSUyMDE0cHJvfGVufDB8fDB8fHww",
        price: 130000,
        desc: "very costly , aukat se bahar"
    },
    {
        name: "Mackbook m2 pro",
        img: "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTR8fGxhcHRvcHxlbnwwfHwwfHx8MA%3D%3D",
        price: 250000,
        desc: "ye to bilkul hi aukat k bahar"
    },
    {
        name: "Iwatch",
        img: "https://images.unsplash.com/photo-1517420879524-86d64ac2f339?w=1000&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8aXdhdGNofGVufDB8fDB8fHww",
        price: 51000,
        desc: "ye sasta hai lelo"
    },
    {
        name: "iPad pro",
        img: "https://images.unsplash.com/photo-1561154464-82e9adf32764?w=1000&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8aXBhZCUyMHByb3xlbnwwfHwwfHx8MA%3D%3D",
        price: 237900,
        desc: "life main kuch cheeje sirf dekhne ke liye hoti hai"
    },
    {
        name: "airpods",
        img: "https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=1000&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8YWlycG9kc3xlbnwwfHwwfHx8MA%3D%3D",
        price: 25000,
        desc: "badiya hai kamao kamao"
    }
]


//promise ki chaining se bachne k liye async wait use krte hai
// db ke sath kam krne main time lagega to ye to kam hoga ye kam nahi hoga
async function seedDB(){
    // await Product.deleteMany();
    await Product.insertMany(products);  // insertmany returns a promise
    console.log("data seeded successfully");
}

module.exports=seedDB;  // project run k time app,js chalegi to ham isko app.js k liye export kr denge
