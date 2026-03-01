# Penny's Rainbow Fairy Closet ✨

A touch-first dress-up game for kids (ages 3–6), built with **Phaser 3 + Vite**.

---

## Quick Start

```bash
npm install
npm run dev
```

Open your browser at `http://localhost:3000`.

---

## All Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server with hot reload |
| `npm run build` | Build for production → `/dist` |
| `npm run preview` | Locally preview the production build |

---

## How to Deploy (Static Site)

The build output is a plain static site in `/dist`. No server needed.

### Netlify

1. Run `npm run build`
2. Drag the `dist/` folder to [netlify.com/drop](https://app.netlify.com/drop)

**Or** connect the repo and set:
- Build command: `npm run build`
- Publish directory: `dist`

### Vercel

```bash
npx vercel --prod
```

Or connect the GitHub repo in the Vercel dashboard. Vercel auto-detects Vite.

### GitHub Pages

```bash
npm run build
# then push the dist/ folder to gh-pages branch
```

Add `base: './'` to `vite.config.js` (already set).

---

## Game Controls

| Button | Action |
|--------|--------|
| **👗 Outfit** | Cycles through 6 dress styles |
| **🧚 Wings** | Cycles through 6 fairy wing colors |
| **👑 Crown** | Cycles through 6 headwear styles |
| **🌈 BG** | Cycles through 6 backgrounds |
| **🐱 Boo** | Boo the cat runs across chasing a butterfly |
| **👶 Luke** | Baby Luke pops up and releases hearts |
| **⚙️ Gear** | Opens reset confirmation dialog |

Selections are saved in `localStorage` automatically.

---

## Swapping Placeholders with Real PNG Assets

All graphics are currently generated with Phaser's Graphics API in `src/scenes/BootScene.js`. To replace them with real art:

### Step 1 – Add your PNG files

```
public/
  assets/
    penny_base.png          ← Penny's body (200×300 px recommended)
    outfit_0.png            ← Outfit variant 0  (160×180 px)
    outfit_1.png            ← Outfit variant 1
    outfit_2.png
    outfit_3.png
    outfit_4.png
    outfit_5.png
    wings_0.png             ← Wings (280×200 px)
    wings_1.png … wings_5.png
    crown_0.png             ← Crown (130×80 px)
    crown_1.png … crown_5.png
    bg_0.png                ← Background (390×844 px – full portrait)
    bg_1.png … bg_5.png
    boo_cat.png             ← Boo the cat (100×90 px)
    butterfly.png           ← Butterfly (60×50 px)
    baby_luke.png           ← Baby Luke (110×130 px)
    heart.png               ← Heart particle (40×36 px)
```

### Step 2 – Load them in BootScene

In `src/scenes/BootScene.js`, add a `preload()` method and load your images:

```js
preload() {
  // Example – add all your variants:
  for (let i = 0; i < 6; i++) {
    this.load.image(`bg_${i}`,     `assets/bg_${i}.png`);
    this.load.image(`outfit_${i}`, `assets/outfit_${i}.png`);
    this.load.image(`wings_${i}`,  `assets/wings_${i}.png`);
    this.load.image(`crown_${i}`,  `assets/crown_${i}.png`);
  }
  this.load.image('penny_base', 'assets/penny_base.png');
  this.load.image('boo_cat',    'assets/boo_cat.png');
  this.load.image('butterfly',  'assets/butterfly.png');
  this.load.image('baby_luke',  'assets/baby_luke.png');
  this.load.image('heart',      'assets/heart.png');
  this.load.image('gear_icon',  'assets/gear_icon.png');
}
```

### Step 3 – Remove the generated texture code

Delete (or comment out) the calls to `createBackgrounds()`, `createPennyBase()`, etc. inside `create()` in `BootScene.js`. The texture keys stay the same so the rest of the game just works.

---

## Project Structure

```
Penny/
├── index.html
├── package.json
├── vite.config.js
├── README.md
├── public/               ← Static assets (add PNGs here later)
└── src/
    ├── main.js           ← Phaser game config + init
    ├── scenes/
    │   ├── BootScene.js  ← Generates all textures procedurally
    │   └── GameScene.js  ← All gameplay, UI, animations
    └── utils/
        ├── SoundManager.js   ← All sounds via WebAudio (no files)
        ├── StorageManager.js ← localStorage persistence
        └── Confetti.js       ← Confetti burst effect
```

---

## Tech Stack

- [Phaser 3](https://phaser.io/) – game framework
- [Vite 5](https://vitejs.dev/) – build tool / dev server

No external assets, no CDN dependencies, no tracking.
