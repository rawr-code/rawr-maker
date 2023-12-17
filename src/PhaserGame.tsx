import { useEffect, useMemo, useState } from "react";
import Phaser from "phaser";

import PlatformerScene from "./platformer-scene";

function GameComponent({ id }: { id: string }) {
  const [open, setOpen] = useState(false);
  const config = useMemo(
    (): Phaser.Types.Core.GameConfig => ({
      type: Phaser.AUTO,
      parent: id,
      backgroundColor: "#1d212d",
      scale: {
        mode: Phaser.Scale.ScaleModes.HEIGHT_CONTROLS_WIDTH,
        width: "100%",
        height: "100%",
        // zoom: 1.68
      },
      pixelArt: true,
      scene: PlatformerScene,
      physics: {
        default: "arcade",
        arcade: {
          gravity: { y: 1000 },
        },
      },
    }),
    [id]
  );

  function toggleFullScreen() {
    const doc = window.document;
    const docEl = doc.documentElement;

    const requestFullScreen = docEl.requestFullscreen;
    const cancelFullScreen = doc.exitFullscreen;

    if (!doc.fullscreenElement) {
      setOpen(true);
      requestFullScreen.call(docEl);
    } else {
      cancelFullScreen.call(doc);
    }
  }

  useEffect(() => {
    const game = new Phaser.Game(config);
    return () => game.destroy(true);
  }, [config, open]);

  return (
    <div
      className="game-wrapper"
      style={{
        maxWidth: 1280,
        maxHeight: 600, // 720
        position: "relative",
      }}
    >
      <button
        onClick={toggleFullScreen}
        style={{ position: "fixed", bottom: 16, left: 16, display: "none" }}
      >
        fullscreen
      </button>
      <p className="game-title">Rawr Maker</p>
      <div id={id} className="game-canvas" />
    </div>
  );
}

export default GameComponent;
