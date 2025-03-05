import { Player } from "./player";

export interface Room {
  id: string;
  players: Player[];
  isGameStarted: boolean;
  grid: string[][];
}
