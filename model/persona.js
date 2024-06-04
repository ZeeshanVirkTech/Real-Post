const mongoose = require("mongoose");

const personaSchema = new mongoose.Schema({
  heading : { type: String, required: true },
  name: { type: String, required: true },
   background : { type: String, required: true },
   housing_needs : { type: String, required: true },
   other_requirements : { type: String, required: true },
    creator: { type: mongoose.Types.ObjectId, required: true, ref: "user" }
});

module.exports = mongoose.model("persona", personaSchema);
