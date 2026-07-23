const { createMessage, getMessagesBetweenUsers } = require("../models/chatModel");
const { getBookedBookingBetween } = require("../models/bookingModel");

const getMessages = async (req, res) => {
  try {
    const otherUserId = req.params.otherUserId;
    const booking = await getBookedBookingBetween(req.user.user_id, otherUserId);
    if (!booking) {
      return res.status(403).json({ message: "You can only chat with a booked tutor or student" });
    }

    const messages = await getMessagesBetweenUsers(req.user.user_id, otherUserId);
    res.status(200).json({ messages });
  } catch (error) {
    res.status(500).json({
      message: "Failed to load messages",
      error: error.message,
    });
  }
};

const sendMessage = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ message: "Message cannot be empty" });
    }

    const otherUserId = req.params.otherUserId;
    const booking = await getBookedBookingBetween(req.user.user_id, otherUserId);
    if (!booking) {
      return res.status(403).json({ message: "You can only chat with a booked tutor or student" });
    }

    const chatMessage = await createMessage(booking.booking_id, req.user.user_id, otherUserId, message.trim());
    res.status(201).json({ chatMessage });
  } catch (error) {
    res.status(500).json({
      message: "Failed to send message",
      error: error.message,
    });
  }
};

module.exports = { getMessages, sendMessage };
