# Pixel Snapper Web

[Español](README.es.md)

Web version of [spritefusion-pixel-snapper](https://github.com/Hugo-Dz/spritefusion-pixel-snapper). It fixes messy, AI-generated pixel art by detecting its real pixel grid, reducing its colors and snapping it to that grid. Everything runs in the browser and nothing is uploaded.

- English / Spanish interface (English by default)
- Automatic or manual pixel size, and a color count (k-means)
- Preset palettes: Game Boy, Game Boy Color, NES, SNES and Mega Drive, plus import from a PNG or a list of hex colors
- PNG export at 1x, 4x, 8x or 16x

## Run

Open `index.html`, or serve the folder with any static server. It is a single self-contained file.

## How the algorithm works

AI-generated "pixel art" looks like pixel art but its pixels are blurry, slightly different in size and misaligned, and its colors drift. Pixel Snapper recovers the grid the image was meant to have. The code is in `src/core.js` and follows the Rust original step by step.

**1. Quantize the colors.** The RGB values of all non-transparent pixels are clustered with k-means++ (fixed seed, up to 15 iterations) into the number of colors you choose. Every pixel is replaced by its nearest cluster color. This removes noise and gradients so edges become clean. Transparent pixels are ignored.

**2. Build edge profiles.** The quantized image is converted to grayscale. For every column, the horizontal gradient `|g(x+1) - g(x-1)|` is summed over all rows, which gives one number per column. The same is done per row. Columns and rows where many pixels change color at once get high values, so the peaks mark the borders between sprite pixels.

**3. Estimate the pixel size.** For each axis, local maxima above 20% of the highest value are taken as peaks, and peaks closer than 4 px are dropped. The pixel size is the median distance between consecutive peaks. The two axes are then combined:
- if you set a manual size, it is used as is;
- if both axes found a size and they differ by more than a factor of 1.8, the smaller one is used for both;
- if they are similar, their average is used;
- if only one axis found a size, it is used for both;
- if neither did, it falls back to `min(width, height) / 64`.

**4. Walk the grid lines.** Starting at 0, an elastic walker jumps one pixel size ahead and searches a window around that spot (35% of the step, at least 2 px). If the strongest edge in the window is above half of the average profile value, the cut is placed on that edge. Otherwise the cut goes at the expected position. Each cut moves the walker, so the grid follows images whose pixels are slightly uneven instead of forcing a rigid grid.

**5. Stabilize both axes.** If an axis ended up with too few cuts (fewer than 4), or its cell size is more than 1.8 times different from the other axis, its cuts are rebuilt as a uniform grid with the other axis' step, and each line is still snapped to the strongest nearby edge. A final check compares the resulting cell sizes of both axes and redoes the coarser one with the finer step if they disagree.

**6. Resample.** Each cell between two consecutive vertical and horizontal cuts becomes one output pixel. Its color is the most frequent color inside the cell (ties go to the lowest RGBA value). The output size is the number of cells, so a sprite drawn at 16x16 comes back as 16x16.

**7. Optional palette.** If you pick or import a palette, every output color is replaced by the nearest palette color (Euclidean distance in RGB). Alpha is kept.

### Limits and tips

- Images must be between 3x3 and 10000x10000 px. A manual pixel size must be between 1 and half the smaller side.
- This app accepts up to 6 megapixels so it stays responsive on phones.
- Auto detection relies on edges. Images with large flat areas can give a wrong pixel size. If the result looks off, turn off "Detect automatically" and type the pixel size.
- k-means uses a different random generator than the Rust version, so noisy images can differ slightly from the original tool. On images with few exact colors the output is identical pixel for pixel.

## Develop

Sources are in `src/` (`core.js` is the algorithm, `app.js` the interface). Rebuild the single file with:

```
python3 build.py
```

## Credits

The algorithm is a JavaScript port of the Rust code in
[Hugo-Dz/spritefusion-pixel-snapper](https://github.com/Hugo-Dz/spritefusion-pixel-snapper) (MIT).
Palette colors come from [Lospec](https://lospec.com/palette-list) palettes.

## License

This project is licensed under GPL-3.0 (see `LICENSE`). It includes a port of MIT-licensed code; the
original copyright and permission notice is kept in `LICENSE-UPSTREAM-MIT`.
