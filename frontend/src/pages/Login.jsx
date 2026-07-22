import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Navbar from "../component/Navbar";
import { loginUser } from "../service/Api";
import "./Login.css";

const EyeIcon = ({ hidden }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    {hidden ? (
      <>
        <path d="M3 3l18 18" />
        <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
        <path d="M9.4 5.5A10.6 10.6 0 0 1 12 5c5 0 9 4 10 7-.4 1.2-1.2 2.5-2.3 3.6M6.3 6.3C4.4 7.5 3 9.3 2 12c1 3 5 7 10 7 1.1 0 2.2-.2 3.2-.5" />
      </>
    ) : (
      <>
        <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z" />
        <circle cx="12" cy="12" r="3" />
      </>
    )}
  </svg>
);

function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.email || !form.password) {
      return toast.error("Email and password are required");
    }

    try {
      setLoading(true);
      const response = await loginUser(form);
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      toast.success(response.data.message);
      navigate("/");
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Navbar hideAuthActions />

      <section className="login">
        <div className="login-hero">
          <span className="login-badge">CONNECT &nbsp;·&nbsp; LEARN &nbsp;·&nbsp; GROW</span>
          <h1>
            Connecting Tutors
            <br />
            &amp; Students
            <br />
            <span className="accent">Directly</span>
          </h1>
          <p>
            Find trusted tutors and tuition opportunities without brokers,
            hidden fees, or unnecessary commissions.
          </p>
        </div>

        <div className="login-panel">
          <h1 className="login-welcome">Welcome Back</h1>

          <div className="login-card">
            <h2>Login</h2>

            <form onSubmit={handleSubmit}>
              <label htmlFor="email">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email address"
                value={form.email}
                onChange={handleChange}
              />

              <label htmlFor="password">Password</label>
              <div className="password-field">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  className="toggle-visibility"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Toggle password visibility"
                >
                  <EyeIcon hidden={showPassword} />
                </button>
              </div>

              <a
                href="#"
                className="forget-password"
                onClick={(e) => {
                  e.preventDefault();
                  toast("Password reset is coming soon");
                }}
              >
                Forget Password
              </a>

              <button type="submit" className="submit-btn" disabled={loading}>
                {loading && <span className="spinner" />}
                {loading ? "Logging in..." : "Login"}
              </button>

              <p className="signup-hint">
                Don't have account?{" "}
                <Link to="/register">Sign Up</Link>
              </p>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Login;
