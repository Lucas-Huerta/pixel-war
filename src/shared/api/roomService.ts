import { Player, Room } from "../types/room";

export const roomService = {
  async getCurrentRoom(): Promise<Room> {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/room`, {
      method: "GET",
    });
    if (!response.ok) {
      throw new Error("Failed to fetch room");
    }
    return response.json();
  },

  async createRoom(): Promise<Room> {
    const response = await fetch(`${import.meta.env.VITE_API_URL}api/room`, {
      method: "POST",
    });
    if (!response.ok) {
      throw new Error("Failed to create room");
    }
    return response.json();
  },

  async getRoom(roomId: string): Promise<Room> {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}api/room/${roomId}`,
    );
    if (!response.ok) {
      throw new Error("Failed to fetch room");
    }
    return response.json();
  },

  async createTeam(roomId: string, teamName: string): Promise<boolean> {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}api/room/${roomId}/player`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: teamName }),
      },
    );
    if (!response.ok) {
      throw new Error("Failed to create team");
    }
    const data = await response.json();
    return data.success;
  },

  async addPlayer(roomId: string, player: Partial<Player>): Promise<boolean> {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}api/room/${roomId}/player`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(player),
      },
    );
    if (!response.ok) {
      throw new Error("Failed to add player");
    }
    const data = await response.json();
    return data.success;
  },

  async startGame(roomId: string): Promise<boolean> {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}api/room/${roomId}/start`,
      {
        method: "POST",
      },
    );
    if (!response.ok) {
      throw new Error("Failed to start game");
    }
    const data = await response.json();
    return data.success;
  },
};
