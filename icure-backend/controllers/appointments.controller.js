const pool = require('../config/database');
const { generateTimeSlots } = require('../utils/generateSlots');

// Helper to check if a date is a Sunday
const isSunday = (dateString) => {
  // dateString is expected to be YYYY-MM-DD
  const [year, month, day] = dateString.split('-').map(Number);
  // Using Date.UTC and getUTCDay to avoid timezone offset issues
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCDay() === 0; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
};

// GET /api/appointments/available-slots
const getAvailableTimeSlots = async (req, res) => {
  const { date } = req.query; // date in YYYY-MM-DD format

  if (!date) {
    return res.status(400).json({ message: 'Date is required' });
  }

  if (isSunday(date)) {
    return res.status(200).json({ slots: [], message: 'Clinic is closed on Sundays' });
  }

  // Use UTC date parsing to match isSunday logic
  const today = new Date();
  const todayUTC = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()));

  const [year, month, day] = date.split('-').map(Number);
  const selectedUTC = new Date(Date.UTC(year, month - 1, day));

  if (selectedUTC < todayUTC) {
    return res.status(200).json({ slots: [], message: 'Cannot book appointments for past dates' });
  }

  try {
    const allSlots = generateTimeSlots();

    // Fetch booked slots for the given date
    const bookedSlotsResult = await pool.query(
      'SELECT appointment_time FROM appointments WHERE appointment_date = $1 AND status IN ($2, $3)',
      [date, 'pending', 'approved']
    );
    const bookedTimes = new Set(bookedSlotsResult.rows.map(row => row.appointment_time));

    // Fetch blocked slots for the given date
    const blockedSlotsResult = await pool.query(
      'SELECT start_time, end_time FROM blocked_slots WHERE block_date = $1',
      [date]
    );

    let availableSlots = allSlots.filter(slot => !bookedTimes.has(slot));

    // Filter out blocked time ranges
    blockedSlotsResult.rows.forEach(blocked => {
      const blockedStartTime = blocked.start_time; // HH:MM
      const blockedEndTime = blocked.end_time;   // HH:MM

      availableSlots = availableSlots.filter(slot => {
        // Compare slot with blocked range
        // If slot >= blockedStartTime and slot < blockedEndTime, then it's blocked
        return !(slot >= blockedStartTime && slot < blockedEndTime);
      });
    });

    res.status(200).json({ slots: availableSlots });
  } catch (error) {
    console.error('Error fetching available time slots:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/appointments/book (Patient only)
const bookAppointment = async (req, res) => {
  const patient_id = req.user.id;
  const { appointment_date, appointment_time, patient_notes, document_ids } = req.body; // document_ids is an array of UUIDs

  if (!appointment_date || !appointment_time) {
    return res.status(400).json({ message: 'Appointment date and time are required' });
  }

  if (isSunday(appointment_date)) {
    return res.status(400).json({ message: 'Clinic is closed on Sundays' });
  }

  // Use UTC date parsing for consistency
  const today = new Date();
  const todayUTC = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()));

  const [year, month, day] = appointment_date.split('-').map(Number);
  const selectedUTC = new Date(Date.UTC(year, month - 1, day));

  // For same-day appointments, check if the time has passed
  if (selectedUTC.getTime() === todayUTC.getTime()) {
    const [hours, minutes] = appointment_time.split(':').map(Number);
    const now = new Date();
    const appointmentDateTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes);

    if (appointmentDateTime < now) {
      return res.status(400).json({ message: 'Cannot book appointments in the past' });
    }
  } else if (selectedUTC < todayUTC) {
    return res.status(400).json({ message: 'Cannot book appointments for past dates' });
  }

  try {
    // Re-check slot availability to prevent double booking or booking blocked slots
    const allSlots = generateTimeSlots();
    if (!allSlots.includes(appointment_time)) {
      return res.status(400).json({ message: 'Invalid appointment time' });
    }

    const bookedSlotsResult = await pool.query(
      'SELECT appointment_time FROM appointments WHERE appointment_date = $1 AND appointment_time = $2 AND status IN ($3, $4)',
      [appointment_date, appointment_time, 'pending', 'approved']
    );
    if (bookedSlotsResult.rows.length > 0) {
      return res.status(409).json({ message: 'Selected time slot is already booked' });
    }

    const blockedSlotsResult = await pool.query(
      'SELECT start_time, end_time FROM blocked_slots WHERE block_date = $1',
      [appointment_date]
    );

    const isBlocked = blockedSlotsResult.rows.some(blocked => {
      return appointment_time >= blocked.start_time && appointment_time < blocked.end_time;
    });

    if (isBlocked) {
      return res.status(409).json({ message: 'Selected time slot is blocked' });
    }

    // Insert new appointment
    const newAppointment = await pool.query(
      'INSERT INTO appointments (patient_id, appointment_date, appointment_time, patient_notes, status) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [patient_id, appointment_date, appointment_time, patient_notes, 'pending']
    );
    const appointment = newAppointment.rows[0];

    // Link documents to the appointment if provided
    if (document_ids && document_ids.length > 0) {
      // Assuming document_ids are UUIDs and already exist in medical_documents table
      // You might need an intermediate table if one document can be linked to multiple appointments
      // Or simply update the medical_documents entry with appointment_id
      await Promise.all(document_ids.map(doc_id =>
        pool.query('UPDATE medical_documents SET appointment_id = $1 WHERE id = $2 AND patient_id = $3', [appointment.id, doc_id, patient_id])
      ));
    }

    res.status(201).json({ message: 'Appointment booked successfully', appointment });
  } catch (error) {
    console.error('Error booking appointment:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/appointments/my-appointments (Patient only)
const getMyAppointments = async (req, res) => {
  const patient_id = req.user.id;
  try {
    const appointments = await pool.query(
      'SELECT a.*, md.id AS document_id, md.file_url, md.file_name FROM appointments a LEFT JOIN medical_documents md ON a.id = md.appointment_id WHERE a.patient_id = $1 ORDER BY appointment_date DESC, appointment_time DESC',
      [patient_id]
    );

    // Group documents by appointment
    const groupedAppointments = appointments.rows.reduce((acc, row) => {
      const existingAppt = acc.find(appt => appt.id === row.id);
      if (existingAppt) {
        if (row.document_id) {
          existingAppt.documents.push({ id: row.document_id, file_url: row.file_url, file_name: row.file_name });
        }
      } else {
        const newAppt = { ...row, documents: [] };
        if (row.document_id) {
          newAppt.documents.push({ id: row.document_id, file_url: row.file_url, file_name: row.file_name });
        }
        acc.push(newAppt);
      }
      // Remove redundant document fields from top level
      delete newAppt.document_id;
      delete newAppt.file_url;
      delete newAppt.file_name;
      return acc;
    }, []);

    res.status(200).json(groupedAppointments);
  } catch (error) {
    console.error('Error fetching patient appointments:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// PUT /api/appointments/:id/cancel (Patient only)
const cancelAppointment = async (req, res) => {
  const { id } = req.params;
  const patient_id = req.user.id;

  try {
    const appointmentResult = await pool.query(
      'SELECT appointment_date, status FROM appointments WHERE id = $1 AND patient_id = $2',
      [id, patient_id]
    );

    if (appointmentResult.rows.length === 0) {
      return res.status(404).json({ message: 'Appointment not found or not owned by patient' });
    }

    const appointment = appointmentResult.rows[0];
    if (appointment.status === 'completed' || appointment.status === 'cancelled') {
      return res.status(400).json({ message: `Cannot cancel an appointment with status: ${appointment.status}` });
    }

    // Use UTC date parsing for consistency
    const [year, month, day] = appointment.appointment_date.split('-').map(Number);
    const appointmentUTC = new Date(Date.UTC(year, month - 1, day));

    const today = new Date();
    const todayUTC = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()));

    if (appointmentUTC < todayUTC) {
      return res.status(400).json({ message: 'Cannot cancel past appointments' });
    }

    await pool.query('UPDATE appointments SET status = $1 WHERE id = $2', ['cancelled', id]);
    res.status(200).json({ message: 'Appointment cancelled successfully' });
  } catch (error) {
    console.error('Error cancelling appointment:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/appointments/all (Doctor only)
const getAllAppointments = async (req, res) => {
  const { date, status, search } = req.query; // date in YYYY-MM-DD format
  let query = `
    SELECT
      a.*,
      u.full_name AS patient_name,
      u.username AS patient_username,
      u.phone AS patient_phone,
      u.whatsapp_number AS patient_whatsapp
    FROM
      appointments a
    JOIN
      users u ON a.patient_id = u.id
  `;
  const values = [];
  const conditions = [];
  let paramIndex = 1;

  if (date) {
    conditions.push(`a.appointment_date = $${paramIndex++}`);
    values.push(date);
  }
  if (status) {
    conditions.push(`a.status = $${paramIndex++}`);
    values.push(status);
  }
  if (search) {
    conditions.push(`(u.full_name ILIKE $${paramIndex} OR u.username ILIKE $${paramIndex++})`);
    values.push(`%${search}%`);
  }

  if (conditions.length > 0) {
    query += ` WHERE ${conditions.join(' AND ')}`;
  }

  query += ` ORDER BY a.appointment_date DESC, a.appointment_time DESC`;

  try {
    const appointments = await pool.query(query, values);
    res.status(200).json(appointments.rows);
  } catch (error) {
    console.error('Error fetching all appointments:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// PUT /api/appointments/:id/approve (Doctor only)
const approveAppointment = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('UPDATE appointments SET status = $1 WHERE id = $2 RETURNING *', ['approved', id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    res.status(200).json({ message: 'Appointment approved', appointment: result.rows[0] });
  } catch (error) {
    console.error('Error approving appointment:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// PUT /api/appointments/:id/reject (Doctor only)
const rejectAppointment = async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body; // Optional reason for rejection
  try {
    const result = await pool.query('UPDATE appointments SET status = $1, doctor_notes = $2 WHERE id = $3 RETURNING *', ['rejected', reason || 'Rejected by doctor', id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    res.status(200).json({ message: 'Appointment rejected', appointment: result.rows[0] });
  } catch (error) {
    console.error('Error rejecting appointment:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// PUT /api/appointments/:id/complete (Doctor only)
const completeAppointment = async (req, res) => {
  const { id } = req.params;
  const { doctor_notes } = req.body;
  try {
    const result = await pool.query('UPDATE appointments SET status = $1, doctor_notes = $2 WHERE id = $3 RETURNING *', ['completed', doctor_notes, id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    res.status(200).json({ message: 'Appointment marked as completed', appointment: result.rows[0] });
  } catch (error) {
    console.error('Error completing appointment:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getAvailableTimeSlots,
  bookAppointment,
  getMyAppointments,
  cancelAppointment,
  getAllAppointments,
  approveAppointment,
  rejectAppointment,
  completeAppointment,
};