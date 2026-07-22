const pool = require("../config/db");

const upsertPendingRegistration = async (
  fullName,
  email,
  hashedPassword,
  role,
  otpCode,
  expiresAt,
) => {
  const result = await pool.query(
    `INSERT INTO otp_verifications (full_name, email, password, role, otp_code, expires_at)
     VALUES ($1, $2, $3, $4, $5, $6)
     ON CONFLICT (email)
     DO UPDATE SET
       full_name = EXCLUDED.full_name,
       password = EXCLUDED.password,
       role = EXCLUDED.role,
       otp_code = EXCLUDED.otp_code,
       expires_at = EXCLUDED.expires_at,
       created_at = NOW()
     RETURNING *`,
    [fullName, email, hashedPassword, role, otpCode, expiresAt],
  );
  return result.rows[0];
};

const findPendingByEmail = async (email) => {
  const result = await pool.query(
    "SELECT * FROM otp_verifications WHERE email = $1",
    [email],
  );
  return result.rows[0];
};

const deletePendingByEmail = async (email) => {
  await pool.query("DELETE FROM otp_verifications WHERE email = $1", [
    email,
  ]);
};

module.exports = {
  upsertPendingRegistration,
  findPendingByEmail,
  deletePendingByEmail,
};
