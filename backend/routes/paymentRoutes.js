const express = require("express");
const router = express.Router();
const { initiateBookingPayment, verifyBookingPayment } = require("../controllers/paymentController");
const { protect, restrictTo } = require("../middleware/authMiddleware");

router.post("/initiate", protect, restrictTo("student"), initiateBookingPayment);
router.post("/verify", protect, restrictTo("student"), verifyBookingPayment);

module.exports = router;
