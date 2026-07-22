const express = require("express");
const router = express.Router();
const { createRequest } = require("../controllers/tuitionRequestController");
const { protect, restrictTo } = require("../middleware/authMiddleware");

router.post("/", protect, restrictTo("student"), createRequest);

module.exports = router;
