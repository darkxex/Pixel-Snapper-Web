# Pixel Snapper Web

Web version of [spritefusion-pixel-snapper](https://github.com/Hugo-Dz/spritefusion-pixel-snapper): fixes messy, AI-generated pixel art by detecting its real grid, quantizing colors and resampling. Everything runs in the browser, nothing is uploaded.

- English / Spanish interface (English by default)
- Auto or manual pixel size, color count (k-means)
- Preset palettes: Game Boy, Game Boy Color, NES, SNES, Mega Drive, plus import from a PNG or hex list
- Export PNG at 1x, 4x, 8x or 16x

## Run

Open `index.html`, or serve the folder with any static server. It is a single self-contained file.

## Develop

Sources live in `src/` (`core.js` is the algorithm, `app.js` the UI). Rebuild the single file with:

```
python3 build.py
```

## Credits

The algorithm is a JavaScript port of the Rust code in
[Hugo-Dz/spritefusion-pixel-snapper](https://github.com/Hugo-Dz/spritefusion-pixel-snapper) (MIT).
Results match the original pixel for pixel on images with few exact colors; k-means uses a different
random generator, so noisy images can differ slightly. Palette colors come from Lospec palettes.

## License

This project is licensed under GPL-3.0 (see `LICENSE`). It includes a port of MIT-licensed code; the
original copyright and permission notice is kept in `LICENSE-UPSTREAM-MIT`.
