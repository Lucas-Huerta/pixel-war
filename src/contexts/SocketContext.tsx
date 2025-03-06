import React, { createContext, useContext, useEffect, useState } from "react";
import { socketService } from "../shared/api/socketService";
import { Room } from "../shared/types/room";
import { socket } from "../shared/api/socket";
import { roomService } from "../shared/api/roomService";

interface Player {
  id: string;
  name: string;
  position: { x: number; y: number };
  character: number;
  teamId?: string;
}

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

      // Initialiser les joueurs avec leurs couleurs d'équipe
      const initialPlayers = roomUsers.map((user, index) => ({
        id: user.id || user,
        name: user.name || user,
        position: { x: 400, y: 300 }, // Position initiale
        character: user.character || 0,
        color: index % 2 === 0 ? 0xff0000 : 0x0000ff, // Alterner entre rouge et bleu
      }));

      console.log("Initial players:", initialPlayers);
      setPlayers(initialPlayers);

      // Informer les autres joueurs de notre position
      if (currentRoom?.id && socket.id) {
        socket.emit("player:move", {
          roomId: currentRoom.id,
          position: { x: 400, y: 300 },
          playerId: socket.id,
        });
      }
    });

    socketService.onPlayerMove((data) => {
      console.log("Player moved:", data);
      if (!data.position || !data.playerId) return;

      setPlayers((prevPlayers) => {
        const playerExists = prevPlayers.some((p) => p.id === data.playerId);
        if (!playerExists) {
          return [
            ...prevPlayers,
            {
              id: data.playerId,
              name: data.playerId,
              position: data.position,
              character: 0,
            },
          ];
        }
        return prevPlayers.map((player) =>
          player.id === data.playerId
            ? { ...player, position: data.position }
            : player,
        );
      });
    });

    socketService.onPlayersUpdate((updatedPlayers) => {
      console.log("All players update:", updatedPlayers);
      setPlayers(updatedPlayers);
    });

    // Ajouter l'écoute des mises à jour des tuiles
    socketService.onTileUpdate((data) => {
      console.log("Tile updated:", data);
      // On peut éventuellement stocker l'état de la grille ici si nécessaire
    });

    socketService.onTileUpdate((data) => {
      console.log("Tile update received in context:", data);
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
      socket.off("tile:updated");
    };
  }, [roomUsers, currentRoom]);

  const joinRoom = async (roomId: string, username: string) => {
    socket.data = {
      username,
    };
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
    // Stocker l'équipe dans le socket
    // const teamNumber = parseInt(teamName.replace("team", ""));
    // socket.data.team = teamNumber;
    socket.emit("joinTeam", roomId, teamName);
  };

  const startGame = (roomId: string) => {
    socketService.startGame(roomId);
  };

  const updatePlayerPosition = (position: { x: number; y: number }) => {
    if (!currentRoom?.id || !socket.id) return;

    // Mettre à jour la position localement immédiatement
    setPlayers((prevPlayers) => {
      const newPlayers = prevPlayers.map((player) =>
        player.id === socket.id ? { ...player, position } : player,
      );
      console.log("Updated players locally:", newPlayers);
      return newPlayers;
    });

    // Envoyer la position aux autres joueurs
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
