import { Grid, ServerStatus } from "@/shared/types/pixel";

const API_URL = import.meta.env.VITE_API_URL;

export const gridService = {
  async getCurrentGrid(): Promise<Grid> {
    const response = await fetch(`${API_URL}/api/grid`);
    if (!response.ok) {
      throw new Error("Failed to fetch grid");
    }
    return response.json();
  },

  async checkHealth(): Promise<ServerStatus> {
    const response = await fetch(`${API_URL}/api/health`);
    if (!response.ok) {
      throw new Error("Health check failed");
    }
    return response.json();
  },
};
