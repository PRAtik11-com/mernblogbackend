const mongoose=require("mongoose")



const userSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true,
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true,
    },
    role:{
        type:Boolean,
        default:false
    },
    profileImage:{
        type:String,
        default:"https://images.icon-icons.com/1378/PNG/512/avatardefault_92824.png"
    }
},{
    timestamps:true
})

const UserModel= mongoose.model("user",userSchema)

module.exports=UserModel