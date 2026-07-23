const pool = require("../config/db");

const createMessage = async (bookingId, senderId, receiverId, message) => {
  const result = await pool.query(
    `INSERT INTO chats (booking_id, sender_id, receiver_id, message)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [bookingId, senderId, receiverId, message],
  );
  return result.rows[0];
};

const getMessagesBetweenUsers = async (userId1, userId2) => {
  const result = await pool.query(
    `SELECT * FROM chats
     WHERE (sender_id = $1 AND receiver_id = $2) OR (sender_id = $2 AND receiver_id = $1)
     ORDER BY sent_time ASC`,
    [userId1, userId2],
  );
  return result.rows;
};

module.exports = { createMessage, getMessagesBetweenUsers };
