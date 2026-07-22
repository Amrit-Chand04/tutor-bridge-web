const pool = require("../config/db");

const findUserByEmail = async (email) => {
  const result = await pool.query("SELECT * FROM users WHERE email = $1", [
    email,
  ]);
  return result.rows[0];
};

const createUser = async (fullName, email, hashedPassword, role) => {
  const result = await pool.query(
    `INSERT INTO users (full_name, email, password, role)
     VALUES ($1, $2, $3, $4)
     RETURNING user_id, full_name, email, role, profile_photo, status`,
    [fullName, email, hashedPassword, role],
  );
  return result.rows[0];
};

const updatePassword = async (email, hashedPassword) => {
  const result = await pool.query(
    `UPDATE users SET password = $1 WHERE email = $2
     RETURNING user_id, full_name, email, role, profile_photo, status`,
    [hashedPassword, email],
  );
  return result.rows[0];
};

module.exports = {
  findUserByEmail,
  createUser,
  updatePassword,
};
