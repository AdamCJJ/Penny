import Phaser from 'phaser';

// ─── Palette helpers ──────────────────────────────────────────────────────────
const OUTLINE = 0x3a1a5c;  // deep purple outline for all stickers

function hexToRgb(hex) {
  return { r: (hex >> 16) & 0xff, g: (hex >> 8) & 0xff, b: hex & 0xff };
}

/** Draw a thick rounded-rect outline (sticker style) */
function stickerOutline(gfx, x, y, w, h, r, thickness = 4) {
  gfx.lineStyle(thickness, OUTLINE, 1);
  gfx.strokeRoundedRect(x, y, w, h, r);
}

/** Draw sparkle star at (cx,cy) with size s */
function drawSparkle(gfx, cx, cy, s, color) {
  gfx.fillStyle(color, 1);
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2;
    const pts = [
      { x: cx, y: cy },
      { x: cx + Math.cos(a - 0.2) * s * 0.35, y: cy + Math.sin(a - 0.2) * s * 0.35 },
      { x: cx + Math.cos(a) * s, y: cy + Math.sin(a) * s },
      { x: cx + Math.cos(a + 0.2) * s * 0.35, y: cy + Math.sin(a + 0.2) * s * 0.35 },
    ];
    gfx.fillPoints(pts, true);
  }
}

// ─── Background textures (6 variants) ────────────────────────────────────────
function createBackgrounds(scene) {
  const W = 390, H = 844;
  const defs = [
    // 0 – Rainbow meadow
    { sky: [0x87ceeb, 0xffd6e7], clouds: true, rainbow: true, stars: false, ground: 0x90ee90 },
    // 1 – Starry night
    { sky: [0x0d0428, 0x1a0a4e], clouds: false, rainbow: false, stars: true, ground: 0x1a0a3e },
    // 2 – Sunset
    { sky: [0xff6b35, 0xff9f1c], clouds: true, rainbow: false, stars: false, ground: 0xff4d6d },
    // 3 – Candy land
    { sky: [0xff9fd4, 0xffd6fa], clouds: true, rainbow: true, stars: false, ground: 0xffaad4 },
    // 4 – Underwater
    { sky: [0x006994, 0x40c8e0], clouds: false, rainbow: false, stars: false, ground: 0x005577, bubbles: true },
    // 5 – Forest magic
    { sky: [0x2d6a4f, 0x52b788], clouds: false, rainbow: false, stars: true, ground: 0x1b4332 }
  ];

  defs.forEach((def, idx) => {
    const rt = scene.add.renderTexture(0, 0, W, H);
    rt.setVisible(false);

    const gfx = scene.make.graphics({ x: 0, y: 0, add: false });

    // Sky gradient (simulate with rect strips)
    const topC = hexToRgb(def.sky[0]);
    const botC = hexToRgb(def.sky[1]);
    const strips = 40;
    for (let i = 0; i < strips; i++) {
      const t = i / strips;
      const r = Math.round(topC.r + (botC.r - topC.r) * t);
      const g = Math.round(topC.g + (botC.g - topC.g) * t);
      const b = Math.round(topC.b + (botC.b - topC.b) * t);
      const color = (r << 16) | (g << 8) | b;
      gfx.fillStyle(color, 1);
      gfx.fillRect(0, (i / strips) * H, W, H / strips + 1);
    }

    // Ground strip
    gfx.fillStyle(def.ground, 1);
    gfx.fillRect(0, H - 120, W, 120);
    gfx.fillStyle(def.ground & 0xdddddd, 0.5);
    gfx.fillRect(0, H - 130, W, 20);

    // Rainbow
    if (def.rainbow) {
      const rcx = W / 2, rcy = H - 80;
      const rainbowColors = [0xff0000, 0xff7700, 0xffff00, 0x00cc00, 0x0055ff, 0x8800ff];
      rainbowColors.forEach((c, i) => {
        const rad = 260 - i * 18;
        gfx.lineStyle(16, c, 0.7);
        gfx.beginPath();
        gfx.arc(rcx, rcy, rad, Math.PI, 0, false);
        gfx.strokePath();
      });
    }

    // Clouds
    if (def.clouds) {
      [[70, 100], [250, 80], [340, 160], [120, 220]].forEach(([cx, cy]) => {
        gfx.fillStyle(0xffffff, 0.85);
        gfx.fillCircle(cx, cy, 30);
        gfx.fillCircle(cx + 30, cy - 10, 38);
        gfx.fillCircle(cx + 65, cy, 28);
        gfx.fillCircle(cx + 35, cy + 12, 25);
      });
    }

    // Stars
    if (def.stars) {
      for (let s = 0; s < 60; s++) {
        const sx = Math.random() * W;
        const sy = Math.random() * (H - 200);
        const ss = Math.random() * 3 + 1;
        gfx.fillStyle(0xffffff, Math.random() * 0.8 + 0.2);
        gfx.fillCircle(sx, sy, ss);
      }
    }

    // Bubbles (underwater)
    if (def.bubbles) {
      for (let b = 0; b < 20; b++) {
        const bx = Math.random() * W;
        const by = Math.random() * H;
        const br = Math.random() * 12 + 4;
        gfx.lineStyle(2, 0xaaddff, 0.7);
        gfx.strokeCircle(bx, by, br);
      }
    }

    rt.draw(gfx, 0, 0);
    rt.saveTexture(`bg_${idx}`);
    gfx.destroy();
    rt.destroy();
  });
}

// ─── Penny base body ──────────────────────────────────────────────────────────
function createPennyBase(scene) {
  const W = 200, H = 300;
  const rt = scene.add.renderTexture(0, 0, W, H);
  rt.setVisible(false);
  const gfx = scene.make.graphics({ add: false });

  const cx = W / 2;

  // Neck
  gfx.fillStyle(0xffd6b0, 1);
  gfx.fillRect(cx - 12, 105, 24, 30);

  // Head
  gfx.fillStyle(0xffd6b0, 1);
  gfx.fillEllipse(cx, 68, 88, 96);
  gfx.lineStyle(3, OUTLINE, 1);
  gfx.strokeEllipse(cx, 68, 88, 96);

  // Hair (long wavy brown)
  gfx.fillStyle(0x8b4513, 1);
  gfx.fillEllipse(cx, 52, 94, 70);
  // Hair sides
  gfx.fillStyle(0x8b4513, 1);
  gfx.fillEllipse(cx - 42, 85, 22, 60);
  gfx.fillEllipse(cx + 42, 85, 22, 60);
  // Hair highlights
  gfx.fillStyle(0xb87333, 0.5);
  gfx.fillEllipse(cx - 10, 40, 20, 35);

  // Face – eyes
  gfx.fillStyle(0x4a2c17, 1);
  gfx.fillCircle(cx - 18, 65, 9);
  gfx.fillCircle(cx + 18, 65, 9);
  gfx.fillStyle(0xffffff, 1);
  gfx.fillCircle(cx - 15, 63, 3);
  gfx.fillCircle(cx + 21, 63, 3);
  // Pupils
  gfx.fillStyle(0x000000, 1);
  gfx.fillCircle(cx - 17, 65, 5);
  gfx.fillCircle(cx + 19, 65, 5);
  // Eye shine
  gfx.fillStyle(0xffffff, 1);
  gfx.fillCircle(cx - 14, 62, 2.5);
  gfx.fillCircle(cx + 22, 62, 2.5);

  // Eyelashes
  gfx.lineStyle(2, OUTLINE, 1);
  [-22, -18, -14].forEach(ox => {
    gfx.beginPath();
    gfx.moveTo(cx + ox, 57);
    gfx.lineTo(cx + ox - 1, 52);
    gfx.strokePath();
  });
  [14, 18, 22].forEach(ox => {
    gfx.beginPath();
    gfx.moveTo(cx + ox, 57);
    gfx.lineTo(cx + ox + 1, 52);
    gfx.strokePath();
  });

  // Nose
  gfx.fillStyle(0xffb899, 1);
  gfx.fillEllipse(cx, 76, 10, 7);

  // Cheeks
  gfx.fillStyle(0xffaaaa, 0.5);
  gfx.fillCircle(cx - 28, 80, 12);
  gfx.fillCircle(cx + 28, 80, 12);

  // Mouth / smile
  gfx.lineStyle(2.5, 0x993333, 1);
  gfx.beginPath();
  gfx.arc(cx, 88, 14, 0.2, Math.PI - 0.2);
  gfx.strokePath();

  // Teeth
  gfx.fillStyle(0xffffff, 1);
  gfx.fillRect(cx - 7, 88, 14, 6);

  // Arms (skin-tone)
  gfx.fillStyle(0xffd6b0, 1);
  gfx.fillEllipse(cx - 65, 180, 22, 80);
  gfx.fillEllipse(cx + 65, 180, 22, 80);
  gfx.lineStyle(2, OUTLINE, 1);
  gfx.strokeEllipse(cx - 65, 180, 22, 80);
  gfx.strokeEllipse(cx + 65, 180, 22, 80);

  // Hands
  gfx.fillStyle(0xffd6b0, 1);
  gfx.fillCircle(cx - 65, 222, 11);
  gfx.fillCircle(cx + 65, 222, 11);

  // Legs
  gfx.fillStyle(0xffd6b0, 1);
  gfx.fillRect(cx - 28, 240, 22, 55);
  gfx.fillRect(cx + 6, 240, 22, 55);

  // Shoes
  gfx.fillStyle(0xff69b4, 1);
  gfx.fillEllipse(cx - 17, 297, 32, 16);
  gfx.fillEllipse(cx + 17, 297, 32, 16);
  gfx.lineStyle(2, OUTLINE, 1);
  gfx.strokeEllipse(cx - 17, 297, 32, 16);
  gfx.strokeEllipse(cx + 17, 297, 32, 16);

  rt.draw(gfx, 0, 0);
  rt.saveTexture('penny_base');
  gfx.destroy();
  rt.destroy();
}

// ─── Outfits (6 variants) – drawn on top of body ────────────────────────────
function createOutfits(scene) {
  const W = 160, H = 180;

  const defs = [
    // 0 – Pink tutu dress
    { bodyColor: 0xff9fd4, skirtColor: 0xff69b4, pattern: 'dots', accent: 0xffd700 },
    // 1 – Blue princess gown
    { bodyColor: 0x87ceeb, skirtColor: 0x4169e1, pattern: 'stars', accent: 0xffd700 },
    // 2 – Purple witch/fairy
    { bodyColor: 0x9b59b6, skirtColor: 0x6c3483, pattern: 'zigzag', accent: 0xffd700 },
    // 3 – Green forest
    { bodyColor: 0x52b788, skirtColor: 0x2d6a4f, pattern: 'flowers', accent: 0xffd700 },
    // 4 – Rainbow
    { bodyColor: 0xff6b35, skirtColor: 0xffd93d, pattern: 'rainbow', accent: 0xff69b4 },
    // 5 – White snow / ice
    { bodyColor: 0xe8f4fd, skirtColor: 0xbde0fe, pattern: 'snowflakes', accent: 0x4fc3f7 }
  ];

  defs.forEach((def, idx) => {
    const rt = scene.add.renderTexture(0, 0, W, H);
    rt.setVisible(false);
    const gfx = scene.make.graphics({ add: false });
    const cx = W / 2;

    // Bodice
    gfx.fillStyle(def.bodyColor, 1);
    gfx.fillRoundedRect(cx - 38, 0, 76, 75, 8);
    gfx.lineStyle(3, OUTLINE, 1);
    gfx.strokeRoundedRect(cx - 38, 0, 76, 75, 8);

    // Skirt (layered semi-circle)
    gfx.fillStyle(def.skirtColor, 1);
    gfx.fillTriangle(cx - 60, 75, cx + 60, 75, cx - 70, 175);
    gfx.fillTriangle(cx - 60, 75, cx + 60, 75, cx + 70, 175);
    gfx.fillTriangle(cx - 60, 75, cx + 60, 75, cx, 180);
    // Smooth skirt with ellipse
    gfx.fillEllipse(cx, 130, 145, 100);
    gfx.lineStyle(3, OUTLINE, 1);
    gfx.strokeEllipse(cx, 130, 145, 100);

    // Pattern overlay
    if (def.pattern === 'dots') {
      gfx.fillStyle(def.accent, 0.7);
      [[cx - 20, 25], [cx + 10, 35], [cx - 5, 50], [cx - 30, 110], [cx + 30, 120], [cx, 145], [cx - 50, 135], [cx + 50, 130]].forEach(([x, y]) => {
        gfx.fillCircle(x, y, 5);
      });
    } else if (def.pattern === 'stars') {
      gfx.fillStyle(def.accent, 0.8);
      [[cx - 15, 20], [cx + 15, 40], [cx, 30], [cx - 40, 115], [cx + 40, 125], [cx, 150]].forEach(([x, y]) => {
        drawSparkle(gfx, x, y, 7, def.accent);
      });
    } else if (def.pattern === 'zigzag') {
      gfx.lineStyle(2, def.accent, 0.8);
      for (let row = 0; row < 3; row++) {
        const y = 85 + row * 28;
        gfx.beginPath();
        for (let xi = 0; xi < 8; xi++) {
          const px = cx - 60 + xi * 18;
          const py = y + (xi % 2 === 0 ? 0 : 10);
          xi === 0 ? gfx.moveTo(px, py) : gfx.lineTo(px, py);
        }
        gfx.strokePath();
      }
    } else if (def.pattern === 'flowers') {
      gfx.fillStyle(def.accent, 0.8);
      [[cx, 20], [cx - 25, 110], [cx + 25, 130], [cx, 155], [cx - 45, 145]].forEach(([x, y]) => {
        for (let p = 0; p < 5; p++) {
          const pa = (p / 5) * Math.PI * 2;
          gfx.fillCircle(x + Math.cos(pa) * 7, y + Math.sin(pa) * 7, 4);
        }
        gfx.fillCircle(x, y, 5);
      });
    } else if (def.pattern === 'rainbow') {
      const rColors = [0xff0000, 0xff7700, 0xffff00, 0x00cc00, 0x0055ff];
      rColors.forEach((c, i) => {
        gfx.fillStyle(c, 0.6);
        gfx.fillRect(cx - 38, 8 + i * 12, 76, 10);
      });
    } else if (def.pattern === 'snowflakes') {
      gfx.lineStyle(1.5, def.accent, 0.9);
      [[cx - 20, 25], [cx + 10, 40], [cx - 35, 115], [cx + 35, 130], [cx, 155]].forEach(([x, y]) => {
        for (let arm = 0; arm < 6; arm++) {
          const a = (arm / 6) * Math.PI * 2;
          gfx.beginPath();
          gfx.moveTo(x, y);
          gfx.lineTo(x + Math.cos(a) * 9, y + Math.sin(a) * 9);
          gfx.strokePath();
        }
      });
    }

    // Bow/ribbon at waist
    gfx.fillStyle(def.accent, 1);
    gfx.fillTriangle(cx - 18, 73, cx, 82, cx - 18, 91);
    gfx.fillTriangle(cx + 18, 73, cx, 82, cx + 18, 91);
    gfx.fillCircle(cx, 82, 7);
    gfx.lineStyle(2, OUTLINE, 1);
    gfx.strokeCircle(cx, 82, 7);

    rt.draw(gfx, 0, 0);
    rt.saveTexture(`outfit_${idx}`);
    gfx.destroy();
    rt.destroy();
  });
}

// ─── Wings (6 variants) ───────────────────────────────────────────────────────
function createWings(scene) {
  const W = 280, H = 200;

  const defs = [
    { color: 0xffc8e8, vein: 0xff69b4, glow: 0xffaadd },   // 0 – Pink fairy
    { color: 0xb8d4ff, vein: 0x4169e1, glow: 0x87ceeb },   // 1 – Blue sky
    { color: 0xd4b8ff, vein: 0x9b59b6, glow: 0xcc99ff },   // 2 – Purple magic
    { color: 0xb8ffd4, vein: 0x2ecc71, glow: 0x90ee90 },   // 3 – Green nature
    { color: 0xffd4b8, vein: 0xff6b35, glow: 0xffaa77 },   // 4 – Sunset
    { color: 0xffffc8, vein: 0xffd700, glow: 0xffffaa },   // 5 – Golden
  ];

  defs.forEach((def, idx) => {
    const rt = scene.add.renderTexture(0, 0, W, H);
    rt.setVisible(false);
    const gfx = scene.make.graphics({ add: false });
    const cx = W / 2;
    const cy = H / 2 + 10;

    // Draw wing pair (mirror)
    [[-1, cx - 10], [1, cx + 10]].forEach(([side, startX]) => {
      // Upper wing
      gfx.fillStyle(def.color, 0.85);
      gfx.fillEllipse(startX + side * 60, cy - 40, 115, 110);
      gfx.lineStyle(2.5, def.vein, 0.9);
      gfx.strokeEllipse(startX + side * 60, cy - 40, 115, 110);

      // Lower wing (smaller)
      gfx.fillStyle(def.color, 0.75);
      gfx.fillEllipse(startX + side * 45, cy + 45, 80, 70);
      gfx.lineStyle(2, def.vein, 0.7);
      gfx.strokeEllipse(startX + side * 45, cy + 45, 80, 70);

      // Veins
      gfx.lineStyle(1.5, def.vein, 0.5);
      const wCx = startX + side * 60;
      const wCy = cy - 40;
      for (let v = 0; v < 4; v++) {
        const vAngle = (v / 4) * Math.PI * 0.8 + (side > 0 ? 0.1 : Math.PI - 0.9);
        gfx.beginPath();
        gfx.moveTo(cx, cy);
        gfx.lineTo(wCx + Math.cos(vAngle) * 50, wCy + Math.sin(vAngle) * 45);
        gfx.strokePath();
      }

      // Sparkle dots on wing edge
      gfx.fillStyle(def.glow, 0.9);
      for (let sp = 0; sp < 5; sp++) {
        const sa = (sp / 5) * Math.PI * 1.2 + (side > 0 ? -0.2 : Math.PI - 1.0);
        gfx.fillCircle(wCx + Math.cos(sa) * 50, wCy + Math.sin(sa) * 47, 4);
      }
    });

    rt.draw(gfx, 0, 0);
    rt.saveTexture(`wings_${idx}`);
    gfx.destroy();
    rt.destroy();
  });
}

// ─── Crowns (6 variants) ─────────────────────────────────────────────────────
function createCrowns(scene) {
  const W = 130, H = 80;

  const defs = [
    { base: 0xffd700, gems: [0xff0000, 0x0000ff, 0xff0000], style: 'crown' },     // 0 – Gold crown
    { base: 0xe8e8e8, gems: [0x4fc3f7, 0xffffff, 0x4fc3f7], style: 'tiara' },    // 1 – Silver tiara
    { base: 0xcc44cc, gems: [0xffffff, 0xffd700, 0xffffff], style: 'floral' },   // 2 – Flower crown
    { base: 0xff69b4, gems: [0xffffff, 0xff69b4, 0xffffff], style: 'bow' },      // 3 – Bow headband
    { base: 0x40c8e0, gems: [0xffffff, 0x87ceeb, 0xffffff], style: 'stars' },    // 4 – Star crown
    { base: 0x52b788, gems: [0xffd700, 0xffaadd, 0xffd700], style: 'leaves' },   // 5 – Leaf crown
  ];

  defs.forEach((def, idx) => {
    const rt = scene.add.renderTexture(0, 0, W, H);
    rt.setVisible(false);
    const gfx = scene.make.graphics({ add: false });
    const cx = W / 2;

    if (def.style === 'crown' || def.style === 'tiara') {
      // Band
      gfx.fillStyle(def.base, 1);
      gfx.fillRoundedRect(cx - 55, 40, 110, 30, 8);
      gfx.lineStyle(2.5, OUTLINE, 1);
      gfx.strokeRoundedRect(cx - 55, 40, 110, 30, 8);

      // Points
      const points = def.style === 'crown' ? 5 : 7;
      for (let p = 0; p < points; p++) {
        const px = cx - 45 + p * (90 / (points - 1));
        const ph = p % 2 === 0 ? 35 : 20;
        gfx.fillStyle(def.base, 1);
        gfx.fillTriangle(px - 10, 42, px + 10, 42, px, 42 - ph);
        gfx.lineStyle(2, OUTLINE, 1);
        gfx.strokeTriangle(px - 10, 42, px + 10, 42, px, 42 - ph);

        if (p % 2 === 0) {
          const gemColor = def.gems[p % def.gems.length];
          gfx.fillStyle(gemColor, 1);
          gfx.fillCircle(px, 42 - ph + 8, 6);
          gfx.fillStyle(0xffffff, 0.5);
          gfx.fillCircle(px - 2, 42 - ph + 6, 2);
        }
      }
      // Band gems
      def.gems.forEach((c, gi) => {
        const gx = cx - 25 + gi * 25;
        gfx.fillStyle(c, 1);
        gfx.fillRoundedRect(gx - 6, 46, 12, 18, 3);
        gfx.fillStyle(0xffffff, 0.4);
        gfx.fillRect(gx - 3, 48, 4, 6);
      });

    } else if (def.style === 'floral') {
      // Flower crown band
      gfx.fillStyle(def.base, 0.3);
      gfx.fillRoundedRect(cx - 55, 48, 110, 12, 6);

      // Flowers
      const flowerPositions = [cx - 40, cx - 20, cx, cx + 20, cx + 40];
      flowerPositions.forEach((fx, fi) => {
        const fc = def.gems[fi % def.gems.length];
        for (let pet = 0; pet < 5; pet++) {
          const pa = (pet / 5) * Math.PI * 2;
          gfx.fillStyle(fc, 1);
          gfx.fillCircle(fx + Math.cos(pa) * 8, 44 + Math.sin(pa) * 8, 6);
        }
        gfx.fillStyle(def.base, 1);
        gfx.fillCircle(fx, 44, 7);
        gfx.lineStyle(1.5, OUTLINE, 1);
        gfx.strokeCircle(fx, 44, 7);
      });

    } else if (def.style === 'bow') {
      // Headband
      gfx.fillStyle(def.base, 1);
      gfx.fillRoundedRect(cx - 55, 46, 110, 16, 8);
      gfx.lineStyle(2, OUTLINE, 1);
      gfx.strokeRoundedRect(cx - 55, 46, 110, 16, 8);

      // Big bow
      gfx.fillStyle(def.base, 1);
      gfx.fillTriangle(cx - 32, 25, cx, 42, cx - 32, 58);
      gfx.fillTriangle(cx + 32, 25, cx, 42, cx + 32, 58);
      gfx.fillCircle(cx, 42, 12);
      gfx.lineStyle(2, OUTLINE, 1);
      gfx.strokeCircle(cx, 42, 12);

      // Dots on bow
      def.gems.forEach((c, gi) => {
        gfx.fillStyle(c, 1);
        gfx.fillCircle(cx - 18 + gi * 18, 54, 5);
      });

    } else if (def.style === 'stars') {
      // Band
      gfx.fillStyle(def.base, 1);
      gfx.fillRoundedRect(cx - 55, 46, 110, 16, 8);
      gfx.lineStyle(2, OUTLINE, 1);
      gfx.strokeRoundedRect(cx - 55, 46, 110, 16, 8);

      // Stars
      [cx - 40, cx - 20, cx, cx + 20, cx + 40].forEach((sx, si) => {
        const sc = def.gems[si % def.gems.length];
        drawSparkle(gfx, sx, 30, 14, sc);
        gfx.lineStyle(1, OUTLINE, 0.5);
      });

    } else if (def.style === 'leaves') {
      // Vine band
      gfx.lineStyle(3, def.base, 1);
      gfx.beginPath();
      gfx.moveTo(cx - 55, 54);
      for (let lx = -55; lx <= 55; lx += 5) {
        gfx.lineTo(cx + lx, 54 + Math.sin(lx * 0.2) * 5);
      }
      gfx.strokePath();

      // Leaves
      for (let l = -45; l <= 45; l += 18) {
        const leafColor = def.base;
        gfx.fillStyle(leafColor, 1);
        const ly = 54 + Math.sin(l * 0.2) * 5;
        gfx.fillEllipse(cx + l, ly - 14, 14, 24);
        gfx.lineStyle(1, OUTLINE, 0.5);
        gfx.strokeEllipse(cx + l, ly - 14, 14, 24);
        // Flower on every 3rd
        if (Math.abs(l) % 36 === 0) {
          const fc = def.gems[0];
          for (let fp = 0; fp < 5; fp++) {
            const fpa = (fp / 5) * Math.PI * 2;
            gfx.fillStyle(fc, 1);
            gfx.fillCircle(cx + l + Math.cos(fpa) * 7, ly - 28 + Math.sin(fpa) * 7, 4);
          }
          gfx.fillStyle(0xffd700, 1);
          gfx.fillCircle(cx + l, ly - 28, 5);
        }
      }
    }

    rt.draw(gfx, 0, 0);
    rt.saveTexture(`crown_${idx}`);
    gfx.destroy();
    rt.destroy();
  });
}

// ─── Boo the Cat ─────────────────────────────────────────────────────────────
function createBoo(scene) {
  const W = 100, H = 90;
  const rt = scene.add.renderTexture(0, 0, W, H);
  rt.setVisible(false);
  const gfx = scene.make.graphics({ add: false });
  const cx = W / 2, cy = H / 2 + 5;

  // Body
  gfx.fillStyle(0xf5f5f5, 1);
  gfx.fillEllipse(cx, cy + 15, 58, 50);
  gfx.lineStyle(2.5, OUTLINE, 1);
  gfx.strokeEllipse(cx, cy + 15, 58, 50);

  // Head
  gfx.fillStyle(0xf5f5f5, 1);
  gfx.fillCircle(cx, cy - 10, 34);
  gfx.lineStyle(2.5, OUTLINE, 1);
  gfx.strokeCircle(cx, cy - 10, 34);

  // Ears
  gfx.fillStyle(0xf5f5f5, 1);
  gfx.fillTriangle(cx - 28, cy - 36, cx - 18, cy - 14, cx - 8, cy - 36);
  gfx.fillTriangle(cx + 28, cy - 36, cx + 18, cy - 14, cx + 8, cy - 36);
  gfx.lineStyle(2, OUTLINE, 1);
  gfx.strokeTriangle(cx - 28, cy - 36, cx - 18, cy - 14, cx - 8, cy - 36);
  gfx.strokeTriangle(cx + 28, cy - 36, cx + 18, cy - 14, cx + 8, cy - 36);
  // Inner ear
  gfx.fillStyle(0xffaacc, 1);
  gfx.fillTriangle(cx - 25, cy - 33, cx - 18, cy - 17, cx - 11, cy - 33);
  gfx.fillTriangle(cx + 25, cy - 33, cx + 18, cy - 17, cx + 11, cy - 33);

  // Eyes
  gfx.fillStyle(0x228b22, 1);
  gfx.fillEllipse(cx - 11, cy - 12, 14, 16);
  gfx.fillEllipse(cx + 11, cy - 12, 14, 16);
  gfx.fillStyle(0x000000, 1);
  gfx.fillEllipse(cx - 11, cy - 12, 7, 12);
  gfx.fillEllipse(cx + 11, cy - 12, 7, 12);
  gfx.fillStyle(0xffffff, 1);
  gfx.fillCircle(cx - 8, cy - 14, 3);
  gfx.fillCircle(cx + 14, cy - 14, 3);

  // Nose
  gfx.fillStyle(0xff69b4, 1);
  gfx.fillTriangle(cx - 4, cy - 3, cx + 4, cy - 3, cx, cy + 2);

  // Mouth
  gfx.lineStyle(2, OUTLINE, 1);
  gfx.beginPath();
  gfx.moveTo(cx, cy + 2);
  gfx.lineTo(cx - 8, cy + 8);
  gfx.strokePath();
  gfx.beginPath();
  gfx.moveTo(cx, cy + 2);
  gfx.lineTo(cx + 8, cy + 8);
  gfx.strokePath();

  // Whiskers
  gfx.lineStyle(1.5, 0x888888, 0.8);
  [[-1, 1], [-1, -1], [1, 1], [1, -1]].forEach(([sx, sy]) => {
    gfx.beginPath();
    gfx.moveTo(cx + sx * 5, cy + 1);
    gfx.lineTo(cx + sx * 30, cy + sy * 5);
    gfx.strokePath();
  });

  // Tail
  gfx.lineStyle(5, 0xf5f5f5, 1);
  gfx.beginPath();
  gfx.moveTo(cx + 26, cy + 25);
  gfx.bezierCurveTo(cx + 55, cy + 10, cx + 65, cy + 35, cx + 48, cy + 42);
  gfx.strokePath();
  gfx.lineStyle(2, OUTLINE, 0.6);
  gfx.beginPath();
  gfx.moveTo(cx + 26, cy + 25);
  gfx.bezierCurveTo(cx + 55, cy + 10, cx + 65, cy + 35, cx + 48, cy + 42);
  gfx.strokePath();

  // Collar
  gfx.fillStyle(0xff69b4, 1);
  gfx.fillRect(cx - 18, cy + 20, 36, 8);
  gfx.lineStyle(1.5, OUTLINE, 1);
  gfx.strokeRect(cx - 18, cy + 20, 36, 8);
  // Bell
  gfx.fillStyle(0xffd700, 1);
  gfx.fillCircle(cx, cy + 28, 5);
  gfx.lineStyle(1, OUTLINE, 1);
  gfx.strokeCircle(cx, cy + 28, 5);

  rt.draw(gfx, 0, 0);
  rt.saveTexture('boo_cat');
  gfx.destroy();
  rt.destroy();
}

// ─── Butterfly (for Boo chase) ────────────────────────────────────────────────
function createButterfly(scene) {
  const W = 60, H = 50;
  const rt = scene.add.renderTexture(0, 0, W, H);
  rt.setVisible(false);
  const gfx = scene.make.graphics({ add: false });
  const cx = W / 2, cy = H / 2;

  gfx.fillStyle(0xffaa00, 0.9);
  gfx.fillEllipse(cx - 14, cy - 8, 28, 22);
  gfx.fillEllipse(cx + 14, cy - 8, 28, 22);
  gfx.fillEllipse(cx - 10, cy + 10, 18, 16);
  gfx.fillEllipse(cx + 10, cy + 10, 18, 16);
  gfx.lineStyle(1.5, OUTLINE, 0.8);
  gfx.strokeEllipse(cx - 14, cy - 8, 28, 22);
  gfx.strokeEllipse(cx + 14, cy - 8, 28, 22);

  // Spots
  gfx.fillStyle(0x000000, 0.5);
  gfx.fillCircle(cx - 14, cy - 8, 5);
  gfx.fillCircle(cx + 14, cy - 8, 5);

  // Body
  gfx.fillStyle(0x333333, 1);
  gfx.fillEllipse(cx, cy, 6, 22);

  // Antennae
  gfx.lineStyle(1.5, 0x333333, 1);
  gfx.beginPath();
  gfx.moveTo(cx - 2, cy - 8);
  gfx.lineTo(cx - 10, cy - 22);
  gfx.strokePath();
  gfx.beginPath();
  gfx.moveTo(cx + 2, cy - 8);
  gfx.lineTo(cx + 10, cy - 22);
  gfx.strokePath();
  gfx.fillStyle(0xffaa00, 1);
  gfx.fillCircle(cx - 10, cy - 22, 3);
  gfx.fillCircle(cx + 10, cy - 22, 3);

  rt.draw(gfx, 0, 0);
  rt.saveTexture('butterfly');
  gfx.destroy();
  rt.destroy();
}

// ─── Baby Luke ────────────────────────────────────────────────────────────────
function createBabyLuke(scene) {
  const W = 110, H = 130;
  const rt = scene.add.renderTexture(0, 0, W, H);
  rt.setVisible(false);
  const gfx = scene.make.graphics({ add: false });
  const cx = W / 2;

  // Body / onesie
  gfx.fillStyle(0x87ceeb, 1);
  gfx.fillRoundedRect(cx - 32, 70, 64, 55, 12);
  gfx.lineStyle(2.5, OUTLINE, 1);
  gfx.strokeRoundedRect(cx - 32, 70, 64, 55, 12);

  // Onesie snap buttons
  gfx.fillStyle(0xffffff, 1);
  [cx - 8, cx, cx + 8].forEach(bx => {
    gfx.fillCircle(bx, 118, 3);
  });

  // Neck
  gfx.fillStyle(0xffd6b0, 1);
  gfx.fillRect(cx - 10, 62, 20, 15);

  // Head
  gfx.fillStyle(0xffd6b0, 1);
  gfx.fillCircle(cx, 42, 38);
  gfx.lineStyle(3, OUTLINE, 1);
  gfx.strokeCircle(cx, 42, 38);

  // Tuft of hair
  gfx.fillStyle(0xb87333, 1);
  gfx.fillEllipse(cx, 12, 35, 22);
  gfx.fillEllipse(cx - 10, 8, 18, 20);
  gfx.fillEllipse(cx + 10, 8, 18, 20);

  // Eyes (big cute)
  gfx.fillStyle(0x4a2c17, 1);
  gfx.fillCircle(cx - 13, 40, 10);
  gfx.fillCircle(cx + 13, 40, 10);
  gfx.fillStyle(0xffffff, 1);
  gfx.fillCircle(cx - 10, 37, 4);
  gfx.fillCircle(cx + 16, 37, 4);

  // Cheeks
  gfx.fillStyle(0xffaaaa, 0.6);
  gfx.fillCircle(cx - 26, 52, 10);
  gfx.fillCircle(cx + 26, 52, 10);

  // Tiny nose
  gfx.fillStyle(0xffb899, 1);
  gfx.fillCircle(cx, 50, 4);

  // Big smile
  gfx.lineStyle(2.5, 0x993333, 1);
  gfx.beginPath();
  gfx.arc(cx, 54, 12, 0.1, Math.PI - 0.1);
  gfx.strokePath();

  // Arms with chubby hands
  gfx.fillStyle(0xffd6b0, 1);
  gfx.fillEllipse(cx - 44, 88, 20, 38);
  gfx.fillEllipse(cx + 44, 88, 20, 38);
  gfx.fillCircle(cx - 44, 108, 12);
  gfx.fillCircle(cx + 44, 108, 12);
  gfx.lineStyle(2, OUTLINE, 0.7);
  gfx.strokeCircle(cx - 44, 108, 12);
  gfx.strokeCircle(cx + 44, 108, 12);

  // Pacifier
  gfx.fillStyle(0xff69b4, 1);
  gfx.fillCircle(cx + 4, 63, 7);
  gfx.lineStyle(1.5, OUTLINE, 1);
  gfx.strokeCircle(cx + 4, 63, 7);
  gfx.fillStyle(0xffffff, 1);
  gfx.fillRect(cx - 2, 60, 12, 6);

  rt.draw(gfx, 0, 0);
  rt.saveTexture('baby_luke');
  gfx.destroy();
  rt.destroy();
}

// ─── Heart sprite ─────────────────────────────────────────────────────────────
function createHeart(scene) {
  const W = 40, H = 36;
  const rt = scene.add.renderTexture(0, 0, W, H);
  rt.setVisible(false);
  const gfx = scene.make.graphics({ add: false });
  const cx = W / 2, cy = H / 2 + 2;

  const colors = [0xff69b4, 0xff1493, 0xffaadd];
  colors.forEach((c, i) => {
    const scale = 1 - i * 0.1;
    const w = 30 * scale, h = 28 * scale;
    gfx.fillStyle(c, 1 - i * 0.2);
    // Heart shape via two circles + triangle
    gfx.fillCircle(cx - w * 0.25, cy - h * 0.15, w * 0.28);
    gfx.fillCircle(cx + w * 0.25, cy - h * 0.15, w * 0.28);
    gfx.fillTriangle(cx - w * 0.5, cy, cx + w * 0.5, cy, cx, cy + h * 0.55);
  });

  rt.draw(gfx, 0, 0);
  rt.saveTexture('heart');
  gfx.destroy();
  rt.destroy();
}

// ─── Button background texture ────────────────────────────────────────────────
function createButtonBg(scene) {
  const W = 56, H = 80;
  const rt = scene.add.renderTexture(0, 0, W, H);
  rt.setVisible(false);
  const gfx = scene.make.graphics({ add: false });

  gfx.fillStyle(0xffffff, 0.15);
  gfx.fillRoundedRect(2, 2, W - 4, H - 4, 12);
  gfx.lineStyle(3, 0xffffff, 0.5);
  gfx.strokeRoundedRect(2, 2, W - 4, H - 4, 12);

  rt.draw(gfx, 0, 0);
  rt.saveTexture('btn_bg');
  gfx.destroy();
  rt.destroy();
}

// ─── Gear / reset icon ────────────────────────────────────────────────────────
function createGearIcon(scene) {
  const S = 44;
  const rt = scene.add.renderTexture(0, 0, S, S);
  rt.setVisible(false);
  const gfx = scene.make.graphics({ add: false });
  const cx = S / 2, cy = S / 2;

  gfx.fillStyle(0xffffff, 0.9);
  // Teeth
  for (let t = 0; t < 8; t++) {
    const a = (t / 8) * Math.PI * 2;
    const ix = cx + Math.cos(a) * 10;
    const iy = cy + Math.sin(a) * 10;
    const ox = cx + Math.cos(a) * 18;
    const oy = cy + Math.sin(a) * 18;
    gfx.fillRect(ix - 3, iy - 3, 6, 6);
  }
  // Outer ring
  gfx.lineStyle(4, 0xffffff, 0.9);
  gfx.strokeCircle(cx, cy, 16);
  // Inner hole
  gfx.fillStyle(0x1a0a2e, 1);
  gfx.fillCircle(cx, cy, 7);

  rt.draw(gfx, 0, 0);
  rt.saveTexture('gear_icon');
  gfx.destroy();
  rt.destroy();
}

// ─── BootScene ────────────────────────────────────────────────────────────────
export default class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  create() {
    const W = this.scale.width;
    const H = this.scale.height;

    // Loading label
    const loadText = this.add.text(W / 2, H / 2, '✨ Loading Magic... ✨', {
      fontSize: '28px',
      fontFamily: 'Arial Rounded MT Bold, Arial, sans-serif',
      color: '#ffffff',
      stroke: '#3a1a5c',
      strokeThickness: 4
    }).setOrigin(0.5);

    // Generate all textures
    createBackgrounds(this);
    createPennyBase(this);
    createOutfits(this);
    createWings(this);
    createCrowns(this);
    createBoo(this);
    createButterfly(this);
    createBabyLuke(this);
    createHeart(this);
    createButtonBg(this);
    createGearIcon(this);

    loadText.setText('✨ Ready! ✨');

    this.time.delayedCall(300, () => {
      this.scene.start('GameScene');
    });
  }
}
