import { Link } from "react-router-dom";
import logo from "../assets/tutor_bridge_logo.png";
import "./Navbar.css";

function Navbar() {
  return (
    <nav className="navbar">
      <Link to="/" className="navbar-logo">
        <img src={logo} alt="Tutor Bridge" />
      </Link>

      <div className="navbar-links">
        <a href="#about">About Us</a>
        <a href="#how-it-works">How It Works</a>
        <a href="#contact">Contact</a>
      </div>

      <div className="navbar-actions">
        <Link to="/login" className="btn btn-outline">
          Login
        </Link>
        <Link to="/register" className="btn btn-primary">
          Register
        </Link>
      </div>
    </nav>
  );
}

export default Navbar;
