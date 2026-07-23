const express = require("express");
const router = express.Router();
const { getMyProfile, saveMyProfile } = require("../controllers/tutorProfileController");
const { protect, restrictTo } = require("../middleware/authMiddleware");
const { uploadCv } = require("../middleware/upload");

router.get("/me", protect, restrictTo("tutor"), getMyProfile);
router.put("/", protect, restrictTo("tutor"), uploadCv, saveMyProfile);

module.exports = router;
