const pool = require("../config/db");

const createTuitionRequest = async (userId, data) => {
  const {
    subject,
    location,
    classLevel,
    preferredGender,
    budget,
    contactNumber,
    preferredTime,
    description,
  } = data;

  const result = await pool.query(
    `INSERT INTO tuition_requests
       (user_id, subject, location, class_level, preferred_gender, budget, contact_number, preferred_time, description)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING *`,
    [
      userId,
      subject,
      location,
      classLevel,
      preferredGender || "any",
      budget,
      contactNumber,
      preferredTime || null,
      description || null,
    ],
  );
  return result.rows[0];
};

const getOpenTuitionRequests = async (tutorId) => {
  const result = await pool.query(
    `SELECT tr.*, u.full_name AS posted_by, ta.status AS my_application_status
     FROM tuition_requests tr
     JOIN users u ON u.user_id = tr.user_id
     LEFT JOIN tuition_applications ta ON ta.request_id = tr.request_id AND ta.tutor_id = $1
     WHERE tr.status = 'open' OR ta.application_id IS NOT NULL
     ORDER BY tr.created_at DESC`,
    [tutorId],
  );
  return result.rows;
};

const getRequestsByUser = async (userId) => {
  const result = await pool.query(
    `SELECT tr.*,
       COUNT(ta.application_id) AS application_count
     FROM tuition_requests tr
     LEFT JOIN tuition_applications ta ON ta.request_id = tr.request_id
     WHERE tr.user_id = $1
     GROUP BY tr.request_id
     ORDER BY tr.created_at DESC`,
    [userId],
  );
  return result.rows;
};

const getRequestById = async (requestId) => {
  const result = await pool.query(
    "SELECT * FROM tuition_requests WHERE request_id = $1",
    [requestId],
  );
  return result.rows[0];
};

const closeRequest = async (requestId) => {
  const result = await pool.query(
    "UPDATE tuition_requests SET status = 'closed' WHERE request_id = $1 RETURNING *",
    [requestId],
  );
  return result.rows[0];
};

const deleteTuitionRequest = async (requestId, userId) => {
  const result = await pool.query(
    "DELETE FROM tuition_requests WHERE request_id = $1 AND user_id = $2 RETURNING *",
    [requestId, userId],
  );
  return result.rows[0];
};

module.exports = {
  createTuitionRequest,
  getOpenTuitionRequests,
  getRequestsByUser,
  getRequestById,
  closeRequest,
  deleteTuitionRequest,
};
