import Phaser from 'phaser';
import BootScene from './scenes/BootScene.js';
import GameScene from './scenes/GameScene.js';

const config = {
  type: Phaser.AUTO,
  parent: 'game-container',
  width: 390,
  height: 844,
  backgroundColor: '#1a0a2e',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 390,
    height: 844
  },
  scene: [BootScene, GameScene],
  render: {
    antialias: true,
    pixelArt: false
  },
  input: {
    activePointers: 3
  }
};

const game = new Phaser.Game(config);

// Prevent context menu / right-click
document.addEventListener('contextmenu', e => e.preventDefault());
// Prevent scroll bounce on iOS
document.addEventListener('touchmove', e => e.preventDefault(), { passive: false });
