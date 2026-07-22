import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Navbar from "../component/Navbar";
import { registerUser, verifyOtp } from "../service/Api";
import "./Register.css";

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

function Register() {
  const navigate = useNavigate();
  const [step, setStep] = useState("form");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const otpRefs = useRef([]);

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "student",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.full_name || !form.email || !form.password || !form.confirmPassword) {
      return toast.error("All fields are required");
    }
    if (form.password !== form.confirmPassword) {
      return toast.error("Passwords do not match");
    }

    try {
      setLoading(true);
      const response = await registerUser({
        full_name: form.full_name,
        email: form.email,
        password: form.password,
        role: form.role,
      });
      toast.success(response.data.message);
      setStep("otp");
    } catch (e) {
      toast.error(e.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    const updated = [...otpDigits];
    updated[index] = digit;
    setOtpDigits(updated);

    if (digit && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      e.preventDefault();
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    const otp = otpDigits.join("");
    if (otp.length < 6) {
      return toast.error("Enter the 6-digit OTP sent to your email");
    }

    try {
      setLoading(true);
      const response = await verifyOtp({ email: form.email, otp });
      toast.success(response.data.message);
      navigate("/login");
    } catch (e) {
      toast.error(e.response?.data?.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Navbar hideAuthActions hideNavLinks={step === "otp"} />

      <section className={`register ${step === "otp" ? "register-centered" : ""}`}>
        {step === "form" && (
          <div className="register-hero">
            <span className="register-badge">CONNECT &nbsp;·&nbsp; LEARN &nbsp;·&nbsp; GROW</span>
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
        )}

        <div className={`register-card ${step === "otp" ? "otp-card" : ""}`}>
          {step === "form" ? (
            <form onSubmit={handleSubmit}>
              <h2>Create an account</h2>

              <label htmlFor="full_name">Full Name</label>
              <input
                id="full_name"
                name="full_name"
                type="text"
                placeholder="Enter your full name"
                value={form.full_name}
                onChange={handleChange}
              />

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
                  placeholder="Create your password"
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

              <label htmlFor="confirmPassword">Confirm Password</label>
              <div className="password-field">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  className="toggle-visibility"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label="Toggle confirm password visibility"
                >
                  <EyeIcon hidden={showConfirmPassword} />
                </button>
              </div>

              <div className="role-field">
                <span className="role-label">Role</span>
                <label className="role-option">
                  <input
                    type="radio"
                    name="role"
                    value="tutor"
                    checked={form.role === "tutor"}
                    onChange={handleChange}
                  />
                  I'm a Tutor
                </label>
                <label className="role-option">
                  <input
                    type="radio"
                    name="role"
                    value="student"
                    checked={form.role === "student"}
                    onChange={handleChange}
                  />
                  I'm a Student
                </label>
              </div>

              <button type="submit" className="submit-btn" disabled={loading}>
                {loading && <span className="spinner" />}
                {loading ? "Registering..." : "Create an account"}
              </button>

              <p className="login-hint">
                Already have an account? <a href="/login">Login</a>
              </p>
            </form>
          ) : (
            <form onSubmit={handleVerify} className="otp-form">
              <div className="otp-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="#5b4fe8" strokeWidth="1.8">
                  <rect x="3" y="5" width="18" height="14" rx="2" />
                  <path d="M3 7l9 6 9-6" />
                </svg>
              </div>
              <h2>Verify your email</h2>
              <p className="otp-subtitle">
                Enter the 6-digit code sent to <strong>{form.email}</strong>
              </p>

              <div className="otp-boxes">
                {otpDigits.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (otpRefs.current[index] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    className="otp-box"
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                  />
                ))}
              </div>

              <button type="submit" className="submit-btn" disabled={loading}>
                {loading && <span className="spinner" />}
                {loading ? "Verifying..." : "Verify & Create Account"}
              </button>

              <p className="login-hint">
                Wrong email?{" "}
                <a href="#" onClick={(e) => { e.preventDefault(); setStep("form"); }}>
                  Go back
                </a>
              </p>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}

export default Register;
