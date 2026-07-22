import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import DashboardNavbar from "../component/DashboardNavbar";
import CreateTuitionRequestModal from "../component/CreateTuitionRequestModal";
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
  const [showCreateRequest, setShowCreateRequest] = useState(false);

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
              <button className="btn-create" onClick={() => setShowCreateRequest(true)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M12 5v14M5 12h14" />
                </svg>
                Create Tuition Request
              </button>
              <button className="btn-support" onClick={notReady}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M4 13v-1a8 8 0 0 1 16 0v1" />
                  <rect x="3" y="13" width="4" height="6" rx="2" />
                  <rect x="17" y="13" width="4" height="6" rx="2" />
                  <path d="M20 19v1a3 3 0 0 1-3 3h-3" />
                </svg>
                Create Support
              </button>
            </div>
          </div>
        </div>

        <div className="dash-hero-image">
          <img src={heroImg} alt="" />
        </div>
      </section>

      {showCreateRequest && (
        <CreateTuitionRequestModal onClose={() => setShowCreateRequest(false)} />
      )}
    </div>
  );
}

export default StudentDashboard;
