const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");

let io = null;

const init = (httpServer) => {
  io = new Server(httpServer, {
    cors: { origin: "*" },
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error("No token provided"));

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = decoded;
      next();
    } catch (error) {
      next(new Error("Invalid or expired token"));
    }
  });

  io.on("connection", (socket) => {
    socket.join(`user:${socket.user.user_id}`);
    socket.join(`role:${socket.user.role}`);
  });

  return io;
};

const emitToUser = (userId, event, payload) => {
  if (io) io.to(`user:${userId}`).emit(event, payload);
};

const emitToRole = (role, event, payload) => {
  if (io) io.to(`role:${role}`).emit(event, payload);
};

module.exports = { init, emitToUser, emitToRole };
