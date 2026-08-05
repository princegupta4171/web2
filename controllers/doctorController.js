const Doctor = require("../models/Doctor");
const Appointment = require("..models/Appointment");

const createDoctor = async(req,res,next) =>{
    try{
        const doctor = await Doctor.create(req.body);
        res.status(201).json({
            success:true,
            message:"Doctor registered succesfully",
            data:doctor
        })
    }catch(err){
        next(err);
    }
};

const getDoctors =async(req,res,next) =>{
    try{
        const{specialization , search,active}= req.query;
        const  filter ={};
        if(specialization){
            filter.specialization = {
                $regex:specialization,
                $options:"i"
            
            }
        }

        if(search){
            filter.$or =[
                {
                    name:{
                        $regex:search,
                        $options:"i"

                    },
                },{
                    specialization:{
                        $regex:search,
                        $options:"i"
                    }
                
                }
            ];
        }
        if(active !== undefined){
            filter.isActive = active === "true" ? true : false;
        }

        const doctors =(await Doctor.find(filter)).sort({createdAt : -1});
        res.json({
            success:true,
            count: doctor.length,
            data:doctors
        });
    }catch(err){
        next(err);
    }

};

const getSingleDoctor =async(req,res,next) =>{
    try{
        const{id} = req.params.id;
        const doctor = await Doctor.findById(id);
        if(!doctor){
            return res.status(403).json({
                success:false,
                message:"Doctor not found"        
            })
        }
        res.json({
            success:true,
            data:doctor
        });
    } catch(err){
        next(err);
    }

};

const updateDoctor =async(req,res,next) =>{
    try {
        const doctor = await Doctor.findByIdAndUpdate(
            req.params.id , 
            req.bod,
            {
                next:true,
                runValidators:true
            
            }
        );
        if(!doctor){
            return res.status(403).json({
                success:false,
                message:"Doctor not found"
            });
        }
        res.json({
            success:true,
            message:"Doctor updated successfully",
            data:doctor
        });

    } catch (error) {
        next(error);
    }
};


const statusDoctor = async(req,res,next) => {
    try{
        const{isActive} = req.body;
        const doctor = await Doctor.findByIdAndUpdate(
            req.params.id,
            {isActive},
            {
                next:true,
                runValidators:true
            }
        )
        if(!doctor){
            return res.status(403).json({
                success:false,
                message:"Doctor not found"
            });
        }
        res.json({
            success:true,
            message:"Doctor updated successfully",
            data:doctor
        });
    } catch (error){
        next(error);
    }
}

const getAllAppointment = async(req,res,next) => {
    try {
        const {id} = req.params;
        const appointments = await Appointment.find({
            doctor:id
        })
        .populate("patient" , "name,age,phone,gender")
        .sort({
            appointmentDate:1,
            appointmentTime:1
        });
        res.json({
            success:true,
            count:appointments.length,
            data:appointments
        });

    } catch (error) {
        next(error);
    }
};

module.exports = {createDoctor , getDoctors , getSingleDoctor , updateDoctor ,getAllAppointment , statusDoctor}; 