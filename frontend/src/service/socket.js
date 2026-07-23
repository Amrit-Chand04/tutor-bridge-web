import { io } from "socket.io-client";

let socket = null;

export const getSocket = () => {
  if (socket) return socket;

  const token = localStorage.getItem("token");
  if (!token) return null;

  socket = io(import.meta.env.VITE_BASE_URL, {
    auth: { token },
  });
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
