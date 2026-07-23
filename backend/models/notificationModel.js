const pool = require("../config/db");

const createNotification = async (userId, message) => {
  const result = await pool.query(
    `INSERT INTO notifications (user_id, message) VALUES ($1, $2) RETURNING *`,
    [userId, message],
  );
  return result.rows[0];
};

const createNotificationsForRole = async (role, message) => {
  const result = await pool.query(
    `INSERT INTO notifications (user_id, message)
     SELECT user_id, $2 FROM users WHERE role = $1
     RETURNING *`,
    [role, message],
  );
  return result.rows;
};

const getNotificationsByUser = async (userId) => {
  const result = await pool.query(
    `SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 30`,
    [userId],
  );
  return result.rows;
};

const markAllAsRead = async (userId) => {
  await pool.query(
    `UPDATE notifications SET is_read = true WHERE user_id = $1 AND is_read = false`,
    [userId],
  );
};

module.exports = {
  createNotification,
  createNotificationsForRole,
  getNotificationsByUser,
  markAllAsRead,
};
