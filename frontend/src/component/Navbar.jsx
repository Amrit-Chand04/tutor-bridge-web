import { Link, useLocation, useNavigate } from "react-router-dom";
import logo from "../assets/tutor_bridge_logo.png";
import "./Navbar.css";

function Navbar({ hideAuthActions = false, hideNavLinks = false }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleSectionClick = (e, id) => {
    e.preventDefault();
    if (location.pathname === "/") {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    } else {
      navigate(`/#${id}`);
    }
  };

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-logo">
        <img src={logo} alt="Tutor Bridge" />
      </Link>

      {!hideNavLinks && (
        <div className="navbar-links">
          <a
            href="#about"
            className="nav-pill nav-pill-tan"
            onClick={(e) => handleSectionClick(e, "about")}
          >
            About Us
          </a>
          <a
            href="#how-it-works"
            className="nav-pill nav-pill-green"
            onClick={(e) => handleSectionClick(e, "how-it-works")}
          >
            How It Works
          </a>
          <a
            href="#contact"
            className="nav-pill nav-pill-tan"
            onClick={(e) => handleSectionClick(e, "contact")}
          >
            Contact
          </a>
        </div>
      )}

      {!hideAuthActions && (
        <div className="navbar-actions">
          <Link to="/login" className="btn btn-outline">
            Login
          </Link>
          <Link to="/register" className="btn btn-primary">
            Register
          </Link>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
