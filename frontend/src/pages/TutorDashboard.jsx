import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import TutorNavbar from "../component/TutorNavbar";
import CreateSupportModal from "../component/CreateSupportModal";
import { getDashboardPath } from "../utils/roleRoutes";
import heroImg from "../assets/my_pic.png";
import "./StudentDashboard.css";

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 17) return "Good Afternoon";
  return "Good Evening";
};

function TutorDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [showCreateSupport, setShowCreateSupport] = useState(false);

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
    setUser(parsedUser);
  }, [navigate]);

  if (!user) return null;

  return (
    <div>
      <TutorNavbar user={user} active="dashboard" />

      <section className="dash-hero">
        <div className="dash-hero-text">
          <span className="dash-badge">CONNECT &nbsp;·&nbsp; LEARN &nbsp;·&nbsp; GROW</span>

          <h1 className="dash-greeting">
            {getGreeting()},
            <br />
            <span className="dash-name">{user.full_name}</span>
          </h1>

          <div className="dash-card">
            <h2>Find Your Next Student</h2>
            <p>
              Browse tuition requests posted by students.
              <br />
              Review the details and apply to the ones that suit you.
            </p>

            <div className="dash-card-actions">
              <Link to="/tutor/browse-tuitions" className="btn-create">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <circle cx="11" cy="11" r="7" />
                  <path d="M21 21l-4.3-4.3" />
                </svg>
                View Available Tuitions
              </Link>
              <button className="btn-support" onClick={() => setShowCreateSupport(true)}>
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

      {showCreateSupport && (
        <CreateSupportModal onClose={() => setShowCreateSupport(false)} />
      )}
    </div>
  );
}

export default TutorDashboard;
