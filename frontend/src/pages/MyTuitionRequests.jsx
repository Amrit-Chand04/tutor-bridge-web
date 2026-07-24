import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import DashboardNavbar from "../component/DashboardNavbar";
import {
  getMyTuitionRequests,
  getApplicationsForRequest,
  initiateBookingPayment,
  deleteTuitionRequest,
} from "../service/Api";
import { getDashboardPath } from "../utils/roleRoutes";
import "./MyTuitionRequests.css";

const STATUS_LABELS = { open: "Open", closed: "Closed" };

const formatDate = (dateString) => {
  const d = new Date(dateString);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

function MyTuitionRequests() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewTarget, setViewTarget] = useState(null);
  const [applicationsTarget, setApplicationsTarget] = useState(null);
  const [applications, setApplications] = useState([]);
  const [applicationsLoading, setApplicationsLoading] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    if (!token || !storedUser) {
      navigate("/login");
      return;
    }
    const parsedUser = JSON.parse(storedUser);
    if (parsedUser.role !== "student") {
      navigate(getDashboardPath(parsedUser.role));
      return;
    }
    setUser(parsedUser);
    fetchRequests();
  }, [navigate]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await getMyTuitionRequests();
      setRequests(res.data.requests);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load your tuition requests");
    } finally {
      setLoading(false);
    }
  };

  const openApplications = async (request) => {
    setApplicationsTarget(request);
    setApplications([]);
    try {
      setApplicationsLoading(true);
      const res = await getApplicationsForRequest(request.request_id);
      setApplications(res.data.applications);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load applications");
    } finally {
      setApplicationsLoading(false);
    }
  };

  const handleBook = async (application) => {
    try {
      setBusyId(application.application_id);
      const res = await initiateBookingPayment(application.application_id);
      window.location.href = res.data.payment_url;
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to start payment");
      setBusyId(null);
    }
  };

  const handleDelete = async () => {
    try {
      setDeleting(true);
      const res = await deleteTuitionRequest(deleteTarget.request_id);
      toast.success(res.data.message);
      setRequests((prev) => prev.filter((r) => r.request_id !== deleteTarget.request_id));
      setDeleteTarget(null);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete tuition request");
    } finally {
      setDeleting(false);
    }
  };

  if (!user) return null;

  return (
    <div>
      <DashboardNavbar user={user} active="my-requests" />

      <section className="mtr-page">
        <div className="mtr-header">
          <h1 className="mtr-heading">My Tuition Requests</h1>
          {!loading && requests.length > 0 && (
            <span className="mtr-count">
              {requests.length} {requests.length === 1 ? "request" : "requests"}
            </span>
          )}
        </div>

        <div className="mtr-table-wrap">
          {loading ? (
            <p className="mtr-empty">Loading your tuition requests...</p>
          ) : requests.length === 0 ? (
            <p className="mtr-empty">You haven't created any tuition requests yet.</p>
          ) : (
            <table className="mtr-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Subject</th>
                  <th>Level</th>
                  <th>Location</th>
                  <th>Budget</th>
                  <th>Applications</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((r) => (
                  <tr key={r.request_id}>
                    <td>{r.request_id}</td>
                    <td>{r.subject}</td>
                    <td>{r.class_level}</td>
                    <td>{r.location}</td>
                    <td>Rs {Number(r.budget).toLocaleString()}/month</td>
                    <td>
                      <span className="mtr-applications-count">{r.application_count}</span>
                    </td>
                    <td>
                      <span className={`mtr-status-badge mtr-status-${r.status}`}>{STATUS_LABELS[r.status]}</span>
                    </td>
                    <td className="mtr-actions-cell">
                      <button className="mtr-action-view" onClick={() => setViewTarget(r)}>
                        View
                      </button>
                      <button className="mtr-action-applications" onClick={() => openApplications(r)}>
                        View Applications
                      </button>
                      {r.status === "open" && (
                        <button className="mtr-action-delete" onClick={() => setDeleteTarget(r)}>
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>

      {viewTarget && (
        <div className="modal-overlay" onClick={() => setViewTarget(null)}>
          <div className="modal-box mtr-view-box" onClick={(e) => e.stopPropagation()}>
            <div className="mtr-view-header">
              <h3>{viewTarget.subject}</h3>
              <span className={`mtr-status-badge mtr-status-${viewTarget.status}`}>
                {STATUS_LABELS[viewTarget.status]}
              </span>
            </div>

            <div className="mtr-detail-grid">
              <div className="mtr-detail-item">
                <span className="mtr-detail-label">Class Level</span>
                <span className="mtr-detail-value">{viewTarget.class_level}</span>
              </div>
              <div className="mtr-detail-item">
                <span className="mtr-detail-label">Location</span>
                <span className="mtr-detail-value">{viewTarget.location}</span>
              </div>
              <div className="mtr-detail-item">
                <span className="mtr-detail-label">Budget</span>
                <span className="mtr-detail-value">Rs {Number(viewTarget.budget).toLocaleString()}/month</span>
              </div>
              <div className="mtr-detail-item">
                <span className="mtr-detail-label">Preferred Gender</span>
                <span className="mtr-detail-value">{viewTarget.preferred_gender}</span>
              </div>
              {viewTarget.preferred_time && (
                <div className="mtr-detail-item">
                  <span className="mtr-detail-label">Preferred Time</span>
                  <span className="mtr-detail-value">{viewTarget.preferred_time}</span>
                </div>
              )}
              <div className="mtr-detail-item">
                <span className="mtr-detail-label">Contact Number</span>
                <span className="mtr-detail-value">{viewTarget.contact_number}</span>
              </div>
            </div>

            <p className="mtr-detail-label">Description</p>
            <p className="mtr-text">{viewTarget.description}</p>

            <p className="mtr-posted">Posted on {formatDate(viewTarget.created_at)}</p>

            <div className="modal-actions">
              <button className="modal-btn-cancel" onClick={() => setViewTarget(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {applicationsTarget && (
        <div className="modal-overlay" onClick={() => setApplicationsTarget(null)}>
          <div className="modal-box mtr-apps-box" onClick={(e) => e.stopPropagation()}>
            <div className="mtr-view-header">
              <h3>Applications for {applicationsTarget.subject}</h3>
              <span className={`mtr-status-badge mtr-status-${applicationsTarget.status}`}>
                {STATUS_LABELS[applicationsTarget.status]}
              </span>
            </div>

            {applicationsLoading ? (
              <p className="mtr-empty">Loading applications...</p>
            ) : applications.length === 0 ? (
              <p className="mtr-empty">No tutors have applied yet.</p>
            ) : (
              <div className="mtr-app-list">
                {applications.map((a) => (
                  <div className="mtr-app-card" key={a.application_id}>
                    <div className="mtr-app-info">
                      <p className="mtr-app-name">{a.tutor_name}</p>
                      <p className="mtr-app-email">{a.tutor_email}</p>
                      <p className="mtr-app-date">Applied on {formatDate(a.created_at)}</p>
                    </div>
                    <div className="mtr-app-side">
                      {a.tutor_cv_url ? (
                        <a href={a.tutor_cv_url} target="_blank" rel="noreferrer" className="mtr-app-cv-btn">
                          View CV
                        </a>
                      ) : (
                        <span className="mtr-app-no-cv">No CV</span>
                      )}

                      {a.status === "pending" && (
                        <button
                          className="mtr-app-book"
                          onClick={() => handleBook(a)}
                          disabled={busyId === a.application_id}
                        >
                          {busyId === a.application_id ? (
                            <>
                              <span className="spinner" /> Redirecting...
                            </>
                          ) : (
                            "Book"
                          )}
                        </button>
                      )}
                      {a.status === "accepted" && a.booking_status === "booked" && (
                        <span className="mtr-app-status mtr-app-status-accepted">Booked</span>
                      )}
                      {a.status === "accepted" && a.booking_status === "rejected" && (
                        <span className="mtr-app-status mtr-app-status-rejected">Rejected</span>
                      )}
                      {a.status === "accepted" && (!a.booking_status || a.booking_status === "pending") && (
                        <span className="mtr-app-status mtr-app-status-pending">Pending</span>
                      )}
                      {a.status === "rejected" && (
                        <span className="mtr-app-status mtr-app-status-rejected">Another Tutor Selected</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="modal-actions">
              <button className="modal-btn-cancel" onClick={() => setApplicationsTarget(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      {deleteTarget && (
        <div className="modal-overlay" onClick={() => setDeleteTarget(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h3>Delete Tuition Request?</h3>
            <p>
              Are you sure you want to delete <strong>{deleteTarget.subject}</strong>? This cannot
              be undone.
            </p>
            <div className="modal-actions">
              <button className="modal-btn-cancel" onClick={() => setDeleteTarget(null)}>
                Cancel
              </button>
              <button className="modal-btn-confirm" onClick={handleDelete} disabled={deleting}>
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MyTuitionRequests;
