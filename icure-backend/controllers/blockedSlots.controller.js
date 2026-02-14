const pool = require('../config/database');

// GET /api/blocked-slots - Get all blocked slots
const getAllBlockedSlots = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM blocked_slots ORDER BY block_date ASC, start_time ASC');
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching blocked slots:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/blocked-slots - Create blocked slot (Doctor only)
const createBlockedSlot = async (req, res) => {
  const { block_date, start_time, end_time, reason } = req.body;

  if (!block_date || !start_time || !end_time || !reason) {
    return res.status(400).json({ message: 'All fields (block_date, start_time, end_time, reason) are required' });
  }

  try {
    // Basic validation: ensure end_time is after start_time
    if (end_time <= start_time) {
      return res.status(400).json({ message: 'End time must be after start time' });
    }

    const result = await pool.query(
      'INSERT INTO blocked_slots (block_date, start_time, end_time, reason) VALUES ($1, $2, $3, $4) RETURNING *',
      [block_date, start_time, end_time, reason]
    );
    res.status(201).json({ message: 'Blocked slot created successfully', blockedSlot: result.rows[0] });
  } catch (error) {
    console.error('Error creating blocked slot:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// DELETE /api/blocked-slots/:id - Delete blocked slot (Doctor only)
const deleteBlockedSlot = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query('DELETE FROM blocked_slots WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Blocked slot not found' });
    }
    res.status(200).json({ message: 'Blocked slot deleted successfully' });
  } catch (error) {
    console.error('Error deleting blocked slot:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getAllBlockedSlots,
  createBlockedSlot,
  deleteBlockedSlot,
};
