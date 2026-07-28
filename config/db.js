const mongoose = require("mongoose");
const connectDB = async() => {
    try{
       await mongoose.connect(process.env.MONGODB_URL)
        console.log("database connected");

    }catch (err){
        console.log("unable to connect database ",err);
    
    }
};

module.exports = connectDB;