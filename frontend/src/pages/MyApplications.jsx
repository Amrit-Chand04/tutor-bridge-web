import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import TutorNavbar from "../component/TutorNavbar";
import { getMyApplications } from "../service/Api";
import { getDashboardPath } from "../utils/roleRoutes";
import "./MyApplications.css";

const APP_STATUS = {
  pending: { label: "Pending", modifier: "pending" },
  accepted: { label: "Booked", modifier: "booked" },
  rejected: { label: "Another Tutor Booked", modifier: "another" },
};

const formatDate = (dateString) => {
  const d = new Date(dateString);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

function MyApplications() {
  const navigate = useNavigate();
  const [tutor, setTutor] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewTarget, setViewTarget] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    if (!token || !storedUser) {
      navigate("/login");
      return;
    }
    const parsedUser = JSON.parse(storedUser);
    if (parsedUser.role !== "tutor") {
      navigate(getDashboardPath(parsedUser.role));
      return;
    }
    setTutor(parsedUser);
    fetchApplications();
  }, [navigate]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const res = await getMyApplications();
      setApplications(res.data.applications);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load your applications");
    } finally {
      setLoading(false);
    }
  };

  if (!tutor) return null;

  return (
    <div>
      <TutorNavbar user={tutor} active="my-applications" />

      <section className="ma-page">
        <div className="ma-header">
          <h1 className="ma-heading">My Applications</h1>
          {!loading && applications.length > 0 && (
            <span className="ma-count">
              {applications.length} {applications.length === 1 ? "application" : "applications"}
            </span>
          )}
        </div>

        <div className="ma-table-wrap">
          {loading ? (
            <p className="ma-empty">Loading your applications...</p>
          ) : applications.length === 0 ? (
            <p className="ma-empty">You haven't applied to any tuitions yet.</p>
          ) : (
            <table className="ma-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Student Name</th>
                  <th>Subject</th>
                  <th>Level</th>
                  <th>Location</th>
                  <th>Budget</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((a) => {
                  const status = APP_STATUS[a.application_status];
                  return (
                    <tr key={a.application_id}>
                      <td>{a.request_id}</td>
                      <td>{a.posted_by}</td>
                      <td>{a.subject}</td>
                      <td>{a.class_level}</td>
                      <td>{a.location}</td>
                      <td>Rs {Number(a.budget).toLocaleString()}/month</td>
                      <td className="ma-actions-cell">
                        <button className="ma-action-view" onClick={() => setViewTarget(a)}>
                          View
                        </button>
                        <span className={`ma-status-pill ma-status-${status.modifier}`}>{status.label}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </section>

      {viewTarget && (
        <div className="modal-overlay" onClick={() => setViewTarget(null)}>
          <div className="modal-box ma-view-box" onClick={(e) => e.stopPropagation()}>
            <div className="ma-view-header">
              <h3>{viewTarget.subject}</h3>
              <span className="ma-modal-budget">
                Rs {Number(viewTarget.budget).toLocaleString()}/month
              </span>
            </div>

            <div className="ma-detail-grid">
              <div className="ma-detail-item">
                <span className="ma-detail-label">Student</span>
                <span className="ma-detail-value">{viewTarget.posted_by}</span>
              </div>
              <div className="ma-detail-item">
                <span className="ma-detail-label">Class Level</span>
                <span className="ma-detail-value">{viewTarget.class_level}</span>
              </div>
              <div className="ma-detail-item">
                <span className="ma-detail-label">Location</span>
                <span className="ma-detail-value">{viewTarget.location}</span>
              </div>
              <div className="ma-detail-item">
                <span className="ma-detail-label">Preferred Gender</span>
                <span className="ma-detail-value">{viewTarget.preferred_gender}</span>
              </div>
              {viewTarget.preferred_time && (
                <div className="ma-detail-item">
                  <span className="ma-detail-label">Preferred Time</span>
                  <span className="ma-detail-value">{viewTarget.preferred_time}</span>
                </div>
              )}
              <div className="ma-detail-item">
                <span className="ma-detail-label">Contact Number</span>
                <span className="ma-detail-value">{viewTarget.contact_number}</span>
              </div>
            </div>

            <p className="ma-detail-label">Description</p>
            <p className="ma-text">{viewTarget.description}</p>

            <div className="ma-modal-footer">
              <span className={`ma-status-pill ma-status-${APP_STATUS[viewTarget.application_status].modifier}`}>
                {APP_STATUS[viewTarget.application_status].label}
              </span>
              <p className="ma-applied-on">Applied on {formatDate(viewTarget.applied_at)}</p>
            </div>

            <div className="modal-actions">
              <button className="modal-btn-cancel" onClick={() => setViewTarget(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MyApplications;
