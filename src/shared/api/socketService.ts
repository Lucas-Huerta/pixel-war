import { socket } from "./socket";
import { Grid, PixelUpdate } from "../types/pixel";
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

  emitRoomUpdate(roomId: string, update: any) {
    socket.emit("room:update", { roomId, update });
  },

  onCreate(callback: (room: Room) => void) {
    socket.on("room:created", callback);
  },

  startGame(roomId: string) {
    socket.emit("startGame", roomId);
  },

  onGameStarted(callback: (roomId: string) => void) {
    socket.on("gameStarted", callback);
  },

  updatePlayerPosition(
    roomId: string,
    position: { x: number; y: number },
    playerId: string,
  ) {
    socket.emit("player:move", { roomId, position, playerId });
  },

  onPlayerMove(
    callback: (data: {
      playerId: string;
      position: { x: number; y: number };
    }) => void,
  ) {
    socket.on("player:moved", callback);
  },

  onPlayersUpdate(callback: (players: any[]) => void) {
    socket.on("players:update", callback);
  },
};
