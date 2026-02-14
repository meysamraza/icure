const pool = require('../config/database');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { hashPassword, comparePassword } = require('../utils/hashPassword');

const generateToken = (user) => {
  return jwt.sign(user, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// Patient Signup
const signup = async (req, res) => {
  const { username, password, full_name, phone, whatsapp_number } = req.body;
  try {
    // Check if username already exists
    const existingUser = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: 'Username already taken' });
    }

    const hashedPassword = await hashPassword(password);
    const newUser = await pool.query(
      'INSERT INTO users (username, password, full_name, phone, whatsapp_number, role) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, username, full_name, role',
      [username, hashedPassword, full_name, phone, whatsapp_number, 'patient']
    );

    const user = newUser.rows[0];
    const token = generateToken({ id: user.id, username: user.username, role: user.role });

    res.status(201).json({ token, user: { id: user.id, username: user.username, full_name: user.full_name, role: user.role } });
  } catch (error) {
    console.error('Detailed Error in patient signup:', error);
    console.error('Error details:', error.message, error.stack);
    res.status(500).json({ message: 'Server error', details: error.message });
  }
};

// Patient Login
const login = async (req, res) => {
  const { username, password } = req.body;
  try {
    const userResult = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    if (userResult.rows.length === 0) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const user = userResult.rows[0];
    const isMatch = await comparePassword(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = generateToken({ id: user.id, username: user.username, role: user.role });
    res.status(200).json({ token, user: { id: user.id, username: user.username, full_name: user.full_name, role: user.role } });
  } catch (error) {
    console.error('Error in patient login:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Doctor Admin Login
const adminLogin = async (req, res) => {
  const { username, password } = req.body;
  try {
    const doctorResult = await pool.query('SELECT * FROM doctor WHERE username = $1', [username]);
    if (doctorResult.rows.length === 0) {
      return res.status(400).json({ message: 'Invalid admin credentials' });
    }

    const doctor = doctorResult.rows[0];
    console.log('adminLogin: Provided Password:', password);
    console.log('adminLogin: Stored Hashed Password:', doctor.password);
    const isMatch = await comparePassword(password, doctor.password);
    console.log('adminLogin: Password Match Result:', isMatch);

    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid admin credentials' });
    }

    const token = generateToken({ id: doctor.id, username: doctor.username, role: 'doctor' });
    res.status(200).json({ token, user: { id: doctor.id, username: doctor.username, role: 'doctor' } });
  } catch (error) {
    console.error('Error in admin login:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get current user info (for /api/auth/me)
const getCurrentUser = async (req, res) => {
  try {
    if (req.user.role === 'patient') {
      const userResult = await pool.query('SELECT id, username, full_name, phone, whatsapp_number, role FROM users WHERE id = $1', [req.user.id]);
      if (userResult.rows.length === 0) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.status(200).json(userResult.rows[0]);
    } else if (req.user.role === 'doctor') {
      const doctorResult = await pool.query('SELECT id, username, full_name, specialization, experience_years, consultation_fee, bio, profile_image_url FROM doctor WHERE id = $1', [req.user.id]);
      if (doctorResult.rows.length === 0) {
        return res.status(404).json({ message: 'Doctor not found' });
      }
      res.status(200).json(doctorResult.rows[0]);
    } else {
      res.status(403).json({ message: 'Unknown user role' });
    }
  } catch (error) {
    console.error('Error fetching current user:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


module.exports = {
  signup,
  login,
  adminLogin,
  getCurrentUser,
};
