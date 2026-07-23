const express = require("express");
const router = express.Router();
const { getReview, saveReview, removeReview } = require("../controllers/reviewController");
const { protect, restrictTo } = require("../middleware/authMiddleware");

router.get("/with/:otherUserId", protect, getReview);
router.put("/:tutorId", protect, restrictTo("student"), saveReview);
router.delete("/:tutorId", protect, restrictTo("student"), removeReview);

module.exports = router;
