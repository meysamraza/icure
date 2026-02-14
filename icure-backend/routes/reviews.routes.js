const express = require('express');
const router = express.Router();
const reviewsController = require('../controllers/reviews.controller');
const { authenticateToken, isPatient } = require('../middleware/auth');

// Public routes
router.get('/', reviewsController.getAllReviews);
router.get('/stats', reviewsController.getReviewStats);

// Protected patient route
router.post('/', authenticateToken, isPatient, reviewsController.writeReview);

module.exports = router;
