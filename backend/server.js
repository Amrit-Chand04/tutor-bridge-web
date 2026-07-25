require("dotenv").config();

const express = require("express");
const cors = require("cors");
const pool = require("./config/db");
const userRoutes = require("./routes/userRoutes");
const tuitionRequestRoutes = require("./routes/tuitionRequestRoutes");
const supportTicketRoutes = require("./routes/supportTicketRoutes");
const tutorProfileRoutes = require("./routes/tutorProfileRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const chatRoutes = require("./routes/chatRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const socketService = require("./services/socketService");
const http = require("http");

const app = express();
const httpServer = http.createServer(app);
socketService.init(httpServer);

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/users", userRoutes);
app.use("/api/tuition-requests", tuitionRequestRoutes);
app.use("/api/support-tickets", supportTicketRoutes);
app.use("/api/tutor-profile", tutorProfileRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/chats", chatRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/notifications", notificationRoutes);

// Test Route
app.get("/", (req, res) => {
  res.send("Amrit : Tutor Bridge Backend Running!");
});

// Database Check Route
app.get("/db-check", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");

    res.status(200).json({
      success: true,
      message: "Database connected successfully",
      time: result.rows[0].now,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Database connection failed",
      error: error.message,
    });
  }
});

// Server
const PORT = process.env.PORT || 3000;

// Only start listening when this file is run directly (not when Jest imports it)
if (require.main === module) {
  httpServer.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

// Export app so Supertest can import it without starting a real server
module.exports = app;