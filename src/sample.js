// Imagen de ejemplo: sprite de 16x16 ampliado con proporción irregular, desenfoque y ruido,
// parecido al pixel art "sucio" que genera una IA.
(function (root) {
  "use strict";
  const SPRITE = [
    "................",
    "......kkkk......",
    "....kkrrrrkk....",
    "...krrrwwrrrk...",
    "..krrwwrrrrrrk..",
    "..krwwrrrrwwrk..",
    ".krrrrrrrrwwrrk.",
    ".krrrrwwrrrrrrk.",
    ".krrrrwwrrrrrrk.",
    ".kwwrrrrrrrrwwk.",
    "..kkwwrrrrwwkk..",
    "...kkkwwwwkkk...",
    "....kcccccck....",
    "....kcckkcck....",
    ".....kk..kk.....",
    "................",
  ];
  const COLORS = {
    ".": [0, 0, 0, 0],
    k: [34, 32, 52, 255],
    r: [217, 87, 99, 255],
    w: [255, 236, 214, 255],
    c: [251, 242, 54, 255],
  };

  function makeSample() {
    const W = 136, H = 128, n = 16;
    const a = new Float32Array(W * H * 4);
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const c = COLORS[SPRITE[Math.floor((y * n) / H)][Math.floor((x * n) / W)]];
        const o = (y * W + x) * 4;
        a[o] = c[0]; a[o + 1] = c[1]; a[o + 2] = c[2]; a[o + 3] = c[3];
      }
    }
    // desenfoque [1 2 1] en horizontal y vertical
    const tmp = new Float32Array(a.length);
    for (let pass = 0; pass < 2; pass++) {
      const src = pass === 0 ? a : tmp, dst = pass === 0 ? tmp : a;
      for (let y = 0; y < H; y++) {
        for (let x = 0; x < W; x++) {
          for (let ch = 0; ch < 4; ch++) {
            const p = pass === 0 ? [x - 1, y, x, y, x + 1, y] : [x, y - 1, x, y, x, y + 1];
            const g = (px, py) => src[(Math.min(H - 1, Math.max(0, py)) * W + Math.min(W - 1, Math.max(0, px))) * 4 + ch];
            dst[(y * W + x) * 4 + ch] = (g(p[0], p[1]) + 2 * g(p[2], p[3]) + g(p[4], p[5])) / 4;
          }
        }
      }
    }
    // ruido determinista
    let s = 12345;
    const rnd = () => { s = (Math.imul(s, 1664525) + 1013904223) | 0; return ((s >>> 8) & 0xffff) / 0xffff; };
    const data = new Uint8ClampedArray(W * H * 4);
    for (let i = 0; i < W * H; i++) {
      const o = i * 4;
      const al = a[o + 3];
      for (let ch = 0; ch < 3; ch++) data[o + ch] = a[o + ch] + (al > 0 ? Math.round((rnd() * 2 - 1) * 7) : 0);
      data[o + 3] = al < 8 ? 0 : Math.round(al);
    }
    return { width: W, height: H, data };
  }

  const api = { makeSample };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.PixelSnapperSample = api;
})(typeof window !== "undefined" ? window : globalThis);
