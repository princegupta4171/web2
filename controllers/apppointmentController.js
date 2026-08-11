const Appointment = require("../models/Appointment");
const Doctor = require("../models/Doctor");
const Patient = require("../models/Patient");

const generateAppointmentNumber = () => {
    const datePart = Date.now().toString().slice(-6);
    // console.log(Date.now().toString());
    const randomPart = Math.floor(100 + Math.random() * 100);
    // console.log(randomPart);
    return `APT-${datePart}-${randomPart}`;
};

console.log(generateAppointmentNumber());

const getDayName = (date) => {
    return new Intl.DateTimeFormat("en-US", {
        weekday: "long"
    }).format(date);
};

const normalizeDate = (dateValue) => {
    const date = new Date(dateValue);
    date.setHours(0, 0, 0, 0);
    return date;
};

const bookAppointment = async (req, res, next) => {
    try {
        const {
            doctorId, patientName, phone, email, age, gender, address, appointmentDate, appointmentTime, reason, symptoms, bookingType
        } = req.body;

        if (!doctorId || !patientName || !phone || age === undefined || !gender || !appointmentDate || !appointmentTime || !reason) {
            return res.status(400).json({
                success: false,
                message: "All Fields are required"
            });
        }
        const doctor = await Doctor.findById(doctorId);
        if (!doctor) {
            return res.status(400).json({
                success: false,
                message: "Invalid Doctor ID"
            });
        }
        if (!doctor.isActive) {
            return res.status(400).json({
                success: false,
                message: "Doctor is currently Unavailable"
            })
        }
        const selectedDate = normalizeDate(appointmentDate);
        const today = normalizeDate(new Date());
        if (selectedDate < today) {
            return res.status(400).json({
                success: false,
                message: "Past Date appointment is not allowed"
            });
        }
        const selectedDay = getDayName(selectedDate);
        if (!doctor.availableDays.includes(selectedDay)) {
            return res.status(400).json({
                success: false,
                message: `Doctor is not available on ${selectedDay}`
            })
        }

        if (appointmentTime < doctor.startTime || appointmentTime >= doctor.endTime) {
            return res.status(400).json({
                success: false,
                message: `Appointment Time must be between ${doctor.startTime} and ${doctor.endTime}`
            });
        }

        const existingAppointment = await Appointment.findOne({
            doctor: doctorId,
            appointmentDate: selectedDate,
            appointmentTime,
            status: {
                $ne: "Cancelled"
            }
        });

        if (existingAppointment) {
            return res.status(409).json({
                success: false,
                message: "This appointment slot is already booked"
            });
        }

        let patient = await Patient.findOne({
            phone,
            name: {
                $regex: `^${patientName}`,
                $options: "i"
            }
        });

        if (!patient) {
            patient = await Patient.create({
                name: patientName,
                phone,
                email,
                age,
                gender,
                address
            });
        }
        else {
            patient.age = age;
            patient.gender = gender
            if (email) {
                patient.email = email;
            }
            if (address) {
                patient.address = address;
            }
            await patient.save();
        }

        const appointmentCount = await Appointment.countDocuments({
            doctor: doctorId,
            appointmentDate: selectedDate,
            status: {
                $ne: "Cancelled"
            }
        });

        const tokenNumber = appointmentCount + 1;

        const appointment = await Appointment.create({
            appointmentNumber: generateAppointmentNumber(),
            doctor: doctorId,
            patient: patient._id,
            appointmentDate: selectedDate,
            appointmentTime,
            reason,
            symptoms: symptoms || [],
            bookingType: bookingType || "Online",
            consultationFee: doctor.consultationFee,
            tokenNumber
        });

        const populatedAppointment = await Appointment.findById(appointment._id)
            .populate("doctor", "name specialization consultationFee roomNumber")
            .populate("patient", "name age gender phone");

        res.status(201).json({
            success: true,
            message: "Appointment Booked Successfully",
            data: populatedAppointment
        });


    } catch (error) {
        next(error);
    }
};


const getAllAppointments = async (req, res, next) => {
    try {
        const { doctorId, patientId, status, date } = req.query;
        const filter = {};
        if (doctorId) {
            filter.doctor = doctorId;
        }
        if (patientId) {
            filter.patient = patientId;
        }
        if (status) {
            filter.status = status;
        }
        if (date) {
            filter.appointmentDate = normalizeDate(date);
        }

        const appointments = await Appointment.find(filter)
            .populate("doctor", "name specialization phone consultationFee")
            .populate("patient", "name age phone gender")
            .sort({ appointmentDate: 1, appointmentTime: 1 });

        res.json({
            success: true,
            count: appointments.length,
            data: appointments
        });

    } catch (error) {
        next(error);
    }
};

const getTodayAppointments = async (req, res, next) => {
    try {
        const today = normalizeDate(new Date());
        const appointments = await Appointment.find({ appointmentDate: today })
            .populate("doctor", "name phone consultationFee")
            .populate("patient", "name age phone gender")
            .sort({
                appointmentTime: 1
            });

        res.json({
            success: true,
            date: today,
            count: appointments.length,
            data: appointments
        })

    } catch (error) {
        next(error);
    }
};

const getAvailableSlotsforDoctor = async (req, res, next) => {
    try {
        const { doctorId } = req.params;
        const { date } = req.query;
        if (!date) {
            return res.status(400).json({
                success: false,
                message: "Date is required"
            });
        }
        const doctor = await Doctor.findById(doctorId);
        if (!doctor || !doctor.isActive) {
            return res.status(400).json({
                success: false,
                message: "Active Doctor not found"
            });
        }

        const selectedDate = normalizeDate(date);
        const selectedDay = getDayName(selectedDate);
        if (!doctor.availableDays.includes(selectedDay)) {
            return res.status(400).json({
                success: false,
                message: `Doctor is unavailable on ${selectedDay}`,
                data: []
            })
        }

        const bookedAppointments = await Appointment.find({
            doctor: doctor._id,
            appointmentDate: selectedDate,
            status: {
                $ne: "Cancelled"
            }
        }).select("appoitmentTime");

        const bookedTimes = bookedAppointments.map(
            (appointment) => appointment.appointmentTime
        );

        const slots = [];
        let [startHour, startMinute] = doctor.startTime
            .split(":")
            .map(Number);
        let [endHour, endMinute] = doctor.endTime
            .split(":")
            .map(Number);
        let currentMinutes = startHour * 60 + startMinute; // 690
        let endMinutes = endHour * 60 + endMinute; // 810

        while (currentMinutes < endMinutes) {  // 735
            const hour = Math.floor(currentMinutes / 60); // 12
            const minute = currentMinutes % 60;  // 15
            const formattedTime = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
            // 12:00
            slots.push({
                time: formattedTime,
                available: !bookedTimes.include(formattedTime)
            });
            currentMinutes = currentMinutes + doctor.slotDuration;
        }

        res.json({
            success: true,
            doctor: {
                id: doctor._id,
                name: doctor.name,
                slotDuration: doctor.slotDuration
            },
            date: selectedDate,
            data: slots
        });
    } catch (error) {
        next(error);
    }
};

const getSingleAppointmentDetails = async (req, res, next) => {
    try {
        const { id } = req.params;
        const appointment = await Appointment.findById(id)
            .populate("doctor", "name specialization phone consultationFee")
            .populate("patient", "name age phone gender");
        if (!appointment) {
            return res.status(403).json({
                success: false,
                message: "Appointment not found"
            });
        }
        res.json({
            success: true,
            data: appointment
        });
    } catch (error) {
        next(error);
    }
};

const updateAppointmentStatus = async (req, res, next) => {
    try {
        const { status } = req.body
        const allowedStatuses = ["Pending", "Confirmed", "Checked-In", "Completed", "Cancelled"];
        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid Appointment Status"
            });
        }
        const appointment = await Appointment.findById(req.params.id);
        if (!appointment) {
            return res.status(403).json({
                success: false,
                message: "Appointment Not Found"
            });
        }
        appointment.status = status;
        await appointment.save();

        if (status === "Completed") {
            await Patient.findByIdAndUpdate(appointment.patient, {
                $inc: {
                    totalVisits: 1
                },
                lastVisit: new Date()
            });
        }

        const updatedAppointment = await Appointment.find(req.params.id)
            .populate("doctor", "name specialization")
            .populate("patient", "name phone totalVisits");

        res.json({
            success: true,
            message: `Appointment Status changed to ${status}`,
            data: updatedAppointment
        });
    } catch (error) {
        next(error);
    }
};

const updatePaymentStatus = async (req, res, next) => {
    try {
        const { paymentStatus } = req.body;
        const allowedStatuses = ["Pending", "Paid", "Refunded"];
        if (!allowedStatuses.includes(paymentStatus)) {
            return res.status(400).json({
                success: false,
                message: "Invalid Payment Status"
            });
        }

        const appointment = await Appointment.findByIdAndUpdate(req.params.id,
            { paymentStatus },
            { new: true, runValidators: true }
        );

        if (!appointment) {
            return res.status(403).json({
                success: false,
                message: "Appointment Not Found"
            });
        }

        res.json({
            success:true,
            message:"Payment Status Updated",
            data:appointment
        });
    } catch (error) {
        next(error);
    }
};
