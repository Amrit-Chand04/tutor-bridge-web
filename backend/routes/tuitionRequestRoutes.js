const express = require("express");
const router = express.Router();
const { createRequest } = require("../controllers/tuitionRequestController");
const { protect } = require("../middleware/authMiddleware");

router.post("/", protect, createRequest);

module.exports = router;
