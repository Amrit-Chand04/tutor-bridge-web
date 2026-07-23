import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import DashboardNavbar from "../component/DashboardNavbar";
import TutorNavbar from "../component/TutorNavbar";
import AdminNavbar from "../component/AdminNavbar";
import { getSupportTicketDetail, addTicketMessage } from "../service/Api";
import "./SupportTicketDetail.css";

const formatDateTime = (dateString) => {
  const d = new Date(dateString);
  return d.toLocaleString(undefined, {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const NAVBARS = {
  student: DashboardNavbar,
  tutor: TutorNavbar,
  admin: AdminNavbar,
};

function SupportTicketDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [ticket, setTicket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [response, setResponse] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    if (!token || !storedUser) {
      navigate("/login");
      return;
    }
    setUser(JSON.parse(storedUser));
    fetchTicket();
  }, [navigate, id]);

  const fetchTicket = async () => {
    try {
      setLoading(true);
      const res = await getSupportTicketDetail(id);
      setTicket(res.data.ticket);
      setMessages(res.data.messages);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load ticket");
      navigate(-1);
    } finally {
      setLoading(false);
    }
  };

  const handleRespond = async (e) => {
    e.preventDefault();
    if (!response.trim()) {
      return toast.error("Enter a response before sending");
    }

    try {
      setSending(true);
      const res = await addTicketMessage(id, response.trim());
      setMessages([...messages, res.data.ticketMessage]);
      setTicket({ ...ticket, status: "resolved" });
      toast.success(res.data.message);
      setResponse("");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send response");
    } finally {
      setSending(false);
    }
  };

  if (!user) return null;

  const Navbar = NAVBARS[user.role] || DashboardNavbar;
  const adminResponse = messages.length > 0 ? messages[messages.length - 1] : null;

  return (
    <div>
      <Navbar user={user} active={user.role === "admin" ? "dashboard" : "support"} />

      <section className="td-page">
        {loading ? (
          <p className="td-empty">Loading ticket...</p>
        ) : ticket ? (
          <div className="td-card">
            <button className="td-back" onClick={() => navigate(-1)} aria-label="Go back">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>

            <div className="td-card-header">
              <div>
                <p className="td-ticket-number">Support Ticket #{ticket.ticket_id}</p>
                <h1 className="td-ticket-subject">{ticket.subject}</h1>
              </div>
              <span className={`td-status-badge td-status-${ticket.status}`}>
                <span className="td-status-dot" />
                {ticket.status === "resolved" ? "Resolved" : "Open"}
              </span>
            </div>

            <div className="td-section">
              <div className="td-section-label">
                <span className="td-icon td-icon-problem">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <circle cx="12" cy="12" r="9" />
                    <path d="M12 8v5" />
                    <path d="M12 16h.01" />
                  </svg>
                </span>
                Problem
              </div>
              <p className="td-text">{ticket.description}</p>
            </div>

            <div className="td-section">
              <div className="td-section-label">
                <span className="td-icon td-icon-response">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M21 11.5a8.5 8.5 0 1 1-3.8-7.1" />
                    <path d="M21 4l-9.5 9.5L8 10" />
                  </svg>
                </span>
                Admin Response
              </div>
              {adminResponse ? (
                <div className="td-response-box">
                  <p className="td-text">{adminResponse.message}</p>
                  <span className="td-response-time">{formatDateTime(adminResponse.sent_time)}</span>
                </div>
              ) : (
                <div className="td-waiting-box">
                  <p className="td-waiting">Waiting for response...</p>
                </div>
              )}
            </div>

            {user.role === "admin" && ticket.status === "open" && (
              <div className="td-section td-reply-section">
                <div className="td-section-label">
                  <span className="td-icon td-icon-reply">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d="M4 4l16 8-16 8V4z" />
                    </svg>
                  </span>
                  Respond to this ticket
                </div>
                <form className="td-reply-form" onSubmit={handleRespond}>
                  <textarea
                    rows={4}
                    placeholder="Write your response..."
                    value={response}
                    onChange={(e) => setResponse(e.target.value)}
                  />
                  <button type="submit" className="td-send-btn" disabled={sending}>
                    {sending && <span className="spinner" />}
                    {sending ? "Sending..." : "Send Response"}
                  </button>
                </form>
              </div>
            )}
          </div>
        ) : null}
      </section>
    </div>
  );
}

export default SupportTicketDetail;
