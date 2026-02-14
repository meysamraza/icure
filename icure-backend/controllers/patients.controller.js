const pool = require('../config/database');

// GET /api/patients - Get all registered patients (Doctor only)
const getAllPatients = async (req, res) => {
  try {
    const patients = await pool.query(`
      SELECT
        u.id,
        u.username,
        u.full_name,
        u.phone,
        u.whatsapp_number,
        COUNT(a.id) AS appointment_count
      FROM
        users u
      LEFT JOIN
        appointments a ON u.id = a.patient_id
      WHERE
        u.role = 'patient'
      GROUP BY
        u.id, u.username, u.full_name, u.phone, u.whatsapp_number
      ORDER BY
        u.full_name ASC
    `);
    res.status(200).json(patients.rows);
  } catch (error) {
    console.error('Error fetching all patients:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/patients/:id - Get patient details (Doctor only)
const getPatientDetails = async (req, res) => {
  const { id } = req.params;
  try {
    const patientResult = await pool.query(
      'SELECT id, username, full_name, phone, whatsapp_number FROM users WHERE id = $1 AND role = $2',
      [id, 'patient']
    );

    if (patientResult.rows.length === 0) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    const patient = patientResult.rows[0];

    // Get appointment history for this patient
    const appointmentsHistory = await pool.query(
      'SELECT * FROM appointments WHERE patient_id = $1 ORDER BY appointment_date DESC, appointment_time DESC',
      [id]
    );

    // Get uploaded documents for this patient
    const documents = await pool.query(
      'SELECT * FROM medical_documents WHERE patient_id = $1 ORDER BY uploaded_at DESC',
      [id]
    );

    // Get reviews given by this patient
    const reviews = await pool.query(
      'SELECT * FROM reviews WHERE patient_id = $1 ORDER BY created_at DESC',
      [id]
    );

    res.status(200).json({
      ...patient,
      appointments: appointmentsHistory.rows,
      documents: documents.rows,
      reviews: reviews.rows,
    });
  } catch (error) {
    console.error('Error fetching patient details:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getAllPatients,
  getPatientDetails,
};
