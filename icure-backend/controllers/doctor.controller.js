const pool = require('../config/database');
const cloudinary = require('../config/cloudinary');

// Get doctor profile (public)
const getDoctorProfile = async (req, res) => {
  try {
    const result = await pool.query('SELECT id, full_name, specialization, qualifications, experience_years, consultation_fee, bio, profile_image_url FROM doctor LIMIT 1');
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Doctor profile not found' });
    }
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching doctor profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update doctor profile (Doctor only)
const updateDoctorProfile = async (req, res) => {
  const { full_name, specialization, qualifications, experience_years, consultation_fee, bio } = req.body;
  const profile_image_url_from_upload = req.file ? req.file.path : null; // Multer adds file to req.file

  try {
    let imageUrl = null;
    if (profile_image_url_from_upload) {
      // Upload image to Cloudinary
      const uploadResult = await cloudinary.uploader.upload(profile_image_url_from_upload, {
        folder: 'doctor_profiles',
      });
      imageUrl = uploadResult.secure_url;
      // TODO: Optionally delete old image from Cloudinary if updating
    }

    const result = await pool.query('SELECT id FROM doctor LIMIT 1');
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Doctor profile not found for update' });
    }
    const doctorId = result.rows[0].id;

    // Build the query dynamically based on provided fields
    const updates = [];
    const values = [];
    let paramIndex = 1;

    if (full_name !== undefined) { updates.push(`full_name = $${paramIndex++}`); values.push(full_name); }
    if (specialization !== undefined) { updates.push(`specialization = $${paramIndex++}`); values.push(specialization); }
    if (qualifications !== undefined) { updates.push(`qualifications = $${paramIndex++}`); values.push(qualifications); }
    if (experience_years !== undefined) { updates.push(`experience_years = $${paramIndex++}`); values.push(experience_years); }
    if (consultation_fee !== undefined) { updates.push(`consultation_fee = $${paramIndex++}`); values.push(consultation_fee); }
    if (bio !== undefined) { updates.push(`bio = $${paramIndex++}`); values.push(bio); }
    if (imageUrl) { updates.push(`profile_image_url = $${paramIndex++}`); values.push(imageUrl); }

    if (updates.length === 0) {
      return res.status(400).json({ message: 'No fields provided for update' });
    }

    values.push(doctorId); // Add doctorId for WHERE clause
    const updateQuery = `UPDATE doctor SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING id, full_name, specialization, qualifications, experience_years, consultation_fee, bio, profile_image_url`;

    const updatedDoctor = await pool.query(updateQuery, values);

    res.status(200).json(updatedDoctor.rows[0]);
  } catch (error) {
    console.error('Detailed Error updating doctor profile:', error);
    console.error('Error details:', error.message, error.stack);
    res.status(500).json({ message: 'Server error', details: error.message });
  }
};

// Get doctor statistics (Doctor only)
const getDoctorStats = async (req, res) => {
  try {
    // Total appointments today
    const today = new Date().toISOString().split('T')[0];
    const appointmentsTodayResult = await pool.query(
      'SELECT COUNT(*) FROM appointments WHERE appointment_date = $1',
      [today]
    );
    const totalAppointmentsToday = parseInt(appointmentsTodayResult.rows[0].count, 10);

    // Pending appointments count
    const pendingAppointmentsResult = await pool.query(
      'SELECT COUNT(*) FROM appointments WHERE status = $1',
      ['pending']
    );
    const pendingAppointmentsCount = parseInt(pendingAppointmentsResult.rows[0].count, 10);

    // Total patients (distinct users who booked an appointment or signed up)
    const totalPatientsResult = await pool.query(
      'SELECT COUNT(DISTINCT id) FROM users'
    );
    const totalPatients = parseInt(totalPatientsResult.rows[0].count, 10);

    // Average rating
    const avgRatingResult = await pool.query(
      'SELECT AVG(rating) FROM reviews WHERE is_verified = TRUE'
    );
    const averageRating = parseFloat(avgRatingResult.rows[0].avg || 0).toFixed(2);

    res.status(200).json({
      totalAppointmentsToday,
      pendingAppointmentsCount,
      totalPatients,
      averageRating,
    });
  } catch (error) {
    console.error('Error fetching doctor statistics:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


module.exports = {
  getDoctorProfile,
  updateDoctorProfile,
  getDoctorStats,
};