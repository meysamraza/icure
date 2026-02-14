const express = require('express');
const router = express.Router();
const patientsController = require('../controllers/patients.controller');
const { authenticateToken, isDoctor } = require('../middleware/auth');

// Protected routes (Doctor only)
router.get('/', authenticateToken, isDoctor, patientsController.getAllPatients);
router.get('/:id', authenticateToken, isDoctor, patientsController.getPatientDetails);

module.exports = router;
