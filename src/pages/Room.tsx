import { useState } from "react";
import { socket } from "@/shared/api/socket";
// import { usePixelWar } from "@/shared/api/usePixelWar";
import { roomService } from "@/shared/api/roomService";

export default function Room() {
  const [isSocketConnected, setIsSocketConnected] = useState(socket.connected);
  const [transport, setTransport] = useState("N/A");

  const handleCreateRoom = async () => {
    try {
      await roomService.createRoom();
    } catch (error) {
      console.error(error);
    }
  };

  //   const { grid, isConnected, updatePixel, refreshGrid } = usePixelWar();

  return (
    <div>
      <p>Status: {isSocketConnected ? "connected" : "disconnected"}</p>
      <p>Transport: {transport}</p>

      <button
        onClick={async () => {
          await handleCreateRoom();
        }}
      >
        Create Room
      </button>
    </div>
  );
}
