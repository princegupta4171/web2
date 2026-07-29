const Patient = require("../models/Patient");
const { search } = require("../routes/doctorRoutes");

const getPatients =async(req,res,next) =>{
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
    
}