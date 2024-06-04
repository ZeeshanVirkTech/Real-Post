const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema({
  otpCode: { type: String, required: true } ,
  email : {type:String , required: true}
});

module.exports = mongoose.model("otp", otpSchema);
