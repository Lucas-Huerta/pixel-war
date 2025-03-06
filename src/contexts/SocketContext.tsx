import React, { createContext, useContext, useEffect, useState } from "react";
import { socketService } from "../shared/api/socketService";
import { Room } from "../shared/types/room";
import { socket } from "../shared/api/socket";
import { roomService } from "../shared/api/roomService";
import { Player } from "../shared/types/player";

interface SocketContextType {
  currentRoom: Room | null;
  joinRoom: (roomId: string, username: string) => void;
  leaveRoom: (roomId: string) => void;
  joinTeam: (roomId: string, teamName: string) => void;
  roomUsers: any[];
  startGame: (roomId: string) => void;
  isGameStarted: boolean;
  updatePlayerPosition: (position: { x: number; y: number }) => void;
  players: Player[];
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null);
  const [roomUsers, setRoomUsers] = useState<any[]>([]);
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [players, setPlayers] = useState<Player[]>([]);

  useEffect(() => {
    socketService.onRoomUpdate((room: Room) => {
      console.log("Room updated:", room);
    });

    socketService.onPlayerJoined((data) => {
      console.log("Player joined:", data);
      const newPlayer = {
        id: data.id,
        name: data.id,
        team: "",
      };
      setCurrentRoom((prev) => {
        if (!prev) return data.room;
        return {
          ...prev,
          players: newPlayer,
          teams: "",
        };
      });
    });

    socket.on("roomUsers", (roomData) => {
      console.log("Room users updated:", roomData);
      setRoomUsers(roomData.users);
      setCurrentRoom(roomData);
    });

    socket.on("player:joined", (player) => {
      console.log("New player joined:", player);
      setRoomUsers((prev) => [...prev, player]);
    });

    socket.on("room:playersUpdate", (updatedPlayers) => {
      console.log("Players update:", updatedPlayers);
      setRoomUsers(updatedPlayers);
    });

    socket.on("teamJoined", (teamName) => {
      console.log("Team joined:", teamName);
    });

    socket.on("gameStarted", (roomId) => {
      console.log("Game started in room:", roomId);
      setIsGameStarted(true);
      setCurrentRoom((prev) =>
        prev ? { ...prev, isGameStarted: true } : null,
      );
    });

    socketService.onPlayerMove((data) => {
      console.log("Player moved:", data);
      setPlayers((prevPlayers) =>
        prevPlayers.map((player) =>
          player.id === data.playerId
            ? { ...player, position: data.position }
            : player,
        ),
      );
    });

    socketService.onPlayersUpdate((updatedPlayers) => {
      console.log("All players update:", updatedPlayers);
      setPlayers(updatedPlayers);
    });

    return () => {
      socket.off("room:update");
      socket.off("player:joined");
      socket.off("roomUsers");
      socket.off("room:playersUpdate");
      socket.off("teamJoined");
      socket.off("gameStarted");
      socket.off("player:moved");
      socket.off("players:update");
    };
  }, []);

  const joinRoom = async (roomId: string, username: string) => {
    socket.data = { username };
    socket.emit("joinRoom", roomId);
    socket.emit("getRoomUsers", roomId);

    try {
      const room = await roomService.getRoom(roomId);
      setCurrentRoom(room);
    } catch (error) {
      console.error("Failed to fetch room:", error);
    }
  };

  const leaveRoom = (roomId: string) => {
    socketService.leaveRoom(roomId);
    setRoomUsers([]);
    setCurrentRoom(null);
  };

  const joinTeam = (roomId: string, teamName: string) => {
    socket.emit("joinTeam", roomId, teamName);
  };

  const startGame = (roomId: string) => {
    socketService.startGame(roomId);
  };

  const updatePlayerPosition = (position: { x: number; y: number }) => {
    if (!currentRoom?.id) return;

    // Met à jour la position localement
    setPlayers((prevPlayers) => {
      const newPlayers = prevPlayers.map((player) =>
        player.id === socket.id ? { ...player, position } : player,
      );
      return newPlayers;
    });

    // Envoie la position aux autres joueurs
    socketService.updatePlayerPosition(
      currentRoom.id,
      position,
      socket.id || "",
    );
  };

  return (
    <SocketContext.Provider
      value={{
        currentRoom,
        joinRoom,
        leaveRoom,
        joinTeam,
        roomUsers,
        startGame,
        isGameStarted,
        updatePlayerPosition,
        players,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};
