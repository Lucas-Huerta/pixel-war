import { socket } from "./socket";
import { Grid, PixelUpdate } from "@/shared/types/pixel";

export const socketService = {
  onConnect(callback: () => void) {
    socket.on("connection", callback);
  },

  onDisconnect(callback: () => void) {
    socket.on("disconnect", callback);
  },

  onPixelUpdate(callback: (pixel: PixelUpdate) => void) {
    socket.on("pixel:update", callback);
  },

  requestGrid(callback: (grid: Grid) => void) {
    socket.emit("grid:request");
    socket.once("grid:request", callback);
  },

  updatePixel(pixel: PixelUpdate) {
    socket.emit("pixel:update", pixel);
  },

  disconnect() {
    socket.disconnect();
  },

  connect() {
    socket.connect();
  },
};
