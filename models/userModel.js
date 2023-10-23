const mongoose = require("mongoose")
const plm = require("passport-local-mongoose")
const userModel = new mongoose.Schema({
    username:{
        type:String,
        trim:true,
        unique:true,
        required:[true,"Username field must not empty"],
        minlength:[4,"Usernme field must have 4 characters"]
    },
    // email: String,
    email:{
        type:String,
        trim:true,
        lowercase:true,
        unique:true,
        required:[true,"Email address is required"],
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
    },
    avatar:{
        type:String,
        default:"default.jpg",
    },
    passwordResetToken:{
        type:Number,
        default:0,
    },
    password: String,
    tasks:[{ type: mongoose.Schema.Types.ObjectId, ref: "task"}]

})
userModel.plugin(plm)
const user = mongoose.model("user",userModel)
module.exports = user;