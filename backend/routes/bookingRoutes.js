const express = require("express");
const router = express.Router();
const {
  getMyBookings,
  getMyTutorBookings,
  getAllBookingsAdmin,
  acceptBookingAdmin,
  rejectBookingAdmin,
} = require("../controllers/bookingController");
const { protect, restrictTo } = require("../middleware/authMiddleware");

router.get("/my", protect, restrictTo("student"), getMyBookings);
router.get("/tutor/my", protect, restrictTo("tutor"), getMyTutorBookings);
router.get("/", protect, restrictTo("admin"), getAllBookingsAdmin);
router.put("/:id/accept", protect, restrictTo("admin"), acceptBookingAdmin);
router.put("/:id/reject", protect, restrictTo("admin"), rejectBookingAdmin);

module.exports = router;
