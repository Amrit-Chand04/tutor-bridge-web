const pool = require("../config/db");

const upsertReview = async (studentId, tutorId, rating, reviewText) => {
  const result = await pool.query(
    `INSERT INTO reviews (student_id, tutor_id, rating, review_text)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (student_id, tutor_id)
     DO UPDATE SET rating = EXCLUDED.rating, review_text = EXCLUDED.review_text, updated_at = NOW()
     RETURNING *`,
    [studentId, tutorId, rating, reviewText || null],
  );
  return result.rows[0];
};

const getReviewByPair = async (studentId, tutorId) => {
  const result = await pool.query(
    "SELECT * FROM reviews WHERE student_id = $1 AND tutor_id = $2",
    [studentId, tutorId],
  );
  return result.rows[0];
};

const deleteReview = async (studentId, tutorId) => {
  const result = await pool.query(
    "DELETE FROM reviews WHERE student_id = $1 AND tutor_id = $2 RETURNING *",
    [studentId, tutorId],
  );
  return result.rows[0];
};

module.exports = { upsertReview, getReviewByPair, deleteReview };
