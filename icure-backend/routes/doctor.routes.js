const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctor.controller');
const { authenticateToken, isDoctor } = require('../middleware/auth');
const upload = require('../middleware/upload'); // For image uploads

// Public route to get doctor profile
router.get('/profile', doctorController.getDoctorProfile);

// Protected route to update doctor profile (Doctor only)
router.put('/profile', authenticateToken, isDoctor, upload.single('profile_image'), doctorController.updateDoctorProfile);

// Protected route to get doctor dashboard statistics (Doctor only)
router.get('/stats', authenticateToken, isDoctor, doctorController.getDoctorStats);


module.exports = router;
