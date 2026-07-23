import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import TutorNavbar from "../component/TutorNavbar";
import { getOpenTuitionRequests, applyToTuitionRequest } from "../service/Api";
import { getDashboardPath } from "../utils/roleRoutes";
import "./BrowseTuitions.css";

const formatDate = (dateString) => {
  const d = new Date(dateString);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

function BrowseTuitions() {
  const navigate = useNavigate();
  const [tutor, setTutor] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewRequest, setViewRequest] = useState(null);
  const [applyingId, setApplyingId] = useState(null);

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
    fetchRequests();
  }, [navigate]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await getOpenTuitionRequests();
      setRequests(response.data.requests);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load tuition requests");
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (request) => {
    try {
      setApplyingId(request.request_id);
      const res = await applyToTuitionRequest(request.request_id);
      toast.success(res.data.message);
      setRequests((prev) =>
        prev.map((r) => (r.request_id === request.request_id ? { ...r, my_application_status: "pending" } : r)),
      );
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to apply");
    } finally {
      setApplyingId(null);
    }
  };

  const getApplyState = (r) => {
    if (applyingId === r.request_id) {
      return { label: "Applying...", modifier: "applying", disabled: true, spinner: true };
    }
    if (r.my_application_status === "accepted") {
      return { label: "Accepted", modifier: "accepted", disabled: true };
    }
    if (r.status === "closed") {
      return { label: "Closed", modifier: "closed", disabled: true };
    }
    if (r.my_application_status === "rejected") {
      return { label: "Rejected", modifier: "rejected", disabled: true };
    }
    if (r.my_application_status === "pending") {
      return { label: "Applied", modifier: "applied", disabled: true };
    }
    return { label: "Apply", modifier: null, disabled: false };
  };

  if (!tutor) return null;

  return (
    <div>
      <TutorNavbar user={tutor} active="dashboard" />

      <section className="bt-page">
        <div className="bt-header">
          <h1 className="bt-heading">Available Tuitions</h1>
          {!loading && requests.length > 0 && (
            <span className="bt-count">
              {requests.length} {requests.length === 1 ? "request" : "requests"}
            </span>
          )}
        </div>

        <div className="bt-table-wrap">
          {loading ? (
            <p className="bt-empty">Loading tuition requests...</p>
          ) : requests.length === 0 ? (
            <p className="bt-empty">No tuition requests available right now.</p>
          ) : (
            <table className="bt-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Student Name</th>
                  <th>Subject</th>
                  <th>Level</th>
                  <th>Location</th>
                  <th>Budget</th>
                  <th>Posted Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((r) => {
                  const applyState = getApplyState(r);
                  return (
                    <tr key={r.request_id}>
                      <td>{r.request_id}</td>
                      <td>{r.posted_by}</td>
                      <td>{r.subject}</td>
                      <td>{r.class_level}</td>
                      <td>{r.location}</td>
                      <td>Rs {Number(r.budget).toLocaleString()}/month</td>
                      <td>{formatDate(r.created_at)}</td>
                      <td>
                        <button className="bt-action-view" onClick={() => setViewRequest(r)}>
                          View
                        </button>
                        <button
                          className={`bt-action-apply ${applyState.modifier ? `bt-state-${applyState.modifier}` : ""}`}
                          onClick={() => handleApply(r)}
                          disabled={applyState.disabled}
                        >
                          {applyState.spinner && <span className="spinner" />} {applyState.label}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </section>

      {viewRequest && (
        <div className="modal-overlay" onClick={() => setViewRequest(null)}>
          <div className="modal-box bt-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="bt-modal-header">
              <h3>{viewRequest.subject}</h3>
              <span className="bt-modal-budget">
                Rs {Number(viewRequest.budget).toLocaleString()}/month
              </span>
            </div>

            <div className="bt-detail-grid">
              <div className="bt-detail-item">
                <span className="bt-detail-label">Student</span>
                <span className="bt-detail-value">{viewRequest.posted_by}</span>
              </div>
              <div className="bt-detail-item">
                <span className="bt-detail-label">Class Level</span>
                <span className="bt-detail-value">{viewRequest.class_level}</span>
              </div>
              <div className="bt-detail-item">
                <span className="bt-detail-label">Location</span>
                <span className="bt-detail-value">{viewRequest.location}</span>
              </div>
              <div className="bt-detail-item">
                <span className="bt-detail-label">Preferred Gender</span>
                <span className="bt-detail-value">{viewRequest.preferred_gender}</span>
              </div>
              {viewRequest.preferred_time && (
                <div className="bt-detail-item">
                  <span className="bt-detail-label">Preferred Time</span>
                  <span className="bt-detail-value">{viewRequest.preferred_time}</span>
                </div>
              )}
              <div className="bt-detail-item">
                <span className="bt-detail-label">Contact Number</span>
                <span className="bt-detail-value">{viewRequest.contact_number}</span>
              </div>
            </div>

            {viewRequest.description && (
              <div className="bt-modal-description">
                <span className="bt-detail-label">Description</span>
                <p>{viewRequest.description}</p>
              </div>
            )}

            <p className="bt-modal-posted">Posted on {formatDate(viewRequest.created_at)}</p>

            <div className="modal-actions">
              <button className="modal-btn-cancel bt-modal-close" onClick={() => setViewRequest(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BrowseTuitions;
