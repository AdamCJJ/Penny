import Phaser from 'phaser';
import SoundManager from '../utils/SoundManager.js';
import StorageManager from '../utils/StorageManager.js';
import Confetti from '../utils/Confetti.js';

const NUM_VARIANTS = 6;

// Button definitions: key, emoji label, display label
const BUTTONS = [
  { key: 'outfit',     emoji: '👗', label: 'Outfit'  },
  { key: 'wings',      emoji: '🧚', label: 'Wings'   },
  { key: 'crown',      emoji: '👑', label: 'Crown'   },
  { key: 'background', emoji: '🌈', label: 'BG'      },
  { key: 'boo',        emoji: '🐱', label: 'Boo'     },
  { key: 'baby',       emoji: '👶', label: 'Luke'    },
];

export default class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  create() {
    this.W = this.scale.width;
    this.H = this.scale.height;

    this.sound_mgr = new SoundManager();
    this.store = new StorageManager();
    this.confetti = new Confetti(this);

    // State: current variant index per category
    this.state = {
      outfit:     this.store.get('outfit'),
      wings:      this.store.get('wings'),
      crown:      this.store.get('crown'),
      background: this.store.get('background'),
    };

    this._createBackground();
    this._createPenny();
    this._createButtonBar();
    this._createGearButton();

    // Special character layers
    this._booActive = false;
    this._babyActive = false;
    this._booSprites = [];
    this._babySprites = [];
    this._heartSprites = [];
  }

  // ─── Background ────────────────────────────────────────────────────────────
  _createBackground() {
    this.bgImage = this.add.image(this.W / 2, this.H / 2, `bg_${this.state.background}`)
      .setDisplaySize(this.W, this.H)
      .setDepth(0);
  }

  _updateBackground(idx) {
    this.bgImage.setTexture(`bg_${idx}`);
    this.bgImage.setDisplaySize(this.W, this.H);
  }

  // ─── Penny + accessories ───────────────────────────────────────────────────
  _createPenny() {
    const cx = this.W / 2;
    const cy = this.H / 2 - 60;

    // Wings behind Penny
    this.wingsImage = this.add.image(cx, cy + 20, `wings_${this.state.wings}`)
      .setDisplaySize(260, 185)
      .setDepth(2);

    // Penny base
    this.pennyImage = this.add.image(cx, cy, 'penny_base')
      .setDisplaySize(180, 270)
      .setDepth(3);

    // Outfit layer on Penny
    this.outfitImage = this.add.image(cx, cy + 60, `outfit_${this.state.outfit}`)
      .setDisplaySize(145, 165)
      .setDepth(4);

    // Crown on head
    this.crownImage = this.add.image(cx, cy - 100, `crown_${this.state.crown}`)
      .setDisplaySize(115, 70)
      .setDepth(5);

    // Floating sparkles
    this._addFloatingSparkles();
  }

  _addFloatingSparkles() {
    const cx = this.W / 2;
    const cy = this.H / 2 - 60;
    const sparkleColors = [0xffd700, 0xff69b4, 0x87ceeb, 0x90ee90, 0xcc99ff];

    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const radius = 110 + Math.random() * 30;
      const sx = cx + Math.cos(angle) * radius;
      const sy = cy + Math.sin(angle) * radius;

      const gfx = this.add.graphics();
      const c = sparkleColors[i % sparkleColors.length];
      gfx.fillStyle(c, 0.8);
      gfx.fillStar(0, 0, 4, 3, 8, 0);
      gfx.x = sx;
      gfx.y = sy;
      gfx.setDepth(6);

      this.tweens.add({
        targets: gfx,
        y: sy - 15,
        alpha: { from: 0.3, to: 0.9 },
        scaleX: { from: 0.8, to: 1.2 },
        scaleY: { from: 0.8, to: 1.2 },
        duration: 1200 + Math.random() * 800,
        yoyo: true,
        repeat: -1,
        delay: i * 150,
        ease: 'Sine.easeInOut'
      });
    }
  }

  // ─── Button bar ────────────────────────────────────────────────────────────
  _createButtonBar() {
    const W = this.W, H = this.H;
    const BAR_H = 110;
    const BTN_W = Math.floor(W / 6) - 4;
    const BTN_H = 88;
    const barY = H - BAR_H;

    // Bar background
    const barBg = this.add.graphics();
    barBg.fillStyle(0x1a0a2e, 0.92);
    barBg.fillRoundedRect(0, barY, W, BAR_H, { tl: 22, tr: 22, bl: 0, br: 0 });
    barBg.lineStyle(3, 0xcc66ff, 0.5);
    barBg.strokeRoundedRect(0, barY, W, BAR_H, { tl: 22, tr: 22, bl: 0, br: 0 });
    barBg.setDepth(10);

    this.buttons = [];

    BUTTONS.forEach((def, i) => {
      const bx = Math.floor((i + 0.5) * (W / 6));
      const by = barY + (BAR_H - BTN_H) / 2 + BTN_H / 2;

      const container = this.add.container(bx, by);
      container.setDepth(11);

      // Button pill background
      const bg = this.add.graphics();
      bg.fillStyle(0x3d1a6e, 1);
      bg.fillRoundedRect(-BTN_W / 2, -BTN_H / 2, BTN_W, BTN_H, 12);
      bg.lineStyle(2.5, 0xcc66ff, 0.7);
      bg.strokeRoundedRect(-BTN_W / 2, -BTN_H / 2, BTN_W, BTN_H, 12);
      container.add(bg);

      // Emoji text
      const emojiTxt = this.add.text(0, -18, def.emoji, {
        fontSize: '28px',
        fontFamily: 'Apple Color Emoji, Segoe UI Emoji, Noto Color Emoji, sans-serif'
      }).setOrigin(0.5);
      container.add(emojiTxt);

      // Label text
      const labelTxt = this.add.text(0, 22, def.label, {
        fontSize: '13px',
        fontFamily: 'Arial Rounded MT Bold, Arial, sans-serif',
        color: '#ffffff',
        stroke: '#1a0a2e',
        strokeThickness: 3
      }).setOrigin(0.5);
      container.add(labelTxt);

      // Hit area
      const hitZone = this.add.rectangle(0, 0, BTN_W, BTN_H, 0x000000, 0)
        .setInteractive({ useHandCursor: true });
      container.add(hitZone);

      hitZone.on('pointerdown', () => this._onButtonTap(def.key, i, container, bx, by + barY - BTN_H));
      hitZone.on('pointerover', () => {
        this.tweens.add({ targets: container, scaleX: 1.08, scaleY: 1.08, duration: 100, ease: 'Back.easeOut' });
        bg.clear();
        bg.fillStyle(0x5a2a9e, 1);
        bg.fillRoundedRect(-BTN_W / 2, -BTN_H / 2, BTN_W, BTN_H, 12);
        bg.lineStyle(2.5, 0xffaaff, 0.9);
        bg.strokeRoundedRect(-BTN_W / 2, -BTN_H / 2, BTN_W, BTN_H, 12);
      });
      hitZone.on('pointerout', () => {
        this.tweens.add({ targets: container, scaleX: 1, scaleY: 1, duration: 100 });
        bg.clear();
        bg.fillStyle(0x3d1a6e, 1);
        bg.fillRoundedRect(-BTN_W / 2, -BTN_H / 2, BTN_W, BTN_H, 12);
        bg.lineStyle(2.5, 0xcc66ff, 0.7);
        bg.strokeRoundedRect(-BTN_W / 2, -BTN_H / 2, BTN_W, BTN_H, 12);
      });

      this.buttons.push({ container, bg, emojiTxt, labelTxt, BTN_W, BTN_H });
    });
  }

  // ─── Button tap handler ────────────────────────────────────────────────────
  _onButtonTap(key, btnIndex, container, confettiX, confettiY) {
    // Button press animation
    this.tweens.add({
      targets: container,
      scaleX: 0.88,
      scaleY: 0.88,
      duration: 80,
      yoyo: true,
      ease: 'Quad.easeInOut'
    });

    if (key === 'boo') {
      this._triggerBoo();
      this.sound_mgr.playCatMeow();
    } else if (key === 'baby') {
      this._triggerBaby();
      this.sound_mgr.playBabyGiggle();
    } else {
      // Cycle variant
      this.state[key] = (this.state[key] + 1) % NUM_VARIANTS;
      this.store.set(key, this.state[key]);
      this._updateItem(key, this.state[key]);
      this.sound_mgr.playPop();
    }

    // Confetti burst
    const cx = this.W / 2;
    const cy = this.H / 2 - 60;
    this.confetti.burst(cx, cy - 80, 24);
    this.sound_mgr.playSparkle();
  }

  _updateItem(key, idx) {
    let target = null;

    if (key === 'outfit') {
      target = this.outfitImage;
      this.outfitImage.setTexture(`outfit_${idx}`);
    } else if (key === 'wings') {
      target = this.wingsImage;
      this.wingsImage.setTexture(`wings_${idx}`);
    } else if (key === 'crown') {
      target = this.crownImage;
      this.crownImage.setTexture(`crown_${idx}`);
    } else if (key === 'background') {
      this._updateBackground(idx);
      return; // no bounce needed for background
    }

    if (target) {
      this._bounceItem(target);
    }
  }

  _bounceItem(target) {
    this.tweens.add({
      targets: target,
      scaleX: 1.18,
      scaleY: 1.18,
      duration: 120,
      ease: 'Back.easeOut',
      yoyo: true,
      onComplete: () => {
        this.tweens.add({
          targets: target,
          scaleX: 1,
          scaleY: 1,
          duration: 80
        });
      }
    });
  }

  // ─── Boo the Cat animation ─────────────────────────────────────────────────
  _triggerBoo() {
    if (this._booActive) return;
    this._booActive = true;

    const H = this.H;
    const W = this.W;
    const startX = -70;
    const endX = W + 70;
    const runY = H - 175;

    // Clean up previous
    this._booSprites.forEach(s => s.destroy());
    this._booSprites = [];

    // Butterfly
    const butterfly = this.add.image(W + 50, runY - 60, 'butterfly')
      .setDisplaySize(50, 42)
      .setDepth(15);
    this._booSprites.push(butterfly);

    // Butterfly flutter animation
    this.tweens.add({
      targets: butterfly,
      scaleY: { from: 1, to: 0.3 },
      duration: 200,
      yoyo: true,
      repeat: -1
    });

    // Butterfly path (enters first, then Boo chases)
    this.tweens.add({
      targets: butterfly,
      x: startX - 30,
      y: runY - 80,
      duration: 3000,
      ease: 'Sine.easeInOut',
      onComplete: () => butterfly.destroy()
    });

    // Boo cat – enters from left
    const boo = this.add.image(startX, runY, 'boo_cat')
      .setDisplaySize(85, 77)
      .setDepth(14)
      .setFlipX(false);
    this._booSprites.push(boo);

    // Running bob
    this.tweens.add({
      targets: boo,
      y: runY - 10,
      duration: 200,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Boo runs across screen
    this.tweens.add({
      targets: boo,
      x: endX,
      duration: 2800,
      ease: 'Linear',
      onComplete: () => {
        boo.destroy();
        this._booActive = false;
      }
    });
  }

  // ─── Baby Luke animation ───────────────────────────────────────────────────
  _triggerBaby() {
    if (this._babyActive) return;
    this._babyActive = true;

    const cx = this.W / 2;

    // Clean up previous
    this._babySprites.forEach(s => s.destroy());
    this._heartSprites.forEach(s => s.destroy());
    this._babySprites = [];
    this._heartSprites = [];

    // Baby pops up from bottom
    const baby = this.add.image(cx, this.H + 80, 'baby_luke')
      .setDisplaySize(95, 115)
      .setDepth(16);
    this._babySprites.push(baby);

    // Pop up animation
    this.tweens.add({
      targets: baby,
      y: this.H - 220,
      duration: 500,
      ease: 'Back.easeOut',
      onComplete: () => {
        // Bounce wiggle
        this.tweens.add({
          targets: baby,
          angle: { from: -8, to: 8 },
          duration: 300,
          yoyo: true,
          repeat: 3
        });

        // Emit floating hearts
        for (let h = 0; h < 8; h++) {
          this.time.delayedCall(h * 180, () => {
            const hx = cx + Phaser.Math.Between(-70, 70);
            const hy = this.H - 240;
            const heart = this.add.image(hx, hy, 'heart')
              .setDisplaySize(32, 28)
              .setDepth(17)
              .setAlpha(0.9);
            this._heartSprites.push(heart);

            this.tweens.add({
              targets: heart,
              y: hy - Phaser.Math.Between(80, 180),
              x: hx + Phaser.Math.Between(-40, 40),
              alpha: 0,
              scale: 1.4,
              duration: Phaser.Math.Between(1200, 2000),
              ease: 'Sine.easeOut',
              onComplete: () => {
                heart.destroy();
                const idx = this._heartSprites.indexOf(heart);
                if (idx !== -1) this._heartSprites.splice(idx, 1);
              }
            });
          });
        }

        // Baby slides back down after a moment
        this.time.delayedCall(2500, () => {
          this.tweens.add({
            targets: baby,
            y: this.H + 100,
            duration: 400,
            ease: 'Back.easeIn',
            onComplete: () => {
              baby.destroy();
              this._babyActive = false;
            }
          });
        });
      }
    });
  }

  // ─── Gear / Reset button ───────────────────────────────────────────────────
  _createGearButton() {
    const gx = this.W - 30;
    const gy = 30;

    const gear = this.add.image(gx, gy, 'gear_icon')
      .setDisplaySize(38, 38)
      .setDepth(20)
      .setInteractive({ useHandCursor: true });

    gear.on('pointerover', () => gear.setScale(1.15));
    gear.on('pointerout', () => gear.setScale(1));
    gear.on('pointerdown', () => this._showResetDialog());

    // Gentle spin
    this.tweens.add({
      targets: gear,
      angle: 360,
      duration: 6000,
      repeat: -1,
      ease: 'Linear'
    });
  }

  _showResetDialog() {
    const W = this.W, H = this.H;
    const depth = 50;

    // Dim overlay
    const overlay = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.65).setDepth(depth);

    // Dialog box
    const dlgW = 300, dlgH = 200;
    const dlg = this.add.graphics().setDepth(depth + 1);
    dlg.fillStyle(0x2d0f4e, 1);
    dlg.fillRoundedRect(W / 2 - dlgW / 2, H / 2 - dlgH / 2, dlgW, dlgH, 20);
    dlg.lineStyle(3, 0xcc66ff, 1);
    dlg.strokeRoundedRect(W / 2 - dlgW / 2, H / 2 - dlgH / 2, dlgW, dlgH, 20);

    const title = this.add.text(W / 2, H / 2 - 55, '🔄 Reset Outfit?', {
      fontSize: '22px',
      fontFamily: 'Arial Rounded MT Bold, Arial, sans-serif',
      color: '#ffffff',
      stroke: '#3a1a5c',
      strokeThickness: 3
    }).setOrigin(0.5).setDepth(depth + 2);

    const subtitle = this.add.text(W / 2, H / 2 - 18, 'Start fresh from the beginning!', {
      fontSize: '15px',
      fontFamily: 'Arial, sans-serif',
      color: '#ddaaff'
    }).setOrigin(0.5).setDepth(depth + 2);

    // Yes button
    const yesBg = this.add.graphics().setDepth(depth + 2);
    yesBg.fillStyle(0xff4d6d, 1);
    yesBg.fillRoundedRect(W / 2 - 120, H / 2 + 30, 100, 48, 12);
    yesBg.lineStyle(2, 0xffffff, 0.7);
    yesBg.strokeRoundedRect(W / 2 - 120, H / 2 + 30, 100, 48, 12);

    const yesLabel = this.add.text(W / 2 - 70, H / 2 + 54, '✨ Yes!', {
      fontSize: '18px', fontFamily: 'Arial Rounded MT Bold, Arial, sans-serif', color: '#ffffff'
    }).setOrigin(0.5).setDepth(depth + 3);

    const yesHit = this.add.rectangle(W / 2 - 70, H / 2 + 54, 100, 48, 0, 0)
      .setInteractive({ useHandCursor: true }).setDepth(depth + 4);

    // No button
    const noBg = this.add.graphics().setDepth(depth + 2);
    noBg.fillStyle(0x3d1a6e, 1);
    noBg.fillRoundedRect(W / 2 + 20, H / 2 + 30, 100, 48, 12);
    noBg.lineStyle(2, 0xcc66ff, 0.7);
    noBg.strokeRoundedRect(W / 2 + 20, H / 2 + 30, 100, 48, 12);

    const noLabel = this.add.text(W / 2 + 70, H / 2 + 54, '❌ No', {
      fontSize: '18px', fontFamily: 'Arial Rounded MT Bold, Arial, sans-serif', color: '#ffffff'
    }).setOrigin(0.5).setDepth(depth + 3);

    const noHit = this.add.rectangle(W / 2 + 70, H / 2 + 54, 100, 48, 0, 0)
      .setInteractive({ useHandCursor: true }).setDepth(depth + 4);

    const closeAll = () => {
      [overlay, dlg, title, subtitle, yesBg, yesLabel, yesHit, noBg, noLabel, noHit].forEach(o => o.destroy());
    };

    yesHit.on('pointerdown', () => {
      closeAll();
      this._resetAll();
    });

    noHit.on('pointerdown', () => {
      closeAll();
    });

    overlay.setInteractive();
    overlay.on('pointerdown', () => closeAll());
  }

  _resetAll() {
    this.store.reset();
    this.state = { outfit: 0, wings: 0, crown: 0, background: 0 };

    this.outfitImage.setTexture('outfit_0');
    this.wingsImage.setTexture('wings_0');
    this.crownImage.setTexture('crown_0');
    this._updateBackground(0);

    this.sound_mgr.playReset();
    this.confetti.burst(this.W / 2, this.H / 2, 40);
  }
}
