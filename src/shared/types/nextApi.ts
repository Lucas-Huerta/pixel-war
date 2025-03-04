import { NextApiResponse } from "next";
import { Socket } from "net";
import { Server as HTTPServer } from "http";
import { Server as IOServer } from "socket.io";

export interface NextApiResponseWithSocket extends NextApiResponse {
  socket: Socket & SocketWithIO;
}

export interface SocketServer extends HTTPServer {
  io?: IOServer | undefined;
}

export interface SocketWithIO {
  server: SocketServer;
}
