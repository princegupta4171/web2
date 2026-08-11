const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const errorHandler = require("../middleware/errorMiddleware");
dotenv.config();
connectDB();
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.get("/",(req,res)=>{
    res.json({
        success : true,
        message : "API is running"
    });
});

const doctorRoutes = require("./routes/doctorRoutes");
const patientRoutes = require("./routes/patientRoutes");
const appointmentRoutes = require("./routes/appointmentRouter");

app.use("/api/doctors",doctorRoutes);
app.use("/api/patients", patientRoutes);
app.use("/api/appointments", appointmentRoutes);

app.use((req,res)=>{
    res.status(404).json({
        success:false,
        message:"API route not found"
    });
});
app.use(errorHandler);
const PORT = process.env.PORT || 5000;
app.listen(PORT, ()=>{
    console.log(`Server is running on http://localhost:${PORT}`);
});






