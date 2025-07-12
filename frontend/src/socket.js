import { io } from "socket.io-client";

const authUser = JSON.parse(localStorage.getItem("authUser"));

export const socket = io("http://localhost:5001", {
  query: {
    userId: authUser?._id,
  },
  transports: ["websocket"],
});
