// Port a JavaScript del algoritmo de spritefusion-pixel-snapper (src/lib.rs, MIT).
// Trabaja sobre objetos { width, height, data: Uint8ClampedArray (RGBA) }.
(function (root) {
  "use strict";

  const MAX_PALETTE_COLORS = 256;

  const DEFAULTS = {
    kColors: 16,
    seed: 42,
    maxKmeansIterations: 15,
    peakThresholdMultiplier: 0.2,
    peakDistanceFilter: 4,
    walkerSearchWindowRatio: 0.35,
    walkerMinSearchWindow: 2.0,
    walkerStrengthThreshold: 0.5,
    minCutsPerAxis: 4,
    fallbackTargetSegments: 64,
    maxStepRatio: 1.8,
  };

  function mulberry32(a) {
    return function () {
      a |= 0;
      a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function fail(code, params, msg) {
    const e = new Error(msg || code);
    e.code = code; e.params = params || {};
    return e;
  }

  function validateDimensions(w, h) {
    if (w === 0 || h === 0) throw fail("dims_zero", null, "Image dimensions cannot be zero");
    if (w > 10000 || h > 10000) throw fail("dims_large", null, "Image too large (max 10000x10000)");
  }

  // ---------- Cuantización de color (k-means++) ----------
  function quantizeImage(img, cfg) {
    const w = img.width, h = img.height, data = img.data;
    if (cfg.kColors <= 0) throw fail("k_zero", null, "Number of colors must be greater than 0");
    const n = w * h;

    // Colores únicos (con peso) de los píxeles opacos: equivale a k-means por píxel.
    const uniq = new Map();
    const uid = new Int32Array(n).fill(-1);
    let ur = [], ug = [], ub = [], uw = [];
    let m = 0;
    const opaque = new Uint32Array(n);
    for (let i = 0; i < n; i++) {
      const o = i * 4;
      if (data[o + 3] === 0) continue;
      const key = (data[o] << 16) | (data[o + 1] << 8) | data[o + 2];
      let id = uniq.get(key);
      if (id === undefined) {
        id = ur.length;
        uniq.set(key, id);
        ur.push(data[o]); ug.push(data[o + 1]); ub.push(data[o + 2]); uw.push(0);
      }
      uw[id]++;
      uid[i] = id;
      opaque[m++] = i;
    }
    if (m === 0) return { width: w, height: h, data: new Uint8ClampedArray(data) };

    const U = ur.length;
    const rng = mulberry32(cfg.seed);
    const k = Math.min(cfg.kColors, m);
    const cent = new Float64Array(k * 3);

    const firstPix = opaque[Math.floor(rng() * m)];
    {
      const u = uid[firstPix];
      cent[0] = ur[u]; cent[1] = ug[u]; cent[2] = ub[u];
    }
    const dist = new Float64Array(U).fill(Infinity);
    for (let c = 1; c < k; c++) {
      const lr = cent[(c - 1) * 3], lg = cent[(c - 1) * 3 + 1], lb = cent[(c - 1) * 3 + 2];
      let sum = 0;
      for (let i = 0; i < U; i++) {
        const dr = ur[i] - lr, dg = ug[i] - lg, db = ub[i] - lb;
        const d = dr * dr + dg * dg + db * db;
        if (d < dist[i]) dist[i] = d;
        sum += dist[i] * uw[i];
      }
      let pick;
      if (sum <= 0) {
        pick = uid[opaque[Math.floor(rng() * m)]];
      } else {
        const r = rng() * sum;
        let acc = 0;
        pick = U - 1;
        for (let i = 0; i < U; i++) {
          acc += dist[i] * uw[i];
          if (r < acc) { pick = i; break; }
        }
      }
      cent[c * 3] = ur[pick]; cent[c * 3 + 1] = ug[pick]; cent[c * 3 + 2] = ub[pick];
    }

    const prev = new Float64Array(cent);
    const sums = new Float64Array(k * 3);
    const counts = new Float64Array(k);
    for (let it = 0; it < cfg.maxKmeansIterations; it++) {
      sums.fill(0); counts.fill(0);
      for (let i = 0; i < U; i++) {
        let best = 0, minD = Infinity;
        for (let c = 0; c < k; c++) {
          const dr = ur[i] - cent[c * 3], dg = ug[i] - cent[c * 3 + 1], db = ub[i] - cent[c * 3 + 2];
          const d = dr * dr + dg * dg + db * db;
          if (d < minD) { minD = d; best = c; }
        }
        const wgt = uw[i];
        sums[best * 3] += ur[i] * wgt;
        sums[best * 3 + 1] += ug[i] * wgt;
        sums[best * 3 + 2] += ub[i] * wgt;
        counts[best] += wgt;
      }
      for (let c = 0; c < k; c++) {
        if (counts[c] > 0) {
          cent[c * 3] = sums[c * 3] / counts[c];
          cent[c * 3 + 1] = sums[c * 3 + 1] / counts[c];
          cent[c * 3 + 2] = sums[c * 3 + 2] / counts[c];
        }
      }
      if (it > 0) {
        let maxMove = 0;
        for (let c = 0; c < k; c++) {
          const dr = cent[c * 3] - prev[c * 3], dg = cent[c * 3 + 1] - prev[c * 3 + 1], db = cent[c * 3 + 2] - prev[c * 3 + 2];
          const mv = dr * dr + dg * dg + db * db;
          if (mv > maxMove) maxMove = mv;
        }
        if (maxMove < 0.01) break;
      }
      prev.set(cent);
    }

    // Color final por color único
    const mapR = new Uint8ClampedArray(U), mapG = new Uint8ClampedArray(U), mapB = new Uint8ClampedArray(U);
    for (let i = 0; i < U; i++) {
      let best = 0, minD = Infinity;
      for (let c = 0; c < k; c++) {
        const dr = ur[i] - cent[c * 3], dg = ug[i] - cent[c * 3 + 1], db = ub[i] - cent[c * 3 + 2];
        const d = dr * dr + dg * dg + db * db;
        if (d < minD) { minD = d; best = c; }
      }
      mapR[i] = Math.round(cent[best * 3]);
      mapG[i] = Math.round(cent[best * 3 + 1]);
      mapB[i] = Math.round(cent[best * 3 + 2]);
    }
    const out = new Uint8ClampedArray(data);
    for (let i = 0; i < n; i++) {
      const u = uid[i];
      if (u < 0) continue;
      const o = i * 4;
      out[o] = mapR[u]; out[o + 1] = mapG[u]; out[o + 2] = mapB[u];
    }
    return { width: w, height: h, data: out };
  }

  // ---------- Paleta personalizada ----------
  function parsePaletteHex(value) {
    if (!value || !value.trim()) throw fail("pal_empty", null, "Palette must contain at least one color");
    const seen = new Set();
    const palette = [];
    for (const part of value.split(/[,\s]+/)) {
      if (!part) continue;
      const hex = part.trim().replace(/^#+/, "");
      if (!/^[0-9a-fA-F]{6}$/.test(hex)) {
        throw fail("pal_bad", { part: part.trim() }, "Invalid palette color '" + part.trim() + "': expected a 6-digit hex");
      }
      const c = [parseInt(hex.slice(0, 2), 16), parseInt(hex.slice(2, 4), 16), parseInt(hex.slice(4, 6), 16)];
      const key = (c[0] << 16) | (c[1] << 8) | c[2];
      if (!seen.has(key)) { seen.add(key); palette.push(c); }
    }
    if (palette.length === 0) throw fail("pal_empty", null, "Palette must contain at least one color");
    if (palette.length > MAX_PALETTE_COLORS) throw fail("pal_max", { max: MAX_PALETTE_COLORS }, "Palette supports at most " + MAX_PALETTE_COLORS + " distinct colors");
    return palette;
  }

  function nearestPaletteColor(r, g, b, palette) {
    let best = palette[0], bestD = Infinity;
    for (const c of palette) {
      const dr = r - c[0], dg = g - c[1], db = b - c[2];
      const d = dr * dr + dg * dg + db * db;
      if (d < bestD) { bestD = d; best = c; }
    }
    return best;
  }

  function applyPalette(img, palette) {
    if (!palette.length) throw fail("pal_empty", null, "Palette must contain at least one color");
    const out = new Uint8ClampedArray(img.data);
    const cache = new Map();
    for (let i = 0; i < img.width * img.height; i++) {
      const o = i * 4;
      if (out[o + 3] === 0) continue;
      const key = (out[o] << 16) | (out[o + 1] << 8) | out[o + 2];
      let c = cache.get(key);
      if (!c) { c = nearestPaletteColor(out[o], out[o + 1], out[o + 2], palette); cache.set(key, c); }
      out[o] = c[0]; out[o + 1] = c[1]; out[o + 2] = c[2];
    }
    return { width: img.width, height: img.height, data: out };
  }

  // ---------- Perfiles de gradiente ----------
  function computeProfiles(img) {
    const w = img.width, h = img.height, d = img.data;
    if (w < 3 || h < 3) throw fail("too_small", null, "Image too small (minimum 3x3)");
    const gray = new Float64Array(w * h);
    for (let i = 0; i < w * h; i++) {
      const o = i * 4;
      gray[i] = d[o + 3] === 0 ? 0 : 0.299 * d[o] + 0.587 * d[o + 1] + 0.114 * d[o + 2];
    }
    const col = new Float64Array(w), row = new Float64Array(h);
    for (let y = 0; y < h; y++) {
      for (let x = 1; x < w - 1; x++) {
        col[x] += Math.abs(gray[y * w + x + 1] - gray[y * w + x - 1]);
      }
    }
    for (let x = 0; x < w; x++) {
      for (let y = 1; y < h - 1; y++) {
        row[y] += Math.abs(gray[(y + 1) * w + x] - gray[(y - 1) * w + x]);
      }
    }
    return [col, row];
  }

  function estimateStepSize(profile, cfg) {
    if (profile.length === 0) return null;
    let maxVal = -Infinity;
    for (const v of profile) if (v > maxVal) maxVal = v;
    if (maxVal === 0) return null;
    const threshold = maxVal * cfg.peakThresholdMultiplier;
    const peaks = [];
    for (let i = 1; i < profile.length - 1; i++) {
      if (profile[i] > threshold && profile[i] > profile[i - 1] && profile[i] > profile[i + 1]) peaks.push(i);
    }
    if (peaks.length < 2) return null;
    const clean = [peaks[0]];
    for (let j = 1; j < peaks.length; j++) {
      if (peaks[j] - clean[clean.length - 1] > cfg.peakDistanceFilter - 1) clean.push(peaks[j]);
    }
    if (clean.length < 2) return null;
    const diffs = [];
    for (let i = 1; i < clean.length; i++) diffs.push(clean[i] - clean[i - 1]);
    diffs.sort((a, b) => a - b);
    return diffs[Math.floor(diffs.length / 2)];
  }

  function resolveStepSizes(sxO, syO, width, height, cfg) {
    if (cfg.pixelSize != null) return [cfg.pixelSize, cfg.pixelSize];
    if (sxO != null && syO != null) {
      const ratio = sxO > syO ? sxO / syO : syO / sxO;
      if (ratio > cfg.maxStepRatio) {
        const s = Math.min(sxO, syO);
        return [s, s];
      }
      const avg = (sxO + syO) / 2;
      return [avg, avg];
    }
    if (sxO != null) return [sxO, sxO];
    if (syO != null) return [syO, syO];
    const f = Math.max(Math.min(width, height) / cfg.fallbackTargetSegments, 1);
    return [f, f];
  }

  // ---------- Caminante elástico ----------
  function walk(profile, stepSize, limit, cfg) {
    if (profile.length === 0) throw fail("internal", null, "Cannot walk an empty profile");
    const cuts = [0];
    let cur = 0;
    const sw = Math.max(stepSize * cfg.walkerSearchWindowRatio, cfg.walkerMinSearchWindow);
    let mean = 0;
    for (const v of profile) mean += v;
    mean /= profile.length;

    while (cur < limit) {
      const target = cur + stepSize;
      if (target >= limit) { cuts.push(limit); break; }
      const start = Math.max(Math.max(0, Math.trunc(target - sw)), Math.trunc(cur + 1));
      const end = Math.min(Math.max(0, Math.trunc(target + sw)), limit);
      if (end <= start) { cur = target; continue; }
      let maxVal = -1, maxIdx = start;
      for (let i = start; i < end && i < profile.length; i++) {
        if (profile[i] > maxVal) { maxVal = profile[i]; maxIdx = i; }
      }
      if (maxVal > mean * cfg.walkerStrengthThreshold) {
        cuts.push(maxIdx);
        cur = maxIdx;
      } else {
        cuts.push(Math.trunc(target));
        cur = target;
      }
    }
    return cuts;
  }

  function sanitizeCuts(cuts, limit) {
    if (limit === 0) return [0];
    let hasZero = false, hasLimit = false;
    cuts = cuts.slice();
    for (let i = 0; i < cuts.length; i++) {
      if (cuts[i] === 0) hasZero = true;
      if (cuts[i] >= limit) cuts[i] = limit;
      if (cuts[i] === limit) hasLimit = true;
    }
    if (!hasZero) cuts.push(0);
    if (!hasLimit) cuts.push(limit);
    cuts.sort((a, b) => a - b);
    return cuts.filter((v, i) => i === 0 || v !== cuts[i - 1]);
  }

  function snapUniformCuts(profile, limit, targetStep, cfg, minRequired) {
    if (limit === 0) return [0];
    if (limit === 1) return [0, 1];

    let desired = Number.isFinite(targetStep) && targetStep > 0 ? Math.round(limit / targetStep) : 0;
    desired = Math.min(Math.max(Math.max(desired, Math.max(minRequired - 1, 0)), 1), limit);

    const cellWidth = limit / desired;
    const sw = Math.max(cellWidth * cfg.walkerSearchWindowRatio, cfg.walkerMinSearchWindow);
    let mean = 0;
    if (profile.length) { for (const v of profile) mean += v; mean /= profile.length; }

    const cuts = [0];
    for (let idx = 1; idx < desired; idx++) {
      const target = cellWidth * idx;
      const prev = cuts[cuts.length - 1];
      if (prev + 1 >= limit) break;
      let start = Math.max(Math.max(Math.floor(target - sw), prev + 1), 0);
      let end = Math.min(Math.ceil(target + sw), limit - 1);
      if (end < start) { start = prev + 1; end = start; }
      const last = Math.max(profile.length - 1, 0);
      let bestIdx = Math.min(start, last);
      let bestVal = -1;
      for (let i = start; i <= Math.min(end, last); i++) {
        const v = i < profile.length ? profile[i] : 0;
        if (v > bestVal) { bestVal = v; bestIdx = i; }
      }
      if (bestVal < mean * cfg.walkerStrengthThreshold) {
        let fb = Math.round(target);
        if (fb <= prev) fb = prev + 1;
        if (fb >= limit) fb = Math.max(limit - 1, prev + 1);
        bestIdx = fb;
      }
      cuts.push(bestIdx);
    }
    if (cuts[cuts.length - 1] !== limit) cuts.push(limit);
    return sanitizeCuts(cuts, limit);
  }

  function stabilizeCuts(profile, cuts, limit, siblingCuts, siblingLimit, cfg) {
    if (limit === 0) return [0];
    cuts = sanitizeCuts(cuts, limit);
    const minRequired = Math.min(Math.max(cfg.minCutsPerAxis, 2), limit + 1);
    const axisCells = Math.max(cuts.length - 1, 0);
    const siblingCells = Math.max(siblingCuts.length - 1, 0);
    const siblingHasGrid = siblingLimit > 0 && siblingCells >= Math.max(minRequired - 1, 0) && siblingCells > 0;
    let skewed = false;
    if (siblingHasGrid && axisCells > 0) {
      const axisStep = limit / axisCells;
      const sibStep = siblingLimit / siblingCells;
      const ratio = axisStep / sibStep;
      skewed = ratio > cfg.maxStepRatio || ratio < 1 / cfg.maxStepRatio;
    }
    const hasEnough = cuts.length >= minRequired;
    if (hasEnough && !skewed) return cuts;

    let target;
    if (siblingHasGrid) target = siblingLimit / siblingCells;
    else if (cfg.fallbackTargetSegments > 1) target = limit / cfg.fallbackTargetSegments;
    else if (axisCells > 0) target = limit / axisCells;
    else target = limit;
    if (!Number.isFinite(target) || target <= 0) target = 1;
    return snapUniformCuts(profile, limit, target, cfg, minRequired);
  }

  function stabilizeBothAxes(px, py, rawCols, rawRows, width, height, cfg) {
    const col1 = stabilizeCuts(px, rawCols, width, rawRows, height, cfg);
    const row1 = stabilizeCuts(py, rawRows, height, rawCols, width, cfg);

    const colCells = Math.max(Math.max(col1.length - 1, 0), 1);
    const rowCells = Math.max(Math.max(row1.length - 1, 0), 1);
    const colStep = width / colCells;
    const rowStep = height / rowCells;
    const ratio = colStep > rowStep ? colStep / rowStep : rowStep / colStep;

    if (ratio > cfg.maxStepRatio) {
      const target = Math.min(colStep, rowStep);
      const fc = colStep > target * 1.2 ? snapUniformCuts(px, width, target, cfg, cfg.minCutsPerAxis) : col1;
      const fr = rowStep > target * 1.2 ? snapUniformCuts(py, height, target, cfg, cfg.minCutsPerAxis) : row1;
      return [fc, fr];
    }
    return [col1, row1];
  }

  // ---------- Remuestreo por color dominante ----------
  function resample(img, cols, rows) {
    if (cols.length < 2 || rows.length < 2) throw fail("internal", null, "Not enough grid cuts to resample");
    const outW = cols.length - 1, outH = rows.length - 1;
    const out = new Uint8ClampedArray(outW * outH * 4);
    const src = new Uint32Array(img.data.buffer, img.data.byteOffset, img.width * img.height);
    const w = img.width, h = img.height;
    const little = new Uint8Array(new Uint32Array([1]).buffer)[0] === 1;

    for (let yi = 0; yi < outH; yi++) {
      const ys = rows[yi], ye = rows[yi + 1];
      for (let xi = 0; xi < outW; xi++) {
        const xs = cols[xi], xe = cols[xi + 1];
        if (xe <= xs || ye <= ys) continue;
        const counts = new Map();
        for (let y = ys; y < ye && y < h; y++) {
          for (let x = xs; x < xe && x < w; x++) {
            const v = src[y * w + x];
            counts.set(v, (counts.get(v) || 0) + 1);
          }
        }
        let bestV = 0, bestC = -1, bestKey = 0;
        for (const [v, c] of counts) {
          // Desempate: menor [r,g,b,a] lexicográfico
          const key = little
            ? ((((v & 0xff) << 24) | (((v >>> 8) & 0xff) << 16) | (((v >>> 16) & 0xff) << 8) | ((v >>> 24) & 0xff)) >>> 0)
            : v >>> 0;
          if (c > bestC || (c === bestC && key < bestKey)) { bestC = c; bestV = v; bestKey = key; }
        }
        const o = (yi * outW + xi) * 4;
        if (bestC >= 0) {
          out[o] = little ? bestV & 0xff : (bestV >>> 24) & 0xff;
          out[o + 1] = little ? (bestV >>> 8) & 0xff : (bestV >>> 16) & 0xff;
          out[o + 2] = little ? (bestV >>> 16) & 0xff : (bestV >>> 8) & 0xff;
          out[o + 3] = little ? (bestV >>> 24) & 0xff : bestV & 0xff;
        }
      }
    }
    return { width: outW, height: outH, data: out };
  }

  // ---------- Entrada principal ----------
  // opts: { kColors, pixelSize (número o null), palette ([[r,g,b],...] o null) }
  function processImage(img, opts) {
    const cfg = Object.assign({}, DEFAULTS, opts || {});
    const width = img.width, height = img.height;
    validateDimensions(width, height);
    if (cfg.pixelSize != null) {
      const px = cfg.pixelSize;
      if (!Number.isFinite(px) || px < 1 || px > Math.min(width, height) / 2) {
        throw fail("px_range", { px: px, max: Math.floor(Math.min(width, height) / 2) }, "Pixel size " + px + " is out of range")
      }
    }

    const analysis = quantizeImage(img, cfg);
    const [profX, profY] = computeProfiles(analysis);
    const sx = estimateStepSize(profX, cfg);
    const sy = estimateStepSize(profY, cfg);
    const [stepX, stepY] = resolveStepSizes(sx, sy, width, height, cfg);

    const rawCols = walk(profX, stepX, width, cfg);
    const rawRows = walk(profY, stepY, height, cfg);
    const [cols, rows] = stabilizeBothAxes(profX, profY, rawCols, rawRows, width, height, cfg);

    let snapped = resample(analysis, cols, rows);
    if (cfg.palette && cfg.palette.length) snapped = applyPalette(snapped, cfg.palette);

    return {
      image: snapped,
      pixelSize: stepX,
      overridden: cfg.pixelSize != null,
      outWidth: cols.length - 1,
      outHeight: rows.length - 1,
    };
  }

  const api = { processImage, parsePaletteHex, DEFAULTS };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.PixelSnapper = api;
})(typeof window !== "undefined" ? window : globalThis);
