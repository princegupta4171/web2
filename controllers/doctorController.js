const Doctor = require("../models/Doctor");
const Appointment = require("..models/Appointment");

const createDoctor = async(req,res,next) =>{
    try{
        const doctor = await Doctor.create(req.body);
        res.status(201).json({
            success:true,
            message:"DOctor registered succesfully",
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

}