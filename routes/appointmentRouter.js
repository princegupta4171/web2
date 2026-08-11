const express = require("express");
const { bookAppointment, getAllAppointments, getTodayAppointments, getAvailableSlotsforDoctor, getSingleAppointmentDetails, updateAppointmentStatus, updatePaymentStatus } = require("../controllers/apppointmentController");
const router = express.router();

router.post("/book",bookAppointment);
router.get("/",getAllAppointments);
router.get("/today",getTodayAppointments);
router.get("/available-slots/doctorId",getAvailableSlotsforDoctor);
router.get("/:id",getSingleAppointmentDetails);
router.patch("/:id/status",updateAppointmentStatus);
router.patch("/:id/payment" , updatePaymentStatus);

module.exports = router;