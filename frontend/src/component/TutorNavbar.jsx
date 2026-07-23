import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import logo from "../assets/tutor_bridge_logo.png";
import ChangePasswordModal from "./ChangePasswordModal";
import UpdateProfileModal from "./UpdateProfileModal";
import "./DashboardNavbar.css";

const MENU_ITEMS = [
  { icon: "🧑‍🎓", label: "My Student" },
];

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

function TutorNavbar({ user, active = "dashboard", minimal = false }) {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showUpdateProfile, setShowUpdateProfile] = useState(false);
  const menuRef = useRef(null);

  const notReady = () => {
    setMenuOpen(false);
    toast("Coming soon");
  };

  const confirmLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  useEffect(() => {
    if (!menuOpen) return;

    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    const handleEscape = (e) => {
      if (e.key === "Escape") setMenuOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [menuOpen]);

  const initials = getInitials(user?.full_name);
  const avatarColor = getAvatarColor(user?.full_name || "");

  return (
    <nav className="dash-navbar">
      <Link to="/tutor-dashboard" className="navbar-logo">
        <img src={logo} alt="Tutor Bridge" />
      </Link>

      {!minimal && (
        <div className="dash-navbar-links">
          <Link
            to="/tutor-dashboard"
            className={`nav-pill nav-pill-tan ${active === "dashboard" ? "nav-pill-active" : ""}`}
          >
            Dashboard
          </Link>
          <a href="#" className="nav-pill nav-pill-green" onClick={(e) => { e.preventDefault(); notReady(); }}>
            My Application
          </a>
          <Link
            to="/support"
            className={`nav-pill nav-pill-tan ${active === "support" ? "nav-pill-active" : ""}`}
          >
            Support
          </Link>
        </div>
      )}

      <div className="dash-navbar-actions">
        {!minimal && (
          <button className="icon-btn" aria-label="Notifications" onClick={notReady}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M18 8a6 6 0 1 0-12 0c0 4-1.5 5.5-1.5 6.5h15C18 13.5 18 12 18 8z" />
              <path d="M9.5 17.5a2.5 2.5 0 0 0 5 0" />
            </svg>
          </button>
        )}

        <div className="profile-menu" ref={menuRef}>
          <button
            className="profile-trigger"
            onClick={() => setMenuOpen((v) => !v)}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
          >
            <span className="avatar" style={{ background: avatarColor }}>
              {user?.profile_photo ? <img src={user.profile_photo} alt="" /> : initials}
            </span>
            <span className="profile-label">Profile</span>
          </button>

          {menuOpen && (
            <div className="profile-dropdown" role="menu">
              <div className="profile-dropdown-header">
                <span className="avatar avatar-lg" style={{ background: avatarColor }}>
                  {user?.profile_photo ? <img src={user.profile_photo} alt="" /> : initials}
                </span>
                <div className="profile-dropdown-info">
                  <p className="profile-dropdown-name">{user?.full_name || "User"}</p>
                  <p className="profile-dropdown-email">{user?.email}</p>
                </div>
              </div>

              <div className="profile-dropdown-divider" />

              <button
                role="menuitem"
                className="dropdown-item"
                onClick={() => {
                  setMenuOpen(false);
                  setShowUpdateProfile(true);
                }}
              >
                <span className="dropdown-item-icon">👤</span>
                Update Profile
              </button>

              <button
                role="menuitem"
                className="dropdown-item"
                onClick={() => {
                  setMenuOpen(false);
                  setShowChangePassword(true);
                }}
              >
                <span className="dropdown-item-icon">🔒</span>
                Change Password
              </button>

              <button
                role="menuitem"
                className="dropdown-item"
                onClick={() => {
                  setMenuOpen(false);
                  navigate("/tutor/profile");
                }}
              >
                <span className="dropdown-item-icon">📇</span>
                My Tutor Profile
              </button>

              {MENU_ITEMS.map((item) => (
                <button key={item.label} role="menuitem" className="dropdown-item" onClick={notReady}>
                  <span className="dropdown-item-icon">{item.icon}</span>
                  {item.label}
                </button>
              ))}

              <button
                role="menuitem"
                className="dropdown-item dropdown-item-danger"
                onClick={() => {
                  setMenuOpen(false);
                  setShowLogoutConfirm(true);
                }}
              >
                <span className="dropdown-item-icon">🚪</span>
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

      {showChangePassword && (
        <ChangePasswordModal onClose={() => setShowChangePassword(false)} />
      )}

      {showUpdateProfile && (
        <UpdateProfileModal user={user} onClose={() => setShowUpdateProfile(false)} />
      )}
    </nav>
  );
}

export default TutorNavbar;
