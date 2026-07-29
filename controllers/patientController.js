const Patient = require("../models/Patient");
const Appointment = require("../models/Appointment");
const { search } = require("../routes/doctorRoutes");

const getPatient =async(req,res,next) =>{
    try{
        const filter ={};
        if(search){
            filter.$or = [
                {
                    name:{
                        $regex:search,
                        $option:"i"
                    },
                },{  
                    phone:{
                        $regex:search,
                        $option:"i"
                    }
                }
            ];
        }

        const patients = await Patient.find(filter)
            .sort({ createdAt: -1});
        res.json({
            success:true,
            count:patients.length,
            data:patients
        });
    }catch(error){
        next(error);
    }
};


const getSinglePatient=async(req,res,next) =>{
    try {
        const{ id } = req.params;
        const patient = await Patient.findById(id);
        if(!patient){
            return res.status(403).json({
                success:false,
                message:"Patient not found"
            })          
        }
        res.json({
            success:true,
            data:patient
        })
    } catch (error) {
        next(error);
    }
}
const getPatientAppointment = async(req,res,next) => {
    try {
        const {id} = req.params;
        const appointments = await Appointment.find({
            patient:id
        })
            .populate("doctor","name specialization consultationfees roomNumber" )
             .sort({
                  appointmentDate:1
                 })
        res.json({
            success:true,
            count:appointments.length,
            data:appointments
        });

    } catch (error) {
        next(error);
    }
}

module.exports= {getPatient , getSinglePatient, getPatientAppointment};