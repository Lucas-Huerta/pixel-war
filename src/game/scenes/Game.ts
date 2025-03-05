import { EventBus } from "../EventBus";
import { Scene } from "phaser";

export class Game extends Scene {
    camera: Phaser.Cameras.Scene2D.Camera | undefined;
    background: Phaser.GameObjects.Image | undefined;
    gameText: Phaser.GameObjects.Text | undefined;
    player: Phaser.GameObjects.Sprite | undefined;
    cursors: Phaser.Types.Input.Keyboard.CursorKeys | undefined;
    grid: Phaser.GameObjects.Grid | undefined;
    gridSize: number = 32;
    lastSentPosition: { x: number; y: number } = { x: 0, y: 0 };
    coloredTiles: Set<string> = new Set();
    totalTiles: number = 0;

    constructor() {
        super("Game");
    }

    preload() {
        const selectedCharacter = this.registry.get("selectedCharacter");
        this.load.image(
            "player",
            `assets/character_${selectedCharacter + 1}.png`
        );
    }

    create() {
        this.camera = this.cameras.main;
        this.camera.setBackgroundColor(0x00ff00);

        this.background = this.add.image(512, 384, "background");
        this.background.setAlpha(0.5);

        EventBus.emit("current-scene-ready", this);

        this.createGrid();
        this.createPlayer();
        if (this.input.keyboard) {
            this.cursors = this.input.keyboard.createCursorKeys();
        }
        if (this.input.keyboard) {
            this.input.keyboard.addKeys("W,A,S,D");
        }
    }

    createGrid() {
        const cols = this.cameras.main.width / this.gridSize;
        const rows = this.cameras.main.height / this.gridSize;
        this.totalTiles = cols * rows;
        //768

        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
                const tile = this.add
                    .rectangle(
                        x * this.gridSize,
                        y * this.gridSize,
                        this.gridSize,
                        this.gridSize,
                        0xffffff
                    )
                    .setOrigin(0);
                tile.setStrokeStyle(1, 0x000000);
            }
        }
    }

    createPlayer() {
        this.player = this.add.sprite(
            this.gridSize / 2,
            this.gridSize / 2,
            "player"
        );
        this.player.setDepth(1); // Ensure player is above the grid
    }

    update() {
        if (!this.player || !this.cursors) return;

        const speed = this.gridSize / 25;
        let moved = false;

        if (
            (this.cursors.left.isDown ||
                (this.input.keyboard && this.input.keyboard.keys[65].isDown)) &&
            this.player.x - speed >= 0
        ) {
            this.player.x -= speed;
            moved = true;
        } else if (
            (this.cursors.right.isDown ||
                (this.input.keyboard && this.input.keyboard.keys[68].isDown)) &&
            this.player.x + speed <= this.cameras.main.width
        ) {
            this.player.x += speed;
            moved = true;
        } else if (
            (this.cursors.up.isDown ||
                (this.input.keyboard && this.input.keyboard.keys[87].isDown)) &&
            this.player.y - speed >= 0
        ) {
            this.player.y -= speed;
            moved = true;
        } else if (
            (this.cursors.down.isDown ||
                (this.input.keyboard && this.input.keyboard.keys[83].isDown)) &&
            this.player.y + speed <= this.cameras.main.height
        ) {
            this.player.y += speed;
            moved = true;
        }

        if (moved) {
            this.changeTileColor(this.player.x, this.player.y);

            const distanceX = Math.abs(this.player.x - this.lastSentPosition.x);
            const distanceY = Math.abs(this.player.y - this.lastSentPosition.y);

            if (distanceX >= this.gridSize || distanceY >= this.gridSize) {
                console.log("Player moved to", this.player.x, this.player.y);
                this.lastSentPosition = { x: this.player.x, y: this.player.y };
                EventBus.emit("player-move", this.player.x, this.player.y);
            }
        }
    }

    changeTileColor(x: number, y: number) {
        const tileX = Math.floor(x / this.gridSize) * this.gridSize;
        const tileY = Math.floor(y / this.gridSize) * this.gridSize;
        const tileKey = `${tileX},${tileY}`;

        if (!this.coloredTiles.has(tileKey)) {
            this.coloredTiles.add(tileKey);
            const coloredPercentage =
                (this.coloredTiles.size / this.totalTiles) * 100;
            EventBus.emit("map-colored", coloredPercentage);
        }

        const tile = this.add
            .rectangle(tileX, tileY, this.gridSize, this.gridSize, 0xff0000)
            .setOrigin(0);
        tile.setStrokeStyle(1, 0x000000);
        tile.setDepth(0); // Ensure tile is below the player
    }

    changeScene() {
        this.scene.start("GameOver");
    }
}

