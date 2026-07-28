const mongoose = require("mongoose");

const doctorSchema = new mongoose.Schema({
    name:{
        type:String,
        required:[true,"Doctor name is required"],
        trim:true
    },
    specialization:{
        type:String,
        required:[true,"Specialization is required"],
        trim:true
    },
    qualification:{
        type:String,
        required:[true,"Qualification is required"],
        trim:true
    },
    experience:{
        type:Number,
        default:0,
        min:0
    },
    consultationfees:{
        type:Number,
        required:true,
        min:0
    },
    phone:{
        type:String,
        required:[true,"Phone number is required"],
        trim:true,
        unique:true
    },
    email:{
        type:String,
        unique:true,
        sparse:true,
        lowercase:true,
        trim:true
    },
    availableDays:[{
        type:String,
        enum:["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"]
    }],
    startTime:{
        type:String,
        required:true
    },
    endTime:{
        type:String,
        required:true
    },
    slotDuration:{
        type:Number,
        default:15
    },
    roomNumber:{
        type:String,
        trim:true
    },
    isActive:{
        type:Boolean,
        default:true
    }
},{
    timestamps:true
    }
);

module.exports = mongoose.model("Doctor",doctorSchema);