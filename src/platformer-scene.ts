import Phaser from "phaser";
import Player from "./player.js";
import MouseTileMarker from "./mouse-tile-maker.js";

import playerImage from "./assets/spritesheets/0x72-industrial-player-32px-extruded.png";
import spikeImage from "./assets/images/0x72-industrial-spike.png";
import mainMapJson from "./assets/tilemaps/platformer-simple.json";
import tilesetImage from "./assets/tilesets/0x72-industrial-tileset-32px-extruded.png";

export default class PlatformerScene extends Phaser.Scene {
  isPlayerDead!: boolean;
  groundLayer!: Phaser.Tilemaps.TilemapLayer | null;
  player!: Player;
  spikeGroup!: Phaser.Physics.Arcade.StaticGroup;
  marker!: MouseTileMarker;

  preload() {
    this.load.spritesheet("player", playerImage, {
      frameWidth: 32,
      frameHeight: 32,
      margin: 1,
      spacing: 2,
    });
    this.load.image("spike", spikeImage);
    this.load.image("tiles", tilesetImage);
    this.load.tilemapTiledJSON("map", mainMapJson);
  }

  create() {
    this.isPlayerDead = false;

    const map = this.make.tilemap({ key: "map" });
    const tiles = map.addTilesetImage(
      "0x72-industrial-tileset-32px-extruded",
      "tiles"
    );

    if (!tiles) return;

    map.createLayer("Background", tiles);
    this.groundLayer = map.createLayer("Ground", tiles);
    map.createLayer("Foreground", tiles);

    const spawnPoint = map.findObject(
      "Objects",
      (obj) => obj.name === "Spawn Point"
    );

    if (!spawnPoint) return;

    this.player = new Player(this, spawnPoint.x ?? 0, spawnPoint.y ?? 0);

    this.groundLayer?.setCollisionByProperty({ collides: true });
    if (!this.groundLayer) return;
    this.physics.world.addCollider(this.player.sprite, this.groundLayer);

    this.spikeGroup = this.physics.add.staticGroup();
    this.groundLayer.forEachTile((tile) => {
      if (tile.index === 77) {
        const spike = this.spikeGroup.create(
          tile.getCenterX(),
          tile.getCenterY(),
          "spike"
        );

        spike.rotation = tile.rotation;
        if (spike.angle === 0) spike.body.setSize(32, 6).setOffset(0, 26);
        else if (spike.angle === -90)
          spike.body.setSize(6, 32).setOffset(26, 0);
        else if (spike.angle === 90) spike.body.setSize(6, 32).setOffset(0, 0);
        if (!this.groundLayer) return;
        this.groundLayer.removeTileAt(tile.x, tile.y);
      }
    });

    this.cameras.main.startFollow(this.player.sprite);
    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

    this.marker = new MouseTileMarker(this, map);

    // Help text that has a "fixed" position on the screen
    this.add
      .text(16, 16, "Arrow/WASD to move & jump\nLeft click to draw platforms", {
        font: "18px monospace",
        color: "#000000",
        padding: { x: 20, y: 10 },
        backgroundColor: "#ffffff",
      })
      .setScrollFactor(0);
  }

  update() {
    if (this.isPlayerDead) return;

    this.marker.update();
    this.player.update();

    // Add a colliding tile at the mouse position
    const pointer = this.input.activePointer;
    const worldPoint = pointer.positionToCamera(
      this.cameras.main
    ) as Phaser.Math.Vector2;
    if (!this.groundLayer) return;

    if (pointer.isDown) {
      const tile = this.groundLayer.putTileAtWorldXY(
        6,
        worldPoint.x,
        worldPoint.y
      );
      tile.setCollision(true);
    }

    if (
      this.player.sprite.y > this.groundLayer.height ||
      this.physics.world.overlap(this.player.sprite, this.spikeGroup)
    ) {
      // Flag that the player is dead so that we can stop update from running in the future
      this.isPlayerDead = true;

      const cam = this.cameras.main;
      cam.shake(100, 0.05);
      cam.fade(250, 0, 0, 0);

      // Freeze the player to leave them on screen while fading but remove the marker immediately
      this.player.freeze();
      this.marker.destroy();

      cam.once("camerafadeoutcomplete", () => {
        this.player.destroy();
        this.scene.restart();
      });
    }
  }
}
