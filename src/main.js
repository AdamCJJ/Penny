import Phaser from 'phaser';
import './style.css';
import { ClosetScene } from './scenes/ClosetScene';

const shell = document.createElement('div');
shell.id = 'game-shell';
document.querySelector('#app').appendChild(shell);

new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'game-shell',
  width: 540,
  height: 960,
  backgroundColor: '#fef2ff',
  scene: [ClosetScene],
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  input: {
    activePointers: 3
  }
});
