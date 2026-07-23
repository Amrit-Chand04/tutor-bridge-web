import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import AdminNavbar from "../component/AdminNavbar";
import { getAllSupportTickets } from "../service/Api";
import { getDashboardPath } from "../utils/roleRoutes";
import "./SupportTickets.css";

const formatDate = (dateString) => {
  const d = new Date(dateString);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

function AdminSupportTickets() {
  const navigate = useNavigate();
  const [admin, setAdmin] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

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
    fetchTickets();
  }, [navigate]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const response = await getAllSupportTickets();
      setTickets(response.data.tickets);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load support tickets");
    } finally {
      setLoading(false);
    }
  };

  if (!admin) return null;

  return (
    <div>
      <AdminNavbar user={admin} active="dashboard" />

      <section className="st-page">
        <div className="st-header">
          <h1 className="st-heading">Support Tickets</h1>
          {!loading && tickets.length > 0 && (
            <span className="st-count">
              {tickets.length} {tickets.length === 1 ? "ticket" : "tickets"}
            </span>
          )}
        </div>

        <div className="st-table-wrap">
          {loading ? (
            <p className="st-empty">Loading support tickets...</p>
          ) : tickets.length === 0 ? (
            <p className="st-empty">No support tickets have been raised yet.</p>
          ) : (
            <table className="st-table">
              <thead>
                <tr>
                  <th>Ticket ID</th>
                  <th>Raised By</th>
                  <th>Subject</th>
                  <th>Status</th>
                  <th>Created Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map((t) => (
                  <tr key={t.ticket_id}>
                    <td>{t.ticket_id}</td>
                    <td>{t.raised_by}</td>
                    <td>{t.subject}</td>
                    <td>
                      <span className={`st-status-badge st-status-${t.status}`}>
                        {t.status}
                      </span>
                    </td>
                    <td>{formatDate(t.created_at)}</td>
                    <td>
                      <button
                        className="st-action-view"
                        onClick={() => navigate(`/support/${t.ticket_id}`)}
                      >
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
    </div>
  );
}

export default AdminSupportTickets;
