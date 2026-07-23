const express = require("express");
const router = express.Router();
const {
  getMyProfile,
  saveMyProfile,
  getAllProfilesAdmin,
  approveTutorProfile,
  rejectTutorProfile,
  deleteTutorProfile,
} = require("../controllers/tutorProfileController");
const { protect, restrictTo } = require("../middleware/authMiddleware");
const { uploadCv } = require("../middleware/upload");

router.get("/me", protect, restrictTo("tutor"), getMyProfile);
router.put("/", protect, restrictTo("tutor"), uploadCv, saveMyProfile);

router.get("/", protect, restrictTo("admin"), getAllProfilesAdmin);
router.put("/:id/approve", protect, restrictTo("admin"), approveTutorProfile);
router.put("/:id/reject", protect, restrictTo("admin"), rejectTutorProfile);
router.delete("/:id", protect, restrictTo("admin"), deleteTutorProfile);

module.exports = router;
