const express = require('express');
const router = express.Router();
const appointmentsController = require('../controllers/appointments.controller');
const { authenticateToken, isPatient, isDoctor } = require('../middleware/auth');

// Public/Patient routes
router.get('/available-slots', appointmentsController.getAvailableTimeSlots);
router.post('/book', authenticateToken, isPatient, appointmentsController.bookAppointment);
router.get('/my-appointments', authenticateToken, isPatient, appointmentsController.getMyAppointments);
router.put('/:id/cancel', authenticateToken, isPatient, appointmentsController.cancelAppointment);

// Doctor (Admin) routes
router.get('/all', authenticateToken, isDoctor, appointmentsController.getAllAppointments);
router.put('/:id/approve', authenticateToken, isDoctor, appointmentsController.approveAppointment);
router.put('/:id/reject', authenticateToken, isDoctor, appointmentsController.rejectAppointment);
router.put('/:id/complete', authenticateToken, isDoctor, appointmentsController.completeAppointment);

module.exports = router;
