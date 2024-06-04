const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  //posts: [{ type: mongoose.Types.ObjectId, required: true, ref: "post" }]
  profile_pic : {type: String , default:"none" } ,
  reminder_type : {type:String , enum : ["daily" , "weekly" , "twice-a-week" ]} ,
  device_token : {type:String , default : "none"} ,
  notifications : [{
     title : {type:String , required:true} ,
     body : {type:String , required:true}
  }]
});

module.exports = mongoose.model("user", userSchema);
