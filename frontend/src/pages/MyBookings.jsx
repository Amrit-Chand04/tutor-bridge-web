import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import DashboardNavbar from "../component/DashboardNavbar";
import { getMyBookings } from "../service/Api";
import { getDashboardPath } from "../utils/roleRoutes";
import "./MyBookings.css";

const STATUS_LABELS = { pending: "Pending", booked: "Booked", rejected: "Rejected" };

const formatDate = (dateString) => {
  const d = new Date(dateString);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

function MyBookings() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

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
    fetchBookings();
  }, [navigate]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await getMyBookings();
      setBookings(res.data.bookings);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load your bookings");
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div>
      <DashboardNavbar user={user} minimal />

      <section className="mb-page">
        <div className="mb-header">
          <h1 className="mb-heading">My Booking</h1>
          {!loading && bookings.length > 0 && (
            <span className="mb-count">
              {bookings.length} {bookings.length === 1 ? "booking" : "bookings"}
            </span>
          )}
        </div>

        <div className="mb-table-wrap">
          {loading ? (
            <p className="mb-empty">Loading your bookings...</p>
          ) : bookings.length === 0 ? (
            <p className="mb-empty">You don't have any bookings yet.</p>
          ) : (
            <table className="mb-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Subject</th>
                  <th>Tutor</th>
                  <th>Booking Date</th>
                  <th>Status</th>
                  <th>Rejection Reason</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b.booking_id}>
                    <td>{b.booking_id}</td>
                    <td>{b.subject}</td>
                    <td>
                      <p className="mb-tutor-name">{b.tutor_name}</p>
                      <p className="mb-tutor-email">{b.tutor_email}</p>
                    </td>
                    <td>{formatDate(b.booking_date)}</td>
                    <td>
                      <span className={`mb-status-badge mb-status-${b.status}`}>{STATUS_LABELS[b.status]}</span>
                    </td>
                    <td className="mb-reason-cell">
                      {b.status === "rejected" ? b.rejection_reason : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  );
}

export default MyBookings;
