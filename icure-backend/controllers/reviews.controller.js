const pool = require('../config/database');

// GET /api/reviews - Get all verified reviews (public)
const getAllReviews = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        r.id, r.rating, r.review_text, r.created_at,
        u.full_name AS patient_name, u.username AS patient_username
      FROM reviews r
      JOIN users u ON r.patient_id = u.id
      WHERE r.is_verified = TRUE
      ORDER BY r.created_at DESC
    `);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching all reviews:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/reviews - Write a review (Patient only)
const writeReview = async (req, res) => {
  const patient_id = req.user.id;
  const { rating, review_text } = req.body;

  if (!rating || !review_text) {
    return res.status(400).json({ message: 'Rating and review text are required' });
  }
  if (rating < 1 || rating > 5) {
    return res.status(400).json({ message: 'Rating must be between 1 and 5' });
  }

  try {
    // Check if patient has completed at least one appointment
    const completedAppointments = await pool.query(
      'SELECT COUNT(*) FROM appointments WHERE patient_id = $1 AND status = $2',
      [patient_id, 'completed']
    );

    if (parseInt(completedAppointments.rows[0].count, 10) === 0) {
      return res.status(403).json({ message: 'You must have at least one completed appointment to write a review' });
    }

    const result = await pool.query(
      'INSERT INTO reviews (patient_id, rating, review_text, is_verified) VALUES ($1, $2, $3, TRUE) RETURNING *',
      [patient_id, rating, review_text]
    );
    res.status(201).json({ message: 'Review submitted successfully', review: result.rows[0] });
  } catch (error) {
    console.error('Error submitting review:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/reviews/stats - Get average rating and total count (public)
const getReviewStats = async (req, res) => {
  try {
    const avgRatingResult = await pool.query(
      'SELECT AVG(rating) AS average_rating, COUNT(*) AS total_reviews FROM reviews WHERE is_verified = TRUE'
    );
    const stats = avgRatingResult.rows[0];
    res.status(200).json({
      average_rating: parseFloat(stats.average_rating || 0).toFixed(2),
      total_reviews: parseInt(stats.total_reviews, 10),
    });
  } catch (error) {
    console.error('Error fetching review stats:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getAllReviews,
  writeReview,
  getReviewStats,
};
