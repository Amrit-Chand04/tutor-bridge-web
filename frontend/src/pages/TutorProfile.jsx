import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import TutorNavbar from "../component/TutorNavbar";
import { getMyTutorProfile, saveTutorProfile, deleteMyTutorProfile } from "../service/Api";
import { getDashboardPath } from "../utils/roleRoutes";
import "./TutorProfile.css";

const STATUS_LABELS = {
  not_submitted: "Not Submitted",
  pending: "Pending",
  verified: "Verified",
  rejected: "Rejected",
};

function TutorProfile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [status, setStatus] = useState("not_submitted");
  const [cvUrl, setCvUrl] = useState(null);
  const [cvFile, setCvFile] = useState(null);
  const [form, setForm] = useState({
    degree: "",
    institution: "",
    passingYear: "",
    yearsExperience: "",
    description: "",
    skills: "",
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    if (!token || !storedUser) {
      navigate("/login");
      return;
    }
    const parsedUser = JSON.parse(storedUser);
    if (parsedUser.role !== "tutor") {
      navigate(getDashboardPath(parsedUser.role));
      return;
    }
    setUser(parsedUser);
    fetchProfile();
  }, [navigate]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await getMyTutorProfile();
      const profile = res.data.profile;
      if (profile) {
        setStatus(profile.verification_status);
        setCvUrl(profile.cv_url);
        setForm({
          degree: profile.degree || "",
          institution: profile.institution || "",
          passingYear: profile.passing_year || "",
          yearsExperience: profile.years_experience || "",
          description: profile.description || "",
          skills: profile.skills || "",
        });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load tutor profile");
    } finally {
      setLoading(false);
    }
  };

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleCvChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      return toast.error("Please select an image file");
    }
    setCvFile(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      (!cvFile && !cvUrl) ||
      !form.degree.trim() ||
      !form.institution.trim() ||
      !form.passingYear ||
      !form.yearsExperience ||
      !form.description.trim() ||
      !form.skills.trim()
    ) {
      return toast.error("Please fill in all required fields");
    }

    try {
      setSaving(true);
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => formData.append(key, value));
      if (cvFile) {
        formData.append("cv", cvFile);
      }

      const res = await saveTutorProfile(formData);
      toast.success(res.data.message);
      setStatus(res.data.profile.verification_status);
      setCvUrl(res.data.profile.cv_url);
      setCvFile(null);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save tutor profile");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProfile = async () => {
    try {
      setDeleting(true);
      const res = await deleteMyTutorProfile();
      toast.success(res.data.message);
      setStatus("not_submitted");
      setCvUrl(null);
      setCvFile(null);
      setForm({
        degree: "",
        institution: "",
        passingYear: "",
        yearsExperience: "",
        description: "",
        skills: "",
      });
      setShowDeleteConfirm(false);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete tutor profile");
    } finally {
      setDeleting(false);
    }
  };

  if (!user) return null;

  return (
    <div>
      <TutorNavbar user={user} minimal />

      <section className="tp-page">
        <button className="tp-back" onClick={() => navigate(-1)} aria-label="Go back">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>

        <div className="tp-header">
          <h1 className="tp-heading">My Tutor Profile</h1>
          <span className={`tp-status-badge tp-status-${status}`}>
            Verification Status: {STATUS_LABELS[status]}
          </span>
        </div>

        {loading ? (
          <p className="tp-empty">Loading profile...</p>
        ) : (
          <form className="tp-card" onSubmit={handleSubmit}>
            <div className="tp-section">
              <h2 className="tp-section-title">1. CV</h2>
              <div className="tp-cv-row">
                {cvUrl && (
                  <a href={cvUrl} target="_blank" rel="noreferrer" className="tp-cv-link">
                    View current CV
                  </a>
                )}
                <label className="tp-cv-upload">
                  {cvFile ? cvFile.name : "Upload CV Image"}
                  <input type="file" accept="image/*" onChange={handleCvChange} hidden />
                </label>
              </div>
            </div>

            <div className="tp-section">
              <h2 className="tp-section-title">2. Educational Qualifications</h2>
              <div className="tp-grid">
                <div className="tp-field">
                  <label>Degree</label>
                  <input
                    type="text"
                    placeholder="e.g. BSc Computer Science"
                    value={form.degree}
                    onChange={update("degree")}
                  />
                </div>
                <div className="tp-field">
                  <label>Institution/College</label>
                  <input
                    type="text"
                    placeholder="e.g. Tribhuvan University"
                    value={form.institution}
                    onChange={update("institution")}
                  />
                </div>
                <div className="tp-field">
                  <label>Passing Year</label>
                  <input
                    type="number"
                    placeholder="e.g. 2022"
                    value={form.passingYear}
                    onChange={update("passingYear")}
                  />
                </div>
              </div>
            </div>

            <div className="tp-section">
              <h2 className="tp-section-title">3. Teaching Experience</h2>
              <div className="tp-field">
                <label>Years of Experience</label>
                <input
                  type="number"
                  min="0"
                  placeholder="e.g. 3"
                  value={form.yearsExperience}
                  onChange={update("yearsExperience")}
                />
              </div>
              <div className="tp-field">
                <label>Description</label>
                <textarea
                  rows={3}
                  placeholder="A little about your teaching style"
                  value={form.description}
                  onChange={update("description")}
                />
              </div>
            </div>

            <div className="tp-section">
              <h2 className="tp-section-title">4. Skills</h2>
              <div className="tp-field">
                <input
                  type="text"
                  placeholder="e.g. Mathematics, English, Science, Computer, Communication, Online Teaching"
                  value={form.skills}
                  onChange={update("skills")}
                />
              </div>
            </div>

            <div className="tp-actions-row">
              <button type="submit" className="tp-save-btn" disabled={saving}>
                {saving && <span className="spinner" />}
                {saving ? "Saving..." : "Save Tutor Profile"}
              </button>
              {status !== "not_submitted" && (
                <button
                  type="button"
                  className="tp-delete-btn"
                  onClick={() => setShowDeleteConfirm(true)}
                  disabled={saving}
                >
                  Delete Tutor Profile
                </button>
              )}
            </div>
          </form>
        )}
      </section>

      {showDeleteConfirm && (
        <div className="modal-overlay" onClick={() => setShowDeleteConfirm(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h3>Delete Tutor Profile?</h3>
            <p>
              This will permanently remove your CV, education, experience, and verification
              status. This cannot be undone.
            </p>
            <div className="modal-actions">
              <button className="modal-btn-cancel" onClick={() => setShowDeleteConfirm(false)}>
                Cancel
              </button>
              <button className="modal-btn-confirm" onClick={handleDeleteProfile} disabled={deleting}>
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TutorProfile;
