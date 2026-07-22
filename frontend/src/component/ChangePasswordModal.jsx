import { useState } from "react";
import toast from "react-hot-toast";
import { changePassword } from "../service/Api";
import "./ChangePasswordModal.css";

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

const PasswordInput = ({ label, value, onChange }) => {
  const [visible, setVisible] = useState(false);
  return (
    <div className="cp-field">
      <label>{label}</label>
      <div className="cp-password-field">
        <input type={visible ? "text" : "password"} value={value} onChange={onChange} />
        <button type="button" className="cp-toggle" onClick={() => setVisible((v) => !v)}>
          <EyeIcon hidden={visible} />
        </button>
      </div>
    </div>
  );
};

function ChangePasswordModal({ onClose }) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.currentPassword || !form.newPassword || !form.confirmPassword) {
      return toast.error("All fields are required");
    }
    if (form.newPassword.length < 6) {
      return toast.error("New password must be at least 6 characters");
    }
    if (form.newPassword !== form.confirmPassword) {
      return toast.error("New passwords do not match");
    }

    try {
      setLoading(true);
      const response = await changePassword({
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      toast.success(response.data.message);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box cp-box" onClick={(e) => e.stopPropagation()}>
        <h3>Change Password</h3>
        <p>Enter your current password and choose a new one.</p>

        <form onSubmit={handleSubmit}>
          <PasswordInput
            label="Current Password"
            value={form.currentPassword}
            onChange={update("currentPassword")}
          />
          <PasswordInput
            label="New Password"
            value={form.newPassword}
            onChange={update("newPassword")}
          />
          <PasswordInput
            label="Confirm New Password"
            value={form.confirmPassword}
            onChange={update("confirmPassword")}
          />

          <div className="modal-actions">
            <button type="button" className="modal-btn-cancel" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="cp-submit" disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ChangePasswordModal;
