const express = require("express");
const router = express.Router();
const { createRequest, getRequests } = require("../controllers/tuitionRequestController");
const { protect, restrictTo } = require("../middleware/authMiddleware");

router.post("/", protect, restrictTo("student"), createRequest);
router.get("/", protect, restrictTo("tutor"), getRequests);

module.exports = router;
