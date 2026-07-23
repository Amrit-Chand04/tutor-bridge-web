import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import AdminNavbar from "../component/AdminNavbar";
import { getAllBookings, acceptBooking, rejectBooking } from "../service/Api";
import { getDashboardPath } from "../utils/roleRoutes";
import "./AdminManageBookings.css";

const STATUS_LABELS = { pending: "Pending", booked: "Booked", rejected: "Rejected" };

const formatDate = (dateString) => {
  const d = new Date(dateString);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

function AdminManageBookings() {
  const navigate = useNavigate();
  const [admin, setAdmin] = useState(null);
  const [bookings, setBookings] = useState([]);
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
    fetchBookings();
  }, [navigate]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await getAllBookings();
      setBookings(res.data.bookings);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  const mergeBooking = (id, updated) => {
    setBookings((prev) => prev.map((b) => (b.booking_id === id ? { ...b, ...updated } : b)));
    setViewTarget((prev) => (prev && prev.booking_id === id ? { ...prev, ...updated } : prev));
  };

  const handleAccept = async (booking) => {
    try {
      setBusyId(booking.booking_id);
      const res = await acceptBooking(booking.booking_id);
      toast.success(res.data.message);
      mergeBooking(booking.booking_id, res.data.booking);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to accept booking");
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
      setBusyId(rejectTarget.booking_id);
      const res = await rejectBooking(rejectTarget.booking_id, reason.trim());
      toast.success(res.data.message);
      mergeBooking(rejectTarget.booking_id, res.data.booking);
      setRejectTarget(null);
      setReason("");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to reject booking");
    } finally {
      setBusyId(null);
    }
  };

  if (!admin) return null;

  return (
    <div>
      <AdminNavbar user={admin} active="manage-bookings" />

      <section className="amb-page">
        <div className="amb-header">
          <h1 className="amb-heading">Manage Bookings</h1>
          {!loading && bookings.length > 0 && (
            <span className="amb-count">
              {bookings.length} {bookings.length === 1 ? "booking" : "bookings"}
            </span>
          )}
        </div>

        <div className="amb-table-wrap">
          {loading ? (
            <p className="amb-empty">Loading bookings...</p>
          ) : bookings.length === 0 ? (
            <p className="amb-empty">No bookings yet.</p>
          ) : (
            <table className="amb-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Subject</th>
                  <th>Student</th>
                  <th>Tutor</th>
                  <th>Booking Date</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b.booking_id}>
                    <td>{b.booking_id}</td>
                    <td>{b.subject}</td>
                    <td>{b.student_name}</td>
                    <td>{b.tutor_name}</td>
                    <td>{formatDate(b.booking_date)}</td>
                    <td>
                      <span className={`amb-status-badge amb-status-${b.status}`}>
                        {STATUS_LABELS[b.status]}
                      </span>
                    </td>
                    <td>
                      <button className="amb-action-view" onClick={() => setViewTarget(b)}>
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
          <div className="modal-box amb-view-box" onClick={(e) => e.stopPropagation()}>
            <div className="amb-view-header">
              <div>
                <p className="amb-subject">{viewTarget.subject}</p>
                <p className="amb-meta">
                  {viewTarget.class_level} &middot; {viewTarget.location}
                </p>
              </div>
              <span className={`amb-status-badge amb-status-${viewTarget.status}`}>
                {STATUS_LABELS[viewTarget.status]}
              </span>
            </div>

            <div className="amb-detail-grid">
              <div className="amb-detail-item">
                <span className="amb-detail-label">Student</span>
                <span className="amb-detail-value">{viewTarget.student_name}</span>
                <span className="amb-detail-sub">{viewTarget.student_email}</span>
              </div>
              <div className="amb-detail-item">
                <span className="amb-detail-label">Tutor</span>
                <span className="amb-detail-value">{viewTarget.tutor_name}</span>
                <span className="amb-detail-sub">{viewTarget.tutor_email}</span>
              </div>
            </div>

            <p className="amb-booked-on">Booked on {formatDate(viewTarget.booking_date)}</p>

            {viewTarget.status === "rejected" && viewTarget.rejection_reason && (
              <div className="amb-rejection-box">
                <span className="amb-detail-label">Rejection Reason</span>
                <p className="amb-text">{viewTarget.rejection_reason}</p>
              </div>
            )}

            {viewTarget.status === "pending" && (
              <div className="amb-actions">
                <button
                  className="amb-approve-btn"
                  onClick={() => handleAccept(viewTarget)}
                  disabled={busyId === viewTarget.booking_id}
                >
                  {busyId === viewTarget.booking_id ? (
                    <>
                      <span className="spinner" /> Accepting...
                    </>
                  ) : (
                    "Accept"
                  )}
                </button>
                <button
                  className="amb-reject-btn"
                  onClick={() => setRejectTarget(viewTarget)}
                  disabled={busyId === viewTarget.booking_id}
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
            <h3>Reject Booking</h3>
            <p>Let {rejectTarget.student_name} know why this booking was rejected.</p>
            <form onSubmit={handleReject}>
              <textarea
                className="amb-reason-input"
                rows={4}
                placeholder="Give reason to reject"
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

export default AdminManageBookings;
