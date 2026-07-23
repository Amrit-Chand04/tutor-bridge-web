import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import AdminNavbar from "../component/AdminNavbar";
import {
  getAllTutorProfiles,
  approveTutorProfile,
  rejectTutorProfile,
} from "../service/Api";
import { getDashboardPath } from "../utils/roleRoutes";
import "./AdminTutorProfiles.css";

const STATUS_LABELS = {
  pending: "Pending",
  verified: "Verified",
  rejected: "Rejected",
};

function AdminTutorProfiles() {
  const navigate = useNavigate();
  const [admin, setAdmin] = useState(null);
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewTarget, setViewTarget] = useState(null);
  const [rejectTarget, setRejectTarget] = useState(null);
  const [reason, setReason] = useState("");
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    if (!token || !storedUser) {
      navigate("/login");
      return;
    }
    const parsedUser = JSON.parse(storedUser);
    if (parsedUser.role !== "admin") {
      navigate(getDashboardPath(parsedUser.role));
      return;
    }
    setAdmin(parsedUser);
    fetchProfiles();
  }, [navigate]);

  const fetchProfiles = async () => {
    try {
      setLoading(true);
      const res = await getAllTutorProfiles();
      setProfiles(res.data.profiles);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load tutor profiles");
    } finally {
      setLoading(false);
    }
  };

  const mergeProfile = (id, updated) => {
    setProfiles((prev) => prev.map((p) => (p.profile_id === id ? { ...p, ...updated } : p)));
    setViewTarget((prev) => (prev && prev.profile_id === id ? { ...prev, ...updated } : prev));
  };

  const handleApprove = async (profile) => {
    try {
      setBusyId(profile.profile_id);
      const res = await approveTutorProfile(profile.profile_id);
      toast.success(res.data.message);
      mergeProfile(profile.profile_id, res.data.profile);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to approve profile");
    } finally {
      setBusyId(null);
    }
  };

  const handleReject = async (e) => {
    e.preventDefault();
    if (!reason.trim()) {
      return toast.error("Enter a reason for rejection");
    }

    try {
      setBusyId(rejectTarget.profile_id);
      const res = await rejectTutorProfile(rejectTarget.profile_id, reason.trim());
      toast.success(res.data.message);
      mergeProfile(rejectTarget.profile_id, res.data.profile);
      setRejectTarget(null);
      setReason("");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to reject profile");
    } finally {
      setBusyId(null);
    }
  };

  if (!admin) return null;

  return (
    <div>
      <AdminNavbar user={admin} minimal />

      <section className="atp-page">
        <div className="atp-header">
          <h1 className="atp-heading">Manage Tutor Profiles</h1>
          {!loading && profiles.length > 0 && (
            <span className="atp-count">
              {profiles.length} {profiles.length === 1 ? "submission" : "submissions"}
            </span>
          )}
        </div>

        <div className="atp-table-wrap">
          {loading ? (
            <p className="atp-empty">Loading tutor profiles...</p>
          ) : profiles.length === 0 ? (
            <p className="atp-empty">No tutor profile submissions yet.</p>
          ) : (
            <table className="atp-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Tutor Name</th>
                  <th>Email</th>
                  <th>Degree</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {profiles.map((p) => (
                  <tr key={p.profile_id}>
                    <td>{p.profile_id}</td>
                    <td>{p.tutor_name}</td>
                    <td>{p.tutor_email}</td>
                    <td>{p.degree}</td>
                    <td>
                      <span className={`atp-status-badge atp-status-${p.verification_status}`}>
                        {STATUS_LABELS[p.verification_status]}
                      </span>
                    </td>
                    <td>
                      <button className="atp-action-view" onClick={() => setViewTarget(p)}>
                        View
                      </button>
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
          <div className="modal-box atp-view-box" onClick={(e) => e.stopPropagation()}>
            <div className="atp-view-header">
              <div>
                <p className="atp-tutor-name">{viewTarget.tutor_name}</p>
                <p className="atp-tutor-email">{viewTarget.tutor_email}</p>
              </div>
              <span className={`atp-status-badge atp-status-${viewTarget.verification_status}`}>
                {STATUS_LABELS[viewTarget.verification_status]}
              </span>
            </div>

            <div className="atp-detail-grid">
              <div className="atp-detail-item">
                <span className="atp-detail-label">Degree</span>
                <span className="atp-detail-value">{viewTarget.degree}</span>
              </div>
              <div className="atp-detail-item">
                <span className="atp-detail-label">Institution</span>
                <span className="atp-detail-value">{viewTarget.institution}</span>
              </div>
              <div className="atp-detail-item">
                <span className="atp-detail-label">Passing Year</span>
                <span className="atp-detail-value">{viewTarget.passing_year}</span>
              </div>
              <div className="atp-detail-item">
                <span className="atp-detail-label">Years of Experience</span>
                <span className="atp-detail-value">{viewTarget.years_experience}</span>
              </div>
            </div>

            <p className="atp-detail-label">Skills</p>
            <p className="atp-text">{viewTarget.skills}</p>

            <p className="atp-detail-label">Description</p>
            <p className="atp-text">{viewTarget.description}</p>

            <a href={viewTarget.cv_url} target="_blank" rel="noreferrer" className="atp-cv-link">
              View CV
            </a>

            {viewTarget.verification_status === "rejected" && viewTarget.rejection_reason && (
              <div className="atp-rejection-box">
                <span className="atp-detail-label">Rejection Reason</span>
                <p className="atp-text">{viewTarget.rejection_reason}</p>
              </div>
            )}

            {viewTarget.verification_status === "pending" && (
              <div className="atp-actions">
                <button
                  className="atp-approve-btn"
                  onClick={() => handleApprove(viewTarget)}
                  disabled={busyId === viewTarget.profile_id}
                >
                  {busyId === viewTarget.profile_id ? (
                    <>
                      <span className="spinner" /> Approving...
                    </>
                  ) : (
                    "Approve"
                  )}
                </button>
                <button
                  className="atp-reject-btn"
                  onClick={() => setRejectTarget(viewTarget)}
                  disabled={busyId === viewTarget.profile_id}
                >
                  Reject
                </button>
              </div>
            )}

            <div className="modal-actions">
              <button className="modal-btn-cancel" onClick={() => setViewTarget(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {rejectTarget && (
        <div className="modal-overlay" onClick={() => setRejectTarget(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h3>Reject Tutor Profile</h3>
            <p>Let {rejectTarget.tutor_name} know why this profile was rejected.</p>
            <form onSubmit={handleReject}>
              <textarea
                className="atp-reason-input"
                rows={4}
                placeholder="e.g. CV is not readable, please re-upload"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
              <div className="modal-actions">
                <button
                  type="button"
                  className="modal-btn-cancel"
                  onClick={() => {
                    setRejectTarget(null);
                    setReason("");
                  }}
                >
                  Cancel
                </button>
                <button type="submit" className="modal-btn-confirm">
                  Confirm Reject
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminTutorProfiles;
