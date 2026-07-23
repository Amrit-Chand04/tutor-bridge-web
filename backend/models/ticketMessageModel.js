const pool = require("../config/db");

const createMessage = async (ticketId, senderId, message) => {
  const result = await pool.query(
    `INSERT INTO ticket_messages (ticket_id, sender_id, message)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [ticketId, senderId, message],
  );
  return result.rows[0];
};

const getMessagesByTicket = async (ticketId) => {
  const result = await pool.query(
    `SELECT tm.*, u.full_name AS sender_name, u.role AS sender_role
     FROM ticket_messages tm
     JOIN users u ON u.user_id = tm.sender_id
     WHERE tm.ticket_id = $1
     ORDER BY tm.sent_time ASC`,
    [ticketId],
  );
  return result.rows;
};

module.exports = {
  createMessage,
  getMessagesByTicket,
};
