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
    console.log("Emitting player position:", { roomId, position, playerId });
    socket.emit("player:move", { roomId, position, playerId });
  },

  onPlayerMove(
    callback: (data: {
      playerId: string;
      position: { x: number; y: number };
    }) => void,
  ) {
    socket.on("player:moved", (data) => {
      console.log("Received player move:", data);
      if (typeof data.position === "number") {
        data.position = { x: data.position, y: data.position };
      }
      callback(data);
    });
  },

  onPlayersUpdate(callback: (players: any[]) => void) {
    socket.on("players:update", callback);
  },

  updateTile(
    roomId: string,
    tileData: { x: number; y: number; color: number; playerId: string },
  ) {
    console.log("Emitting tile update:", { roomId, ...tileData });
    socket.emit("tile:update", { roomId, ...tileData });
  },

  onTileUpdate(
    callback: (data: {
      x: number;
      y: number;
      color: number;
      playerId: string;
    }) => void,
  ) {
    socket.on("tile:updated", (data) => {
      console.log("Received tile update:", data);
      callback(data);
    });
  },
};
