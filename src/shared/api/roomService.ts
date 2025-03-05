import { Room } from "../types/room";

export const roomService = {
  async getCurrentRoom(): Promise<Room> {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/room`,
      {
        method: "GET",
      },
    );
    if (!response.ok) {
      throw new Error("Failed to fetch room");
    }
    return response.json();
  },

  async createRoom(): Promise<Room> {
    console.log("Creating room");

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/room`,
      {
        method: "POST",
      },
    );
    if (!response.ok) {
      throw new Error("Failed to create room");
    }
    return response.json();
  },
};
