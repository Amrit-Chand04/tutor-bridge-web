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

const getAllUsers = async () => {
  const result = await pool.query(
    "SELECT user_id, full_name, email, role, status FROM users ORDER BY user_id",
  );
  return result.rows;
};

const getUserById = async (userId) => {
  const result = await pool.query(
    "SELECT user_id, role FROM users WHERE user_id = $1",
    [userId],
  );
  return result.rows[0];
};

const deleteUserById = async (userId) => {
  const result = await pool.query(
    "DELETE FROM users WHERE user_id = $1 RETURNING user_id",
    [userId],
  );
  return result.rows[0];
};

const updateProfile = async (userId, fullName, profilePhotoUrl) => {
  if (profilePhotoUrl) {
    const result = await pool.query(
      `UPDATE users SET full_name = $1, profile_photo = $2 WHERE user_id = $3
       RETURNING user_id, full_name, email, role, profile_photo, status`,
      [fullName, profilePhotoUrl, userId],
    );
    return result.rows[0];
  }

  const result = await pool.query(
    `UPDATE users SET full_name = $1 WHERE user_id = $2
     RETURNING user_id, full_name, email, role, profile_photo, status`,
    [fullName, userId],
  );
  return result.rows[0];
};

module.exports = {
  findUserByEmail,
  createUser,
  updatePassword,
  getAllUsers,
  getUserById,
  deleteUserById,
  updateProfile,
};
