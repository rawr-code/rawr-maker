export default class MouseTileMarker {
  map: Phaser.Tilemaps.Tilemap;
  scene: Phaser.Scene;
  graphics: Phaser.GameObjects.Graphics;
  constructor(scene: Phaser.Scene, map: Phaser.Tilemaps.Tilemap) {
    this.map = map;
    this.scene = scene;

    this.graphics = scene.add.graphics();
    this.graphics.lineStyle(5, 0xffffff, 1);
    this.graphics.strokeRect(0, 0, map.tileWidth, map.tileHeight);
    this.graphics.lineStyle(3, 0xff4f78, 1);
    this.graphics.strokeRect(0, 0, map.tileWidth, map.tileHeight);
  }

  update() {
    const pointer = this.scene.input.activePointer;
    const worldPoint = pointer.positionToCamera(
      this.scene.cameras.main
    ) as Phaser.Math.Vector2;
    const pointerTileXY = this.map.worldToTileXY(worldPoint.x, worldPoint.y);
    if (!pointerTileXY) return;

    const snappedWorldPoint = this.map.tileToWorldXY(
      pointerTileXY.x,
      pointerTileXY.y
    );
    if (!snappedWorldPoint) return;
    this.graphics.setPosition(snappedWorldPoint.x, snappedWorldPoint.y);
  }

  destroy() {
    this.graphics.destroy();
  }
}
