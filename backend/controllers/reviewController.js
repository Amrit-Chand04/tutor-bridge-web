const { upsertReview, getReviewByPair, deleteReview } = require("../models/reviewModel");
const { getBookedBookingBetween } = require("../models/bookingModel");

const resolvePair = (req, otherUserId) => {
  if (req.user.role === "student") {
    return { studentId: req.user.user_id, tutorId: otherUserId };
  }
  return { studentId: otherUserId, tutorId: req.user.user_id };
};

const getReview = async (req, res) => {
  try {
    const { studentId, tutorId } = resolvePair(req, req.params.otherUserId);
    const review = await getReviewByPair(studentId, tutorId);
    res.status(200).json({ review: review || null });
  } catch (error) {
    res.status(500).json({
      message: "Failed to load review",
      error: error.message,
    });
  }
};

const saveReview = async (req, res) => {
  try {
    const { rating, reviewText } = req.body;
    const tutorId = req.params.tutorId;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }

    const booking = await getBookedBookingBetween(req.user.user_id, tutorId);
    if (!booking) {
      return res.status(403).json({ message: "You can only review a tutor you have booked" });
    }

    const review = await upsertReview(req.user.user_id, tutorId, rating, reviewText);
    res.status(200).json({ message: "Review saved", review });
  } catch (error) {
    res.status(500).json({
      message: "Failed to save review",
      error: error.message,
    });
  }
};

const removeReview = async (req, res) => {
  try {
    const deleted = await deleteReview(req.user.user_id, req.params.tutorId);
    if (!deleted) {
      return res.status(404).json({ message: "Review not found" });
    }
    res.status(200).json({ message: "Review deleted" });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete review",
      error: error.message,
    });
  }
};

module.exports = { getReview, saveReview, removeReview };
