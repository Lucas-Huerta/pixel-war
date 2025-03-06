import { socket } from "./socket";
import { Grid, PixelUpdate } from "@/shared/types/pixel";
import { Room } from "../types/room";

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

  onRoomUpdate(callback: (room: Room) => void) {
    socket.on("room:update", callback);
  },

  onGameStart(callback: () => void) {
    socket.on("startGame", callback);
  },

  onHandleGetRooms(callback: (rooms: Room[]) => void) {
    socket.emit("getRooms", callback);
  },

  handleReceiveAllRooms(callback: (rooms: Room[]) => void) {
    socket.on("allRooms", callback);
  },

  onPlayerJoin(callback: (roomId: string) => void) {
    socket.on("player:join", callback);
  },

  joinRoom(roomId: string) {
    socket.emit("joinRoom", roomId);
  },

  leaveRoom(roomId: string) {
    socket.emit("room:leave", roomId);
  },

  onPlayerJoined(callback: (newPlayer: any) => void) {
    socket.on("player:joined", callback);
  },

  onRoomPlayersUpdate(callback: (players: any[]) => void) {
    socket.on("room:playersUpdate", callback);
  },
};
