import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import AdminNavbar from "../component/AdminNavbar";
import { getDashboardPath } from "../utils/roleRoutes";
import heroImg from "../assets/my_pic.png";
import "./StudentDashboard.css";

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 17) return "Good Afternoon";
  return "Good Evening";
};

function AdminDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

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
    setUser(parsedUser);
  }, [navigate]);

  if (!user) return null;

  const notReady = () => toast("Coming soon");

  return (
    <div>
      <AdminNavbar user={user} active="dashboard" />

      <section className="dash-hero">
        <div className="dash-hero-text">
          <span className="dash-badge">CONNECT &nbsp;·&nbsp; LEARN &nbsp;·&nbsp; GROW</span>

          <h1 className="dash-greeting">
            {getGreeting()},
            <br />
            <span className="dash-name">{user.full_name}</span>
          </h1>

          <div className="dash-card">
            <h2>Manage Your Platform</h2>
            <p>
              Review user activity and bookings.
              <br />
              Keep tutors, students, and support running smoothly.
            </p>

            <div className="dash-card-actions">
              <button className="btn-create" onClick={notReady}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M3 8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-4V8z" />
                  <path d="M13 6v12" strokeDasharray="2 2" />
                </svg>
                Support Tickets
              </button>
            </div>
          </div>
        </div>

        <div className="dash-hero-image">
          <img src={heroImg} alt="" />
        </div>
      </section>
    </div>
  );
}

export default AdminDashboard;
