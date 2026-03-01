import Phaser from 'phaser';

const STORAGE_KEY = 'pennys-rainbow-fairy-closet-state-v1';

const BACKGROUND_STYLES = [
  { top: 0xffe7fb, bottom: 0xb7ecff, motif: 'clouds' },
  { top: 0xfff3b5, bottom: 0xffd1e9, motif: 'stars' },
  { top: 0xd7f8ff, bottom: 0xc7ffdd, motif: 'rainbow' },
  { top: 0xffdbdb, bottom: 0xfff5c7, motif: 'hearts' },
  { top: 0xded5ff, bottom: 0xa2e5ff, motif: 'moon' },
  { top: 0xc4ffd2, bottom: 0x8fd6ff, motif: 'sparkle' }
];

const OUTFIT_STYLES = [
  { primary: 0xff8fd1, accent: 0xffffff, pattern: 'dots' },
  { primary: 0x9bdeff, accent: 0xfff16f, pattern: 'stripe' },
  { primary: 0xcdb8ff, accent: 0xffffff, pattern: 'heart' },
  { primary: 0x91f2b8, accent: 0xfff5f8, pattern: 'scallop' },
  { primary: 0xffb091, accent: 0xffffff, pattern: 'star' },
  { primary: 0x99b4ff, accent: 0xffd5f6, pattern: 'diamond' }
];

const WING_STYLES = [0xffffff, 0xffc4f6, 0xbde6ff, 0xfff3a8, 0xd0ffcd, 0xe4d2ff];
const CROWN_STYLES = [0xffe55c, 0xff9ad6, 0x9dd7ff, 0xa7f0b1, 0xc7b3ff, 0xffb48f];

const BUTTONS = [
  ['outfit', 'Outfit 👗'],
  ['wings', 'Wings 🧚'],
  ['crown', 'Crown 👑'],
  ['background', 'Background 🌈'],
  ['boo', 'Boo the Cat 🐱'],
  ['baby', 'Baby Luke 👶']
];

const defaults = {
  outfit: 0,
  wings: 0,
  crown: 0,
  background: 0,
  boo: 0,
  baby: 0
};

export class ClosetScene extends Phaser.Scene {
  constructor() {
    super('ClosetScene');
    this.state = { ...defaults };
  }

  create() {
    this.loadState();

    this.backgroundLayer = this.add.container(0, 0);
    this.characterLayer = this.add.container(270, 440);
    this.effectLayer = this.add.container(0, 0);

    this.drawBackground();
    this.createPenny();
    this.createBottomButtons();
    this.createResetButton();

    this.applyState();
  }

  loadState() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return;
    try {
      const parsed = JSON.parse(saved);
      this.state = { ...defaults, ...parsed };
    } catch {
      this.state = { ...defaults };
    }
  }

  saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
  }

  createPenny() {
    this.wingContainer = this.add.container(0, -30);

    this.bodyBase = this.add.graphics();
    this.bodyBase.lineStyle(6, 0x7b5aa0, 1);
    this.bodyBase.fillStyle(0xfff0d7, 1);
    this.bodyBase.fillCircle(0, -120, 64);
    this.bodyBase.strokeCircle(0, -120, 64);
    this.bodyBase.fillStyle(0x8b5cf6, 1);
    this.bodyBase.fillRoundedRect(-18, -48, 36, 90, 16);
    this.bodyBase.lineStyle(4, 0x6c43ac, 1);
    this.bodyBase.strokeRoundedRect(-18, -48, 36, 90, 16);
    this.bodyBase.fillStyle(0xffffff, 1);
    this.bodyBase.fillCircle(-24, -128, 6);
    this.bodyBase.fillCircle(24, -128, 6);
    this.bodyBase.fillStyle(0xf973a5, 1);
    this.bodyBase.fillEllipse(0, -96, 20, 10);

    this.outfitGraphic = this.add.graphics();
    this.crownGraphic = this.add.graphics();

    this.characterLayer.add([this.wingContainer, this.bodyBase, this.outfitGraphic, this.crownGraphic]);

    this.booContainer = this.add.container(90, 730);
    this.booGraphic = this.add.graphics();
    this.butterflyGraphic = this.add.graphics();
    this.booContainer.add([this.butterflyGraphic, this.booGraphic]);
    this.drawBoo();

    this.babyContainer = this.add.container(450, 730);
    this.babyGraphic = this.add.graphics();
    this.babyContainer.add(this.babyGraphic);
    this.drawBaby();
  }

  applyState() {
    this.drawBackground();
    this.drawOutfit(this.state.outfit);
    this.drawWings(this.state.wings);
    this.drawCrown(this.state.crown);
    this.drawBoo();
    this.drawBaby();
  }

  drawBackground() {
    this.backgroundLayer.removeAll(true);
    const s = BACKGROUND_STYLES[this.state.background];
    const g = this.add.graphics();
    g.fillGradientStyle(s.top, s.top, s.bottom, s.bottom, 1);
    g.fillRect(0, 0, 540, 960);

    const rainbow = this.add.graphics();
    rainbow.lineStyle(14, 0xff5f7f, 0.9).strokeCircle(270, 320, 190);
    rainbow.lineStyle(14, 0xffb347, 0.9).strokeCircle(270, 320, 172);
    rainbow.lineStyle(14, 0xfff46b, 0.9).strokeCircle(270, 320, 154);
    rainbow.lineStyle(14, 0x7adf8d, 0.9).strokeCircle(270, 320, 136);
    rainbow.lineStyle(14, 0x7dbdff, 0.9).strokeCircle(270, 320, 118);
    rainbow.lineStyle(14, 0xb29bff, 0.9).strokeCircle(270, 320, 100);
    rainbow.setMask(new Phaser.Display.Masks.GeometryMask(this, this.add.graphics().fillRect(0, 0, 540, 390)));

    const deco = this.add.graphics();
    deco.fillStyle(0xffffff, 0.75);

    for (let i = 0; i < 9; i += 1) {
      const x = 60 + i * 55;
      const y = 120 + (i % 2) * 30;
      if (s.motif === 'stars' || s.motif === 'sparkle') {
        deco.fillPoint(x, y, 8);
        deco.fillPoint(x + 8, y + 8, 8);
      } else {
        deco.fillEllipse(x, y, 38, 24);
      }
    }

    this.backgroundLayer.add([g, rainbow, deco]);
  }

  drawWings(index) {
    this.wingContainer.removeAll(true);
    const c = WING_STYLES[index];
    const left = this.add.graphics();
    const right = this.add.graphics();
    [left, right].forEach((wing) => {
      wing.lineStyle(5, 0x7b5aa0, 0.8);
      wing.fillStyle(c, 0.9);
      wing.fillEllipse(0, 0, 100, 150);
      wing.strokeEllipse(0, 0, 100, 150);
      wing.fillEllipse(0, 58, 68, 94);
      wing.strokeEllipse(0, 58, 68, 94);
    });
    left.x = -72;
    left.y = -12;
    right.x = 72;
    right.y = -12;
    this.wingContainer.add([left, right]);
  }

  drawOutfit(index) {
    const s = OUTFIT_STYLES[index];
    this.outfitGraphic.clear();
    this.outfitGraphic.lineStyle(5, 0x7b5aa0, 1);
    this.outfitGraphic.fillStyle(s.primary, 1);
    this.outfitGraphic.fillRoundedRect(-92, -25, 184, 180, 38);
    this.outfitGraphic.strokeRoundedRect(-92, -25, 184, 180, 38);
    this.outfitGraphic.fillStyle(s.accent, 0.95);

    for (let i = -60; i <= 60; i += 30) {
      if (s.pattern === 'dots') this.outfitGraphic.fillCircle(i, 40, 8);
      if (s.pattern === 'stripe') this.outfitGraphic.fillRect(i, 6, 14, 120);
      if (s.pattern === 'heart') {
        this.outfitGraphic.fillCircle(i - 5, 40, 6);
        this.outfitGraphic.fillCircle(i + 5, 40, 6);
        this.outfitGraphic.fillTriangle(i - 12, 42, i + 12, 42, i, 56);
      }
      if (s.pattern === 'scallop') this.outfitGraphic.fillEllipse(i, 116, 28, 14);
      if (s.pattern === 'star') this.outfitGraphic.fillPoint(i, 40, 12);
      if (s.pattern === 'diamond') this.outfitGraphic.fillTriangle(i, 25, i + 10, 40, i, 55);
    }
  }

  drawCrown(index) {
    const c = CROWN_STYLES[index];
    this.crownGraphic.clear();
    this.crownGraphic.lineStyle(4, 0x7b5aa0, 1);
    this.crownGraphic.fillStyle(c, 1);
    this.crownGraphic.fillRoundedRect(-48, -206, 96, 26, 10);
    this.crownGraphic.strokeRoundedRect(-48, -206, 96, 26, 10);
    this.crownGraphic.fillTriangle(-40, -180, -26, -226, -12, -180);
    this.crownGraphic.fillTriangle(-12, -180, 0, -236, 12, -180);
    this.crownGraphic.fillTriangle(12, -180, 26, -226, 40, -180);
    this.crownGraphic.strokeTriangle(-40, -180, -26, -226, -12, -180);
    this.crownGraphic.strokeTriangle(-12, -180, 0, -236, 12, -180);
    this.crownGraphic.strokeTriangle(12, -180, 26, -226, 40, -180);
  }

  drawBoo() {
    this.booGraphic.clear();
    this.butterflyGraphic.clear();
    const color = [0x999999, 0xffc1d9, 0xfad58f, 0xb7f2d2, 0xd9c6ff, 0x9ed8ff][this.state.boo];

    this.booGraphic.lineStyle(4, 0x553e58, 1);
    this.booGraphic.fillStyle(color, 1);
    this.booGraphic.fillEllipse(0, 0, 90, 64);
    this.booGraphic.strokeEllipse(0, 0, 90, 64);
    this.booGraphic.fillCircle(-26, -24, 15);
    this.booGraphic.fillCircle(26, -24, 15);
    this.booGraphic.strokeCircle(-26, -24, 15);
    this.booGraphic.strokeCircle(26, -24, 15);
    this.booGraphic.fillStyle(0xffffff, 1);
    this.booGraphic.fillCircle(-12, -4, 5);
    this.booGraphic.fillCircle(12, -4, 5);

    this.butterflyGraphic.fillStyle(0xfff57f, 1);
    this.butterflyGraphic.fillEllipse(56, -34, 18, 14);
    this.butterflyGraphic.fillEllipse(74, -34, 18, 14);
    this.butterflyGraphic.fillStyle(0xa66bff, 1);
    this.butterflyGraphic.fillRect(64, -40, 3, 14);
  }

  drawBaby() {
    this.babyGraphic.clear();
    const color = [0xfff0d9, 0xffddb6, 0xf3c59c, 0xf0c8b8, 0xeec0a5, 0xf8d5c2][this.state.baby];
    this.babyGraphic.lineStyle(4, 0x6e4c86, 1);
    this.babyGraphic.fillStyle(color, 1);
    this.babyGraphic.fillCircle(0, 0, 44);
    this.babyGraphic.strokeCircle(0, 0, 44);
    this.babyGraphic.fillStyle(0xffffff, 1);
    this.babyGraphic.fillCircle(-14, -6, 5);
    this.babyGraphic.fillCircle(14, -6, 5);
    this.babyGraphic.fillStyle(0xfb7fab, 1);
    this.babyGraphic.fillEllipse(0, 16, 18, 9);
    this.babyGraphic.fillStyle(0xfff2a0, 1);
    this.babyGraphic.fillTriangle(-8, -42, 0, -58, 8, -42);
  }

  createBottomButtons() {
    const panel = this.add.graphics();
    panel.fillStyle(0xffffff, 0.92);
    panel.fillRoundedRect(10, 732, 520, 216, 24);
    panel.lineStyle(4, 0xc099e8, 1);
    panel.strokeRoundedRect(10, 732, 520, 216, 24);

    const colW = 160;
    const startX = 36;
    const startY = 752;

    BUTTONS.forEach(([key, label], i) => {
      const row = Math.floor(i / 3);
      const col = i % 3;
      const x = startX + col * colW;
      const y = startY + row * 96;

      const button = this.add.container(x, y);
      const bg = this.add.graphics();
      bg.fillStyle(0xfff1ff, 1);
      bg.fillRoundedRect(0, 0, 148, 88, 20);
      bg.lineStyle(4, 0xb280de, 1);
      bg.strokeRoundedRect(0, 0, 148, 88, 20);
      const text = this.add.text(74, 44, label, {
        color: '#583885',
        fontFamily: 'Trebuchet MS, Comic Sans MS, sans-serif',
        fontSize: '25px',
        align: 'center'
      }).setOrigin(0.5);

      const hit = this.add.zone(74, 44, 148, 88).setInteractive({ useHandCursor: true });
      hit.on('pointerdown', () => this.cycle(key, button));

      button.add([bg, text, hit]);
      this.add.existing(button);
    });
  }

  createResetButton() {
    const button = this.add.container(492, 44);
    const bg = this.add.graphics();
    bg.fillStyle(0xffffff, 0.94);
    bg.fillCircle(0, 0, 30);
    bg.lineStyle(4, 0xbd95e5, 1);
    bg.strokeCircle(0, 0, 30);
    const gear = this.add.text(0, 0, '⚙️', { fontSize: '30px' }).setOrigin(0.5);
    const hit = this.add.zone(0, 0, 60, 60).setInteractive({ useHandCursor: true });
    hit.on('pointerdown', () => {
      if (window.confirm('Reset Penny’s closet to the beginning?')) {
        this.state = { ...defaults };
        this.applyState();
        this.saveState();
        this.makeConfetti(492, 44);
        this.playPop();
      }
    });
    button.add([bg, gear, hit]);
  }

  cycle(key, button) {
    this.state[key] = (this.state[key] + 1) % 6;

    switch (key) {
      case 'outfit':
        this.drawOutfit(this.state.outfit);
        this.bounce(this.outfitGraphic);
        break;
      case 'wings':
        this.drawWings(this.state.wings);
        this.bounce(this.wingContainer);
        break;
      case 'crown':
        this.drawCrown(this.state.crown);
        this.bounce(this.crownGraphic);
        break;
      case 'background':
        this.drawBackground();
        this.cameras.main.shake(110, 0.002);
        break;
      case 'boo':
        this.drawBoo();
        this.runBooAnimation();
        break;
      case 'baby':
        this.drawBaby();
        this.popBabyHearts();
        this.bounce(this.babyContainer);
        break;
      default:
        break;
    }

    this.bounce(button);
    this.makeConfetti(button.x + 74, button.y + 44);
    this.playPop();
    this.saveState();
  }

  bounce(target) {
    this.tweens.add({
      targets: target,
      scaleX: 1.1,
      scaleY: 1.1,
      yoyo: true,
      duration: 120,
      ease: 'Quad.easeOut'
    });
  }

  makeConfetti(x, y) {
    const colors = [0xff75ae, 0x7bd9ff, 0xffd66b, 0x94f2aa, 0xd8b9ff];
    for (let i = 0; i < 18; i += 1) {
      const dot = this.add.circle(x, y, Phaser.Math.Between(3, 6), Phaser.Utils.Array.GetRandom(colors));
      this.effectLayer.add(dot);
      this.tweens.add({
        targets: dot,
        x: x + Phaser.Math.Between(-70, 70),
        y: y + Phaser.Math.Between(-70, 70),
        alpha: 0,
        scale: 0.3,
        duration: 480,
        ease: 'Cubic.easeOut',
        onComplete: () => dot.destroy()
      });
    }
  }

  runBooAnimation() {
    this.tweens.killTweensOf(this.booContainer);
    this.tweens.killTweensOf(this.butterflyGraphic);

    this.booContainer.x = -60;
    this.booContainer.y = 700;
    this.tweens.add({
      targets: this.booContainer,
      x: 620,
      duration: 1400,
      ease: 'Sine.easeInOut'
    });

    this.tweens.add({
      targets: this.booContainer,
      y: '+=14',
      yoyo: true,
      repeat: 6,
      duration: 90
    });

    this.tweens.add({
      targets: this.butterflyGraphic,
      x: 30,
      y: -24,
      yoyo: true,
      repeat: 5,
      duration: 120
    });
  }

  popBabyHearts() {
    this.babyContainer.y = 780;
    this.tweens.add({
      targets: this.babyContainer,
      y: 730,
      duration: 220,
      ease: 'Back.Out'
    });

    for (let i = 0; i < 7; i += 1) {
      const heart = this.add.text(this.babyContainer.x + Phaser.Math.Between(-18, 18), 690, '💖', {
        fontSize: '24px'
      });
      this.effectLayer.add(heart);
      this.tweens.add({
        targets: heart,
        y: 590 - i * 18,
        x: heart.x + Phaser.Math.Between(-50, 50),
        alpha: 0,
        duration: 850,
        ease: 'Sine.easeOut',
        onComplete: () => heart.destroy()
      });
    }
  }

  playPop() {
    const ctx = this.sound.context;
    if (!ctx) return;
    const now = ctx.currentTime;
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();

    oscillator.type = 'triangle';
    oscillator.frequency.setValueAtTime(680, now);
    oscillator.frequency.exponentialRampToValueAtTime(360, now + 0.12);
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.exponentialRampToValueAtTime(0.12, now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

    oscillator.connect(gain);
    gain.connect(ctx.destination);
    oscillator.start(now);
    oscillator.stop(now + 0.15);
  }
}
