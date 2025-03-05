export interface Player {
  id: string;
  name: string;
  teamId?: string;
}

export interface Team {
  id: string;
  name: string;
  players: Player[];
}

export interface Room {
  id: string;
  teams: Team[];
  players: Player[];
  isGameStarted: boolean;
}
