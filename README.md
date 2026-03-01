# Penny's Rainbow Fairy Closet

A touch-first Phaser 3 dress-up mini game made for young kids. Everything is generated locally (graphics + sound), with no external assets, ads, login, or tracking.

## Run locally

```bash
npm install
npm run dev
```

Open the local URL shown by Vite.

## Scripts

- `npm run dev` - run Vite dev server
- `npm run build` - production build into `dist/`
- `npm run preview` - preview production build locally

## Deploy as static site (Netlify / Vercel)

This project is a pure static Vite build.

1. Build command: `npm run build`
2. Publish/output directory: `dist`

### Netlify quick settings
- Build command: `npm run build`
- Publish directory: `dist`

### Vercel quick settings
- Framework preset: `Vite`
- Build command: `npm run build`
- Output directory: `dist`

## Project structure

```text
.
├─ public/                  # optional future static assets
├─ src/
│  ├─ main.js               # Phaser boot/config
│  ├─ style.css             # mobile-safe layout + portrait shell
│  └─ scenes/
│     └─ ClosetScene.js     # all gameplay, visuals, audio, persistence
├─ index.html
└─ package.json
```

## Replacing placeholder stickers with real PNG assets later

The current game uses Phaser Graphics vectors. To replace with PNGs:

1. Put images in `public/assets/` (for example `public/assets/penny/base.png`).
2. In `src/scenes/ClosetScene.js`:
   - Add `preload()` and call `this.load.image(...)` for each PNG.
   - Replace draw functions like `drawOutfit`, `drawWings`, `drawCrown`, `drawBoo`, and `drawBaby` with sprite swapping logic (`this.add.image`, `.setTexture`, or visibility toggles).
   - Keep the existing state object and button `cycle()` logic so category taps still rotate through 6 variants.
3. Keep dimensions generous for touch devices (big hit targets and minimum 80px button height).

Suggested folders when adding art:

```text
public/assets/
  penny/
    base.png
    outfit-0.png ... outfit-5.png
    wings-0.png ... wings-5.png
    crown-0.png ... crown-5.png
  boo/
    boo-0.png ... boo-5.png
  baby/
    baby-0.png ... baby-5.png
  backgrounds/
    bg-0.png ... bg-5.png
```

## Notes

- Orientation is portrait-first via responsive CSS layout shell.
- Local progress is saved in browser `localStorage`.
- Pop sound is generated with WebAudio at runtime.
