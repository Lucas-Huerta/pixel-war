import { socket } from "../../shared/api/socket";
import { EventBus } from "../EventBus";

export class GameScene extends Phaser.Scene {
  private players: Map<string, Phaser.GameObjects.Sprite> = new Map();
  private currentPlayer: Phaser.GameObjects.Sprite | null = null;

  create() {
    // Initialisation de la scène
    const selectedCharacter = this.game.registry.get("selectedCharacter") || 0;

    // Création du joueur local avec une position initiale
    this.currentPlayer = this.add.sprite(
      400, // position x initiale au centre
      300, // position y initiale au centre
      `character_${selectedCharacter + 1}`,
    );

    // Stocker le joueur local dans la Map
    if (socket.id) {
      this.players.set(socket.id, this.currentPlayer);

      // Émettre la position initiale
      EventBus.emit("player-move", { x: 400, y: 300 });
    }

    // Mise à jour des positions des autres joueurs
    this.game.registry.events.on(
      "changedata-players",
      (_: any, players: any[]) => {
        console.log("Updating players:", players);
        this.updatePlayers(players);
      },
    );

    // Gestion des déplacements du joueur local
    this.input.keyboard?.on("keydown", (event: KeyboardEvent) => {
      if (!this.currentPlayer) return;

      const position = { x: this.currentPlayer.x, y: this.currentPlayer.y };
      const speed = 10;

      switch (event.code) {
        case "ArrowUp":
          position.y -= speed;
          break;
        case "ArrowDown":
          position.y += speed;
          break;
        case "ArrowLeft":
          position.x -= speed;
          break;
        case "ArrowRight":
          position.x += speed;
          break;
      }

      this.currentPlayer.setPosition(position.x, position.y);
      EventBus.emit("player-move", position);
    });
  }

  private updatePlayers(players: any[]) {
    console.log("Updating players in scene:", players);

    players.forEach((player) => {
      // Skip if this is the local player
      if (player.id === socket.id) return;

      let sprite = this.players.get(player.id);
      const character = player.character || 0;

      if (!sprite) {
        // Create new player sprite with initial position
        sprite = this.add.sprite(
          player.position?.x || 400,
          player.position?.y || 300,
          `character_${character + 1}`,
        );
        this.players.set(player.id, sprite);
        console.log("Created new player sprite:", player.id);
      } else {
        // Update existing player position
        sprite.setPosition(
          player.position?.x || sprite.x,
          player.position?.y || sprite.y,
        );
      }
    });

    // Remove disconnected players
    this.players.forEach((sprite, id) => {
      if (id !== socket.id && !players.find((p) => p.id === id)) {
        sprite.destroy();
        this.players.delete(id);
        console.log("Removed disconnected player:", id);
      }
    });
  }
}
