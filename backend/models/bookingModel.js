const pool = require("../config/db");

const createBooking = async (requestId, studentId, tutorId) => {
  const result = await pool.query(
    `INSERT INTO bookings (request_id, student_id, tutor_id)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [requestId, studentId, tutorId],
  );
  return result.rows[0];
};

const getBookingsByStudent = async (studentId) => {
  const result = await pool.query(
    `SELECT b.*, tr.subject, tr.class_level, tr.location, u.full_name AS tutor_name, u.email AS tutor_email
     FROM bookings b
     JOIN tuition_requests tr ON tr.request_id = b.request_id
     JOIN users u ON u.user_id = b.tutor_id
     WHERE b.student_id = $1
     ORDER BY b.booking_date DESC`,
    [studentId],
  );
  return result.rows;
};

const getAllBookings = async () => {
  const result = await pool.query(
    `SELECT b.*, tr.subject, tr.class_level, tr.location,
       s.full_name AS student_name, s.email AS student_email,
       t.full_name AS tutor_name, t.email AS tutor_email
     FROM bookings b
     JOIN tuition_requests tr ON tr.request_id = b.request_id
     JOIN users s ON s.user_id = b.student_id
     JOIN users t ON t.user_id = b.tutor_id
     ORDER BY b.booking_date DESC`,
  );
  return result.rows;
};

const getBookingById = async (bookingId) => {
  const result = await pool.query("SELECT * FROM bookings WHERE booking_id = $1", [bookingId]);
  return result.rows[0];
};

const acceptBooking = async (bookingId) => {
  const result = await pool.query(
    `UPDATE bookings SET status = 'booked', rejection_reason = NULL
     WHERE booking_id = $1 RETURNING *`,
    [bookingId],
  );
  return result.rows[0];
};

const rejectBooking = async (bookingId, reason) => {
  const result = await pool.query(
    `UPDATE bookings SET status = 'rejected', rejection_reason = $2
     WHERE booking_id = $1 RETURNING *`,
    [bookingId, reason],
  );
  return result.rows[0];
};

module.exports = {
  createBooking,
  getBookingsByStudent,
  getAllBookings,
  getBookingById,
  acceptBooking,
  rejectBooking,
};
