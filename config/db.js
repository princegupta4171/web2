const mongoose = require("mongoose");
const connectDB = async() => {
    try{
       await mongoose.connect(process.env.MONGODB_URL)
        console.log("database connected");

    } catch (err) {
        console.error("unable to connect database:", err.message);
        process.exit(1);
    }
};

module.exports = connectDB;