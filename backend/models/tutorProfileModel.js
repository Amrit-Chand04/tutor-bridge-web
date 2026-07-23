const pool = require("../config/db");

const getProfileByUserId = async (userId) => {
  const result = await pool.query(
    "SELECT * FROM tutor_profiles WHERE user_id = $1",
    [userId],
  );
  return result.rows[0];
};

const upsertProfile = async (userId, data) => {
  const { cvUrl, degree, institution, passingYear, yearsExperience, description, skills } = data;

  const result = await pool.query(
    `INSERT INTO tutor_profiles
       (user_id, cv_url, degree, institution, passing_year, years_experience, description, skills)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     ON CONFLICT (user_id)
     DO UPDATE SET
       cv_url = COALESCE(EXCLUDED.cv_url, tutor_profiles.cv_url),
       degree = EXCLUDED.degree,
       institution = EXCLUDED.institution,
       passing_year = EXCLUDED.passing_year,
       years_experience = EXCLUDED.years_experience,
       description = EXCLUDED.description,
       skills = EXCLUDED.skills,
       updated_at = NOW()
     RETURNING *`,
    [userId, cvUrl || null, degree, institution, passingYear, yearsExperience, description, skills],
  );
  return result.rows[0];
};

const getAllProfiles = async () => {
  const result = await pool.query(
    `SELECT tp.*, u.full_name AS tutor_name, u.email AS tutor_email
     FROM tutor_profiles tp
     JOIN users u ON u.user_id = tp.user_id
     ORDER BY tp.updated_at DESC`,
  );
  return result.rows;
};

const approveProfile = async (profileId) => {
  const result = await pool.query(
    `UPDATE tutor_profiles SET verification_status = 'verified', rejection_reason = NULL
     WHERE profile_id = $1 RETURNING *`,
    [profileId],
  );
  return result.rows[0];
};

const rejectProfile = async (profileId, reason) => {
  const result = await pool.query(
    `UPDATE tutor_profiles SET verification_status = 'rejected', rejection_reason = $2
     WHERE profile_id = $1 RETURNING *`,
    [profileId, reason],
  );
  return result.rows[0];
};

const deleteProfile = async (profileId) => {
  const result = await pool.query(
    "DELETE FROM tutor_profiles WHERE profile_id = $1 RETURNING *",
    [profileId],
  );
  return result.rows[0];
};

module.exports = {
  getProfileByUserId,
  upsertProfile,
  getAllProfiles,
  approveProfile,
  rejectProfile,
  deleteProfile,
};
