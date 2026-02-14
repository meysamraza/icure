const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { authenticateToken } = require('../middleware/auth');

// Patient Authentication
router.post('/signup', authController.signup);
router.post('/login', authController.login);

// Doctor Admin Authentication
router.post('/admin/login', authController.adminLogin);

// Get current authenticated user details
router.get('/me', authenticateToken, authController.getCurrentUser);

module.exports = router;
