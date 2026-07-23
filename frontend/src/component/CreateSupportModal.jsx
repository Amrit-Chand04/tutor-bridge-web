import { useState } from "react";
import toast from "react-hot-toast";
import { createSupportTicket } from "../service/Api";
import "./CreateSupportModal.css";

function CreateSupportModal({ onClose }) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ subject: "", description: "" });

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.subject.trim() || !form.description.trim()) {
      return toast.error("Subject and description are required");
    }

    try {
      setLoading(true);
      const response = await createSupportTicket(form);
      toast.success(response.data.message);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create support ticket");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box cs-box" onClick={(e) => e.stopPropagation()}>
        <h3>Create Support Ticket</h3>
        <p>Tell us what's going wrong and we'll get back to you.</p>

        <form onSubmit={handleSubmit}>
          <div className="cs-field">
            <label htmlFor="subject">Subject</label>
            <input
              id="subject"
              type="text"
              placeholder="e.g. Unable to reset password"
              value={form.subject}
              onChange={update("subject")}
            />
          </div>

          <div className="cs-field">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              rows={4}
              placeholder="Describe your issue in detail"
              value={form.description}
              onChange={update("description")}
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="modal-btn-cancel" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="cs-submit" disabled={loading}>
              {loading && <span className="spinner" />}
              {loading ? "Submitting..." : "Submit Ticket"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateSupportModal;
