(function () {
  "use strict";
  const $ = (id) => document.getElementById(id);
  const PS = window.PixelSnapper;

  // ---------- i18n ----------
  const I18N = {
    en: {
      subtitle: "Fix messy pixel art by detecting its real grid. Everything is processed on your device.",
      previewAria: "Preview", tabOrig: "Original", tabRes: "Result",
      empty: "Choose an image or use the sample.",
      statSrc: "Original", statOut: "Result", statPx: "Pixel size",
      imageAria: "Image", chooseImage: "Choose image", useSample: "Use sample",
      imageHint: "PNG or JPEG, up to 6 megapixels. You can also drag a file onto the preview.",
      settingsAria: "Settings", settings: "Settings",
      colorsLabel: "Palette colors",
      colorsHelp: "How many colors the result keeps (k-means).",
      pxLabel: "Pixel size", pxAuto: "Detect automatically", pxAria: "Manual pixel size",
      pxHelp: "If detection fails, enter how many image pixels each sprite pixel spans.",
      paletteLabel: "Palette (optional)", presetAria: "Preset palette",
      importPng: "Import palette from PNG", hexLabel: "Hex colors",
      palInfo: "Replaces each color in the result with the nearest palette color. Pick a preset, import a PNG with 1 to 256 colors, or type 6-digit hex codes separated by commas.",
      run: "Snap to grid", rerun: "Snap again",
      exportAria: "Export", export: "Export", scaleLabel: "PNG scale", scale1: "1× (actual result size)",
      download: "Download PNG", fbAlt: "Result ready to save",
      foot: 'Web port of the <a href="https://github.com/Hugo-Dz/spritefusion-pixel-snapper">spritefusion-pixel-snapper</a> algorithm (MIT), by Hugo-Dz.',
      none: "No palette (keep image colors)", custom: "Custom / imported",
      processing: "Processing…", done: "Done in {ms} ms.",
      auto: "auto", manual: "manual",
      notImage: "That file is not an image. Use PNG or JPEG.",
      tooBig: "The image is over 6 megapixels. Reduce it and try again.",
      readFail: "Could not read the image: {msg}",
      openFail: "Could not open the image. Try another PNG or JPEG file.",
      pxNeed: "Enter a pixel size greater than 0.",
      palImported: "Palette imported: {n} colors.",
      palImportFail: "Could not import the palette: {msg}",
      palOpenFail: "Could not open the palette PNG.",
      e_palTooBig: "The image is too large to be a palette.",
      e_palNoColors: "The image has no visible colors.",
      e_palOver: "The palette has more than 256 colors.",
      pngFail: "Could not generate the PNG.",
      saved: "Saved: {name}", cancelled: "Download cancelled.",
      longPress: "Press and hold the image below to save it.",
      e_dims_zero: "Image dimensions cannot be zero.",
      e_dims_large: "Image too large (max 10000×10000).",
      e_k_zero: "The number of colors must be greater than 0.",
      e_pal_empty: "The palette must contain at least one color.",
      e_pal_bad: "Invalid palette color '{part}': expected a 6-digit hex code.",
      e_pal_max: "The palette supports at most {max} distinct colors.",
      e_too_small: "Image too small (minimum 3×3).",
      e_px_range: "Pixel size {px} is out of range (1 to {max}).",
      e_internal: "Processing error. Try a different image or settings.",
      sampleName: "sample", imageName: "image",
    },
    es: {
      subtitle: "Corrige pixel art desordenado detectando su rejilla real. Todo se procesa en tu dispositivo.",
      previewAria: "Vista previa", tabOrig: "Original", tabRes: "Resultado",
      empty: "Elige una imagen o usa el ejemplo.",
      statSrc: "Original", statOut: "Resultado", statPx: "Tamaño de píxel",
      imageAria: "Imagen", chooseImage: "Elegir imagen", useSample: "Usar ejemplo",
      imageHint: "PNG o JPEG, hasta 6 megapíxeles. También puedes arrastrar un archivo sobre la vista previa.",
      settingsAria: "Ajustes", settings: "Ajustes",
      colorsLabel: "Colores de la paleta",
      colorsHelp: "Cuántos colores conserva el resultado (k-means).",
      pxLabel: "Tamaño de píxel", pxAuto: "Detectar automáticamente", pxAria: "Tamaño de píxel manual",
      pxHelp: "Si el detector falla, indica cuántos píxeles de la imagen mide cada píxel del sprite.",
      paletteLabel: "Paleta (opcional)", presetAria: "Paleta predefinida",
      importPng: "Importar paleta desde PNG", hexLabel: "Colores hex",
      palInfo: "Sustituye cada color del resultado por el más cercano de la paleta. Puedes elegir una predefinida, importar un PNG con 1 a 256 colores o escribir los hex de 6 dígitos separados por comas.",
      run: "Ajustar a la rejilla", rerun: "Volver a ajustar",
      exportAria: "Exportar", export: "Exportar", scaleLabel: "Ampliación del PNG", scale1: "1× (tamaño real del resultado)",
      download: "Descargar PNG", fbAlt: "Resultado listo para guardar",
      foot: 'Port web del algoritmo de <a href="https://github.com/Hugo-Dz/spritefusion-pixel-snapper">spritefusion-pixel-snapper</a> (MIT), de Hugo-Dz.',
      none: "Sin paleta (colores de la imagen)", custom: "Personalizada / importada",
      processing: "Procesando…", done: "Listo en {ms} ms.",
      auto: "auto", manual: "manual",
      notImage: "Ese archivo no es una imagen. Usa PNG o JPEG.",
      tooBig: "La imagen tiene más de 6 megapíxeles. Redúcela e inténtalo de nuevo.",
      readFail: "No se pudo leer la imagen: {msg}",
      openFail: "No se pudo abrir la imagen. Prueba con otro archivo PNG o JPEG.",
      pxNeed: "Indica un tamaño de píxel mayor que 0.",
      palImported: "Paleta importada: {n} colores.",
      palImportFail: "No se pudo importar la paleta: {msg}",
      palOpenFail: "No se pudo abrir el PNG de la paleta.",
      e_palTooBig: "La imagen es demasiado grande para ser una paleta.",
      e_palNoColors: "La imagen no tiene colores visibles.",
      e_palOver: "La paleta tiene más de 256 colores.",
      pngFail: "No se pudo generar el PNG.",
      saved: "Guardado: {name}", cancelled: "Descarga cancelada.",
      longPress: "Mantén pulsada la imagen de abajo para guardarla.",
      e_dims_zero: "Las dimensiones de la imagen no pueden ser cero.",
      e_dims_large: "Imagen demasiado grande (máx. 10000×10000).",
      e_k_zero: "El número de colores debe ser mayor que 0.",
      e_pal_empty: "La paleta debe contener al menos un color.",
      e_pal_bad: "Color de paleta no válido '{part}': se espera un hex de 6 dígitos.",
      e_pal_max: "La paleta admite como máximo {max} colores distintos.",
      e_too_small: "Imagen demasiado pequeña (mínimo 3×3).",
      e_px_range: "El tamaño de píxel {px} está fuera del rango válido (1 a {max}).",
      e_internal: "Error de procesado. Prueba con otra imagen u otros ajustes.",
      sampleName: "ejemplo", imageName: "imagen",
    },
  };

  let lang = "en";
  try { const saved = localStorage.getItem("pixel-snapper-lang"); if (saved === "es" || saved === "en") lang = saved; } catch (e) { /* sin almacenamiento */ }

  function t(key, params) {
    let s = (I18N[lang] && I18N[lang][key]) || I18N.en[key] || key;
    if (params) s = s.replace(/\{(\w+)\}/g, function (m, k) { return params[k] != null ? params[k] : m; });
    return s;
  }
  function errMsg(e) { return e && e.code ? t("e_" + e.code, e.params) : (e && e.message) || String(e); }

  const els = {
    file: $("file"), drop: $("drop"), sample: $("btn-sample"), run: $("btn-run"),
    colors: $("colors"), colorsOut: $("colors-out"),
    auto: $("px-auto"), px: $("px-size"),
    palette: $("palette"), chips: $("chips"),
    status: $("status"), stage: $("stage"), cv: $("cv"), empty: $("empty"),
    tabOrig: $("tab-orig"), tabRes: $("tab-res"),
    statSrc: $("stat-src"), statOut: $("stat-out"), statPx: $("stat-px"),
    scale: $("scale"), save: $("btn-save"), saveInfo: $("save-info"),
    fallback: $("fallback"), fbImg: $("fb-img"),
    langEn: $("lang-en"), langEs: $("lang-es"),
  };

  // Preset palettes (hex without #), from the Lospec pages Sprite Fusion links to.
  const PRESETS = [
    { id: "gb", name: "Game Boy · 4 (bgb)", colors: "081820 346856 88c070 e0f8d0".split(" ") },
    { id: "gbc", name: "Game Boy Color · 31 (keyros)", colors: "f0eeef f2d3c9 f1aeb1 ed6d8b ee1764 942f55 8a7ba5 483e5a fde5a7 ebac7d a7888d 7a566d 34355a a1efee 2276a4 fece7c ed8631 ed0d0f 721d28 efef80 95de40 539a36 217319 b4561f d0a46d 8d7320 5a541f e1ebb0 b3bd85 5d7841 1b1020".split(" ") },
    { id: "nes", name: "NES · 55", colors: "000000 fcfcfc f8f8f8 bcbcbc 7c7c7c a4e4fc 3cbcfc 0078f8 0000fc b8b8f8 6888fc 0058f8 0000bc d8b8f8 9878f8 6844fc 4428bc f8b8f8 f878f8 d800cc 940084 f8a4c0 f85898 e40058 a80020 f0d0b0 f87858 f83800 a81000 fce0a8 fca044 e45c10 881400 f8d878 f8b800 ac7c00 503000 d8f878 b8f818 00b800 007800 b8f8b8 58d854 00a800 006800 b8f8d8 58f898 00a844 005800 00fcfc 00e8d8 008888 004058 f8d8f8 787878".split(" ") },
    { id: "snes", name: "SNES · 32 (Jehkoba)", colors: "000000 00021c 1c284d 343473 2d5280 4d7a99 7497a6 a3ccd9 f0edd8 732866 a6216e d94c87 d9214f f25565 f27961 993649 b36159 f09c60 b38f24 b3b324 f7c93e 17735f 119955 67b31b 1ba683 47cca9 96e3c9 2469b3 0b8be6 0bafe6 f28d85 f0bb90".split(" ") },
    { id: "md", name: "Mega Drive · 34 (MetaruPX)", colors: "2b120d 9f1211 fc1400 fc6a00 fcfc00 000000 330445 9c0c9c ff099d 00072c 040085 0000ff 0066ff 67cdfc 004849 067826 00c908 52ff00 c6f022 352c2e 754944 ad5950 f6757a fac59b 693623 b0572b e98e42 fcb448 fffcff 666688 9892ad b8b8d1 ddd9e6 fcfcfc".split(" ") },
  ];

  const MAX_PIXELS = 6000000;
  let src = null;          // { width, height, data }
  let srcKey = "sampleName"; // nombre base del archivo: clave i18n o nombre real
  let srcFile = null;
  let result = null;       // resultado de processImage
  let view = "orig";       // "orig" | "res"
  let busy = false;
  let stale = true;

  // Mensajes dinámicos guardados como clave para poder re-traducirlos al cambiar de idioma
  let statusState = { key: "", params: null, kind: "", raw: null };
  let saveState = null;    // { key, params }
  let palInfoState = null; // { n } cuando se importó un PNG

  function setStatus(key, params, kind) { statusState = { key: key || "", params: params || null, kind: kind || "", raw: null }; renderStatus(); }
  function setStatusError(prefixKey, e) { statusState = { key: prefixKey || "", params: null, kind: "error", raw: e }; renderStatus(); }
  function renderStatus() {
    const st = statusState;
    let msg = "";
    if (st.raw) msg = st.key ? t(st.key, { msg: errMsg(st.raw) }) : errMsg(st.raw);
    else if (st.key) msg = t(st.key, st.params);
    els.status.textContent = msg;
    els.status.dataset.kind = st.kind;
  }
  function setSaveInfo(key, params) { saveState = key ? { key: key, params: params || null } : null; renderSaveInfo(); }
  function renderSaveInfo() { els.saveInfo.textContent = saveState ? t(saveState.key, saveState.params) : ""; }

  // ---------- Dibujo ----------
  function drawTo(canvas, img) {
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext("2d");
    ctx.putImageData(new ImageData(new Uint8ClampedArray(img.data), img.width, img.height), 0, 0);
  }

  function render() {
    const img = view === "res" && result ? result.image : src;
    els.tabOrig.setAttribute("aria-selected", String(view === "orig"));
    els.tabRes.setAttribute("aria-selected", String(view === "res"));
    els.tabRes.disabled = !result;
    if (!img) { els.empty.hidden = false; els.cv.hidden = true; return; }
    els.empty.hidden = true; els.cv.hidden = false;
    drawTo(els.cv, img);
    layoutCanvas(img);
  }

  function layoutCanvas(img) {
    img = img || (view === "res" && result ? result.image : src);
    if (!img) return;
    const maxW = els.stage.clientWidth - 24;
    const maxH = Math.min(window.innerHeight * 0.58, 520);
    let scale = Math.min(maxW / img.width, maxH / img.height);
    if (scale >= 1) scale = Math.floor(scale); // píxeles nítidos al ampliar
    els.cv.style.width = Math.max(1, Math.round(img.width * scale)) + "px";
    els.cv.style.height = Math.max(1, Math.round(img.height * scale)) + "px";
    els.cv.style.imageRendering = scale >= 1 ? "pixelated" : "auto";
  }

  function updateStats() {
    els.statSrc.textContent = src ? src.width + " × " + src.height : "–";
    if (result) {
      els.statOut.textContent = result.outWidth + " × " + result.outHeight;
      els.statPx.textContent = result.pixelSize.toFixed(1) + " px (" + t(result.overridden ? "manual" : "auto") + ")";
    } else {
      els.statOut.textContent = "–";
      els.statPx.textContent = "–";
    }
    els.run.disabled = !src || busy;
    els.save.disabled = !result;
    els.run.textContent = t(stale && result ? "rerun" : "run");
  }

  // ---------- Carga ----------
  function loadSample() {
    src = window.PixelSnapperSample.makeSample();
    srcKey = "sampleName"; srcFile = null;
    afterLoad();
  }

  function loadFile(file) {
    if (!file) return;
    if (!/^image\//.test(file.type) && !/\.(png|jpe?g|webp|gif|bmp)$/i.test(file.name)) {
      setStatus("notImage", null, "error");
      return;
    }
    const url = URL.createObjectURL(file);
    const im = new Image();
    im.onload = function () {
      try {
        if (im.naturalWidth * im.naturalHeight > MAX_PIXELS) {
          setStatus("tooBig", null, "error");
          return;
        }
        const c = document.createElement("canvas");
        c.width = im.naturalWidth; c.height = im.naturalHeight;
        const ctx = c.getContext("2d", { willReadFrequently: true });
        ctx.drawImage(im, 0, 0);
        const d = ctx.getImageData(0, 0, c.width, c.height);
        src = { width: d.width, height: d.height, data: d.data };
        srcKey = null; srcFile = file.name.replace(/\.[^.]+$/, "") || null;
        afterLoad();
      } catch (e) {
        setStatusError("readFail", e);
      } finally {
        URL.revokeObjectURL(url);
      }
    };
    im.onerror = function () {
      URL.revokeObjectURL(url);
      setStatus("openFail", null, "error");
    };
    im.src = url;
  }

  function afterLoad() {
    result = null; stale = true; view = "orig";
    els.fallback.hidden = true;
    setSaveInfo(null);
    render(); updateStats();
    setStatus("");
    run();
  }

  // ---------- Procesado ----------
  function readOptions() {
    const k = parseInt(els.colors.value, 10);
    const opts = { kColors: k >= 1 ? k : 16, pixelSize: null, palette: null };
    if (!els.auto.checked) {
      const v = parseFloat(els.px.value);
      if (!(v > 0)) { const e = new Error("pxNeed"); e.code = "pxNeed"; throw e; }
      opts.pixelSize = v;
    }
    const pal = els.palette.value.trim();
    if (pal) opts.palette = PS.parsePaletteHex(pal);
    return opts;
  }

  function run() {
    if (!src || busy) return;
    let opts;
    try { opts = readOptions(); }
    catch (e) {
      if (e.code === "pxNeed") setStatus("pxNeed", null, "error"); else setStatusError("", e);
      return;
    }
    busy = true; updateStats();
    setStatus("processing", null, "busy");
    setTimeout(function () {
      try {
        const t0 = performance.now();
        result = PS.processImage(src, opts);
        stale = false; view = "res";
        els.fallback.hidden = true;
        setStatus("done", { ms: Math.max(1, Math.round(performance.now() - t0)) }, "ok");
      } catch (e) {
        setStatusError("", e);
      } finally {
        busy = false; render(); updateStats();
      }
    }, 30);
  }

  function markStale() { if (result) { stale = true; updateStats(); } }

  // ---------- Exportar ----------
  function scaledCanvas(img, s) {
    const small = document.createElement("canvas");
    drawTo(small, img);
    if (s === 1) return small;
    const big = document.createElement("canvas");
    big.width = img.width * s; big.height = img.height * s;
    const ctx = big.getContext("2d");
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(small, 0, 0, big.width, big.height);
    return big;
  }

  function toBlob(canvas) {
    return new Promise(function (res, rej) {
      canvas.toBlob(function (b) { b ? res(b) : rej(new Error("png")); }, "image/png");
    });
  }

  async function save() {
    if (!result) return;
    const s = parseInt(els.scale.value, 10) || 1;
    setSaveInfo(null);
    let blob;
    try {
      blob = await toBlob(scaledCanvas(result.image, s));
    } catch (e) { setStatus("pngFail", null, "error"); return; }
    const base = srcFile || t(srcKey || "imageName");
    const filename = base + "_snapped" + (s > 1 ? "_x" + s : "") + ".png";

    let dl = null;
    try { dl = window.claude && window.claude.use ? await window.claude.use("downloads") : null; } catch (e) { dl = null; }
    if (dl) {
      try {
        await dl.save({ filename: filename, data: blob });
        setSaveInfo("saved", { name: filename });
        return;
      } catch (e) {
        if (e && e.code === "declined") { setSaveInfo("cancelled"); return; }
      }
    }
    // Alternativa: mostrar la imagen para guardarla con pulsación larga
    if (els.fbImg.dataset.url) URL.revokeObjectURL(els.fbImg.dataset.url);
    const url = URL.createObjectURL(blob);
    els.fbImg.dataset.url = url;
    els.fbImg.src = url;
    els.fallback.hidden = false;
    setSaveInfo("longPress");
  }

  // ---------- Paleta: chips ----------
  function renderChips() {
    els.chips.textContent = "";
    const v = els.palette.value.trim();
    if (!v) return;
    try {
      PS.parsePaletteHex(v).forEach(function (c) {
        const s = document.createElement("span");
        s.className = "chip";
        s.style.background = "rgb(" + c[0] + "," + c[1] + "," + c[2] + ")";
        s.title = "#" + c.map((n) => n.toString(16).padStart(2, "0")).join("");
        els.chips.appendChild(s);
      });
    } catch (e) { /* se informa al procesar */ }
  }

  // ---------- Paletas predefinidas e importación PNG ----------
  const presetEl = $("preset"), palFile = $("pal-file"), palInfo = $("pal-info");
  const CUSTOM = "custom";

  const optNone = document.createElement("option");
  optNone.value = "";
  presetEl.appendChild(optNone);
  PRESETS.forEach(function (p) {
    const o = document.createElement("option");
    o.value = p.id; o.textContent = p.name;
    presetEl.appendChild(o);
  });
  const optCustom = document.createElement("option");
  optCustom.value = CUSTOM; optCustom.hidden = true;
  presetEl.appendChild(optCustom);

  function renderPalInfo() { palInfo.textContent = palInfoState ? t("palImported", palInfoState) : t("palInfo"); }

  function setPalette(hexList, presetValue) {
    els.palette.value = hexList.join(", ");
    presetEl.value = presetValue;
    renderChips(); markStale();
    if (src) run();
  }

  presetEl.addEventListener("change", function () {
    palInfoState = null; renderPalInfo();
    const p = PRESETS.find(function (x) { return x.id === presetEl.value; });
    if (p) setPalette(p.colors, p.id);
    else { els.palette.value = ""; renderChips(); markStale(); if (src) run(); }
  });

  palFile.addEventListener("change", function () {
    const file = palFile.files[0];
    palFile.value = "";
    if (!file) return;
    const url = URL.createObjectURL(file);
    const im = new Image();
    function failWith(key) { const e = new Error(key); e.code = key; throw e; }
    im.onload = function () {
      try {
        if (im.naturalWidth * im.naturalHeight > 1000000) failWith("palTooBig");
        const c = document.createElement("canvas");
        c.width = im.naturalWidth; c.height = im.naturalHeight;
        const ctx = c.getContext("2d", { willReadFrequently: true });
        ctx.drawImage(im, 0, 0);
        const d = ctx.getImageData(0, 0, c.width, c.height).data;
        const seen = new Set(), list = [];
        for (let i = 0; i < d.length; i += 4) {
          if (d[i + 3] === 0) continue;
          const key = (d[i] << 16) | (d[i + 1] << 8) | d[i + 2];
          if (!seen.has(key)) {
            seen.add(key);
            list.push(key.toString(16).padStart(6, "0"));
            if (list.length > 256) break;
          }
        }
        if (list.length === 0) failWith("palNoColors");
        if (list.length > 256) failWith("palOver");
        palInfoState = { n: list.length };
        setPalette(list, CUSTOM);
        renderPalInfo();
        setStatus("");
      } catch (e) {
        const known = ["palTooBig", "palNoColors", "palOver"].indexOf(e.code) >= 0;
        statusState = { key: "palImportFail", params: null, kind: "error", raw: { code: known ? e.code : "internal" } };
        renderStatus();
      } finally { URL.revokeObjectURL(url); }
    };
    im.onerror = function () {
      URL.revokeObjectURL(url);
      setStatus("palOpenFail", null, "error");
    };
    im.src = url;
  });

  // ---------- Idioma ----------
  function applyLang() {
    document.documentElement.lang = lang;
    document.querySelectorAll("[data-i18n]").forEach(function (n) { n.textContent = t(n.getAttribute("data-i18n")); });
    document.querySelectorAll("[data-i18n-aria]").forEach(function (n) { n.setAttribute("aria-label", t(n.getAttribute("data-i18n-aria"))); });
    document.querySelectorAll("[data-i18n-alt]").forEach(function (n) { n.setAttribute("alt", t(n.getAttribute("data-i18n-alt"))); });
    document.querySelectorAll("[data-i18n-html]").forEach(function (n) { n.innerHTML = t(n.getAttribute("data-i18n-html")); });
    optNone.textContent = t("none");
    optCustom.textContent = t("custom");
    els.langEn.setAttribute("aria-pressed", String(lang === "en"));
    els.langEs.setAttribute("aria-pressed", String(lang === "es"));
    renderPalInfo(); renderStatus(); renderSaveInfo(); updateStats();
  }
  function setLang(l) {
    lang = l;
    try { localStorage.setItem("pixel-snapper-lang", l); } catch (e) { /* sin almacenamiento */ }
    applyLang();
  }
  els.langEn.addEventListener("click", function () { setLang("en"); });
  els.langEs.addEventListener("click", function () { setLang("es"); });

  // ---------- Eventos ----------
  els.file.addEventListener("change", function () { loadFile(els.file.files[0]); els.file.value = ""; });
  els.sample.addEventListener("click", loadSample);
  els.run.addEventListener("click", run);
  els.save.addEventListener("click", save);
  els.tabOrig.addEventListener("click", function () { view = "orig"; render(); });
  els.tabRes.addEventListener("click", function () { if (result) { view = "res"; render(); } });
  els.colors.addEventListener("input", function () { els.colorsOut.textContent = els.colors.value; markStale(); });
  els.auto.addEventListener("change", function () { els.px.disabled = els.auto.checked; markStale(); });
  els.px.addEventListener("input", markStale);
  els.palette.addEventListener("input", function () {
    presetEl.value = els.palette.value.trim() ? CUSTOM : "";
    palInfoState = null; renderPalInfo();
    renderChips(); markStale();
  });
  window.addEventListener("resize", function () { layoutCanvas(); });

  ["dragenter", "dragover"].forEach(function (ev) {
    els.drop.addEventListener(ev, function (e) { e.preventDefault(); els.drop.classList.add("over"); });
  });
  ["dragleave", "drop"].forEach(function (ev) {
    els.drop.addEventListener(ev, function (e) { e.preventDefault(); els.drop.classList.remove("over"); });
  });
  els.drop.addEventListener("drop", function (e) {
    const f = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
    if (f) loadFile(f);
  });

  // Estado inicial: ejemplo ya procesado
  els.px.disabled = els.auto.checked;
  els.colorsOut.textContent = els.colors.value;
  applyLang();
  loadSample();
})();
