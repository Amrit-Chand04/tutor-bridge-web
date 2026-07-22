import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import logo from "../assets/tutor_bridge_logo.png";
import "./DashboardNavbar.css";

const AVATAR_COLORS = ["#5b4fe8", "#2f9e44", "#e2574c", "#0891b2", "#d97706"];

const getInitials = (name = "") => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const initials = parts.slice(0, 2).map((p) => p[0].toUpperCase());
  return initials.join("") || "U";
};

const getAvatarColor = (name = "") => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash + name.charCodeAt(i)) % AVATAR_COLORS.length;
  }
  return AVATAR_COLORS[hash];
};

function DashboardNavbar({ user, active = "dashboard" }) {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const notReady = () => toast("Coming soon");

  const confirmLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const initials = getInitials(user?.full_name);
  const avatarColor = getAvatarColor(user?.full_name || "");

  return (
    <nav className="dash-navbar">
      <Link to="/dashboard" className="navbar-logo">
        <img src={logo} alt="Tutor Bridge" />
      </Link>

      <div className="dash-navbar-links">
        <Link
          to="/dashboard"
          className={`nav-pill nav-pill-tan ${active === "dashboard" ? "nav-pill-active" : ""}`}
        >
          Dashboard
        </Link>
        <a href="#" className="nav-pill nav-pill-green" onClick={(e) => { e.preventDefault(); notReady(); }}>
          My Requests
        </a>
        <a href="#" className="nav-pill nav-pill-tan" onClick={(e) => { e.preventDefault(); notReady(); }}>
          Support
        </a>
      </div>

      <div className="dash-navbar-actions">
        <button className="icon-btn" aria-label="Notifications" onClick={notReady}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M18 8a6 6 0 1 0-12 0c0 4-1.5 5.5-1.5 6.5h15C18 13.5 18 12 18 8z" />
            <path d="M9.5 17.5a2.5 2.5 0 0 0 5 0" />
          </svg>
        </button>

        <div className="profile-menu">
          <button className="profile-trigger" onClick={() => setMenuOpen((v) => !v)}>
            <span className="avatar" style={{ background: avatarColor }}>
              {initials}
            </span>
            <span className="profile-label">Profile</span>
          </button>

          {menuOpen && (
            <div className="profile-dropdown">
              <button
                onClick={() => {
                  setMenuOpen(false);
                  setShowLogoutConfirm(true);
                }}
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>

      {showLogoutConfirm && (
        <div className="modal-overlay" onClick={() => setShowLogoutConfirm(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h3>Log out?</h3>
            <p>Are you sure you want to logout of your account?</p>
            <div className="modal-actions">
              <button className="modal-btn-cancel" onClick={() => setShowLogoutConfirm(false)}>
                Cancel
              </button>
              <button className="modal-btn-confirm" onClick={confirmLogout}>
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

export default DashboardNavbar;
