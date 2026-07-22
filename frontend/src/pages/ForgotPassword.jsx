import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Navbar from "../component/Navbar";
import { forgotPassword, resetPassword } from "../service/Api";
import "./ForgotPassword.css";

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

function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState("email");
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const otpRefs = useRef([]);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwords, setPasswords] = useState({ newPassword: "", confirmPassword: "" });

  const handleSendCode = async (e) => {
    e.preventDefault();
    if (!email) {
      return toast.error("Enter your email address");
    }

    try {
      setLoading(true);
      const response = await forgotPassword({ email });
      toast.success(response.data.message);
      setStep("reset");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send reset code");
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

  const handleResetPassword = async (e) => {
    e.preventDefault();
    const otp = otpDigits.join("");

    if (otp.length < 6) {
      return toast.error("Enter the 6-digit code sent to your email");
    }
    if (!passwords.newPassword || !passwords.confirmPassword) {
      return toast.error("Enter and confirm your new password");
    }
    if (passwords.newPassword !== passwords.confirmPassword) {
      return toast.error("Passwords do not match");
    }

    try {
      setLoading(true);
      const response = await resetPassword({
        email,
        otp,
        newPassword: passwords.newPassword,
      });
      toast.success(response.data.message);
      navigate("/login");
    } catch (err) {
      toast.error(err.response?.data?.message || "Password reset failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Navbar hideAuthActions />

      <section className="forgot">
        <div className="forgot-hero">
          <span className="forgot-badge">CONNECT &nbsp;·&nbsp; LEARN &nbsp;·&nbsp; GROW</span>
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

        <div className="forgot-panel">
          <h1 className="forgot-welcome">
            {step === "email" ? "Forgot Password?" : "Reset Password"}
          </h1>

          <div className="forgot-card">
            {step === "email" ? (
              <form onSubmit={handleSendCode}>
                <p className="forgot-subtitle">
                  Enter your email and we'll send you a code to reset your password.
                </p>

                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />

                <button type="submit" className="submit-btn" disabled={loading}>
                  {loading && <span className="spinner" />}
                  {loading ? "Sending..." : "Send Reset Code"}
                </button>

                <p className="signup-hint">
                  Remembered your password? <Link to="/login">Login</Link>
                </p>
              </form>
            ) : (
              <form onSubmit={handleResetPassword} className="reset-form">
                <p className="forgot-subtitle">
                  Enter the 6-digit code sent to <strong>{email}</strong>
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

                <label htmlFor="newPassword">New Password</label>
                <div className="password-field">
                  <input
                    id="newPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a new password"
                    value={passwords.newPassword}
                    onChange={(e) =>
                      setPasswords({ ...passwords, newPassword: e.target.value })
                    }
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
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your new password"
                    value={passwords.confirmPassword}
                    onChange={(e) =>
                      setPasswords({ ...passwords, confirmPassword: e.target.value })
                    }
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

                <button type="submit" className="submit-btn" disabled={loading}>
                  {loading && <span className="spinner" />}
                  {loading ? "Resetting..." : "Reset Password"}
                </button>

                <p className="signup-hint">
                  Wrong email?{" "}
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setStep("email");
                    }}
                  >
                    Go back
                  </a>
                </p>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

export default ForgotPassword;
