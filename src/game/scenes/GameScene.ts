import { socket } from "../../shared/api/socket";
import { EventBus } from "../EventBus";
import { socketService } from "../../shared/api/socketService";

export class GameScene extends Phaser.Scene {
  private players: Map<string, Phaser.GameObjects.Sprite> = new Map();
  private currentPlayer: Phaser.GameObjects.Sprite | null = null;
  private gridTiles: Map<string, Phaser.GameObjects.Rectangle> = new Map();
  private gridSize: number = 32;
  private coloredTiles: Set<string> = new Set();
  private totalTiles: number;
  private playerColors: Map<string, number> = new Map();
  private currentRoomId: string | null = null;

  preload() {
    // Charger les assets pour tous les personnages
    for (let i = 1; i <= 10; i++) {
      this.load.image(`character_${i}`, `assets/character_${i}.png`);
    }
  }

  create() {
    // Initialisation de la scène
    const selectedCharacter = this.game.registry.get("selectedCharacter") || 0;

    // Création du joueur local
    this.currentPlayer = this.add.sprite(
      400,
      300,
      `character_${selectedCharacter + 1}`,
    );

    if (socket.id) {
      this.players.set(socket.id, this.currentPlayer);
      EventBus.emit("player-move", { x: 400, y: 300 });

      const team = this.registry.get("team");
      const playerColor = team === 1 ? 0xff0000 : 0x0000ff;
      this.playerColors.set(socket.id, playerColor);
    }

    // Stocker l'ID de la room actuelle
    this.currentRoomId = this.registry.get("roomId");
    console.log("Current room ID:", this.currentRoomId);

    // Définir la couleur du joueur en fonction de son équipe
    if (socket.id) {
      const team = this.registry.get("team");
      const playerColor = team === 1 ? 0xff0000 : 0x0000ff;
      this.playerColors.set(socket.id, playerColor);
      console.log("Player color set:", playerColor);
    }

    // Mettre à jour les joueurs quand le registre change
    this.game.registry.events.on(
      "changedata-players",
      (_: any, players: any[]) => {
        console.log("Registry players update:", players);
        this.updateOtherPlayers(players);
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

    // Initialiser la grille
    this.createGrid();

    // Écouter les mises à jour des tuiles
    socketService.onTileUpdate((data) => {
      console.log("Received tile update:", data);
      // Vérifier que la mise à jour vient d'un autre joueur
      if (data.playerId !== socket.id) {
        this.updateTileColor(data.x, data.y, data.color, data.playerId);
      }
    });
  }

  private createGrid() {
    const cols = Math.floor(this.cameras.main.width / this.gridSize);
    const rows = Math.floor(this.cameras.main.height / this.gridSize);
    this.totalTiles = cols * rows;

    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const tile = this.add
          .rectangle(
            x * this.gridSize,
            y * this.gridSize,
            this.gridSize,
            this.gridSize,
            0xffffff,
          )
          .setOrigin(0);
        tile.setStrokeStyle(1, 0x000000);
        this.gridTiles.set(`${x * this.gridSize},${y * this.gridSize}`, tile);
      }
    }
  }

  private updateOtherPlayers(players: any[]) {
    if (!Array.isArray(players)) return;
    console.log("Current players in scene:", players);

    players.forEach((player) => {
      if (!player || !player.id || player.id === socket.id) return;

      const position = player.position || { x: 400, y: 300 };
      let sprite = this.players.get(player.id);

      if (!sprite) {
        // Créer un nouveau sprite pour le joueur
        sprite = this.add.sprite(
          position.x,
          position.y,
          `character_${(player.character || 0) + 1}`,
        );
        this.players.set(player.id, sprite);
        console.log("Created new player sprite:", player.id, position);
      } else {
        // Mettre à jour la position du sprite existant
        sprite.setPosition(position.x, position.y);
        console.log("Updated player position:", player.id, position);
      }
    });

    // Supprimer les sprites des joueurs déconnectés
    this.players.forEach((sprite, playerId) => {
      if (playerId !== socket.id && !players.find((p) => p.id === playerId)) {
        sprite.destroy();
        this.players.delete(playerId);
        console.log("Removed disconnected player:", playerId);
      }
    });
  }

  private updateTileColor(
    x: number,
    y: number,
    color: number,
    playerId: string,
  ) {
    const tileKey = `${x},${y}`;

    // Obtenir la couleur du joueur
    const playerColor = this.playerColors.get(playerId) || color;

    let tile = this.gridTiles.get(tileKey);
    if (tile) {
      tile.setFillStyle(playerColor);
    } else {
      tile = this.add
        .rectangle(x, y, this.gridSize, this.gridSize, playerColor)
        .setOrigin(0)
        .setDepth(0);
      tile.setStrokeStyle(1, 0x000000);
      this.gridTiles.set(tileKey, tile);
    }

    // Mettre à jour le compteur
    if (!this.coloredTiles.has(tileKey)) {
      this.coloredTiles.add(tileKey);
      const percentage = (this.coloredTiles.size / this.totalTiles) * 100;
      EventBus.emit("map-colored", percentage);
    }
  }

  private changeTileColor(x: number, y: number) {
    if (!this.currentRoomId || !socket.id) {
      console.log("Missing room ID or socket ID");
      return;
    }

    const tileX = Math.floor(x / this.gridSize) * this.gridSize;
    const tileY = Math.floor(y / this.gridSize) * this.gridSize;
    const playerColor = this.playerColors.get(socket.id) || 0xff0000;

    // Émettre l'événement de mise à jour de tuile
    socketService.updateTile(this.currentRoomId, {
      x: tileX,
      y: tileY,
      color: playerColor,
      playerId: socket.id,
    });

    // Mettre à jour localement
    this.updateTileColor(tileX, tileY, playerColor, socket.id);
  }

  update() {
    if (!this.currentPlayer) return;

    let moved = false; // Track if player has moved
    const speed = 10;
    const cursors = this.input.keyboard?.createCursorKeys();

    if (cursors?.up.isDown) {
      this.currentPlayer.y = Math.max(0, this.currentPlayer.y - speed);
      moved = true;
    }
    if (cursors?.down.isDown) {
      this.currentPlayer.y += 10;
      moved = true;
    }
    if (cursors?.left.isDown) {
      this.currentPlayer.x -= 10;
      moved = true;
    }
    if (cursors?.right.isDown) {
      this.currentPlayer.x += 10;
      moved = true;
    }

    if (moved) {
      this.changeTileColor(this.currentPlayer.x, this.currentPlayer.y);
      EventBus.emit("player-move", {
        x: this.currentPlayer.x,
        y: this.currentPlayer.y,
      });
    }
  }
}
