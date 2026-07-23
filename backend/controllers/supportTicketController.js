const {
  createTicket,
  getTicketsByUser,
  getAllTickets,
  getTicketById,
  markTicketResolved,
} = require("../models/supportTicketModel");
const { createMessage, getMessagesByTicket } = require("../models/ticketMessageModel");

const canAccessTicket = (req, ticket) =>
  req.user.role === "admin" || ticket.user_id === req.user.user_id;

const createSupportTicket = async (req, res) => {
  try {
    const { subject, description } = req.body;

    if (!subject || !description) {
      return res.status(400).json({
        message: "Subject and description are required",
      });
    }

    const ticket = await createTicket(req.user.user_id, subject, description);

    res.status(201).json({
      message: "Support ticket created successfully",
      ticket,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to create support ticket",
      error: error.message,
    });
  }
};

const getMyTickets = async (req, res) => {
  try {
    const tickets = await getTicketsByUser(req.user.user_id);
    res.status(200).json({ tickets });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch support tickets",
      error: error.message,
    });
  }
};

const getAllTicketsAdmin = async (req, res) => {
  try {
    const tickets = await getAllTickets();
    res.status(200).json({ tickets });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch support tickets",
      error: error.message,
    });
  }
};

const getTicketDetail = async (req, res) => {
  try {
    const { id } = req.params;

    const ticket = await getTicketById(id);
    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }
    if (!canAccessTicket(req, ticket)) {
      return res.status(403).json({ message: "You cannot access this ticket" });
    }

    const messages = await getMessagesByTicket(id);

    res.status(200).json({ ticket, messages });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch ticket details",
      error: error.message,
    });
  }
};

const addMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ message: "Message is required" });
    }

    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Only support staff can respond to tickets" });
    }

    const ticket = await getTicketById(id);
    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }
    if (ticket.status === "resolved") {
      return res.status(400).json({ message: "This ticket has already been resolved" });
    }

    const newMessage = await createMessage(id, req.user.user_id, message);
    await markTicketResolved(id);

    res.status(201).json({
      message: "Response sent and ticket marked as resolved",
      ticketMessage: newMessage,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to send response",
      error: error.message,
    });
  }
};

module.exports = {
  createSupportTicket,
  getMyTickets,
  getAllTicketsAdmin,
  getTicketDetail,
  addMessage,
};
