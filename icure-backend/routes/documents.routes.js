const express = require('express');
const router = express.Router();
const documentsController = require('../controllers/documents.controller');
const { authenticateToken, isPatient } = require('../middleware/auth');
const upload = require('../middleware/upload'); // Multer for file uploads

// Protected patient routes
router.post('/upload', authenticateToken, isPatient, upload.single('document'), documentsController.uploadDocument);
router.get('/my-documents', authenticateToken, isPatient, documentsController.getMyDocuments);
router.delete('/:id', authenticateToken, isPatient, documentsController.deleteDocument);

module.exports = router;
