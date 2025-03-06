export interface Player {
  id: string;
  name: string;
  position: { x: number; y: number };
  character: number;
  teamId?: string;
  color: number; // Couleur Phaser (hexadécimal)
}
