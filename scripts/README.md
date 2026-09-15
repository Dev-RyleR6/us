# Scrapbook tools

The website is static. Its existing animation libraries load from CDNs.

Install optional local tools:

```powershell
npm.cmd install --prefix .tools --no-audit --no-fund pdfjs-dist @napi-rs/canvas playwright gifenc gifuct-js
```

- `node scripts/extract-scrapbook.mjs` renders 11 square PDF pages at 1500 × 1500 and makes lightweight thumbnails.
- `assets/js/showcase.js` contains the shared original-page sequences, durations, transitions, palette, and renderer. Highlights uses pages 1, 3, 8, 10, 11 for 20 seconds; All Pages uses all 11 for 66 seconds. No introductory cards or added narrative captions.
- `node scripts/generate-showcase.mjs` creates both 640 × 640 GIFs and their download metadata in `assets/js/data/showcase-exports.js`. It starts at 12 fps, then tries 8, 6, and 4 to stay below 10 MB. Current exports: Highlights at 12 fps, All Pages at 8 fps. Unchanged pixels use transparency compression.
- `node scripts/check-showcase-gif.mjs` decodes every scene and transition, checks page order, durations, dimensions, still holds, reduced-motion rendering, loop seams, and actual sizes. Sample images go into ignored `artifacts/`.
- `node scripts/check-showcase.mjs` (also available as `check-scrapbook.mjs`) checks desktop and narrow phones, presets, navigation, pointers, downloads, focus, zoom, scroll restoration, loading races, retry, and playback timing. It uses installed Microsoft Edge and needs access to the existing CDN libraries.

Playback starts only on request. Preset selection resets to the cover and pauses. Progress segments and previous/next seek and pause. Restart resets while preserving playback state. Read This Page opens the corresponding original; Back to Story restores the paused time. The reader supports fit/2× zoom. Hidden tabs and offscreen players pause until resumed. Reduced motion uses still pages and instant transitions. GIFs are prepared downloads, never automatically played on the site.

To fill Volume II, edit its chapter data and reserved archive card. To enable chapter audio later, supply the track and set `songUrl`; the showcase stays silent.
