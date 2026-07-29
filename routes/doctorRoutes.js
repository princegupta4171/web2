const express = require('express');
const { createDoctor, getDoctors, updateDoctor, getSingleDoctor, statusDoctor, getAllAppointment } = require('../controllers/doctorController');
const router = express.Router();

router.post("/",createDoctor);
router.get("/",getDoctors);
router.get("/:id",getSingleDoctor);
router.patch("/:id",updateDoctor);
router.patch("/:id", statusDoctor);
router.get("/:id/appointment" , getAllAppointment);

module.exports = router;
