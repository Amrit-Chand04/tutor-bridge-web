import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import DashboardNavbar from "../component/DashboardNavbar";
import heroImg from "../assets/my_pic.png";
import "./StudentDashboard.css";

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 17) return "Good Afternoon";
  return "Good Evening";
};

function StudentDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    if (!token || !storedUser) {
      navigate("/login");
      return;
    }
    setUser(JSON.parse(storedUser));
  }, [navigate]);

  if (!user) return null;

  const notReady = () => toast("Coming soon");

  return (
    <div>
      <DashboardNavbar user={user} active="dashboard" />

      <section className="dash-hero">
        <div className="dash-hero-text">
          <span className="dash-badge">CONNECT &nbsp;·&nbsp; LEARN &nbsp;·&nbsp; GROW</span>

          <h1 className="dash-greeting">
            {getGreeting()},
            <br />
            <span className="dash-name">{user.full_name}</span>
          </h1>

          <div className="dash-card">
            <h2>Find Your Perfect Tutor</h2>
            <p>
              Post your requirements.
              <br />
              Review applications and choose the right tutor.
            </p>

            <div className="dash-card-actions">
              <button className="btn-create" onClick={notReady}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M12 5v14M5 12h14" />
                </svg>
                Create Tuition Request
              </button>
              <button className="btn-support" onClick={notReady}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.8.4-1 .8-1 1.7" />
                  <path d="M12 17h.01" />
                </svg>
                Support
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

export default StudentDashboard;
