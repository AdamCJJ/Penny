/**
 * Confetti burst using Phaser Graphics particles.
 * Spawns colorful squares/circles that arc outward and fade.
 */
export default class Confetti {
  constructor(scene) {
    this.scene = scene;
    this._particles = [];
  }

  burst(x, y, count = 28) {
    const scene = this.scene;
    const colors = [0xff6b9d, 0xffd93d, 0x6bcb77, 0x4d96ff, 0xff9f1c, 0xc77dff, 0xff4d6d, 0xffffff];

    for (let i = 0; i < count; i++) {
      const color = colors[Math.floor(Math.random() * colors.length)];
      const size = Phaser.Math.Between(6, 14);
      const useCircle = Math.random() > 0.5;

      const gfx = scene.add.graphics();
      gfx.fillStyle(color, 1);
      if (useCircle) {
        gfx.fillCircle(0, 0, size / 2);
      } else {
        gfx.fillRect(-size / 2, -size / 2, size, size);
      }
      gfx.x = x;
      gfx.y = y;
      gfx.setDepth(100);

      const angle = Phaser.Math.Between(0, 360);
      const speed = Phaser.Math.Between(80, 220);
      const vx = Math.cos(Phaser.Math.DegToRad(angle)) * speed;
      const vy = Math.sin(Phaser.Math.DegToRad(angle)) * speed - Phaser.Math.Between(50, 150);
      const gravity = Phaser.Math.Between(200, 400);
      const duration = Phaser.Math.Between(700, 1200);

      this._particles.push(gfx);

      scene.tweens.add({
        targets: gfx,
        x: x + vx * (duration / 1000),
        y: y + vy * (duration / 1000) + gravity * (duration / 1000) ** 2 / 2,
        alpha: 0,
        angle: Phaser.Math.Between(-360, 360),
        scaleX: Phaser.Math.FloatBetween(0.2, 0.8),
        scaleY: Phaser.Math.FloatBetween(0.2, 0.8),
        duration: duration,
        ease: 'Quad.easeIn',
        onComplete: () => {
          gfx.destroy();
          const idx = this._particles.indexOf(gfx);
          if (idx !== -1) this._particles.splice(idx, 1);
        }
      });
    }
  }

  clearAll() {
    this._particles.forEach(p => p.destroy());
    this._particles = [];
  }
}
