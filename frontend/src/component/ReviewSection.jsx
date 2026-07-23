import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { getReview, saveReview, deleteReview } from "../service/Api";
import "./ReviewSection.css";

const Stars = ({ value, onRate, size = "md" }) => (
  <div className={`review-stars review-stars-${size}`}>
    {[1, 2, 3, 4, 5].map((n) => (
      <span
        key={n}
        className={`review-star ${n <= value ? "review-star-filled" : ""} ${onRate ? "review-star-pick" : ""}`}
        onClick={onRate ? () => onRate(n) : undefined}
      >
        &#9733;
      </span>
    ))}
  </div>
);

function ReviewSection({ otherUserId, editable }) {
  const [review, setReview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formRating, setFormRating] = useState(0);
  const [formText, setFormText] = useState("");
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    fetchReview();
  }, [otherUserId]);

  const fetchReview = async () => {
    try {
      setLoading(true);
      const res = await getReview(otherUserId);
      setReview(res.data.review);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load review");
    } finally {
      setLoading(false);
    }
  };

  const startEdit = () => {
    setFormRating(review?.rating || 0);
    setFormText(review?.review_text || "");
    setEditing(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formRating) {
      return toast.error("Select a star rating");
    }
    try {
      setSaving(true);
      const res = await saveReview(otherUserId, formRating, formText.trim());
      setReview(res.data.review);
      setEditing(false);
      toast.success(res.data.message);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save review");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      setSaving(true);
      await deleteReview(otherUserId);
      setReview(null);
      setConfirmDelete(false);
      toast.success("Review deleted");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete review");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return null;

  return (
    <div className="review-section">
      {editing ? (
        <form className="review-form" onSubmit={handleSave}>
          <Stars value={formRating} onRate={setFormRating} size="lg" />
          <textarea
            rows={2}
            placeholder="Write a review (optional)"
            value={formText}
            onChange={(e) => setFormText(e.target.value)}
          />
          <div className="review-form-actions">
            <button type="button" className="review-btn-cancel" onClick={() => setEditing(false)}>
              Cancel
            </button>
            <button type="submit" className="review-btn-save" disabled={saving}>
              {saving ? "Saving..." : "Save Review"}
            </button>
          </div>
        </form>
      ) : review ? (
        <div className="review-display">
          <div className="review-display-top">
            <Stars value={review.rating} />
            {editable && (
              <div className="review-actions">
                <button className="review-icon-btn" onClick={startEdit} aria-label="Edit review">
                  Edit
                </button>
                <button
                  className="review-icon-btn review-icon-danger"
                  onClick={() => setConfirmDelete(true)}
                  aria-label="Delete review"
                >
                  Delete
                </button>
              </div>
            )}
          </div>
          {review.review_text && <p className="review-text">{review.review_text}</p>}
        </div>
      ) : editable ? (
        <button className="review-add-btn" onClick={startEdit}>
          &#9733; Rate &amp; Review
        </button>
      ) : (
        <p className="review-none">No review yet from this student.</p>
      )}

      {confirmDelete && (
        <div className="modal-overlay" onClick={() => setConfirmDelete(false)}>
          <div className="modal-box review-confirm-box" onClick={(e) => e.stopPropagation()}>
            <h3>Delete review?</h3>
            <p>This will permanently remove your rating and review.</p>
            <div className="modal-actions">
              <button className="modal-btn-cancel" onClick={() => setConfirmDelete(false)}>
                Cancel
              </button>
              <button className="modal-btn-confirm" onClick={handleDelete} disabled={saving}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ReviewSection;
