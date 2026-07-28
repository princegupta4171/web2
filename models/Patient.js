const mongoose = require("mongoose");

const patientSchema = new mongoose.Schema({

    name:{
        type:String,
        required:[true,"Patient name is required"],
        trim:true
    },
    phone:{
        type:String,
        required:[true,"Phone number is required"],
        trim:true,
        index:true
    },
    email:{
        type:String,
        lowercase:true,
        trim:true
    },
    age:{
        type:Number,
        required:[true,"Age is required"],
        min:0,
        max:120
    },
    gender:{
        type:String,
        required:true,
        enum:["Male","Female","Other"]
    },
    address:{
        type:String,
        trim:true
    },
    totalVisits:{
        type:Number,
        default:0,
        min:0
    },
    lastVisits:{
        type:Date
    }
},{
    timestamps:true
});

module.exports = mongoose.model("Patient",patientSchema);