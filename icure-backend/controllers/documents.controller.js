const pool = require('../config/database');
const cloudinary = require('../config/cloudinary');
const fs = require('fs'); // For file system operations (to delete local file after upload)

// POST /api/documents/upload - Upload file to Cloudinary and store URL in DB (Patient only)
const uploadDocument = async (req, res) => {
  const patient_id = req.user.id;
  const { appointment_id } = req.body; // Optional: link to a specific appointment

  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  try {
    const filePath = req.file.path;
    const fileName = req.file.originalname;

    // Upload image to Cloudinary
    const uploadResult = await cloudinary.uploader.upload(filePath, {
      folder: `medical_documents/patient_${patient_id}`,
      resource_type: "auto" // Auto detect resource type (image, pdf, etc.)
    });
    const fileUrl = uploadResult.secure_url;
    const publicId = uploadResult.public_id; // Store public_id to allow deletion later

    // Delete the local file after uploading to Cloudinary
    fs.unlink(filePath, (err) => {
      if (err) console.error('Error deleting local file:', err);
    });

    const newDocument = await pool.query(
      'INSERT INTO medical_documents (patient_id, file_name, file_url, cloudinary_public_id, appointment_id) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [patient_id, fileName, fileUrl, publicId, appointment_id || null]
    );

    res.status(201).json({ message: 'Document uploaded successfully', document: newDocument.rows[0] });
  } catch (error) {
    console.error('Error uploading document:', error);
    if (req.file) {
      fs.unlink(req.file.path, (err) => { // Ensure local file is deleted on error
        if (err) console.error('Error deleting local file after upload error:', err);
      });
    }
    res.status(500).json({ message: 'Server error during document upload' });
  }
};

// GET /api/documents/my-documents - Get all documents uploaded by patient (Patient only)
const getMyDocuments = async (req, res) => {
  const patient_id = req.user.id;
  try {
    const documents = await pool.query(
      'SELECT md.*, a.appointment_date, a.appointment_time FROM medical_documents md LEFT JOIN appointments a ON md.appointment_id = a.id WHERE md.patient_id = $1 ORDER BY md.uploaded_at DESC',
      [patient_id]
    );
    res.status(200).json(documents.rows);
  } catch (error) {
    console.error('Error fetching patient documents:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// DELETE /api/documents/:id - Delete document (Patient only)
const deleteDocument = async (req, res) => {
  const { id } = req.params;
  const patient_id = req.user.id;

  try {
    const documentResult = await pool.query(
      'SELECT cloudinary_public_id FROM medical_documents WHERE id = $1 AND patient_id = $2',
      [id, patient_id]
    );

    if (documentResult.rows.length === 0) {
      return res.status(404).json({ message: 'Document not found or not owned by patient' });
    }

    const { cloudinary_public_id } = documentResult.rows[0];

    // Delete from Cloudinary
    if (cloudinary_public_id) {
      await cloudinary.uploader.destroy(cloudinary_public_id, { resource_type: "auto" });
    }

    // Delete from database
    await pool.query('DELETE FROM medical_documents WHERE id = $1', [id]);

    res.status(200).json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Error deleting document:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  uploadDocument,
  getMyDocuments,
  deleteDocument,
};
