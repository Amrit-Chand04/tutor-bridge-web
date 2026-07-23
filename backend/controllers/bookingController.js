const {
  getBookingsByStudent,
  getAllBookings,
  getBookingById,
  acceptBooking,
  rejectBooking,
} = require("../models/bookingModel");

const getMyBookings = async (req, res) => {
  try {
    const bookings = await getBookingsByStudent(req.user.user_id);
    res.status(200).json({ bookings });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch your bookings",
      error: error.message,
    });
  }
};

const getAllBookingsAdmin = async (req, res) => {
  try {
    const bookings = await getAllBookings();
    res.status(200).json({ bookings });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch bookings",
      error: error.message,
    });
  }
};

const acceptBookingAdmin = async (req, res) => {
  try {
    const booking = await getBookingById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    if (booking.status !== "pending") {
      return res.status(400).json({ message: "This booking has already been decided" });
    }

    const updated = await acceptBooking(req.params.id);
    res.status(200).json({
      message: "Booking accepted",
      booking: updated,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to accept booking",
      error: error.message,
    });
  }
};

const rejectBookingAdmin = async (req, res) => {
  try {
    const { reason } = req.body;
    if (!reason) {
      return res.status(400).json({ message: "A rejection reason is required" });
    }

    const booking = await getBookingById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    if (booking.status !== "pending") {
      return res.status(400).json({ message: "This booking has already been decided" });
    }

    const updated = await rejectBooking(req.params.id, reason);
    res.status(200).json({
      message: "Booking rejected",
      booking: updated,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to reject booking",
      error: error.message,
    });
  }
};

module.exports = { getMyBookings, getAllBookingsAdmin, acceptBookingAdmin, rejectBookingAdmin };
