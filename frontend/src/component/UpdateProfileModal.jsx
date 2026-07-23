import { useState } from "react";
import toast from "react-hot-toast";
import { updateProfile } from "../service/Api";
import "./UpdateProfileModal.css";

const getInitials = (name = "") => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const initials = parts.slice(0, 2).map((p) => p[0].toUpperCase());
  return initials.join("") || "U";
};

function UpdateProfileModal({ user, onClose }) {
  const [fullName, setFullName] = useState(user?.full_name || "");
  const [photoFile, setPhotoFile] = useState(null);
  const [preview, setPreview] = useState(user?.profile_photo || null);
  const [loading, setLoading] = useState(false);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      return toast.error("Please select an image file");
    }
    setPhotoFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!fullName.trim()) {
      return toast.error("Full name is required");
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("full_name", fullName.trim());
      if (photoFile) {
        formData.append("profile_photo", photoFile);
      }

      const response = await updateProfile(formData);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      toast.success(response.data.message);
      window.location.reload();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box up-box" onClick={(e) => e.stopPropagation()}>
        <h3>Update Profile</h3>
        <p>Update your name and profile photo.</p>

        <form onSubmit={handleSubmit}>
          <div className="up-photo-section">
            <div className="up-photo-preview">
              {preview ? (
                <img src={preview} alt="Profile preview" />
              ) : (
                <span className="up-photo-fallback">{getInitials(fullName)}</span>
              )}
            </div>
            <label className="up-photo-upload">
              Change Photo
              <input type="file" accept="image/*" onChange={handlePhotoChange} hidden />
            </label>
          </div>

          <div className="up-field">
            <label htmlFor="full_name">Full Name</label>
            <input
              id="full_name"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="modal-btn-cancel" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="up-submit" disabled={loading}>
              {loading && <span className="spinner" />}
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default UpdateProfileModal;
