const pool = require("../config/db");

const createTicket = async (userId, subject, description) => {
  const result = await pool.query(
    `INSERT INTO support_tickets (user_id, subject, description)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [userId, subject, description],
  );
  return result.rows[0];
};

const getTicketsByUser = async (userId) => {
  const result = await pool.query(
    "SELECT * FROM support_tickets WHERE user_id = $1 ORDER BY created_at DESC",
    [userId],
  );
  return result.rows;
};

const getAllTickets = async () => {
  const result = await pool.query(
    `SELECT st.*, u.full_name AS raised_by
     FROM support_tickets st
     JOIN users u ON u.user_id = st.user_id
     ORDER BY st.created_at DESC`,
  );
  return result.rows;
};

const getTicketById = async (ticketId) => {
  const result = await pool.query(
    `SELECT st.*, u.full_name AS raised_by
     FROM support_tickets st
     JOIN users u ON u.user_id = st.user_id
     WHERE st.ticket_id = $1`,
    [ticketId],
  );
  return result.rows[0];
};

const markTicketResolved = async (ticketId) => {
  const result = await pool.query(
    "UPDATE support_tickets SET status = 'resolved' WHERE ticket_id = $1 RETURNING *",
    [ticketId],
  );
  return result.rows[0];
};

module.exports = {
  createTicket,
  getTicketsByUser,
  getAllTickets,
  getTicketById,
  markTicketResolved,
};
