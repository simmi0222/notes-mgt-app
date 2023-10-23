const mongoose = require("mongoose")
mongoose.connect("mongodb+srv://simranmeena84:simran0702@cluster0.dtep4ys.mongodb.net/")
.then(()=>{
    console.log("db connected");
})
.catch((error)=>{
    console.log("error");
})