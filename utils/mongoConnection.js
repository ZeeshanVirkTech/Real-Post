const mongoose = require("mongoose");
require("dotenv").config();

const connectMongo=()=>{
    try {
        mongoose.set("strictQuery", true);
        mongoose.connect(process.env.MONGO_URL, {
          useNewUrlParser: true,
        });
    } catch (error) {
            console.log("Something went wrong connecting to database")
    }
    
    console.log("Database connected successfully!");
}
module.exports = connectMongo;