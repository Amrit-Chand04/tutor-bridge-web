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

module.exports = {
  getProfileByUserId,
  upsertProfile,
};
