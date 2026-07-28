const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema({
    appointmentNumber:{
        type:String,
        required:true,
        unique:true
    },
    doctor:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Doctor",
        required:true
    },
    patient:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Patient",
        required:true
    },
    appointmentDate:{
        type:Date,
        required:true
    },
    appointmentTime:{
        type:String,
        required:true
    },
    reason:{
        type:String,
        required:true,
        trim:true
    },
    symptoms:{
        type:String,
        true:true
    },
    status:{
        type:String,
        enum:["Pending" , "Approved" , "Checked-In" , "Completed" , "Canceled"]
    },
    bookingType:{
        type:String,
        enum:["Online","Walk-in","Phone"],
        default:"Online"
    },
    paymentStatus:{
        type:String,
        enum:["Pending" , "Paid" , "Refunded"],
        default:"Pending"
    },
    consultationFee:{
        type:Number,
        required:true
    },
    tokenNumber:{
        type:Number,
    },
    notes:{
        type:String,
        trim:true
    }

},{
    timestamps:true
});

appointmentSchema.index({
    appointmentDate:1, 
    appointmentTime:1, 
    doctor:1},
    {
        unique:true,
        partialFilterExpression:{
            status:{
                $nin:["cancelled"]
            }
        }
    });   
module.exports = mongoose.model("Appointment",appointmentSchema);