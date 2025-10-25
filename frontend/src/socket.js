// src/socket.js
import { io } from "socket.io-client";

const DEFAULT =
  import.meta.env.VITE_SOCKET_URL ||
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";

// create socket but do not auto connect (we'll attach token on connect)
export const socket = io(DEFAULT, {
  autoConnect: false,
  transports: ["websocket", "polling"],
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});
