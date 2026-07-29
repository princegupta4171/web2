const express = require('express');
const { getPatient, getSinglePatient, getPatientAppointment } = require('../controllers/patientController');
const router = express.Router();

router.get("/",getPatient);
router.get("/:id",getSinglePatient);
router.get("/:id/appointments" , getPatientAppointment);

module.exports = router;