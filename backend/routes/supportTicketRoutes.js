const express = require("express");
const router = express.Router();
const {
  createSupportTicket,
  getMyTickets,
  getAllTicketsAdmin,
  getTicketDetail,
  addMessage,
} = require("../controllers/supportTicketController");
const { protect, restrictTo } = require("../middleware/authMiddleware");

router.post("/", protect, createSupportTicket);
router.get("/my", protect, getMyTickets);
router.get("/", protect, restrictTo("admin"), getAllTicketsAdmin);
router.get("/:id", protect, getTicketDetail);
router.post("/:id/messages", protect, addMessage);

module.exports = router;
