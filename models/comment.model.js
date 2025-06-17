const mongoose = require("mongoose")

const commentSchema = new mongoose.Schema({
  userId : {
    type:String,
    required:true
  },
  postId : {
    type:String,
    required:true
  },
  comment : {
    type:String,
    required:true
  },
  likes:{
    type:Array,
    default:[]
  },
  numberOfLikes:{
    type:Number,
    default:0
  }
},{
    timestamps:true,
    versionKey:false
})

const Commentmodel = mongoose.model("comment", commentSchema)

module.exports = Commentmodel;