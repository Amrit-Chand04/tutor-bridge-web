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

module.exports = {
  createTuitionRequest,
};
