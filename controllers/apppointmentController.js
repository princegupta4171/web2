const Appointment = require("../models/Appointment");
const Doctor = require("../models/Doctor");
const Patient = require("../models/Patient");

const genarateAppointmentNumber =async(req,res,next) =>{
    const datePart = Date.now().toString.slice(-6);
    const randomPart = Math.floor(100 + Math.random() * 900);
    return `APT-${datePart}-${randomPart}`;

};

const getDayName =(date) => {
    return new Intl.DateTimeFormat("en-US", {
        weekday:"long"
    }).format(date);
}

const normalizeDate = (dateValue) => {
    const date = new Date (dateValue);
    date.setHours(0,0,0,0);
    return date;
}

const bookAppointment = async(req,res,next) => {
    try {
        const {
            doctorId,patientName,phone,email,age,gender,
           address,appointmentDate,appointmentTime,reason,symptoms,bookingType
        } = req.body;
        if(!doctorId || !patientName || !phone || age===undefined || !gender ||appointmentDate || !appointmentTime || !reason){
            return res.status(400).json({
                success:false,
                message:"All fields are required"
            });
        }

        const doctor = await Doctor.findById(doctorId);
        if(!doctor){
            return res.status(400).json({
                success:false,
                message:"invalid doctor id"
            });

        }
        if(!doctor.isActive){
            return res.status(400).json({
                success:false,
                message:"Doctor is currently unavailable"
            });
        }

        const selectedDate = normalizeDate(appointmentDate);
        const today = normalizeDate(new Date());
        if(selectedDate < today){
            return res.status(400).json({
                success:false,
                message:"past date appointment is not allowed"
            });

        }

        const selectedDay = getDayName(selectedDate);
        if(!doctor.availableDays.includes(selectedDay)){
            return res.status(400).json({
                success:false,
                message:`dovtor is not acvailableon ${selectedDay}`
            });
        }

        if(appointmentTime < doctor.startTime || appointmentTime > doctor.endTime){
            return res.status(400).json({
                success:false,
                message:`appointment tie must be between ${doctor.startTime} and ${doctor.endTime}`
            });
        }

        const existingAppointment = await Appointment.findOne({
            doctor:doctorId,
            appointmentDate:selectedDate,
            appointmentTime,
            status:{
                $ne:"cancelled"
            }
        
        });

        if(existingAppointment){
            return res.status(400).json({
                success:false,
                message:"this appointment slot is already booked"
            });
        }

        let patient = await Patient.findOne({
            phone,
            name:{
                $regex:`^${patientName}`,
                $options:"i"
            
            }
        })

        if(!patient){
            patient = await Patient.create({
                name:patientName,
                phone,
                email,
                age,
                gender,
                address,
                });
        }else{
            patient.age = age;
            patient.gender = gender;
            if(email){
                patient.email = email;
            }
            if(address){
                patient.address = address;
            }
            await patient.save();

        }

        const appointmentCount = await Appointment.countDocuments({
            docto:doctor.Id,
            appointmentDate :selectedDate,
            status:{
                $ne : "cancelled"
            }

        });

        const tokenNumber = appointmentCount +1;

        const appointment = await Appointment.create({
            appointmentNumber:await genarateAppointmentNumber(),
            doctor:doctorId,
            patient:patient._id,
            appointmentDate:selectedDate,
            appointmentTime,
            reason,
            symptoms: symptoms || [],
            bookingType :bookingType ||"Online",
            consultationFee:doctor.consultationfees,
            tokenNumber
        });

        const populatedAppointment = await Appoinment.findById(appointment._id)
        .populate("doctor","name,specilization , cosnultationFee ,roomNumber")
        .populate("patient","name , age , gender , phone");

        res.status(201).json({
            success:true,
            message:"Appointment booked successfully",
            data:populatedAppointment
        })


    } catch (error) {
        next(error);
    }
}


const getAllApointments = async(req,res,next) => {
    try {
        const {doctorId , patientId ,status ,date} = req.query;
        const filter = {};
        if(doctorId){
            filter.doctor = doctorId;
        }
        if(patientId){
            filter.patientId = patientId;
        }
        if(status){
            filter.staus = status;
        }
        if(date){
            filter.appointmentDate = normalizeDate(date);

        }

        const appointment = await Appointment.find(filter)
        .populate("doctor","name specilization  phone  consultationFee")
        .populate("patient"  , "name age phone gender")
        .sort({appointmentDate:1,appointmentTime:1 });

        res.json({
            success:true,
            count:appointments.length,
            data:appointments

        });
      
        
        
    } catch (error) {
        next(error);
    }
};

const getTodayAppointments = async(req,res,next) => {
    try {
        const today = normalizeDate(new date());
        const appointment = await Appointment.find({
            appointmentDate : todaydate})
        .populate("doctor" , "name phone consultationFee")
        .populate("patient" , "name age phone gender")
        .sort({
            appointmentTime:1
        
        })

        res.json({
            success:true,
            date:today,
            count:appointments.length,
            data:appointments

        })
            

    } catch (error) {
        next(error);
        
    }

};


const getAvailableSlotsorDoctor = async(req,res,next) => {
    try {
        const{doctorId} = req.params;
        const{date} = req.query;
        if(!date){
            return res.status(400).json({
                success:false,
                message:"date is required"
            });
        }
        const doctor = await Doctor.findById(doctorId);
        if(!doctor || !doctor.isActive){
            return res.status(400).json({
                success:false,
                message:"active doctor not found"
            });
        }

        const selectedDate = normalizeDate(date);
        const selectedDay = getDayName(selectedDate);
        if(!doctor.availableDays.includes(selectedDay)){
            return res.status(400).json({
                success:false,
                message:`doctor is unavailable on ${selectedDay}`,
                date = []
            });
        }

        const bookedAppointments = await Appointment.find({
            doctor:doctorId,
            appointmentDate:selectedDate,
            status:{
                $ne:"cancelled"            
            }}).select("AppointmentTime");
            
        const bookedTimes = bookedAppointments.map{
            (appointment) => appointment.appointmentTime
        };

        const slot = {};
        let {startHour , startMinute} = doctor.startTime
            .split(":")
            .map(Number);
        let{endHour , endMinute} = doctor.endTime
            .split(":")
            .map(Number);
        let currentMinutes = startHour * 60 + startMinute ;
        
        let endMinutes = endHour * 60 + endMinute;

        while(currentMinutes < endMinutes){
            const hour = Math.floor(currentMinutes % 60);
            const minute = currentMinutes % 60;
            const formattedTime = `${}`
            
        })
        

    } catch (error) {
        next(error);
    }
}