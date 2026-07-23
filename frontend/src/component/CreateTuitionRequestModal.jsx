import { useState } from "react";
import toast from "react-hot-toast";
import { createTuitionRequest } from "../service/Api";
import "./CreateTuitionRequestModal.css";

const GENDER_OPTIONS = [
  { value: "any", label: "Any" },
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
];

function CreateTuitionRequestModal({ onClose }) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    subject: "",
    location: "",
    classLevel: "",
    preferredGender: "any",
    budget: "",
    contactNumber: "",
    preferredTime: "",
    description: "",
  });

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const updateContactNumber = (e) => {
    const digitsOnly = e.target.value.replace(/\D/g, "");
    setForm({ ...form, contactNumber: digitsOnly });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !form.subject ||
      !form.location ||
      !form.classLevel ||
      !form.budget ||
      !form.contactNumber ||
      !form.description
    ) {
      return toast.error("Please fill in all required fields");
    }
    if (isNaN(form.budget) || Number(form.budget) < 0) {
      return toast.error("Enter a valid budget");
    }

    try {
      setLoading(true);
      const response = await createTuitionRequest(form);
      toast.success(response.data.message);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create tuition request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box ctr-box" onClick={(e) => e.stopPropagation()}>
        <h3>Create Tuition Request</h3>
        <p>Share your requirements so tutors can apply.</p>

        <form onSubmit={handleSubmit}>
          <div className="ctr-grid">
            <div className="ctr-field">
              <label>Subject</label>
              <input type="text" placeholder="e.g. Mathematics" value={form.subject} onChange={update("subject")} />
            </div>
            <div className="ctr-field">
              <label>Location</label>
              <input type="text" placeholder="e.g. Kathmandu" value={form.location} onChange={update("location")} />
            </div>
            <div className="ctr-field">
              <label>Class Level</label>
              <input type="text" placeholder="e.g. Grade 10" value={form.classLevel} onChange={update("classLevel")} />
            </div>
            <div className="ctr-field">
              <label>Budget (per month)</label>
              <input type="number" min="0" placeholder="e.g. 10000" value={form.budget} onChange={update("budget")} />
            </div>
            <div className="ctr-field">
              <label>Contact Number</label>
              <input
                type="tel"
                inputMode="numeric"
                placeholder="e.g. 9800000000"
                value={form.contactNumber}
                onChange={updateContactNumber}
              />
            </div>
            <div className="ctr-field">
              <label>Preferred Time</label>
              <input type="text" placeholder="e.g. 5 PM to 6 PM" value={form.preferredTime} onChange={update("preferredTime")} />
            </div>
          </div>

          <div className="ctr-field">
            <label>Preferred Tutor Gender</label>
            <div className="ctr-gender-options">
              {GENDER_OPTIONS.map((opt) => (
                <label key={opt.value} className="ctr-gender-option">
                  <input
                    type="radio"
                    name="preferredGender"
                    value={opt.value}
                    checked={form.preferredGender === opt.value}
                    onChange={update("preferredGender")}
                  />
                  {opt.label}
                </label>
              ))}
            </div>
          </div>

          <div className="ctr-field">
            <label>Description</label>
            <textarea
              rows={3}
              placeholder="Any extra details tutors should know"
              value={form.description}
              onChange={update("description")}
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="modal-btn-cancel" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="ctr-submit" disabled={loading}>
              {loading ? "Posting..." : "Post Request"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateTuitionRequestModal;
