const pool = require("../config/db");

const upsertPasswordReset = async (email, otpCode, expiresAt) => {
  const result = await pool.query(
    `INSERT INTO password_resets (email, otp_code, expires_at)
     VALUES ($1, $2, $3)
     ON CONFLICT (email)
     DO UPDATE SET
       otp_code = EXCLUDED.otp_code,
       expires_at = EXCLUDED.expires_at,
       created_at = NOW()
     RETURNING *`,
    [email, otpCode, expiresAt],
  );
  return result.rows[0];
};

const findPasswordResetByEmail = async (email) => {
  const result = await pool.query(
    "SELECT * FROM password_resets WHERE email = $1",
    [email],
  );
  return result.rows[0];
};

const deletePasswordResetByEmail = async (email) => {
  await pool.query("DELETE FROM password_resets WHERE email = $1", [email]);
};

module.exports = {
  upsertPasswordReset,
  findPasswordResetByEmail,
  deletePasswordResetByEmail,
};
