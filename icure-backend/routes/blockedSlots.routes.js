const express = require('express');
const router = express.Router();
const blockedSlotsController = require('../controllers/blockedSlots.controller');
const { authenticateToken, isDoctor } = require('../middleware/auth');

// Get all blocked slots (can be public for calendar display)
router.get('/', blockedSlotsController.getAllBlockedSlots);

// Protected routes (Doctor only)
router.post('/', authenticateToken, isDoctor, blockedSlotsController.createBlockedSlot);
router.delete('/:id', authenticateToken, isDoctor, blockedSlotsController.deleteBlockedSlot);

module.exports = router;
