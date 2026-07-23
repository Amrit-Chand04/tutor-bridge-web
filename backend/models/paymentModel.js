const pool = require("../config/db");

const createPayment = async (applicationId, amount) => {
  const result = await pool.query(
    `INSERT INTO payments (application_id, amount)
     VALUES ($1, $2)
     RETURNING *`,
    [applicationId, amount],
  );
  return result.rows[0];
};

const setPidx = async (paymentId, pidx) => {
  const result = await pool.query(
    "UPDATE payments SET pidx = $2, updated_at = NOW() WHERE payment_id = $1 RETURNING *",
    [paymentId, pidx],
  );
  return result.rows[0];
};

const getPaymentByPidx = async (pidx) => {
  const result = await pool.query("SELECT * FROM payments WHERE pidx = $1", [pidx]);
  return result.rows[0];
};

const updatePaymentStatus = async (paymentId, status, transactionId) => {
  const result = await pool.query(
    `UPDATE payments SET status = $2, transaction_id = $3, updated_at = NOW()
     WHERE payment_id = $1 RETURNING *`,
    [paymentId, status, transactionId || null],
  );
  return result.rows[0];
};

module.exports = {
  createPayment,
  setPidx,
  getPaymentByPidx,
  updatePaymentStatus,
};
