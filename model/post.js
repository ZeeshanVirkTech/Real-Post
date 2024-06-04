const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
   heading : { type: String, required: true },
  description: { type: String, required: true },
  images : [{type : String , required :true}] ,
  creator: { type: mongoose.Types.ObjectId, required: true, ref: "user" }

});

module.exports = mongoose.model("post", postSchema);
