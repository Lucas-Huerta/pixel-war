import { useState, useEffect } from "react";
import { roomService } from "../shared/api/roomService";
import { socketService } from "../shared/api/socketService";
import { Room, Player } from "../shared/types/room";

export const useRoom = (roomId: string | null) => {
  const [room, setRoom] = useState<Room | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (roomId) {
      socketService.joinRoom(roomId);
      fetchRoom();

      socketService.onRoomUpdate((updatedRoom) => {
        setRoom(updatedRoom);
      });

      return () => {
        socketService.leaveRoom(roomId);
      };
    }
  }, [roomId]);

  const fetchRoom = async () => {
    try {
      if (roomId) {
        const roomData = await roomService.getRoom(roomId);
        setRoom(roomData);
      }
    } catch (err) {
      setError("Failed to fetch room");
    }
  };

  const joinRoom = async (player: Partial<Player>) => {
    try {
      if (roomId) {
        await roomService.addPlayer(roomId, player);
        await fetchRoom();
      }
    } catch (err) {
      setError("Failed to join room");
    }
  };

  const selectTeam = async (player: Partial<Player>, teamId: string) => {
    try {
      if (roomId) {
        const updatedPlayer = { ...player, teamId };
        await roomService.addPlayer(roomId, updatedPlayer);
        await fetchRoom();
      }
    } catch (err) {
      setError("Failed to join team");
    }
  };

  return { room, error, joinRoom, selectTeam };
};
