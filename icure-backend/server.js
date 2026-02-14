const express = require('express');
const cors = require('cors');
require('dotenv').config();
const pool = require('./config/database');
const { hashPassword } = require('./utils/hashPassword');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Import Routes
const authRoutes = require('./routes/auth.routes');
const doctorRoutes = require('./routes/doctor.routes');
const appointmentRoutes = require('./routes/appointments.routes');
const blockedSlotsRoutes = require('./routes/blockedSlots.routes');
const reviewRoutes = require('./routes/reviews.routes');
const documentRoutes = require('./routes/documents.routes');
const patientRoutes = require('./routes/patients.routes'); // Added patientRoutes

// Use Routes
app.use('/api/auth', authRoutes);
app.use('/api/doctor', doctorRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/blocked-slots', blockedSlotsRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/patients', patientRoutes); // Added patientRoutes

// Doctor Initial Setup
const setupDoctorAccount = async () => {
  try {
    const doctorUsername = process.env.DOCTOR_USERNAME;
    const doctorPassword = process.env.DOCTOR_PASSWORD;

    if (!doctorUsername || !doctorPassword) {
      console.warn('Doctor username or password not set in .env. Skipping initial doctor setup.');
      return;
    }

    const result = await pool.query('SELECT * FROM doctor LIMIT 1');
    if (result.rows.length === 0) {
      // No doctor record found, create one
      const hashedPassword = await hashPassword(doctorPassword);
      console.log('setupDoctorAccount: Doctor Password from .env:', doctorPassword);
      console.log('setupDoctorAccount: Hashed Password for new doctor:', hashedPassword);
      await pool.query(
        'INSERT INTO doctor (username, password, full_name, specialization, qualifications, experience_years, consultation_fee, bio, profile_image_url) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)',
        [
          doctorUsername,
          hashedPassword, 'Dr. Noreen Abid', // Default name
          'General Physician', // Default specialization
          'MBBS, FCPS', // Default qualifications
          10, // Default experience
          500, // Default fee
          'Experienced physician providing comprehensive healthcare.', // Default bio
          'https://res.cloudinary.com/dc7o6m23d/image/upload/v1700000000/default_doctor.png', // Default image
        ]
      );
      console.log('Default doctor account created.');
    } else {
      console.log('Doctor account already exists.');
    }
  } catch (error) {
    console.error('Error setting up doctor account:', error);
  }
};

// Test DB connection
app.get('/api/test-db', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.status(200).send('Database connected successfully!');
  } catch (error) {
    console.error('Database connection error:', error);
    res.status(500).send('Database connection failed.');
  }
});


// Centralized Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('API Error:', err.stack);
  res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

// Process Error Listeners
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception thrown:', err);
  // Keep server running if possible, or exit gracefully
});

app.listen(PORT, async () => {
  console.log(`🚀 iCure Server running on port ${PORT}`);
  console.log('--- Environment Check ---');
  console.log('DB URL:', process.env.DATABASE_URL ? 'PRESENT' : 'MISSING');
  console.log('DOCTOR:', process.env.DOCTOR_USERNAME || 'NOT SET');

  await setupDoctorAccount();
  console.log('Initialization complete. Server is active and listening...');
});
