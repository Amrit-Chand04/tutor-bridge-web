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

const getOpenTuitionRequests = async () => {
  const result = await pool.query(
    `SELECT tr.*, u.full_name AS posted_by
     FROM tuition_requests tr
     JOIN users u ON u.user_id = tr.user_id
     WHERE tr.status = 'open'
     ORDER BY tr.created_at DESC`,
  );
  return result.rows;
};

module.exports = {
  createTuitionRequest,
  getOpenTuitionRequests,
};
