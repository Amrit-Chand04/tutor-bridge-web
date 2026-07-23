const pool = require("../config/db");

const createApplication = async (requestId, tutorId) => {
  const result = await pool.query(
    `INSERT INTO tuition_applications (request_id, tutor_id)
     VALUES ($1, $2)
     RETURNING *`,
    [requestId, tutorId],
  );
  return result.rows[0];
};

const getApplicationByRequestAndTutor = async (requestId, tutorId) => {
  const result = await pool.query(
    "SELECT * FROM tuition_applications WHERE request_id = $1 AND tutor_id = $2",
    [requestId, tutorId],
  );
  return result.rows[0];
};

const getApplicationsForRequest = async (requestId) => {
  const result = await pool.query(
    `SELECT ta.*, u.full_name AS tutor_name, u.email AS tutor_email, u.profile_photo AS tutor_photo,
       tp.cv_url AS tutor_cv_url
     FROM tuition_applications ta
     JOIN users u ON u.user_id = ta.tutor_id
     LEFT JOIN tutor_profiles tp ON tp.user_id = ta.tutor_id
     WHERE ta.request_id = $1
     ORDER BY ta.created_at DESC`,
    [requestId],
  );
  return result.rows;
};

const getApplicationsForTutor = async (tutorId) => {
  const result = await pool.query(
    `SELECT ta.application_id, ta.status AS application_status, ta.created_at AS applied_at,
       tr.*, u.full_name AS posted_by
     FROM tuition_applications ta
     JOIN tuition_requests tr ON tr.request_id = ta.request_id
     JOIN users u ON u.user_id = tr.user_id
     WHERE ta.tutor_id = $1
     ORDER BY ta.created_at DESC`,
    [tutorId],
  );
  return result.rows;
};

const getApplicationById = async (applicationId) => {
  const result = await pool.query(
    "SELECT * FROM tuition_applications WHERE application_id = $1",
    [applicationId],
  );
  return result.rows[0];
};

const acceptApplication = async (applicationId) => {
  const result = await pool.query(
    `UPDATE tuition_applications SET status = 'accepted'
     WHERE application_id = $1 RETURNING *`,
    [applicationId],
  );
  return result.rows[0];
};

const rejectApplication = async (applicationId) => {
  const result = await pool.query(
    `UPDATE tuition_applications SET status = 'rejected'
     WHERE application_id = $1 RETURNING *`,
    [applicationId],
  );
  return result.rows[0];
};

const rejectOtherPendingApplications = async (requestId, exceptApplicationId) => {
  await pool.query(
    `UPDATE tuition_applications SET status = 'rejected'
     WHERE request_id = $1 AND application_id != $2 AND status = 'pending'`,
    [requestId, exceptApplicationId],
  );
};

module.exports = {
  createApplication,
  getApplicationByRequestAndTutor,
  getApplicationsForRequest,
  getApplicationsForTutor,
  getApplicationById,
  acceptApplication,
  rejectApplication,
  rejectOtherPendingApplications,
};
