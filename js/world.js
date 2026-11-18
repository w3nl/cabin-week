"use strict";
// De wereld tekenen: texturen, achtergronden, interieur, decoratie, uitgangen en render().
/* =====================================================================
   TEKENEN
   ===================================================================== */
const pxr = (x, y, w = 1, h = 1) => g.fillRect(x * 2, y * 2, w * 2, h * 2);
const fl = Math.floor;

/* ---------- Tegel-texturen (pixel-art, 1x gemaakt, scherp opgeschaald) ---------- */
const TEXCACHE = {};
function texTile(fn) { const c = mk(32, 32); withCtx(c.getContext("2d"), fn); return c; }
const PAL = {
  bos: { base: "#7b4a2b", dark: "#5f381f", light: "#946038", edge: "#2a1708" },
  sneeuw: { base: "#566b8f", dark: "#40527a", light: "#7189b0", edge: "#25324d" },
  huis: { base: "#d5c7b0", dark: "#b9a98e", light: "#e6dbc8", edge: "#7d6b52" },
  stad: { base: "#7c7882", dark: "#615d68", light: "#9894a0", edge: "#2e2b34" }
};
function fillTex(theme, R) {
  const p = PAL[theme];
  g.fillStyle = p.base; g.fillRect(0, 0, 32, 32);
  if (theme === "bos") {
    for (let i = 0; i < 30; i++) { g.fillStyle = R() < .55 ? p.dark : p.light; pxr(fl(R() * 16), fl(R() * 16)); }
    for (let i = 0; i < 3; i++) { const x = fl(R() * 14), y = fl(R() * 14); g.fillStyle = p.dark; pxr(x, y, 2, 1); pxr(x + 1, y + 1); }
    if (R() < .18) {
      const x = fl(R() * 10) + 1, y = fl(R() * 10) + 2;
      g.fillStyle = "#3a2414"; pxr(x + 1, y, 4, 1); pxr(x, y + 1, 6, 2); pxr(x + 1, y + 3, 4, 1);
      g.fillStyle = "#9b958a"; pxr(x + 1, y + 1, 4, 2); g.fillStyle = "#c8c2b5"; pxr(x + 1, y + 1, 2, 1); g.fillStyle = "#726c62"; pxr(x + 3, y + 2, 2, 1);
    }
    if (R() < .25) { g.fillStyle = "#4b2b16"; let x = fl(R() * 12), y = fl(R() * 6) + 6; for (let i = 0; i < 6; i++) { pxr(x, y); x++; if (R() < .5) y++; } }
  } else if (theme === "sneeuw") {
    for (let row = 0; row < 4; row++) {
      const off = row % 2 ? 4 : 0;
      g.fillStyle = p.dark; pxr(0, row * 4 + 3, 16, 1);
      for (let x = off; x < 16 + 8; x += 8) { pxr(x % 16, row * 4, 1, 3); }
      g.fillStyle = p.light; for (let x = off + 1; x < 16 + 8; x += 8) pxr((x) % 16, row * 4, 5, 1);
    }
    for (let i = 0; i < 6; i++) { g.fillStyle = "#8ea6c9"; pxr(fl(R() * 16), fl(R() * 16)); }
  } else {
    for (let row = 0; row < 4; row++) {
      const off = row % 2 ? 4 : 0;
      g.fillStyle = p.dark; pxr(0, row * 4 + 3, 16, 1);
      for (let x = off; x < 24; x += 8) pxr(x % 16, row * 4, 1, 3);
      g.fillStyle = p.light; for (let x = off + 1; x < 24; x += 8) pxr(x % 16, row * 4, 5, 1);
    }
  }
}
function topTex(theme, R) {
  if (theme === "bos") {
    for (let x = 0; x < 16; x++) {
      const h = 4 + (R() < .5 ? 1 : 0) + (R() < .2 ? 1 : 0);
      g.fillStyle = "#4f9e3c"; pxr(x, 0, 1, h); g.fillStyle = "#2c6a28"; pxr(x, h, 1, 1);
      g.fillStyle = R() < .3 ? "#a8e878" : "#7fcf5a"; pxr(x, 1, 1, 1);
      if (R() < .2) { g.fillStyle = "#3b8a35"; pxr(x, 2 + fl(R() * 2), 1, 1); }
    }
    g.fillStyle = "#24461b"; g.fillRect(0, 0, 32, 2);
  } else if (theme === "sneeuw") {
    for (let x = 0; x < 16; x++) {
      const h = 5 + (R() < .5 ? 1 : 0);
      g.fillStyle = "#f4f8ff"; pxr(x, 0, 1, h); g.fillStyle = "#c3d4ec"; pxr(x, h, 1, 1);
      if (R() < .2) { g.fillStyle = "#ffffff"; pxr(x, 1); }
      if (R() < .15) { g.fillStyle = "#a9c6ea"; pxr(x, 3); }
    }
    g.fillStyle = "#8ea6c9"; g.fillRect(0, 0, 32, 2);
  } else if (theme === "stad") {
    // kasseien met een laagje sneeuw
    g.fillStyle = "#3e3a44"; g.fillRect(0, 0, 32, 12);
    for (let x = 0; x < 16; x += 3) { const o = (x / 3) % 2; g.fillStyle = ["#8d8894", "#a19ca8", "#7e7a86"][x % 3]; pxr(x, 1 + o, 2, 2); pxr(x + 1, 3 + o, 2, 2); g.fillStyle = "#b9b4c0"; pxr(x, 1 + o, 1, 1); }
    g.fillStyle = "#f4f8ff"; for (let x = 0; x < 16; x++) pxr(x, 0, 1, 1 + (R() < .4 ? 1 : 0));
    g.fillStyle = "#c3d4ec"; pxr(0, 6, 16, 1);
  } else {
    const cols = ["#c08a55", "#b07a47", "#c99560", "#b88450"];
    let x = 0, i = fl(R() * 4);
    while (x < 16) { const w = 4 + fl(R() * 4); g.fillStyle = cols[i++ % 4]; pxr(x, 0, w, 5); g.fillStyle = "#7a4f2b"; pxr(x, 0, 1, 5); g.fillStyle = "#dcae78"; pxr(x + 1, 1, w - 2, 1); x += w; }
    g.fillStyle = "#6b4426"; g.fillRect(0, 0, 32, 2); g.fillStyle = "#7a5636"; pxr(0, 5, 16, 1);
  }
}
function platTex(theme) {
  const snowy = theme === "sneeuw" || theme === "stad";
  if (theme === "huis") {
    g.fillStyle = "#6b4a2a"; g.fillRect(0, 0, 32, 10);
    g.fillStyle = "#c89a64"; g.fillRect(0, 2, 32, 6); g.fillStyle = "#e0b880"; g.fillRect(0, 2, 32, 2);
    g.fillStyle = "#8a8a86"; g.fillRect(14, 10, 4, 2); g.fillRect(15, 10, 2, 8); g.fillRect(12, 10, 2, 2);
    return;
  }
  const dark = snowy ? "#5a3d26" : "#6b4220", mid = snowy ? "#86603f" : "#a86c3a", hi = snowy ? "#a57c56" : "#d39858";
  const y0 = snowy ? 4 : 0;
  g.fillStyle = "#2e1a0b"; g.fillRect(0, y0, 32, 14);
  g.fillStyle = mid; g.fillRect(0, y0 + 2, 32, 10); g.fillStyle = hi; g.fillRect(0, y0 + 2, 32, 2); g.fillStyle = dark; g.fillRect(0, y0 + 10, 32, 2);
  g.fillStyle = dark; g.fillRect(4, y0 + 6, 10, 1); g.fillRect(18, y0 + 5, 9, 1); g.fillRect(0, y0 + 2, 1, 10);
  g.fillStyle = "#d8d8d0"; g.fillRect(3, y0 + 4, 2, 2); g.fillRect(27, y0 + 4, 2, 2);
  if (snowy) {
    g.fillStyle = "#8ea6c9"; g.fillRect(0, 0, 32, 2);
    g.fillStyle = "#f4f8ff"; g.fillRect(0, 2, 32, 4); g.fillRect(2, 0, 10, 2); g.fillRect(18, 0, 8, 2);
    g.fillStyle = "#cfefff"; [[5, 6], [13, 4], [24, 7]].forEach(([x, h]) => { g.fillRect(x, 18, 3, h); g.fillRect(x + 1, 18 + h, 1, 2); });
  }
}
function blockTex(theme, R) {
  if (theme === "huis") {
    g.fillStyle = "#6b6b66"; g.fillRect(0, 0, 32, 32);
    g.fillStyle = "#f6f4ee"; g.fillRect(2, 2, 28, 28); g.fillStyle = "#e2dfd6"; g.fillRect(2, 26, 28, 4); g.fillRect(28, 2, 2, 28);
    g.fillStyle = "#c9c5bb"; g.fillRect(2, 12, 28, 2); g.fillStyle = "#8f8b82"; g.fillRect(12, 6, 8, 2); g.fillRect(12, 18, 8, 2);
    return;
  }
  if (theme === "sneeuw") {
    g.fillStyle = "#3f6f9a"; g.fillRect(0, 0, 32, 32);
    g.fillStyle = "#9fd2ee"; g.fillRect(2, 2, 28, 28); g.fillStyle = "#d8f2ff"; g.fillRect(2, 2, 28, 3); g.fillRect(2, 2, 3, 28);
    g.fillStyle = "#6aa8cf"; g.fillRect(2, 27, 28, 3); g.fillRect(27, 2, 3, 28);
    g.fillStyle = "rgba(255,255,255,.7)"; for (let i = 0; i < 3; i++) { g.fillRect(8 + i * 4, 18 - i * 4, 2, 2); } g.fillRect(20, 8, 4, 2);
    return;
  }
  g.fillStyle = "#2e2c28"; g.fillRect(0, 0, 32, 32);
  g.fillStyle = "#8f8d84"; g.fillRect(2, 2, 28, 28); g.fillStyle = "#b6b4a9"; g.fillRect(2, 2, 28, 3); g.fillRect(2, 2, 3, 28);
  g.fillStyle = "#64625a"; g.fillRect(2, 27, 28, 3); g.fillRect(27, 2, 3, 28);
  g.fillStyle = "#55534c"; g.fillRect(10, 10, 2, 6); g.fillRect(12, 16, 4, 2); g.fillRect(20, 18, 2, 4);
  if (theme === "bos") { g.fillStyle = "#5c9a3e"; g.fillRect(2, 2, 12, 3); g.fillRect(4, 5, 4, 2); g.fillRect(20, 2, 8, 2); g.fillStyle = "#86c45c"; g.fillRect(4, 2, 6, 1); }
  else { g.fillStyle = "#f4f8ff"; g.fillRect(2, 2, 28, 3); }
}
function spikeTex(theme, R) {
  if (theme === "bos") {
    g.fillStyle = "#24461b";
    for (let i = 0; i < 4; i++) { g.beginPath(); g.moveTo(i * 8, 32); g.lineTo(i * 8 + 4, 10 + (i % 2) * 4); g.lineTo(i * 8 + 8, 32); g.fill(); }
    g.fillStyle = "#3e7a2c"; for (let i = 0; i < 4; i++) { g.beginPath(); g.moveTo(i * 8 + 2, 32); g.lineTo(i * 8 + 4, 14 + (i % 2) * 4); g.lineTo(i * 8 + 6, 32); g.fill(); }
    g.fillStyle = "#d9d0b0"; [[6, 20], [14, 16], [22, 22], [27, 18]].forEach(([x, y]) => g.fillRect(x, y, 2, 2));
    [[9, 22], [19, 18], [25, 25]].forEach(([x, y]) => { g.fillStyle = "#1e1030"; g.fillRect(x - 1, y - 1, 6, 6); g.fillStyle = "#5a2a7a"; g.fillRect(x, y, 4, 4); g.fillStyle = "#b37ad9"; g.fillRect(x, y, 2, 2); });
  } else if (theme === "huis") {
    const br = (x, y, c) => { g.fillStyle = OUT; g.fillRect(x - 1, y - 1, 14, 9); g.fillStyle = c; g.fillRect(x, y, 12, 7); g.fillRect(x + 1, y - 3, 3, 3); g.fillRect(x + 7, y - 3, 3, 3); g.fillStyle = "rgba(255,255,255,.4)"; g.fillRect(x, y, 12, 2); };
    br(2, 24, "#e8423a"); br(17, 24, "#2f7fe0"); br(9, 17, "#f5c22b"); br(21, 14, "#3bb35a");
  } else {
    for (let i = 0; i < 4; i++) {
      const h = 18 + (i % 2) * 6;
      g.fillStyle = "#3f6f9a"; g.beginPath(); g.moveTo(i * 8, 32); g.lineTo(i * 8 + 4, 32 - h - 2); g.lineTo(i * 8 + 8, 32); g.fill();
      g.fillStyle = "#bfeaff"; g.beginPath(); g.moveTo(i * 8 + 1, 32); g.lineTo(i * 8 + 4, 32 - h); g.lineTo(i * 8 + 7, 32); g.fill();
      g.fillStyle = "#fff"; g.fillRect(i * 8 + 3, 32 - h + 4, 1, h - 6);
    }
  }
}
function getTex(theme) {
  if (TEXCACHE[theme]) return TEXCACHE[theme];
  const R = rng(theme.length * 977 + 13), T = { fill: [], top: [] };
  for (let v = 0; v < 4; v++) { T.fill.push(texTile(() => fillTex(theme, R))); T.top.push(texTile(() => { fillTex(theme, R); topTex(theme, R); })); }
  T.plat = texTile(() => platTex(theme)); T.block = texTile(() => blockTex(theme, R)); T.spike = texTile(() => spikeTex(theme, R));
  // Alle tegels ook in één atlas (met een rand van 1 px ertussen): zo tekent de grafische chip honderden tegels per
  // beeld uit één plaatje, in plaats van steeds te wisselen. Pixel voor pixel hetzelfde resultaat.
  const all = [...T.fill, ...T.top, T.plat, T.block, T.spike];
  T.atlas = mk(all.length * 34, 34); T.at = new Map();
  const actx = T.atlas.getContext("2d");
  all.forEach((c, i) => { actx.drawImage(c, i * 34 + 1, 1); T.at.set(c, i * 34 + 1); });
  return TEXCACHE[theme] = T;
}

/* ---------- Achtergrondlagen (naadloos herhalend) ---------- */
const LW = 1536;
const per = (x, k, ph) => Math.sin(x / LW * Math.PI * 2 * k + ph);
const ridge = (base, amps, x) => base - amps.reduce((s, [a, k, p]) => s + a * per(x, k, p), 0);
function layerCanvas(fn) { const c = mk(LW, VIEW_H); withCtx(c.getContext("2d"), fn); return c; }
function fillRidge(base, amps, col, hi) {
  g.fillStyle = col; g.beginPath(); g.moveTo(0, VIEW_H);
  for (let x = 0; x <= LW; x += 6) g.lineTo(x, ridge(base, amps, x));
  g.lineTo(LW, VIEW_H); g.fill();
  if (hi) { g.strokeStyle = hi; g.lineWidth = 3; g.beginPath(); for (let x = 0; x <= LW; x += 6) g.lineTo(x, ridge(base, amps, x) + 1.5); g.stroke(); }
}
function wrapAt(x, fn) { fn(x); if (x < 120) fn(x + LW); if (x > LW - 120) fn(x - LW); }
function pineShape(x, y, h, c1, c2, snow, outline) {
  const w = h * .38;
  g.fillStyle = "#4a3020"; g.fillRect(x - h * .04, y - h * .16, h * .08, h * .16);
  for (let i = 0; i < 4; i++) {
    const ww = w * (1 - i * .2), yy = y - h * .12 - i * h * .19, top = yy - h * .32;
    if (outline) { g.fillStyle = outline; g.beginPath(); g.moveTo(x - ww - 1.5, yy + 1.5); g.lineTo(x + ww + 1.5, yy + 1.5); g.lineTo(x, top - 2); g.fill(); }
    g.fillStyle = c1; g.beginPath(); g.moveTo(x - ww, yy); g.lineTo(x + ww, yy); g.lineTo(x, top); g.fill();
    g.fillStyle = c2; g.beginPath(); g.moveTo(x, yy); g.lineTo(x + ww, yy); g.lineTo(x, top); g.fill();
    if (snow) { g.fillStyle = snow; g.beginPath(); g.moveTo(x - ww * .55, yy - h * .14); g.quadraticCurveTo(x, yy - h * .08, x + ww * .55, yy - h * .14); g.lineTo(x, top); g.fill(); }
  }
}
function leafTree(x, y, h, cols, outline) {
  g.fillStyle = "#4a3020"; g.fillRect(x - h * .05, y - h * .5, h * .1, h * .5);
  const blobs = [[0, -.62, .3], [-.22, -.52, .22], [.22, -.5, .22], [-.1, -.8, .2], [.14, -.75, .2]];
  if (outline) { g.fillStyle = outline; blobs.forEach(([dx, dy, r]) => { g.beginPath(); g.arc(x + dx * h, y + dy * h, r * h + 2, 0, 7); g.fill(); }); }
  blobs.forEach(([dx, dy, r], i) => { g.fillStyle = cols[i % cols.length]; g.beginPath(); g.arc(x + dx * h, y + dy * h, r * h, 0, 7); g.fill(); });
  g.fillStyle = "rgba(255,255,255,.18)"; g.beginPath(); g.arc(x - h * .06, y - h * .72, h * .12, 0, 7); g.fill();
}
function village(x, y, s, lit, roof, wall) {
  const houses = [[0, 22, 18], [22, 18, 14], [38, 26, 16], [62, 20, 13]];
  houses.forEach(([dx, w, h]) => {
    const hx = x + dx * s, hw = w * s, hh = h * s;
    g.fillStyle = wall; g.fillRect(hx, y - hh, hw, hh);
    g.fillStyle = roof; g.beginPath(); g.moveTo(hx - 2, y - hh); g.lineTo(hx + hw / 2, y - hh - hw * .45); g.lineTo(hx + hw + 2, y - hh); g.fill();
    g.fillStyle = lit; for (let i = 0; i < Math.floor(w / 9); i++) g.fillRect(hx + (3 + i * 8) * s, y - hh + 5 * s, 3 * s, 4 * s);
  });
  // kerk
  const cx = x + 90 * s;
  g.fillStyle = wall; g.fillRect(cx, y - 30 * s, 12 * s, 30 * s); g.fillRect(cx + 12 * s, y - 16 * s, 22 * s, 16 * s);
  g.fillStyle = roof; g.beginPath(); g.moveTo(cx - 1, y - 30 * s); g.lineTo(cx + 6 * s, y - 52 * s); g.lineTo(cx + 12 * s + 1, y - 30 * s); g.fill();
  g.beginPath(); g.moveTo(cx + 12 * s, y - 16 * s); g.lineTo(cx + 23 * s, y - 26 * s); g.lineTo(cx + 34 * s, y - 16 * s); g.fill();
  g.fillStyle = lit; g.fillRect(cx + 4 * s, y - 24 * s, 4 * s, 6 * s);
  g.fillRect(cx + 6 * s - .5, y - 58 * s, 1.2, 7 * s); g.fillRect(cx + 4 * s, y - 56 * s, 5 * s, 1.2);
}
const LAYERS = {};
function getLayers(theme) {
  if (LAYERS[theme]) return LAYERS[theme];
  const R = rng(theme === "bos" ? 4242 : 777);
  const out = {};
  if (theme === "bos") {
    out.clouds = layerCanvas(() => {
      for (let i = 0; i < 9; i++) {
        const cx = i * LW / 9 + R() * 80, cy = 50 + R() * 110, s = .7 + R() * .7;
        wrapAt(cx, x => {
          const puffs = [[0, 0, 22], [24, -10, 26], [50, -2, 20], [70, 4, 15], [-20, 6, 15]];
          g.fillStyle = "#a9c8e2"; puffs.forEach(([dx, dy, r]) => { g.beginPath(); g.arc(x + dx * s, cy + dy * s + 5, r * s + 2, 0, 7); g.fill(); });
          g.fillStyle = "#ffffff"; puffs.forEach(([dx, dy, r]) => { g.beginPath(); g.arc(x + dx * s, cy + dy * s, r * s, 0, 7); g.fill(); });
          g.fillStyle = "#dcebf6"; g.fillRect(x - 34 * s, cy + 8 * s, 120 * s, 10 * s);
        });
      }
    });
    out.far = layerCanvas(() => {
      const a = [[38, 2, 1], [22, 5, 2], [9, 11, 0]];
      fillRidge(265, a, "#8fb6cf", "#b8d6e6");
      g.fillStyle = "#7ea7c2"; for (let x = 0; x < LW; x += 14) { const y = ridge(265, a, x); g.fillRect(x, y + 14 + R() * 30, 6, 2); }
    });
    out.mid = layerCanvas(() => {
      const a = [[24, 3, 4], [12, 7, 1], [5, 17, 2]];
      fillRidge(310, a, "#6aa05a", "#8cc46e");
      for (let i = 0; i < 2; i++) { const vx = 200 + i * 760; village(vx, ridge(310, a, vx + 60) + 6, 1, "#ffe7a8", "#b5453a", "#f1e6d6"); }
      for (let x = 0; x < LW; x += 22) {
        if (x % 760 > 180 && x % 760 < 340) continue;
        const r = R(); if (r < .3) continue; const y = ridge(310, a, x) + 8;
        wrapAt(x, xx => r < .7 ? pineShape(xx, y, 40 + r * 30, "#3f7d47", "#2f6539") : leafTree(xx, y, 40 + r * 20, ["#e08a2e", "#f2b53c", "#c9562b"]));
      }
    });
    out.near = layerCanvas(() => {
      const a = [[16, 4, 2], [9, 9, 5]];
      fillRidge(372, a, "#3f7a45");
      for (let x = 0; x < LW; x += 34) {
        const r = R(), y = ridge(372, a, x) + 10;
        wrapAt(x, xx => r < .55 ? pineShape(xx, y, 80 + r * 50, "#2d6338", "#21502b", null, "#173220") : leafTree(xx, y, 80 + r * 30, ["#d9742a", "#eaa635", "#b44a25", "#e9c04a"], "#3b1e0e"));
      }
      g.fillStyle = "#2e6a37"; for (let x = 0; x < LW; x += 18) { const y = ridge(372, a, x) + 14; g.beginPath(); g.arc(x, y, 12 + R() * 8, Math.PI, 0); g.fill(); }
    });
  } else if (theme === "sneeuw") {
    out.far = layerCanvas(() => {
      const a = [[46, 2, 2], [26, 5, 1], [10, 13, 4]];
      fillRidge(280, a, "#3a5689");
      g.fillStyle = "#c9d8f0"; g.beginPath();
      for (let x = 0; x <= LW; x += 6) g.lineTo(x, ridge(280, a, x));
      for (let x = LW; x >= 0; x -= 6) { const y = ridge(280, a, x); g.lineTo(x, y + Math.max(2, (262 - y) * .55) + Math.sin(x * .09) * 3); }
      g.fill();
    });
    out.mid = layerCanvas(() => {
      const a = [[22, 3, 1], [10, 8, 3]];
      fillRidge(330, a, "#a8bfe0", "#e4eefb");
      village(520, ridge(330, a, 580) + 6, 1, "#ffd27a", "#3b4660", "#c9d3e6");
      village(1180, ridge(330, a, 1240) + 6, .9, "#ffd27a", "#3b4660", "#c9d3e6");
      for (let x = 0; x < LW; x += 20) {
        if ((x > 480 && x < 660) || (x > 1150 && x < 1320)) continue;
        const r = R(); if (r < .35) continue; const y = ridge(330, a, x) + 8;
        wrapAt(x, xx => pineShape(xx, y, 34 + r * 30, "#2a4a5e", "#203a4c", "#e8f0fb"));
      }
    });
    out.near = layerCanvas(() => {
      const a = [[14, 4, 3], [8, 10, 1]];
      fillRidge(380, a, "#dfe9f7", "#ffffff");
      g.fillStyle = "#c7d7ee"; for (let x = 0; x < LW; x += 26) { const y = ridge(380, a, x) + 18; g.beginPath(); g.ellipse(x, y, 20, 4, 0, 0, 7); g.fill(); }
      for (let x = 0; x < LW; x += 40) {
        const r = R(), y = ridge(380, a, x) + 10; if (r < .25) continue;
        wrapAt(x, xx => pineShape(xx, y, 80 + r * 50, "#1f4152", "#173444", "#f4f8ff", "#0f2230"));
      }
    });
  }
  else if (theme === "stad") {
    // Kirchberg: moderne torens met verlichte ramen
    out.far = layerCanvas(() => {
      for (let x = 10; x < LW - 40; x += 60 + R() * 70) {
        const w = 26 + R() * 34, h = 70 + R() * 100, y = 300;
        g.fillStyle = "#43527a"; g.fillRect(x, y - h, w, h + 60); g.fillStyle = "#56668f"; g.fillRect(x, y - h, w * .35, h + 60);
        g.fillStyle = "rgba(255,226,150,.85)"; for (let wy = y - h + 6; wy < y + 40; wy += 8) for (let wx = x + 4; wx < x + w - 4; wx += 7) if (R() < .4) g.fillRect(wx, wy, 3, 4);
        if (R() < .3) { g.fillStyle = "#ff5a5a"; g.fillRect(x + w / 2 - 1, y - h - 6, 2, 6); }
      }
    });
    // de oude stad op de rotsen, met de rode brug en de torens van de kathedraal
    out.mid = layerCanvas(() => {
      const a = [[14, 3, 1], [8, 7, 2]];
      fillRidge(345, a, "#6e6a5c");
      g.fillStyle = "#5b5849"; for (let x = 0; x < LW; x += 9) g.fillRect(x, ridge(345, a, x) + 10 + R() * 40, 5, 2);
      for (let x = 0; x < LW; x += 30) {
        if (x > 280 && x < 700) continue;
        const y = ridge(345, a, x) + 4, h = 34 + R() * 26, w = 26;
        g.fillStyle = ["#e9e0cf", "#d8c9b0", "#cfd6dc", "#e6d2bf"][Math.floor(R() * 4)]; g.fillRect(x, y - h, w, h);
        g.fillStyle = "#3c4150"; g.beginPath(); g.moveTo(x - 2, y - h); g.lineTo(x + w / 2, y - h - 16); g.lineTo(x + w + 2, y - h); g.fill();
        g.fillStyle = "#f4f8ff"; g.fillRect(x - 1, y - h - 2, w + 2, 2);
        g.fillStyle = "#ffd27a"; for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) if (R() < .7) g.fillRect(x + 5 + i * 11, y - h + 8 + j * 12, 5, 6);
      }
      // de rode brug over het dal
      g.fillStyle = "#3a3846"; g.fillRect(280, 330, 420, 150);
      g.fillStyle = "#c4302b"; g.fillRect(270, 286, 440, 10);
      for (let i = 0; i < 3; i++) { const bx = 330 + i * 130; g.beginPath(); g.moveTo(bx, 296); g.lineTo(bx + 34, 420); g.lineTo(bx + 46, 420); g.lineTo(bx + 80, 296); g.lineTo(bx + 66, 296); g.lineTo(bx + 40, 390); g.lineTo(bx + 14, 296); g.fill(); }
      g.fillStyle = "rgba(255,230,160,.9)"; for (let x = 275; x < 705; x += 12) g.fillRect(x, 283, 2, 3);
      // kathedraal
      const cx = 1100, cy = ridge(345, a, 1100) + 6;
      g.fillStyle = "#cbbf9f"; g.fillRect(cx, cy - 60, 90, 60);
      [[cx - 6, 110], [cx + 40, 90], [cx + 84, 110]].forEach(([tx, h]) => { g.fillStyle = "#cbbf9f"; g.fillRect(tx, cy - h, 12, h); g.fillStyle = "#4f5f5a"; g.beginPath(); g.moveTo(tx - 2, cy - h); g.lineTo(tx + 6, cy - h - 34); g.lineTo(tx + 14, cy - h); g.fill(); });
      g.fillStyle = "#ffd27a"; g.fillRect(cx + 38, cy - 40, 14, 18);
    });
    // kale bomen met lichtjes en slingers tussen de palen
    out.near = layerCanvas(() => {
      fillRidge(400, [[6, 5, 1]], "#2f2c40");
      for (let x = 20; x < LW; x += 90 + R() * 60) {
        const y = 404, h = 70 + R() * 30;
        g.strokeStyle = "#241f2c"; g.lineWidth = 5; g.beginPath(); g.moveTo(x, y); g.lineTo(x, y - h); g.stroke();
        g.lineWidth = 2.5; for (let i = 0; i < 6; i++) { const by = y - h * .45 - i * h * .09, d = (i % 2 ? 1 : -1) * (18 + R() * 16); g.beginPath(); g.moveTo(x, by); g.lineTo(x + d, by - 16 - R() * 10); g.stroke(); }
        for (let i = 0; i < 14; i++) { g.fillStyle = ["#ffe08a", "#ffffff", "#ffcf6a"][i % 3]; g.beginPath(); g.arc(x + (R() - .5) * 60, y - h * .5 - R() * h * .55, 1.6, 0, 7); g.fill(); }
      }
      for (let x = 0; x < LW; x += 160) {
        g.fillStyle = "#1e1a26"; g.fillRect(x, 300, 4, 110);
        g.strokeStyle = "#1e1a26"; g.lineWidth = 1; g.beginPath(); g.moveTo(x + 2, 302); g.quadraticCurveTo(x + 82, 334, x + 162, 302); g.stroke();
        for (let i = 1; i < 12; i++) { const t = i / 12, lx = x + 2 + t * 160, ly = 302 + Math.sin(t * Math.PI) * 16; g.fillStyle = ["#ff6b6b", "#ffd25e", "#59c28a", "#5aa8ff"][i % 4]; g.beginPath(); g.arc(lx, ly + 3, 2.2, 0, 7); g.fill(); }
      }
    });
  }
  return LAYERS[theme] = out;
}
/* ---------- Scenes of the other regions: North Pole, Tirol (Alps) and Norway (fjord) ---------- */
function chaletShape(x, y, s, wall, roof) {
  g.fillStyle = wall; g.fillRect(x, y - 22 * s, 30 * s, 22 * s);
  g.fillStyle = "rgba(0,0,0,.18)"; for (let i = 1; i < 5; i++) g.fillRect(x, y - 22 * s + i * 4.4 * s, 30 * s, 1);
  g.fillStyle = roof; g.beginPath(); g.moveTo(x - 6 * s, y - 20 * s); g.lineTo(x + 15 * s, y - 34 * s); g.lineTo(x + 36 * s, y - 20 * s); g.fill();
  g.fillStyle = "#f4f8ff"; g.beginPath(); g.moveTo(x - 6 * s, y - 20 * s); g.lineTo(x + 15 * s, y - 34 * s); g.lineTo(x + 36 * s, y - 20 * s); g.lineTo(x + 15 * s, y - 30 * s); g.fill();
  g.fillStyle = "#ffd27a"; g.fillRect(x + 5 * s, y - 15 * s, 5 * s, 5 * s); g.fillRect(x + 20 * s, y - 15 * s, 5 * s, 5 * s);
}
function getSceneLayers(scene) {
  if (LAYERS[scene]) return LAYERS[scene];
  const R = rng({ pole: 9001, alps: 9002, fjord: 9003 }[scene] || 1), out = {};
  if (scene === "pole") {
    // ice floes and icebergs far away
    out.far = layerCanvas(() => {
      g.fillStyle = "#9fc2de"; g.fillRect(0, 300, LW, 200);
      for (let x = 0; x < LW; x += 70 + R() * 90) {
        const w = 50 + R() * 90, h = 30 + R() * 60, y = 304;
        g.fillStyle = "#cfe4f5"; g.beginPath(); g.moveTo(x, y); g.lineTo(x + w * .2, y - h * .8); g.lineTo(x + w * .45, y - h); g.lineTo(x + w * .7, y - h * .6); g.lineTo(x + w, y); g.fill();
        g.fillStyle = "#a9cbe6"; g.beginPath(); g.moveTo(x + w * .45, y - h); g.lineTo(x + w * .7, y - h * .6); g.lineTo(x + w, y); g.lineTo(x + w * .5, y); g.fill();
      }
      g.fillStyle = "rgba(255,255,255,.35)"; for (let x = 0; x < LW; x += 18) g.fillRect(x, 306 + R() * 20, 10, 1.5);
    });
    // Santa's village: red houses with snowy roofs, warm windows and candy-cane poles
    out.mid = layerCanvas(() => {
      const a = [[12, 3, 1], [6, 8, 2]];
      fillRidge(338, a, "#dbe8f6", "#ffffff");
      for (let x = 30; x < LW - 60; x += 64 + R() * 50) {
        const y = ridge(338, a, x + 20) + 6, w = 34 + R() * 16, h = 22 + R() * 10;
        g.fillStyle = ["#b8372f", "#a52f2a", "#2f6a4a"][Math.floor(R() * 3)]; g.fillRect(x, y - h, w, h);
        g.fillStyle = "#f4f8ff"; g.beginPath(); g.moveTo(x - 4, y - h); g.lineTo(x + w / 2, y - h - w * .42); g.lineTo(x + w + 4, y - h); g.fill();
        g.fillStyle = "#ffd27a"; g.fillRect(x + 6, y - h + 7, 6, 6); g.fillRect(x + w - 12, y - h + 7, 6, 6);
        if (R() < .4) { g.fillStyle = "#e9e3d6"; g.fillRect(x + w - 2, y + 2, 3, -38); for (let i = 0; i < 6; i++) { g.fillStyle = "#d33"; g.fillRect(x + w - 2, y - 36 + i * 6, 3, 3); } }
      }
      // the big tree in the middle of the village
      pineShape(760, ridge(338, a, 760) + 8, 120, "#1f5a3a", "#174a2f", "#f4f8ff");
      for (let i = 0; i < 16; i++) { g.fillStyle = i % 2 ? "#ffd25e" : "#ff6b6b"; g.beginPath(); g.arc(760 + (R() - .5) * 60 * (1 - i / 18), ridge(338, a, 760) - 10 - i * 6, 2, 0, 7); g.fill(); }
    });
    out.near = layerCanvas(() => {
      const a = [[14, 4, 2], [8, 9, 4]];
      fillRidge(386, a, "#e6effa", "#ffffff");
      g.fillStyle = "#c9dbef"; for (let x = 0; x < LW; x += 30) { const y = ridge(386, a, x) + 16; g.beginPath(); g.ellipse(x, y, 22, 4, 0, 0, 7); g.fill(); }
      for (let x = 0; x < LW; x += 60) { const r = R(), y = ridge(386, a, x) + 10; if (r < .45) continue; wrapAt(x, xx => pineShape(xx, y, 60 + r * 40, "#1f4152", "#173444", "#f4f8ff", "#0f2230")); }
    });
  } else if (scene === "alps") {
    // high, sharp peaks with snow caps
    out.far = layerCanvas(() => {
      const pts = []; let x = -40; while (x < LW + 80) { pts.push([x, 120 + R() * 90]); x += 70 + R() * 90; pts.push([x, 230 + R() * 50]); x += 50 + R() * 60; }
      g.fillStyle = "#5b6f9e"; g.beginPath(); g.moveTo(0, VIEW_H); pts.forEach(([px, py]) => g.lineTo(px, py)); g.lineTo(LW, VIEW_H); g.fill();
      g.fillStyle = "#4b5d88"; for (let i = 0; i < pts.length - 1; i += 2) { const [x1, y1] = pts[i], [x2, y2] = pts[i + 1]; g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2, y2); g.lineTo(x1 + 10, VIEW_H); g.fill(); }
      g.fillStyle = "#eef4fc";
      for (let i = 0; i < pts.length; i += 2) {
        const [px, py] = pts[i], prev = pts[i - 1] || [px - 60, py + 90], next = pts[i + 1] || [px + 60, py + 90];
        const k = .38; g.beginPath(); g.moveTo(px, py);
        g.lineTo(px + (next[0] - px) * k, py + (next[1] - py) * k); g.lineTo(px + (next[0] - px) * k * .5, py + (next[1] - py) * k * .7);
        g.lineTo(px, py + (next[1] - py) * k * .9); g.lineTo(px + (prev[0] - px) * k * .5, py + (prev[1] - py) * k * .7);
        g.lineTo(px + (prev[0] - px) * k, py + (prev[1] - py) * k); g.fill();
      }
    });
    // slopes with chalets, an onion-dome church and the cable car
    out.mid = layerCanvas(() => {
      const a = [[30, 2, 1], [14, 6, 3]];
      fillRidge(330, a, "#c3d4ec", "#f2f7fd");
      g.strokeStyle = "#2a2f3c"; g.lineWidth = 1.5; g.beginPath(); g.moveTo(120, ridge(330, a, 120) - 10); g.lineTo(700, 150); g.stroke();
      g.fillStyle = "#2a2f3c"; g.fillRect(118, ridge(330, a, 120) - 14, 4, 14); g.fillRect(698, 150, 4, 30);
      [.35, .7].forEach(t => { const cx = 120 + (580 * t), cy = ridge(330, a, 120) - 10 + (150 - ridge(330, a, 120) + 10) * t; g.fillStyle = "#2a2f3c"; g.fillRect(cx - 1, cy, 2, 8); g.fillStyle = "#d8423a"; g.fillRect(cx - 9, cy + 8, 18, 13); g.fillStyle = "#ffe7a8"; g.fillRect(cx - 6, cy + 11, 12, 5); });
      for (let x = 820; x < LW - 60; x += 46 + R() * 40) chaletShape(x, ridge(330, a, x + 15) + 6, .9 + R() * .3, "#8a5a34", "#4a2f22");
      for (let x = 140; x < 600; x += 70 + R() * 50) chaletShape(x, ridge(330, a, x + 15) + 6, .8, "#9a6338", "#4a2f22");
      const cx = 1250, cy = ridge(330, a, 1256) + 6;
      g.fillStyle = "#f1ece0"; g.fillRect(cx, cy - 46, 12, 46); g.fillRect(cx + 12, cy - 22, 26, 22);
      g.fillStyle = "#4a6a3a"; g.beginPath(); g.ellipse(cx + 6, cy - 52, 8, 9, 0, 0, 7); g.fill(); g.fillRect(cx + 5, cy - 66, 2, 8);
      g.fillStyle = "#4a2f22"; g.beginPath(); g.moveTo(cx + 10, cy - 22); g.lineTo(cx + 25, cy - 32); g.lineTo(cx + 40, cy - 22); g.fill();
      for (let x = 0; x < LW; x += 24) { if ((x > 100 && x < 620) || (x > 800 && x < 1320)) continue; const r = R(); if (r < .4) continue; wrapAt(x, xx => pineShape(xx, ridge(330, a, x) + 8, 30 + r * 26, "#2a4a5e", "#203a4c", "#e8f0fb")); }
    });
    out.near = layerCanvas(() => {
      const a = [[14, 4, 3], [8, 10, 1]];
      fillRidge(384, a, "#dfe9f7", "#ffffff");
      for (let x = 0; x < LW; x += 38) { const r = R(), y = ridge(384, a, x) + 10; if (r < .3) continue; wrapAt(x, xx => pineShape(xx, y, 80 + r * 50, "#1f4152", "#173444", "#f4f8ff", "#0f2230")); }
    });
  } else if (scene === "fjord") {
    // steep mountain walls on both sides of a calm fjord
    out.far = layerCanvas(() => {
      const a = [[60, 2, 2], [34, 5, 1], [12, 11, 3]];
      fillRidge(250, a, "#2c3a5e");
      g.fillStyle = "#dfe8f5"; g.beginPath();
      for (let x = 0; x <= LW; x += 6) g.lineTo(x, ridge(250, a, x));
      for (let x = LW; x >= 0; x -= 6) { const y = ridge(250, a, x); g.lineTo(x, y + Math.max(3, (220 - y) * .5)); }
      g.fill();
      // the water: dark, with the reflection of the snowy tops
      g.fillStyle = "#18264a"; g.fillRect(0, 330, LW, 200);
      g.fillStyle = "rgba(200,220,255,.18)"; for (let x = 0; x < LW; x += 10) { const y = 2 * 330 - ridge(250, a, x); if (y > 332) g.fillRect(x, 332 + (y - 332) * .25, 8, 1.5); }
      g.fillStyle = "rgba(255,255,255,.25)"; for (let x = 0; x < LW; x += 26) g.fillRect(x + R() * 10, 340 + R() * 50, 14, 1);
    });
    // red fishermen's cabins (rorbuer) on stilts along the shore, and little boats
    out.mid = layerCanvas(() => {
      const a = [[10, 3, 1], [6, 7, 2]];
      fillRidge(352, a, "#cdd9ec", "#f4f8ff");
      for (let x = 40; x < LW - 50; x += 80 + R() * 70) {
        const y = 346, w = 34 + R() * 10;
        g.fillStyle = "#3a2a22"; for (let i = 0; i < 4; i++) g.fillRect(x + 3 + i * (w - 6) / 3, y - 2, 2, 14);
        g.fillStyle = "#b2322a"; g.fillRect(x, y - 24, w, 22);
        g.fillStyle = "#f4f8ff"; g.beginPath(); g.moveTo(x - 4, y - 24); g.lineTo(x + w / 2, y - 40); g.lineTo(x + w + 4, y - 24); g.fill();
        g.fillStyle = "#ffd27a"; g.fillRect(x + 6, y - 17, 6, 6); g.fillRect(x + w - 12, y - 17, 6, 6);
        if (R() < .5) { const bx = x + w + 14; g.fillStyle = "#e9e3d6"; g.beginPath(); g.moveTo(bx, 356); g.lineTo(bx + 30, 356); g.lineTo(bx + 24, 364); g.lineTo(bx + 6, 364); g.fill(); g.fillStyle = "#3a2a22"; g.fillRect(bx + 14, 330, 2, 26); }
      }
    });
    out.near = layerCanvas(() => {
      const a = [[14, 4, 3], [8, 10, 1]];
      fillRidge(384, a, "#dfe9f7", "#ffffff");
      for (let x = 0; x < LW; x += 36) { const r = R(), y = ridge(384, a, x) + 10; if (r < .25) continue; wrapAt(x, xx => pineShape(xx, y, 80 + r * 60, "#1a3a3a", "#132e2e", "#f4f8ff", "#0b1c1c")); }
    });
  }
  return LAYERS[scene] = out;
}
/** Northern lights: a few slow, wavy green and purple curtains (cheap: three paths per frame). */
function drawAurora(strength) {
  const cols = [["rgba(90,255,170,", 150], ["rgba(120,230,255,", 110], ["rgba(190,120,255,", 80]];
  for (let k = 0; k < 3; k++) {
    const [c, base] = cols[k], amp = 26 + k * 8;
    g.fillStyle = grad("aurora" + k, () => { const gr = g.createLinearGradient(0, base - 70, 0, base + 60); gr.addColorStop(0, c + "0)"); gr.addColorStop(.55, c + (.38 * strength).toFixed(2) + ")"); gr.addColorStop(1, c + "0)"); return gr; });
    g.beginPath(); g.moveTo(0, base + 60);
    for (let x = 0; x <= viewW + 24; x += 24) g.lineTo(x, base - 50 + Math.sin(x * .006 + frame * .008 + k * 2) * amp + Math.sin(x * .017 - frame * .011) * 10);
    g.lineTo(viewW + 24, base + 60); g.fill();
  }
}
function drawSceneSky(scene) {
  const skies = { pole: ["#061024", "#14385a", "#3a6f92"], alps: ["#1a2a5a", "#5a6aa8", "#e0a5a0"], fjord: ["#050b22", "#1a2350", "#3b3f7a"] }[scene];
  g.fillStyle = grad("sky-" + scene, () => { const gr = g.createLinearGradient(0, 0, 0, VIEW_H); gr.addColorStop(0, skies[0]); gr.addColorStop(.62, skies[1]); gr.addColorStop(1, skies[2]); return gr; });
  g.fillRect(0, 0, viewW, VIEW_H);
  g.fillStyle = "#fff";
  for (let i = 0; i < 70; i++) { g.globalAlpha = (.3 + .6 * Math.abs(Math.sin(frame / (30 + i % 13) + i))) * (scene === "alps" ? .5 : 1); g.fillRect(((hash(i * 3) * 3000) % viewW + viewW) % viewW, hash(i * 7) * 220, 2, 2); }
  g.globalAlpha = 1;
  if (scene !== "alps") drawAurora(scene === "fjord" ? 1 : .8);
}

/** De rijen van een laag waar iets op staat (de rest is doorzichtig), met 2 lege rijen marge zodat de randen precies hetzelfde blijven. */
function layerBand(cnv) {
  if (cnv._band) return cnv._band;
  let top = 0, bot = cnv.height;
  try {
    const d = cnv.getContext("2d").getImageData(0, 0, cnv.width, cnv.height).data, w = cnv.width;
    const filled = y => { for (let i = (y * w) * 4 + 3, e = i + w * 4; i < e; i += 4) if (d[i]) return true; return false; };
    while (top < cnv.height && !filled(top)) top++;
    while (bot > top && !filled(bot - 1)) bot--;
    top = Math.max(0, top - 2); bot = Math.min(cnv.height, bot + 2);
  } catch (e) { top = 0; bot = cnv.height; }
  return (cnv._band = [top, Math.max(0, bot - top)]);
}
// Teken alleen de strook waar iets op staat: scheelt veel schilderwerk per beeld (vooral op tv's en tragere toestellen).
function drawLayer(cnv, off) {
  const [y0, h] = layerBand(cnv);
  if (!h) return;
  let x = -(((off % LW) + LW) % LW);
  for (; x < viewW; x += LW) g.drawImage(cnv, 0, y0, LW, h, x, y0, LW, h);
}

/* ---------- Interieur (hele level in één keer getekend) ---------- */
function buildInterior() {
  const W = L.w * TS, c = mk(W, VIEW_H);
  withCtx(c.getContext("2d"), () => {
    const R = rng(99);
    for (let x = 0; x < L.w; x++) {
      const zone = L.d.fixedInterior ? (x < 50 ? 0 : x < 90 ? 1 : x < 133 ? 2 : 0) : Math.floor(x / 48) % 3;
      const px = x * TS, fy = groundTop(x) * TS;
      if (zone === 0) {
        g.fillStyle = "#efe3cf"; g.fillRect(px, 0, TS, VIEW_H);
        g.fillStyle = "#e3d3b8"; for (let y = 24; y < fy; y += 24) { const o = (y / 24) % 2 ? 16 : 0; g.save(); g.translate(px + 8 + o / 2, y); g.rotate(Math.PI / 4); g.fillRect(-3, -3, 6, 6); g.restore(); }
      } else if (zone === 1) {
        g.fillStyle = "#e9eef1"; g.fillRect(px, 0, TS, VIEW_H);
        g.fillStyle = "#d3dde3"; g.fillRect(px, 0, 1, VIEW_H); for (let y = 0; y < VIEW_H; y += 16) g.fillRect(px, y, TS, 1);
        g.fillStyle = "#d8b48a"; g.fillRect(px, fy - 120, TS, 120);
        g.fillStyle = "#b8936a"; for (let i = 0; i < TS; i += 8) g.fillRect(px + i, fy - 120, 2, 120);
      } else {
        g.fillStyle = (x % 2) ? "#ecd8d4" : "#e4ccc7"; g.fillRect(px, 0, TS, VIEW_H);
        g.fillStyle = "rgba(255,255,255,.35)"; g.fillRect(px + 15, 0, 2, VIEW_H);
      }
      if (zone !== 1) {
        g.fillStyle = "#f5efe4"; g.fillRect(px, fy - 96, TS, 96);
        g.fillStyle = "#d9cdb8"; g.fillRect(px, fy - 98, TS, 4);
        if (x % 3 === 0) { g.strokeStyle = "#ddd2bf"; g.lineWidth = 2; g.strokeRect(px + 6, fy - 84, TS * 3 - 12, 64); }
      }
      g.fillStyle = "#ffffff"; g.fillRect(px, fy - 12, TS, 12); g.fillStyle = "#d4cbbd"; g.fillRect(px, fy - 13, TS, 2);
      g.fillStyle = "#f8f3ea"; g.fillRect(px, 0, TS, 14); g.fillStyle = "#d9cdb8"; g.fillRect(px, 14, TS, 3);
    }
    const win = (x, fy) => {
      const px = x * TS, top = fy - 230;
      g.fillStyle = "#6e5a46"; g.fillRect(px - 26, top - 16, 132, 6);
      const wg = g.createLinearGradient(0, top, 0, top + 110); wg.addColorStop(0, "#14244a"); wg.addColorStop(1, "#4d6ea6");
      g.fillStyle = "#fff"; g.fillRect(px - 6, top - 6, 92, 124); g.fillStyle = wg; g.fillRect(px, top, 80, 112);
      g.fillStyle = "#f6f2dc"; g.beginPath(); g.arc(px + 60, top + 22, 9, 0, 7); g.fill();
      g.fillStyle = "#d9e5f5"; g.beginPath(); g.moveTo(px, top + 112); g.quadraticCurveTo(px + 30, top + 72, px + 80, top + 92); g.lineTo(px + 80, top + 112); g.fill();
      [[14, 96, 26], [40, 92, 34], [66, 98, 22]].forEach(([dx, y, h]) => pineShape(px + dx, top + y, h, "#1e3b4c", "#163040", "#eef4ff"));
      g.fillStyle = "#fff"; for (let i = 0; i < 14; i++) g.fillRect(px + R() * 78, top + R() * 100, 2, 2);
      g.fillStyle = "#fff"; g.fillRect(px + 38, top, 4, 112); g.fillRect(px, top + 54, 80, 4);
      g.fillStyle = "#e8e2d6"; g.fillRect(px - 10, top + 118, 100, 7);
      ["#b5453a", "#3f7f8a", "#8a6bb0"].forEach((col, i) => { if (i !== (x % 3)) return;
        [px - 24, px + 80].forEach(cx => { g.fillStyle = col; g.fillRect(cx, top - 10, 24, 140); g.fillStyle = shade(col, -.25); for (let k = 3; k < 24; k += 7) g.fillRect(cx + k, top - 10, 2, 140); g.fillStyle = shade(col, .2); g.fillRect(cx, top - 10, 24, 4); });
      });
    };
    const frame2 = (px, y, w, h, kind) => {
      g.fillStyle = "#8a6a3a"; g.fillRect(px - 5, y - 5, w + 10, h + 10); g.fillStyle = "#c9a45a"; g.fillRect(px - 3, y - 3, w + 6, h + 6);
      if (kind === 0) { g.fillStyle = "#9fd0ea"; g.fillRect(px, y, w, h); g.fillStyle = "#5fa05a"; g.beginPath(); g.moveTo(px, y + h); g.quadraticCurveTo(px + w * .4, y + h * .3, px + w, y + h * .7); g.lineTo(px + w, y + h); g.fill(); g.fillStyle = "#ffd25e"; g.beginPath(); g.arc(px + w * .75, y + h * .3, 5, 0, 7); g.fill(); }
      else if (kind === 1) {
        g.fillStyle = "#fffdf5"; g.fillRect(px, y, w, h);
        g.strokeStyle = "#c43a3a"; g.lineWidth = 1.5; g.strokeRect(px + w * .3, y + h * .35, w * .4, h * .35); g.beginPath(); g.moveTo(px + w * .25, y + h * .37); g.lineTo(px + w * .5, y + h * .15); g.lineTo(px + w * .75, y + h * .37); g.stroke();
        const cols = ["#e8553f", "#3fb0a3", "#f2a93b", "#b67ad9", "#3d7fd9", "#d9497a", "#4fae55", "#f07d2f", "#27b2d6"];
        cols.forEach((c2, i) => { const sx = px + 4 + i * (w - 8) / 8, sy = y + h - 6; g.strokeStyle = c2; g.beginPath(); g.arc(sx, sy - 9, 2, 0, 7); g.moveTo(sx, sy - 7); g.lineTo(sx, sy - 2); g.moveTo(sx - 2, sy); g.lineTo(sx, sy - 2); g.lineTo(sx + 2, sy); g.stroke(); });
      } else { g.fillStyle = "#34506e"; g.fillRect(px, y, w, h); g.fillStyle = "#e2a34a"; g.beginPath(); g.arc(px + w / 2, y + h / 2, h / 3, 0, 7); g.fill(); g.fillStyle = "#c85a3a"; g.fillRect(px + 4, y + h - 10, w - 8, 6); }
    };
    const lamp = (px, fy) => {
      const cone = g.createLinearGradient(0, 60, 0, fy); cone.addColorStop(0, "rgba(255,226,150,.38)"); cone.addColorStop(1, "rgba(255,226,150,0)");
      g.fillStyle = cone; g.beginPath(); g.moveTo(px - 10, 66); g.lineTo(px + 10, 66); g.lineTo(px + 70, fy); g.lineTo(px - 70, fy); g.fill();
      g.fillStyle = "#333"; g.fillRect(px - 1, 14, 2, 40);
      g.fillStyle = "#2d2d2d"; g.beginPath(); g.moveTo(px - 16, 66); g.lineTo(px + 16, 66); g.lineTo(px + 8, 50); g.lineTo(px - 8, 50); g.fill();
      g.fillStyle = "#fff3c4"; g.beginPath(); g.ellipse(px, 66, 12, 3, 0, 0, 7); g.fill();
    };
    const fixed = L.d.fixedInterior;
    (fixed ? [5, 18, 27, 57, 70, 95, 116, 138] : Array.from({ length: Math.floor(L.w / 13) }, (_, i) => 5 + i * 13)).forEach(x => win(x, groundTop(x) * TS));
    if (fixed) { frame2(12 * TS, 120, 60, 44, 0); frame2(41 * TS, 140, 50, 40, 2); frame2(99 * TS, 120, 80, 56, 1); frame2(122 * TS, 120, 54, 40, 0); frame2(64 * TS, 170, 44, 34, 2); }
    else for (let x = 11, i = 0; x < L.w - 4; x += 26, i++) frame2(x * TS, 120 + (i % 2) * 30, 56, 42, i % 3);
    (fixed ? [9, 24, 36, 47, 62, 80, 101, 112, 127, 142] : Array.from({ length: Math.floor(L.w / 12) }, (_, i) => 9 + i * 12)).forEach(x => lamp(x * TS + 16, groundTop(x) * TS));
    g.font = "600 13px Fredoka, sans-serif"; g.textAlign = "left"; g.textBaseline = "middle";
    (L.d.labels || T([["Level 0", 2], ["Level 1 · wellness", 53], ["Level 2", 93], ["Terrace →", 136]], [["Niveau 0", 2], ["Niveau 1 · wellness", 53], ["Niveau 2", 93], ["Terras →", 136]])).forEach(([t, x]) => {
      const px = x * TS, y = groundTop(x) * TS - 150, w = g.measureText(t).width + 16;
      g.fillStyle = "#8a6a2a"; g.fillRect(px - 2, y - 13, w + 4, 26); g.fillStyle = "#e9c873"; g.fillRect(px, y - 11, w, 22);
      g.fillStyle = "#4a3410"; g.fillText(t, px + 8, y + 1);
    });
  });
  return c;
}

/* ---------- Kleine voorgrond-details op de grond ---------- */
function buildGroundDecor() {
  const list = [], th = L.d.theme;
  if (th === "huis") return list;
  for (let x = 0; x < L.w; x++) for (let y = 1; y < ROWS; y++) {
    if (L.grid[y][x] !== "#" || L.grid[y - 1][x] !== " ") continue;
    const r = hash(x * 13 + y * 7);
    if (r < .45) continue;
    list.push({ x: x * TS + 4 + hash(x) * 22, y: y * TS + 2, k: fl(hash(x * 3.7 + 1) * 6), r });
  }
  return list;
}
function drawGroundDecor(d, th) {
  const x = d.x, y = d.y;
  if (th === "bos") {
    if (d.k === 0 || d.k === 1) { g.fillStyle = "#3f8a35"; for (let i = 0; i < 4; i++) { g.beginPath(); g.moveTo(x + i * 3, y); g.lineTo(x + i * 3 + 1 + Math.sin(frame / 30 + x + i) * 1.2, y - 7 - (i % 2) * 3); g.lineTo(x + i * 3 + 2.5, y); g.fill(); } }
    else if (d.k === 2) { const c = ["#ffffff", "#ffd25e", "#e8553f"][fl(d.r * 30) % 3]; g.fillStyle = "#3f8a35"; g.fillRect(x + 3, y - 8, 1.5, 8); g.fillStyle = c; [[0, -1], [1, 0], [0, 1], [-1, 0]].forEach(([a, b]) => { g.beginPath(); g.arc(x + 3.8 + a * 2.4, y - 9 + b * 2.4, 2, 0, 7); g.fill(); }); g.fillStyle = "#f2b53c"; g.beginPath(); g.arc(x + 3.8, y - 9, 1.5, 0, 7); g.fill(); }
    else if (d.k === 3) { g.fillStyle = OUT; g.fillRect(x + 2, y - 7, 2.5, 7); g.fillStyle = "#f4ead8"; g.fillRect(x + 2.5, y - 7, 1.5, 7); g.fillStyle = OUT; g.beginPath(); g.arc(x + 3.2, y - 7, 5.5, Math.PI, 0); g.fill(); g.fillStyle = "#d8323a"; g.beginPath(); g.arc(x + 3.2, y - 7, 4.5, Math.PI, 0); g.fill(); g.fillStyle = "#fff"; g.fillRect(x + 1, y - 10, 1.5, 1.5); g.fillRect(x + 4.5, y - 9.5, 1.5, 1.5); }
    else if (d.k === 4) { g.fillStyle = "#2a1a10"; g.beginPath(); g.ellipse(x + 5, y - 2, 6.5, 4, 0, Math.PI, 0); g.fill(); g.fillStyle = "#9b958a"; g.beginPath(); g.ellipse(x + 5, y - 2, 5.5, 3, 0, Math.PI, 0); g.fill(); g.fillStyle = "#c8c2b5"; g.fillRect(x + 2, y - 4, 3, 1); }
    else { g.strokeStyle = "#4f9e3c"; g.lineWidth = 1.3; g.beginPath(); g.moveTo(x + 4, y); g.quadraticCurveTo(x - 2, y - 6, x - 3, y - 10); g.moveTo(x + 4, y); g.quadraticCurveTo(x + 10, y - 6, x + 11, y - 10); g.moveTo(x + 4, y); g.lineTo(x + 4, y - 12); g.stroke(); }
  } else {
    if (d.k < 2) { g.fillStyle = "#ffffff"; g.beginPath(); g.ellipse(x + 5, y, 8, 4, 0, Math.PI, 0); g.fill(); g.fillStyle = "#d6e3f4"; g.fillRect(x - 2, y - 1, 14, 1); }
    else if (d.k === 2 && th === "sneeuw") pineShape(x + 4, y, 22, "#1f4152", "#173444", "#f4f8ff", "#0f2230");
    else if (d.k === 3) { g.fillStyle = "#2a6a3a"; g.beginPath(); g.ellipse(x + 2, y - 3, 3.5, 2, .5, 0, 7); g.ellipse(x + 7, y - 3, 3.5, 2, -.5, 0, 7); g.fill(); g.fillStyle = "#d32a2a"; g.beginPath(); g.arc(x + 4.5, y - 4, 1.6, 0, 7); g.arc(x + 6, y - 2.5, 1.6, 0, 7); g.fill(); }
    else if (d.k === 4) { g.strokeStyle = "#8aa3c4"; g.lineWidth = 1.2; for (let i = 0; i < 3; i++) { g.beginPath(); g.moveTo(x + i * 3, y); g.lineTo(x + i * 3 + 1, y - 6 - i); g.stroke(); } }
    else if ((frame + d.x) % 90 < 8) sparkle(x + 4, y - 3, 3, 0);
  }
}

/* ---------- Achtergrond tekenen ---------- */
// Verloopkleuren één keer maken en hergebruiken (ze hangen alleen af van de schermbreedte): scheelt werk per beeld.
const GRADS = {};
let gradsW = 0;
function grad(key, make) {
  if (gradsW !== viewW) { for (const k in GRADS) delete GRADS[k]; gradsW = viewW; }
  return GRADS[key] || (GRADS[key] = make());
}
function drawBackground(theme, camX) {
  const scene = arguments.length > 2 ? arguments[2] : L && L.d.scene;
  if (scene === "pole" || scene === "alps" || scene === "fjord") {
    const Ls = getSceneLayers(scene);
    drawSceneSky(scene);
    drawLayer(Ls.far, camX * .15);
    drawLayer(Ls.mid, camX * .3);
    drawLayer(Ls.near, camX * .5);
    return;
  }
  if (theme === "huis") {
    if (!L.interior) L.interior = buildInterior();
    const sx = Math.max(0, camX), w = Math.min(viewW, L.interior.width - sx);
    g.fillStyle = "#efe3cf"; g.fillRect(0, 0, viewW, VIEW_H);
    if (w > 0) g.drawImage(L.interior, sx, 0, w, VIEW_H, sx - camX, 0, w, VIEW_H);
    return;
  }
  const Ls = getLayers(theme);
  if (theme === "bos") {
    g.fillStyle = grad("sky-bos", () => { const gr = g.createLinearGradient(0, 0, 0, VIEW_H); gr.addColorStop(0, "#3a8ad6"); gr.addColorStop(.6, "#9fd3f0"); gr.addColorStop(1, "#d8f0f6"); return gr; });
    g.fillRect(0, 0, viewW, VIEW_H);
    g.fillStyle = grad("sun", () => { const sun = g.createRadialGradient(viewW * .2, 80, 10, viewW * .2, 80, 120); sun.addColorStop(0, "rgba(255,250,210,1)"); sun.addColorStop(.25, "rgba(255,240,170,.8)"); sun.addColorStop(1, "rgba(255,240,170,0)"); return sun; }); g.fillRect(0, 0, viewW, 260);
    drawLayer(Ls.clouds, camX * .08 + frame * .15);
    drawLayer(Ls.far, camX * .15);
    g.fillStyle = "rgba(220,240,250,.25)"; g.fillRect(0, 250, viewW, 120);
    drawLayer(Ls.mid, camX * .3);
    drawLayer(Ls.near, camX * .5);
    // vogeltjes
    g.strokeStyle = "#2a3a4a"; g.lineWidth = 1.5;
    for (let i = 0; i < 3; i++) { const bx = ((frame * (.6 + i * .2) + i * 400) % (viewW + 200)) - 100, by = 70 + i * 26 + Math.sin(frame / 40 + i) * 6, w = Math.sin(frame / 6 + i) * 3;
      g.beginPath(); g.moveTo(bx - 6, by - w); g.lineTo(bx, by); g.lineTo(bx + 6, by - w); g.stroke(); }
  } else if (theme === "stad") {
    g.fillStyle = grad("sky-stad", () => { const gr = g.createLinearGradient(0, 0, 0, VIEW_H); gr.addColorStop(0, "#142247"); gr.addColorStop(.55, "#4b4f86"); gr.addColorStop(1, "#d9967a"); return gr; }); g.fillRect(0, 0, viewW, VIEW_H);
    g.fillStyle = "#fff"; for (let i = 0; i < 40; i++) { g.globalAlpha = .3 + .5 * Math.abs(Math.sin(frame / 40 + i)); g.fillRect(((hash(i * 3) * 3000 - camX * .04) % viewW + viewW) % viewW, hash(i * 7) * 160, 2, 2); } g.globalAlpha = 1;
    drawLayer(Ls.far, camX * .15);
    g.fillStyle = "rgba(230,170,150,.18)"; g.fillRect(0, 250, viewW, 120);
    drawLayer(Ls.mid, camX * .3);
    drawLayer(Ls.near, camX * .5);
  } else {
    g.fillStyle = grad("sky-sneeuw", () => { const gr = g.createLinearGradient(0, 0, 0, VIEW_H); gr.addColorStop(0, "#081230"); gr.addColorStop(.7, "#2a4a82"); gr.addColorStop(1, "#4a6fa8"); return gr; }); g.fillRect(0, 0, viewW, VIEW_H);
    g.fillStyle = "#fff";
    for (let i = 0; i < 90; i++) {
      const tw = .4 + .6 * Math.abs(Math.sin(frame / (30 + i % 17) + i));
      g.globalAlpha = tw * (.3 + hash(i) * .7);
      const sx = ((hash(i * 3) * 3000 - camX * .04) % viewW + viewW) % viewW; const s = hash(i * 5) > .9 ? 3 : 2;
      g.fillRect(sx, hash(i * 7) * 250, s, s);
    }
    g.globalAlpha = 1;
    const mx = viewW * .8;
    g.fillStyle = grad("moon", () => { const mg = g.createRadialGradient(mx, 90, 20, mx, 90, 110); mg.addColorStop(0, "rgba(255,250,220,.35)"); mg.addColorStop(1, "rgba(255,250,220,0)"); return mg; }); g.fillRect(mx - 110, 0, 220, 220);
    g.fillStyle = "#f7f3dc"; g.beginPath(); g.arc(mx, 90, 28, 0, 7); g.fill();
    g.fillStyle = "#e3dcc0"; [[-8, -6, 6], [9, 7, 4], [4, -12, 3]].forEach(([dx, dy, r]) => { g.beginPath(); g.arc(mx + dx, 90 + dy, r, 0, 7); g.fill(); });
    drawLayer(Ls.far, camX * .15);
    g.fillStyle = "rgba(160,190,230,.18)"; g.fillRect(0, 260, viewW, 120);
    drawLayer(Ls.mid, camX * .3);
    drawLayer(Ls.near, camX * .5);
  }
}

/* ---------- Tegels ---------- */
function tile(T, tex, px, py) { g.drawImage(T.atlas, T.at.get(tex), 1, TS, TS, px, py, TS, TS); }
function drawTile(c, px, py, theme, tx, ty, T) {
  if (c === "#") {
    const top = cell(tx, ty - 1) !== "#" && cell(tx, ty - 1) !== "S";
    const v = fl(hash(tx * 31 + ty * 17) * 4);
    tile(T, top ? T.top[v] : T.fill[v], px, py);
    const pe = PAL[theme].edge;
    if (cell(tx - 1, ty) !== "#") { g.fillStyle = pe; g.fillRect(px, py, 2, TS); if (top && theme !== "huis") { g.fillStyle = theme === "bos" ? "#4f9e3c" : "#f4f8ff"; g.fillRect(px - 3, py + 2, 5, 8); g.fillStyle = pe; g.fillRect(px - 3, py + 10, 5, 2); g.fillRect(px - 5, py + 2, 2, 8); } }
    if (cell(tx + 1, ty) !== "#") { g.fillStyle = pe; g.fillRect(px + TS - 2, py, 2, TS); if (top && theme !== "huis") { g.fillStyle = theme === "bos" ? "#4f9e3c" : "#f4f8ff"; g.fillRect(px + TS - 2, py + 2, 5, 8); g.fillStyle = pe; g.fillRect(px + TS - 2, py + 10, 5, 2); g.fillRect(px + TS + 3, py + 2, 2, 8); } }
  } else if (c === "=") tile(T, T.plat, px, py);
  else if (c === "S") tile(T, T.block, px, py);
  else if (c === "^") tile(T, T.spike, px, py);
}

/* ---------- Hek (opdracht) en codedeur ---------- */
function drawGates(theme) {
  g.lineJoin = "round"; g.lineCap = "round";
  if (L.gateFade > 0) {
    const [gx, y1, y2] = L.d.gate, px = gx * TS, top = y1 * TS, bot = (y2 + 1) * TS;
    g.globalAlpha = L.gateFade;
    if (theme === "huis") {
      g.fillStyle = "#e8e0d2"; g.fillRect(px - 6, top, TS + 12, bot - top);
      g.fillStyle = "#cfc4b2"; g.fillRect(px - 6, top, 3, bot - top); g.fillRect(px + TS + 3, top, 3, bot - top);
      g.fillStyle = "#6b5a46"; g.fillRect(px - 4, bot - 78, TS + 8, 78);
      g.fillStyle = "#f6f2ea"; g.fillRect(px, bot - 74, TS, 74); g.strokeStyle = "#cfc4b2"; g.lineWidth = 2; g.strokeRect(px + 5, bot - 68, TS - 10, 28); g.strokeRect(px + 5, bot - 34, TS - 10, 28);
      g.fillStyle = "#c9a34a"; g.beginPath(); g.arc(px + TS - 7, bot - 38, 2.5, 0, 7); g.fill();
      sign2(px - 14, bot - 120, 60, 26, "#fff", L.d.fixedInterior ? "🛁 Privé" : `${L.d.questHud} eerst!`, "#2a4a6a");
    } else {
      const wood = theme === "bos" ? "#8a5a32" : "#6e4e34", woodL = theme === "bos" ? "#b07a44" : "#8f6a48";
      g.strokeStyle = OUT; g.lineWidth = 2;
      for (const x of [px - 2, px + TS - 8]) { g.fillStyle = wood; g.fillRect(x, top - 10, 10, bot - top + 10); g.strokeRect(x, top - 10, 10, bot - top + 10); g.fillStyle = woodL; g.fillRect(x + 2, top - 8, 3, bot - top + 6); }
      for (let y = top + 10; y < bot - 10; y += 34) { g.fillStyle = woodL; g.fillRect(px - 6, y, TS + 12, 9); g.strokeRect(px - 6, y, TS + 12, 9); }
      g.strokeStyle = wood; g.lineWidth = 6; g.beginPath(); g.moveTo(px, bot - 12); g.lineTo(px + TS, top + 14); g.stroke();
      if (theme === "sneeuw") { g.fillStyle = "#f4f8ff"; g.fillRect(px - 4, top - 14, 14, 5); g.fillRect(px + TS - 10, top - 14, 14, 5); for (let y = top + 10; y < bot - 10; y += 34) g.fillRect(px - 6, y - 3, TS + 12, 4); }
      sign2(px - 18, bot - 120, 68, 28, "#f4e2b8", `${L.d.questHud} eerst!`, "#4a2a10");
    }
    g.globalAlpha = 1;
  }
  if (L.codeFade > 0) {
    const c = L.d.code, px = c.x * TS, top = c.y1 * TS, bot = (c.y2 + 1) * TS;
    g.globalAlpha = L.codeFade;
    g.strokeStyle = OUT; g.lineWidth = 2;
    if (theme === "huis") {
      g.fillStyle = "#e8e0d2"; g.fillRect(px - 6, top, TS + 12, bot - top);
      g.fillStyle = "#5a3e28"; g.fillRect(px - 2, bot - 80, TS + 4, 80); g.fillStyle = "#7a5638"; g.fillRect(px + 2, bot - 76, TS - 4, 76);
      g.fillStyle = "#5a3e28"; for (let i = 0; i < 3; i++) g.fillRect(px + 2, bot - 70 + i * 24, TS - 4, 2);
    } else {
      g.fillStyle = "#3a4250"; g.fillRect(px - 4, top - 6, 8, bot - top + 6); g.fillRect(px + TS - 4, top - 6, 8, bot - top + 6);
      g.strokeRect(px - 4, top - 6, 8, bot - top + 6); g.strokeRect(px + TS - 4, top - 6, 8, bot - top + 6);
      g.fillStyle = "#4b5566"; for (let i = 0; i < 3; i++) { const x = px + 6 + i * 8; g.fillRect(x, top, 4, bot - top); g.beginPath(); g.moveTo(x - 2, top); g.lineTo(x + 2, top - 10); g.lineTo(x + 6, top); g.fill(); }
      g.fillStyle = "#5f6b7e"; for (let y = top + 20; y < bot; y += 60) { g.fillRect(px - 4, y, TS + 8, 6); g.strokeRect(px - 4, y, TS + 8, 6); }
      if (theme === "sneeuw") { g.fillStyle = "#f4f8ff"; for (let y = top + 20; y < bot; y += 60) g.fillRect(px - 4, y - 3, TS + 8, 3); }
    }
    emoji("🔒", px + 16, bot - 46, 20);
    g.globalAlpha = 1;
  }
}
function sign2(x, y, w, h, bg, text, fg) {
  g.fillStyle = OUT; g.fillRect(x - 2, y - 2, w + 4, h + 4); g.fillStyle = bg; g.fillRect(x, y, w, h);
  g.fillStyle = "rgba(0,0,0,.08)"; g.fillRect(x, y + h - 4, w, 4);
  g.fillStyle = fg; g.font = "700 12px Fredoka, sans-serif"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(text, x + w / 2, y + h / 2 + 1);
}

/* ---------- Decoratie ---------- */
function drawDeco(kind, x, theme) {
  const by = groundTop(x) * TS, px = x * TS;
  g.lineJoin = "round"; g.lineCap = "round"; g.strokeStyle = OUT; g.lineWidth = 2;
  const H = hash(x * 5.3);
  if (kind === "candycane") {
    // a candy-cane pole, red and white
    g.lineWidth = 9; g.strokeStyle = OUT; g.beginPath(); g.moveTo(px + 16, by); g.lineTo(px + 16, by - 64); g.arc(px + 26, by - 64, 10, Math.PI, 0); g.stroke();
    g.lineWidth = 6; g.strokeStyle = "#f8f4ec"; g.stroke();
    g.strokeStyle = "#d8232a"; g.lineWidth = 6; g.setLineDash([6, 6]); g.stroke(); g.setLineDash([]);
    g.lineWidth = 2; g.strokeStyle = OUT;
  } else if (kind === "presents") {
    shadowAt(px + 22, by, 26);
    [[0, 22, 20, "#d8232a", "#ffd25e"], [24, 18, 16, "#2a9a4a", "#ffffff"], [8, 14, 14, "#1e5aa8", "#ff9b45"]].forEach(([dx, w, h, c, rib], i) => {
      const yy = by - h - (i === 2 ? 20 : 0);
      g.fillStyle = c; g.fillRect(px + dx, yy, w, h); g.strokeRect(px + dx, yy, w, h);
      g.fillStyle = rib; g.fillRect(px + dx + w / 2 - 2, yy, 4, h); g.fillRect(px + dx, yy + h / 2 - 2, w, 4);
      g.beginPath(); g.ellipse(px + dx + w / 2 - 4, yy - 2, 4, 2.5, -.4, 0, 7); g.ellipse(px + dx + w / 2 + 4, yy - 2, 4, 2.5, .4, 0, 7); g.fill();
    });
  } else if (kind === "igloo") {
    shadowAt(px + 30, by, 40);
    g.fillStyle = "#f4f8ff"; g.beginPath(); g.arc(px + 30, by, 38, Math.PI, 0); g.closePath(); g.fill(); g.stroke();
    g.strokeStyle = "#b9cde6"; g.lineWidth = 1.5;
    for (let r = 1; r < 4; r++) { const yy = by - r * 10; const hw = Math.sqrt(38 * 38 - (r * 10) ** 2); g.beginPath(); g.moveTo(px + 30 - hw, yy); g.lineTo(px + 30 + hw, yy); g.stroke(); }
    g.strokeStyle = OUT; g.lineWidth = 2;
    g.fillStyle = "#24324a"; g.beginPath(); g.arc(px + 52, by, 12, Math.PI, 0); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = "rgba(255,210,120,.5)"; g.beginPath(); g.arc(px + 52, by, 8, Math.PI, 0); g.fill();
  } else if (kind === "sleigh") {
    shadowAt(px + 30, by, 40);
    g.strokeStyle = "#e8c45a"; g.lineWidth = 3; g.beginPath(); g.moveTo(px - 4, by - 3); g.lineTo(px + 58, by - 3); g.quadraticCurveTo(px + 70, by - 3, px + 66, by - 14); g.stroke();
    g.strokeStyle = OUT; g.lineWidth = 2;
    g.fillStyle = "#b8232a"; g.beginPath(); g.moveTo(px, by - 10); g.lineTo(px + 52, by - 10); g.quadraticCurveTo(px + 62, by - 22, px + 56, by - 38); g.lineTo(px + 44, by - 30); g.lineTo(px + 8, by - 30); g.quadraticCurveTo(px - 4, by - 40, px, by - 10); g.fill(); g.stroke();
    g.fillStyle = "#e8c45a"; g.fillRect(px + 6, by - 22, 42, 3);
    [["#2a9a4a", 10], ["#1e5aa8", 24], ["#ffd25e", 36]].forEach(([c, dx]) => { g.fillStyle = c; g.fillRect(px + dx, by - 42, 12, 12); g.strokeRect(px + dx, by - 42, 12, 12); });
  } else if (kind === "chalet") {
    // an Alpine chalet: wooden walls, a wide snowy roof and a balcony
    shadowAt(px + 50, by, 60);
    g.fillStyle = "#f1ece0"; g.fillRect(px, by - 44, 100, 44); g.strokeRect(px, by - 44, 100, 44);
    g.fillStyle = "#8a5a34"; g.fillRect(px, by - 96, 100, 52); g.strokeRect(px, by - 96, 100, 52);
    g.fillStyle = "#6e4426"; for (let yy = by - 90; yy < by - 44; yy += 8) g.fillRect(px, yy, 100, 1.5);
    g.fillStyle = "#4a2f22"; g.beginPath(); g.moveTo(px - 16, by - 92); g.lineTo(px + 50, by - 132); g.lineTo(px + 116, by - 92); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = "#f4f8ff"; g.beginPath(); g.moveTo(px - 16, by - 92); g.lineTo(px + 50, by - 132); g.lineTo(px + 116, by - 92); g.lineTo(px + 106, by - 96); g.lineTo(px + 50, by - 126); g.lineTo(px - 6, by - 96); g.closePath(); g.fill();
    g.fillStyle = "#5a3a22"; g.fillRect(px - 4, by - 58, 108, 5); for (let xx = px; xx < px + 100; xx += 8) g.fillRect(xx, by - 70, 3, 12); g.fillRect(px - 4, by - 72, 108, 3);
    g.fillStyle = "#d8423a"; for (let xx = px + 6; xx < px + 96; xx += 14) { g.beginPath(); g.arc(xx, by - 74, 3, 0, 7); g.fill(); }
    [[px + 12, by - 36], [px + 70, by - 36], [px + 20, by - 88], [px + 62, by - 88]].forEach(([wx, wy]) => { g.fillStyle = "#ffd88a"; g.fillRect(wx, wy, 18, 14); g.strokeRect(wx, wy, 18, 14); g.fillStyle = "#3a5a2a"; g.fillRect(wx - 5, wy, 4, 14); g.fillRect(wx + 19, wy, 4, 14); });
    g.fillStyle = "#6e4426"; g.fillRect(px + 40, by - 30, 18, 30); g.strokeRect(px + 40, by - 30, 18, 30);
  } else if (kind === "skis") {
    // skis and poles stuck in the snow
    [[0, "#d8423a"], [9, "#1e5aa8"]].forEach(([dx, c]) => { g.fillStyle = c; g.save(); g.translate(px + 12 + dx, by); g.rotate(-.08 + dx * .012); g.beginPath(); rp(-3, -62, 6, 62, 3); g.fill(); g.stroke(); g.restore(); });
    g.strokeStyle = "#3a3f4b"; g.lineWidth = 2; [[30, .12], [36, .2]].forEach(([dx, a]) => { g.beginPath(); g.moveTo(px + dx, by); g.lineTo(px + dx + Math.sin(a) * 56, by - 56); g.stroke(); });
    g.strokeStyle = OUT; g.fillStyle = "#f4f8ff"; g.beginPath(); g.ellipse(px + 22, by - 2, 22, 4, 0, 0, 7); g.fill();
  } else if (kind === "rorbu") {
    // a red Norwegian cabin with a turf roof under the snow
    shadowAt(px + 44, by, 52);
    g.fillStyle = "#b2322a"; g.fillRect(px, by - 54, 88, 54); g.strokeRect(px, by - 54, 88, 54);
    g.fillStyle = "#952820"; for (let xx = px + 6; xx < px + 88; xx += 8) g.fillRect(xx, by - 54, 1.5, 54);
    g.fillStyle = "#4a3a2a"; g.beginPath(); g.moveTo(px - 10, by - 50); g.lineTo(px + 44, by - 82); g.lineTo(px + 98, by - 50); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = "#f4f8ff"; g.beginPath(); g.moveTo(px - 10, by - 50); g.lineTo(px + 44, by - 82); g.lineTo(px + 98, by - 50); g.lineTo(px + 90, by - 54); g.lineTo(px + 44, by - 76); g.lineTo(px - 2, by - 54); g.closePath(); g.fill();
    [[px + 10, by - 40], [px + 62, by - 40]].forEach(([wx, wy]) => { g.fillStyle = "#f8f4ec"; g.fillRect(wx - 2, wy - 2, 20, 18); g.fillStyle = "#ffd27a"; g.fillRect(wx, wy, 16, 14); g.strokeRect(wx, wy, 16, 14); g.fillStyle = "#f8f4ec"; g.fillRect(wx + 7, wy, 2, 14); g.fillRect(wx, wy + 6, 16, 2); });
    g.fillStyle = "#f8f4ec"; g.fillRect(px + 34, by - 32, 20, 32); g.fillStyle = "#3a5a7a"; g.fillRect(px + 36, by - 30, 16, 30); g.strokeRect(px + 34, by - 32, 20, 32);
    g.fillStyle = "#ffe08a"; star(px + 44, by - 62, 6);
  } else if (kind === "kicksled") {
    // a Norwegian kicksled: a little chair on long runners
    g.strokeStyle = "#3a3f4b"; g.lineWidth = 2.5; g.beginPath(); g.moveTo(px - 6, by - 2); g.lineTo(px + 52, by - 2); g.quadraticCurveTo(px + 60, by - 2, px + 58, by - 8); g.stroke();
    g.beginPath(); g.moveTo(px + 6, by - 2); g.lineTo(px + 6, by - 46); g.lineTo(px + 14, by - 52); g.moveTo(px + 30, by - 2); g.lineTo(px + 30, by - 20); g.stroke();
    g.strokeStyle = OUT; g.lineWidth = 2; g.fillStyle = "#b2322a"; g.fillRect(px + 6, by - 24, 26, 5); g.strokeRect(px + 6, by - 24, 26, 5); g.fillRect(px + 6, by - 40, 5, 18); g.strokeRect(px + 6, by - 40, 5, 18);
  } else if (kind === "stave") {
    // a stave church: dark wood, stacked roofs and dragon heads
    const w = 120, top = by - 120;
    shadowAt(px + w / 2, by, 70);
    g.fillStyle = "#4a3020"; g.fillRect(px, top + 40, w, 80); g.strokeRect(px, top + 40, w, 80);
    g.fillStyle = "#3a2418"; for (let xx = px + 6; xx < px + w; xx += 9) g.fillRect(xx, top + 40, 2, 80);
    [[0, 40, 1], [16, 10, .75], [34, -18, .45]].forEach(([inset, y, s]) => {
      g.fillStyle = "#2e1e14"; g.beginPath(); g.moveTo(px + inset - 10, top + y + 6); g.lineTo(px + w / 2, top + y - 34 * s); g.lineTo(px + w - inset + 10, top + y + 6); g.closePath(); g.fill(); g.stroke();
      g.fillStyle = "#f4f8ff"; g.beginPath(); g.moveTo(px + inset - 10, top + y + 6); g.lineTo(px + w / 2, top + y - 34 * s); g.lineTo(px + w - inset + 10, top + y + 6); g.lineTo(px + w / 2, top + y - 26 * s); g.closePath(); g.fill();
    });
    g.strokeStyle = "#2e1e14"; g.lineWidth = 3; [[px + 24, top + 2, -1], [px + w - 24, top + 2, 1]].forEach(([dx, dy, d]) => { g.beginPath(); g.moveTo(dx, dy + 10); g.quadraticCurveTo(dx + d * 6, dy - 4, dx + d * 14, dy - 2); g.stroke(); });
    g.strokeStyle = OUT; g.lineWidth = 2;
    g.fillStyle = "#ffd88a"; g.beginPath(); rp(px + w / 2 - 12, by - 40, 24, 40, 10); g.fill(); g.stroke();
  } else if (kind === "tree") {
    shadowAt(px + 16, by, 26);
    g.fillStyle = "#4a2e18"; g.beginPath(); g.moveTo(px + 9, by); g.lineTo(px + 13, by - 70); g.lineTo(px + 20, by - 70); g.lineTo(px + 24, by); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = "#6b4426"; g.fillRect(px + 15, by - 60, 3, 56);
    g.strokeStyle = "#4a2e18"; g.lineWidth = 4; g.beginPath(); g.moveTo(px + 16, by - 55); g.lineTo(px - 4, by - 80); g.moveTo(px + 17, by - 60); g.lineTo(px + 38, by - 86); g.stroke();
    const cols = H < .5 ? ["#e0862e", "#f2b53c", "#c9562b"] : ["#d24a2a", "#e98a2e", "#f4c44a"];
    const bl = [[16, -100, 30], [-6, -84, 22], [38, -88, 22], [2, -118, 22], [30, -116, 22], [16, -76, 20]];
    g.fillStyle = OUT; bl.forEach(([dx, dy, r]) => { g.beginPath(); g.arc(px + dx, by + dy, r + 2.5, 0, 7); g.fill(); });
    bl.forEach(([dx, dy, r], i) => { g.fillStyle = cols[i % 3]; g.beginPath(); g.arc(px + dx, by + dy, r, 0, 7); g.fill(); });
    g.fillStyle = "rgba(255,255,255,.22)"; bl.forEach(([dx, dy, r]) => { g.beginPath(); g.arc(px + dx - r * .3, by + dy - r * .35, r * .35, 0, 7); g.fill(); });
    g.fillStyle = "rgba(90,30,10,.25)"; bl.forEach(([dx, dy, r]) => { g.beginPath(); g.arc(px + dx + r * .3, by + dy + r * .4, r * .4, 0, 7); g.fill(); });
  } else if (kind === "pine") {
    shadowAt(px + 16, by, 22);
    pineShape(px + 16, by, 110 + H * 30, "#24543f", "#1b4332", theme === "sneeuw" ? "#f4f8ff" : null, OUT);
  } else if (kind === "saab93") { drawSaab("93", px, by);
  } else if (kind === "saab900") { drawSaab("900", px, by);
  } else if (kind === "saab96") { drawSaab("96", px, by);
  } else if (kind === "legoset") {
    // Lego voor de jarige: een torentje, "44" van steentjes en een Saab van Lego
    g.fillStyle = "#2a9a4a"; g.fillRect(px - 4, by - 6, 120, 6); g.strokeRect(px - 4, by - 6, 120, 6);
    for (let r = 0; r < 7; r++) drawLegoBrick(px + 10, by - 12 - r * 11, LEGO_COLS[r % LEGO_COLS.length]);
    const four = [[0, 0], [0, 1], [0, 2], [1, 2], [2, 0], [2, 1], [2, 2], [2, 3], [2, 4]];
    [32, 62].forEach(ox => four.forEach(([c, r]) => drawLegoBrick(px + ox + c * 9, by - 56 + r * 10, "#d8232a", 9)));
    g.save(); g.translate(px + 92, by - 6); g.scale(.22, .22); drawSaab("900", -72, 0, { tree: false, color: "#d8232a" }); g.restore();
  } else if (kind === "stall") {
    // kerstmarktkraam
    const names = T(["Mulled wine", "Waffles", "Chips", "Baubles", "Chocolate", "Pretzels"], ["Glühwein", "Wafels", "Frieten", "Kerstballen", "Chocolade", "Krakelingen"]), name = names[Math.floor(H * names.length)];
    shadowAt(px + 48, by, 50);
    g.fillStyle = "#7a4a26"; g.fillRect(px, by - 70, 96, 70); g.strokeRect(px, by - 70, 96, 70);
    g.fillStyle = "#6b3f20"; for (let x = px + 8; x < px + 96; x += 12) g.fillRect(x, by - 70, 2, 70);
    const warm = g.createLinearGradient(0, by - 56, 0, by - 26); warm.addColorStop(0, "#ffd88a"); warm.addColorStop(1, "#f0a050");
    g.fillStyle = warm; g.fillRect(px + 8, by - 56, 80, 28); g.strokeRect(px + 8, by - 56, 80, 28);
    g.fillStyle = "#5a3416"; g.fillRect(px + 4, by - 30, 88, 6); g.strokeRect(px + 4, by - 30, 88, 6);
    for (let i = 0; i < 5; i++) { g.fillStyle = ["#c43a3a", "#fff", "#e8b44a", "#59c28a", "#fff"][i]; g.beginPath(); g.arc(px + 18 + i * 15, by - 36, 4, 0, 7); g.fill(); }
    g.fillStyle = "#3a2010"; g.beginPath(); g.moveTo(px - 10, by - 68); g.lineTo(px + 48, by - 104); g.lineTo(px + 106, by - 68); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = "#f4f8ff"; g.beginPath(); g.moveTo(px - 10, by - 68); g.lineTo(px + 48, by - 104); g.lineTo(px + 106, by - 68); g.lineTo(px + 96, by - 72); g.lineTo(px + 48, by - 98); g.lineTo(px, by - 72); g.closePath(); g.fill();
    for (let i = 0; i < 9; i++) { const t = i / 8; g.fillStyle = (Math.floor(frame / 18) + i) % 2 ? "#ffe08a" : "#ff8a6a"; g.beginPath(); g.arc(px - 6 + t * 108, by - 66 - Math.sin(t * Math.PI) * 30, 2.4, 0, 7); g.fill(); }
    sign2(px + 10, by - 92, 76, 16, "#f4e2b8", name, "#4a2a10");
  } else if (kind === "xtree") {
    shadowAt(px + 16, by, 40);
    pineShape(px + 16, by, 170, "#1f5a3a", "#174a2f", "#f4f8ff", OUT);
    for (let i = 0; i < 22; i++) { g.fillStyle = (Math.floor(frame / 15) + i) % 3 ? "#ffd25e" : "#ff6b6b"; const t = hash(i * 9 + x); g.beginPath(); g.arc(px + 16 + (hash(i + x) - .5) * 70 * (1 - t), by - 26 - t * 120, 2.6, 0, 7); g.fill(); }
    g.fillStyle = "#ffe066"; star(px + 16, by - 168, 11);
  } else if (kind === "streetlamp") {
    const lg = g.createRadialGradient(px + 16, by - 96, 2, px + 16, by - 96, 60); lg.addColorStop(0, "rgba(255,226,150,.55)"); lg.addColorStop(1, "rgba(255,226,150,0)");
    g.fillStyle = lg; g.fillRect(px - 44, by - 156, 120, 120);
    g.fillStyle = "#1e1e24"; g.fillRect(px + 13, by - 90, 6, 90); g.fillRect(px + 8, by - 6, 16, 6);
    g.beginPath(); g.moveTo(px + 6, by - 90); g.lineTo(px + 26, by - 90); g.lineTo(px + 22, by - 108); g.lineTo(px + 10, by - 108); g.closePath(); g.fill();
    g.fillStyle = "#ffe8a8"; g.fillRect(px + 11, by - 104, 10, 12);
    g.fillStyle = "#1e1e24"; g.beginPath(); g.moveTo(px + 8, by - 108); g.lineTo(px + 16, by - 116); g.lineTo(px + 24, by - 108); g.fill();
    g.fillStyle = "#f4f8ff"; g.fillRect(px + 9, by - 112, 14, 3);
  } else if (kind === "church") {
    // een stenen kerk; de deur staat open en binnen is het warm
    const w = 176, top = by - 196;
    g.fillStyle = "#b9ae9a"; g.fillRect(px, top, w, 196); g.strokeRect(px, top, w, 196);
    g.fillStyle = "#a89d88"; for (let y = top + 12; y < by; y += 16) for (let xx = px + ((y / 16) % 2) * 12; xx < px + w; xx += 24) g.fillRect(xx, y, 22, 1.5);
    g.fillStyle = "#b9ae9a"; g.beginPath(); g.moveTo(px - 8, top); g.lineTo(px + w / 2, top - 50); g.lineTo(px + w + 8, top); g.closePath(); g.fill(); g.stroke();
    g.fillRect(px + w / 2 - 16, top - 96, 32, 56); g.strokeRect(px + w / 2 - 16, top - 96, 32, 56);
    g.fillStyle = "#4f5f5a"; g.beginPath(); g.moveTo(px + w / 2 - 20, top - 96); g.lineTo(px + w / 2, top - 150); g.lineTo(px + w / 2 + 20, top - 96); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = "#e8c45a"; g.fillRect(px + w / 2 - 1, top - 164, 2, 14); g.fillRect(px + w / 2 - 5, top - 160, 10, 2);
    g.fillStyle = "#f4f8ff"; g.beginPath(); g.moveTo(px - 8, top); g.lineTo(px + w / 2, top - 50); g.lineTo(px + w / 2, top - 43); g.lineTo(px, top + 2); g.closePath(); g.fill();
    // roosvenster en ramen met warm licht
    const glow = (x, y, ww, hh) => { g.fillStyle = "#5a3a2a"; g.beginPath(); g.moveTo(x, y + hh); g.lineTo(x, y + ww / 2); g.arc(x + ww / 2, y + ww / 2, ww / 2, Math.PI, 0); g.lineTo(x + ww, y + hh); g.closePath(); g.fill(); g.stroke(); const gg = g.createLinearGradient(0, y, 0, y + hh); gg.addColorStop(0, "#ffd88a"); gg.addColorStop(1, "#e88a4a"); g.fillStyle = gg; g.beginPath(); g.moveTo(x + 3, y + hh - 3); g.lineTo(x + 3, y + ww / 2); g.arc(x + ww / 2, y + ww / 2, ww / 2 - 3, Math.PI, 0); g.lineTo(x + ww - 3, y + hh - 3); g.closePath(); g.fill(); };
    glow(px + 20, top + 40, 30, 60); glow(px + w - 50, top + 40, 30, 60);
    g.fillStyle = "#5a3a2a"; g.beginPath(); g.arc(px + w / 2, top + 40, 22, 0, 7); g.fill(); g.stroke();
    for (let i = 0; i < 8; i++) { g.fillStyle = ["#e85a5a", "#5aa8ff", "#ffd25e", "#59c28a"][i % 4]; g.beginPath(); g.moveTo(px + w / 2, top + 40); g.arc(px + w / 2, top + 40, 18, i * Math.PI / 4, (i + 1) * Math.PI / 4); g.closePath(); g.fill(); }
    g.fillStyle = "#ffe8a8"; g.beginPath(); g.arc(px + w / 2, top + 40, 5, 0, 7); g.fill();
    glow(px + w / 2 - 30, by - 96, 60, 96);
  } else if (kind === "deer") {
    shadowAt(px + 16, by, 16);
    g.fillStyle = "#9a6a3e"; [[4, 0], [8, 1], [22, 0], [26, 1]].forEach(([dx]) => { g.fillRect(px + dx, by - 16, 3, 16); });
    g.beginPath(); g.ellipse(px + 16, by - 20, 15, 8, 0, 0, 7); g.fill(); g.stroke();
    g.fillStyle = "#f4e6d0"; g.beginPath(); g.ellipse(px + 3, by - 20, 3, 4, 0, 0, 7); g.fill();
    g.fillStyle = "#9a6a3e"; g.beginPath(); g.moveTo(px + 24, by - 24); g.lineTo(px + 30, by - 38); g.lineTo(px + 34, by - 36); g.lineTo(px + 30, by - 22); g.fill(); g.stroke();
    g.beginPath(); g.ellipse(px + 34, by - 38, 6, 4.5, .3, 0, 7); g.fill(); g.stroke();
    g.fillStyle = "#1e1622"; g.fillRect(px + 35, by - 40, 2, 2); g.fillRect(px + 39, by - 37, 2, 2);
    g.strokeStyle = "#e9d7b4"; g.lineWidth = 2; g.beginPath(); g.moveTo(px + 32, by - 42); g.lineTo(px + 28, by - 54); g.lineTo(px + 24, by - 58); g.moveTo(px + 29, by - 50); g.lineTo(px + 34, by - 56); g.moveTo(px + 35, by - 42); g.lineTo(px + 38, by - 54); g.lineTo(px + 42, by - 58); g.stroke();
    if (theme === "sneeuw") { g.fillStyle = "#f4f8ff"; g.beginPath(); g.ellipse(px + 16, by - 27, 10, 2.5, 0, 0, 7); g.fill(); }
  } else if (kind === "bench") {
    g.fillStyle = "#6b4528"; [[px, by - 20, 46, 6], [px + 2, by - 14, 5, 14], [px + 39, by - 14, 5, 14], [px, by - 34, 46, 6], [px + 4, by - 30, 4, 10], [px + 38, by - 30, 4, 10]].forEach(r => { g.fillRect(...r); g.strokeRect(...r); });
    g.fillStyle = "#fff"; g.fillRect(px, by - 24, 46, 4); g.fillRect(px, by - 38, 46, 4);
  } else if (kind === "sofa") {
    shadowAt(px + 40, by, 42);
    g.fillStyle = "#4f6280"; g.beginPath(); rp(px, by - 40, 84, 28, 8); g.fill(); g.stroke();
    g.fillStyle = "#5f7496"; g.beginPath(); rp(px - 4, by - 26, 92, 22, 6); g.fill(); g.stroke();
    g.fillStyle = "#71879f"; [[px + 6, by - 36], [px + 44, by - 36]].forEach(([x, y]) => { g.beginPath(); rp(x, y, 34, 14, 5); g.fill(); g.stroke(); });
    g.fillStyle = "#f2a93b"; g.beginPath(); rp(px + 2, by - 44, 16, 16, 4); g.fill(); g.stroke();
    g.fillStyle = "#4a3020"; g.fillRect(px + 2, by - 4, 5, 4); g.fillRect(px + 77, by - 4, 5, 4);
  } else if (kind === "lamp") {
    g.fillStyle = "#333"; g.fillRect(px + 15, by - 86, 3, 82); g.fillRect(px + 6, by - 4, 21, 4);
    const lg = g.createRadialGradient(px + 16, by - 88, 2, px + 16, by - 88, 50); lg.addColorStop(0, "rgba(255,230,160,.6)"); lg.addColorStop(1, "rgba(255,230,160,0)");
    g.fillStyle = lg; g.fillRect(px - 34, by - 138, 100, 100);
    g.fillStyle = "#ffe7a8"; g.beginPath(); g.moveTo(px + 2, by - 84); g.lineTo(px + 30, by - 84); g.lineTo(px + 23, by - 104); g.lineTo(px + 9, by - 104); g.closePath(); g.fill(); g.stroke();
  } else if (kind === "table") {
    shadowAt(px + 56, by, 60);
    g.fillStyle = "#5a3e28"; g.fillRect(px, by - 36, 112, 8); g.strokeRect(px, by - 36, 112, 8); g.fillRect(px + 8, by - 28, 6, 28); g.fillRect(px + 98, by - 28, 6, 28);
    [px - 14, px + 120].forEach(cx => { g.fillStyle = "#3a3a3a"; g.fillRect(cx, by - 46, 4, 46); g.fillRect(cx, by - 22, 14, 4); g.fillRect(cx + 10, by - 22, 4, 22); });
    g.fillStyle = "#fff"; g.beginPath(); g.ellipse(px + 30, by - 38, 10, 3, 0, 0, 7); g.ellipse(px + 80, by - 38, 10, 3, 0, 0, 7); g.fill();
    g.fillStyle = "#e9e3d6"; g.fillRect(px + 52, by - 52, 8, 14); g.fillStyle = "#ffd25e"; g.beginPath(); g.ellipse(px + 56, by - 56 + Math.sin(frame / 8), 2, 4, 0, 0, 7); g.fill();
  } else if (kind === "stove") {
    g.fillStyle = "#1e1e22"; g.beginPath(); rp(px, by - 62, 54, 62, 4); g.fill(); g.stroke();
    g.fillStyle = "#3a3a40"; g.fillRect(px + 4, by - 58, 46, 6); g.fillRect(px + 22, by - 110, 10, 48);
    const fg2 = g.createLinearGradient(0, by - 44, 0, by - 12); fg2.addColorStop(0, "#ffd25e"); fg2.addColorStop(1, "#ff5a2a");
    g.fillStyle = "#120a08"; g.fillRect(px + 8, by - 46, 38, 34);
    for (let i = 0; i < 5; i++) { g.fillStyle = fg2; const h = 14 + Math.abs(Math.sin(frame / 7 + i * 1.3)) * 12; g.beginPath(); g.moveTo(px + 10 + i * 7, by - 13); g.quadraticCurveTo(px + 13 + i * 7, by - 13 - h, px + 16 + i * 7, by - 13); g.fill(); }
    const glow = g.createRadialGradient(px + 27, by - 28, 4, px + 27, by - 28, 70); glow.addColorStop(0, "rgba(255,160,80,.3)"); glow.addColorStop(1, "rgba(255,160,80,0)");
    g.fillStyle = glow; g.fillRect(px - 44, by - 98, 140, 100);
  } else if (kind === "kitchen") {
    g.fillStyle = "#f2f0ea"; g.fillRect(px, by - 42, 128, 42); g.strokeRect(px, by - 42, 128, 42);
    for (let i = 0; i < 4; i++) { g.strokeStyle = "#c9c5bb"; g.strokeRect(px + i * 32 + 3, by - 36, 26, 32); g.fillStyle = "#8f8b82"; g.fillRect(px + i * 32 + 12, by - 32, 8, 2); }
    g.strokeStyle = OUT; g.fillStyle = "#2f2f33"; g.fillRect(px - 3, by - 47, 134, 6); g.strokeRect(px - 3, by - 47, 134, 6);
    g.fillStyle = "#f2f0ea"; g.fillRect(px + 4, by - 150, 120, 46); g.strokeRect(px + 4, by - 150, 120, 46); g.fillStyle = "#c9c5bb"; g.fillRect(px + 64, by - 146, 2, 38);
    g.fillStyle = "#1e1e22"; g.fillRect(px + 10, by - 68, 20, 21); g.fillStyle = "#c0392b"; g.fillRect(px + 13, by - 64, 14, 4);
    g.fillStyle = "#d9d9d9"; g.beginPath(); g.ellipse(px + 50, by - 55, 9, 8, 0, 0, 7); g.fill(); g.stroke(); g.fillRect(px + 47, by - 66, 6, 4);
    emoji("🧀", px + 82, by - 58, 18); emoji("🍞", px + 108, by - 58, 18);
  } else if (kind === "bed") {
    shadowAt(px + 32, by, 34);
    g.fillStyle = "#6b4a33"; g.fillRect(px, by - 24, 66, 20); g.strokeRect(px, by - 24, 66, 20); g.fillRect(px - 2, by - 48, 8, 48); g.strokeRect(px - 2, by - 48, 8, 48);
    g.fillStyle = "#fff"; g.beginPath(); rp(px + 6, by - 32, 22, 10, 4); g.fill(); g.stroke();
    const qc = ["#9db7d6", "#e8a1a1", "#a6d4a0"][fl(H * 3)];
    g.fillStyle = qc; g.beginPath(); rp(px + 22, by - 32, 44, 14, 4); g.fill(); g.stroke();
    g.fillStyle = shade(qc.length === 7 ? qc : "#9db7d6", -.15); for (let i = 0; i < 3; i++) g.fillRect(px + 28 + i * 13, by - 30, 6, 10);
    g.fillStyle = "#4a3020"; g.fillRect(px + 2, by - 4, 5, 4); g.fillRect(px + 60, by - 4, 5, 4);
  } else if (kind === "sauna") {
    g.fillStyle = "#c48a52"; g.fillRect(px, by - 100, 96, 100); g.strokeRect(px, by - 100, 96, 100);
    g.fillStyle = "#a8703c"; for (let i = 0; i < 10; i++) g.fillRect(px, by - 100 + i * 10, 96, 2);
    g.fillStyle = "rgba(210,236,255,.75)"; g.fillRect(px + 32, by - 80, 32, 80); g.strokeRect(px + 32, by - 80, 32, 80);
    g.fillStyle = "rgba(255,255,255,.6)"; g.fillRect(px + 36, by - 76, 4, 60);
    for (let i = 0; i < 3; i++) { g.fillStyle = `rgba(255,255,255,${.25 + .15 * Math.sin(frame / 20 + i)})`; g.beginPath(); g.arc(px + 40 + i * 8, by - 90 - ((frame / 2 + i * 15) % 30), 6, 0, 7); g.fill(); }
    sign2(px + 18, by - 120, 60, 18, "#5a3416", "SAUNA", "#ffe0b0");
  } else if (kind === "bath") {
    g.fillStyle = "#fff"; g.beginPath(); rp(px, by - 34, 86, 34, 12); g.fill(); g.stroke();
    g.fillStyle = "#9bd3f2"; g.fillRect(px + 6, by - 30, 74, 6);
    g.fillStyle = "#fff"; [[18, -36], [30, -40], [46, -37], [60, -41]].forEach(([dx, dy]) => { g.beginPath(); g.arc(px + dx, by + dy, 6, 0, 7); g.fill(); });
    g.fillStyle = "#ffd25e"; g.beginPath(); g.ellipse(px + 66, by - 40, 6, 5, 0, 0, 7); g.fill(); g.stroke(); g.fillStyle = "#ff8a2a"; g.fillRect(px + 71, by - 41, 4, 2);
    g.fillStyle = "#bbb"; g.fillRect(px + 78, by - 54, 4, 20);
  } else if (kind === "garland") {
    const cols = ["#ff5a7a", "#ffd25e", "#59c28a", "#5aa8ff"];
    g.strokeStyle = "#7a5a3a"; g.lineWidth = 1.5; g.beginPath(); g.moveTo(px - 70, 52); g.quadraticCurveTo(px + 30, 78, px + 130, 52); g.stroke();
    for (let i = 0; i < 11; i++) { const t = i / 10, xx = px - 70 + t * 200, yy = 52 + Math.sin(t * Math.PI) * 13; g.fillStyle = cols[i % 4]; g.beginPath(); g.moveTo(xx - 7, yy); g.lineTo(xx + 7, yy); g.lineTo(xx, yy + 16); g.closePath(); g.fill(); g.strokeStyle = OUT; g.lineWidth = 1; g.stroke(); }
    sign2(px - 10, 92, 90, 24, "#fff4e6", "PAUL 40", "#c43a3a");
    [[-40, 130, "#ff5a7a"], [100, 124, "#5aa8ff"]].forEach(([dx, y, c2]) => { g.strokeStyle = "#888"; g.lineWidth = 1; g.beginPath(); g.moveTo(px + dx, y + 14); g.lineTo(px + dx + 2, y + 50); g.stroke(); g.fillStyle = c2; g.beginPath(); g.ellipse(px + dx, y + Math.sin(frame / 30 + dx) * 3, 10, 13, 0, 0, 7); g.fill(); g.strokeStyle = OUT; g.stroke(); g.fillStyle = "rgba(255,255,255,.5)"; g.beginPath(); g.ellipse(px + dx - 3, y - 4, 2.5, 4, -.4, 0, 7); g.fill(); });
  } else if (kind === "fire") {
    [[0, 0], [10, 2], [22, 0], [32, 1]].forEach(([dx, dy]) => { g.fillStyle = "#7a7a72"; g.beginPath(); g.ellipse(px - 2 + dx, by - 3 + dy, 6, 4, 0, 0, 7); g.fill(); g.stroke(); });
    g.fillStyle = "#5a3a20"; g.fillRect(px + 2, by - 10, 28, 5); g.strokeRect(px + 2, by - 10, 28, 5);
    if (L.questDone) {
      const glow = g.createRadialGradient(px + 16, by - 20, 4, px + 16, by - 20, 80); glow.addColorStop(0, "rgba(255,170,80,.45)"); glow.addColorStop(1, "rgba(255,170,80,0)");
      g.fillStyle = glow; g.fillRect(px - 64, by - 100, 160, 110);
      [["#ff5a2a", 30], ["#ff9b45", 22], ["#ffd25e", 13]].forEach(([c2, h0], i) => { g.fillStyle = c2; for (let k = 0; k < 3; k++) { const h = h0 + Math.sin(frame / 5 + k + i) * 5; g.beginPath(); g.moveTo(px + 6 + k * 8, by - 9); g.quadraticCurveTo(px + 10 + k * 8, by - 9 - h, px + 14 + k * 8, by - 9); g.fill(); } });
      g.fillStyle = "#ffd25e"; for (let k = 0; k < 4; k++) { const t = (frame * 1.5 + k * 25) % 60; g.fillRect(px + 14 + Math.sin(k * 3 + t / 8) * 8, by - 30 - t, 2, 2); }
    }
  } else if (kind === "cake") {
    g.fillStyle = "#6b4528"; g.fillRect(px - 8, by - 28, 48, 5); g.strokeRect(px - 8, by - 28, 48, 5); g.fillRect(px - 4, by - 23, 4, 23); g.fillRect(px + 32, by - 23, 4, 23);
    g.fillStyle = "#fff4e6"; g.beginPath(); rp(px, by - 50, 32, 22, 3); g.fill(); g.stroke();
    g.fillStyle = "#ff7aa8"; g.fillRect(px, by - 50, 32, 6); for (let i = 0; i < 4; i++) { g.beginPath(); g.arc(px + 4 + i * 8, by - 44, 3, 0, Math.PI); g.fill(); }
    g.fillStyle = "#c43a3a"; g.font = "700 11px Fredoka, sans-serif"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("40", px + 16, by - 35);
    for (let i = 0; i < 4; i++) { g.fillStyle = ["#5aa8ff", "#ffd25e", "#59c28a", "#ff7aa8"][i]; g.fillRect(px + 5 + i * 7, by - 58, 2.5, 8); g.fillStyle = "#ffd25e"; g.beginPath(); g.ellipse(px + 6 + i * 7, by - 61 + Math.sin(frame / 5 + i) * .8, 1.6, 3, 0, 0, 7); g.fill(); }
    [[-30, "#d33a3a", "#ffd25e"], [44, "#3d7fd9", "#fff"]].forEach(([dx, c1, c2]) => { g.fillStyle = c1; g.fillRect(px + dx, by - 18, 20, 18); g.strokeRect(px + dx, by - 18, 20, 18); g.fillStyle = c2; g.fillRect(px + dx + 8, by - 18, 4, 18); g.fillRect(px + dx, by - 11, 20, 4); });
  }
}
function groundTop(x) { for (let y = 0; y < ROWS; y++) if (L.grid[y][x] === "#") return y; return ROWS; }

/* ---------- Saabs ---------- */
/** Een Saab van opzij, met de neus naar rechts. x = links, by = de grond. */
function drawSaab(model, x, by, opts = {}) {
  g.save(); g.lineJoin = "round"; g.lineCap = "round"; g.strokeStyle = OUT; g.lineWidth = 2;
  const wheel = (cx, r) => {
    g.fillStyle = "#1c1c20"; g.beginPath(); g.arc(cx, by - r, r, 0, 7); g.fill(); g.stroke();
    g.fillStyle = "#c9ced6"; g.beginPath(); g.arc(cx, by - r, r * .58, 0, 7); g.fill();
    g.strokeStyle = "#8a9099"; g.lineWidth = 1.4; for (let i = 0; i < 5; i++) { const a = i * Math.PI * 2 / 5 + .3; g.beginPath(); g.moveTo(cx, by - r); g.lineTo(cx + Math.cos(a) * r * .55, by - r + Math.sin(a) * r * .55); g.stroke(); }
    g.strokeStyle = OUT; g.lineWidth = 2;
  };
  // witte aero-velg van de Saab 900, met drie gebogen sleuven
  const aero = (cx, r) => {
    g.fillStyle = "#1c1c20"; g.beginPath(); g.arc(cx, by - r, r, 0, 7); g.fill(); g.stroke();
    g.fillStyle = "#f2f2ee"; g.beginPath(); g.arc(cx, by - r, r * .66, 0, 7); g.fill();
    g.strokeStyle = "#9a9ca4"; g.lineWidth = 1.6; for (let i = 0; i < 3; i++) { const a = i * Math.PI * 2 / 3 + frame * 0; g.beginPath(); g.arc(cx, by - r, r * .42, a, a + .9); g.stroke(); }
    g.fillStyle = "#9a9ca4"; g.beginPath(); g.arc(cx, by - r, 1.6, 0, 7); g.fill();
    g.strokeStyle = OUT; g.lineWidth = 2;
  };
  if (model === "93") {
    // Saab 9-3 SportCombi in Snow Silver metallic, met een dakkoffer
    const body = opts.color || "#bfc4cb", dark = shade(body, -.2);
    shadowAt(x + 75, by, 74);
    g.fillStyle = "#3a3f48"; g.fillRect(x + 22, by - 64, 4, 6); g.fillRect(x + 80, by - 64, 4, 6);
    if (opts.roofbox !== false) { g.fillStyle = "#dfe3e8"; g.beginPath(); rp(x + 16, by - 80, 74, 16, 8); g.fill(); g.stroke(); g.fillStyle = "#c3c8cf"; g.fillRect(x + 22, by - 70, 62, 3); }
    g.fillStyle = body; g.beginPath();
    g.moveTo(x + 3, by - 12); g.lineTo(x + 2, by - 42); g.quadraticCurveTo(x + 4, by - 58, x + 14, by - 59); g.lineTo(x + 86, by - 59);
    g.quadraticCurveTo(x + 96, by - 58, x + 112, by - 42); g.quadraticCurveTo(x + 138, by - 40, x + 148, by - 34); g.quadraticCurveTo(x + 152, by - 26, x + 150, by - 14); g.lineTo(x + 3, by - 12); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = dark; g.fillRect(x + 4, by - 22, 145, 8);
    // metallic glans
    g.fillStyle = "rgba(255,255,255,.45)"; g.fillRect(x + 8, by - 38, 128, 2.5); g.fillStyle = "rgba(255,255,255,.2)"; g.fillRect(x + 108, by - 40, 30, 2);
    g.fillStyle = "#2a3542"; g.beginPath(); g.moveTo(x + 10, by - 54); g.lineTo(x + 86, by - 54); g.quadraticCurveTo(x + 94, by - 53, x + 106, by - 42); g.lineTo(x + 10, by - 42); g.closePath(); g.fill();
    g.fillStyle = body; g.fillRect(x + 38, by - 55, 4, 14); g.fillRect(x + 66, by - 55, 4, 14);
    g.fillStyle = "rgba(255,255,255,.25)"; g.fillRect(x + 14, by - 52, 20, 3);
    g.strokeStyle = dark; g.lineWidth = 1.2; g.beginPath(); g.moveTo(x + 40, by - 41); g.lineTo(x + 40, by - 18); g.moveTo(x + 68, by - 41); g.lineTo(x + 70, by - 18); g.stroke();
    g.fillStyle = "#9aa0a8"; g.fillRect(x + 50, by - 36, 6, 2); g.fillRect(x + 78, by - 36, 6, 2);
    g.fillStyle = body; g.beginPath(); g.ellipse(x + 104, by - 43, 4, 2.5, 0, 0, 7); g.fill(); g.stroke();
    g.fillStyle = "#fff6d8"; g.beginPath(); g.ellipse(x + 142, by - 33, 6, 2.6, -.2, 0, 7); g.fill(); g.stroke();
    g.fillStyle = "#c4202a"; g.fillRect(x + 2, by - 42, 5, 12);
    g.fillStyle = "#1c1c20"; g.fillRect(x + 140, by - 24, 10, 6);
    g.fillStyle = "#c4202a"; g.beginPath(); g.arc(x + 146, by - 28, 1.8, 0, 7); g.fill();
    g.fillStyle = "#3a3f48"; g.fillRect(x + 12, by - 61, 72, 2);
    wheel(x + 30, 13); wheel(x + 120, 13);
  } else if (model === "900") {
    // klassieke Saab 900 driedeurs: lange motorkap, steile voorruit, schuine achterklep met spoilertje,
    // grijze onderrand en witte aero-velgen; met een kerstboom op het dak zoals op de kersttrui
    const body = opts.color || "#b8232a", dark = shade(body, -.25), trim = "#3c3d44";
    shadowAt(x + 75, by, 74);
    g.fillStyle = body; g.beginPath();
    g.moveTo(x + 3, by - 16); g.lineTo(x + 3, by - 36); g.lineTo(x + 8, by - 41); g.lineTo(x + 16, by - 43);
    g.lineTo(x + 52, by - 63); g.quadraticCurveTo(x + 56, by - 65, x + 62, by - 65); g.lineTo(x + 90, by - 65);
    g.quadraticCurveTo(x + 94, by - 64, x + 108, by - 45); g.quadraticCurveTo(x + 132, by - 42, x + 146, by - 36);
    g.quadraticCurveTo(x + 149, by - 30, x + 148, by - 16); g.closePath(); g.fill(); g.stroke();
    // spoilertje op de achterklep
    g.fillStyle = "#1c1c20"; g.beginPath(); g.moveTo(x + 10, by - 44); g.lineTo(x + 22, by - 47); g.lineTo(x + 22, by - 44); g.closePath(); g.fill();
    // grijze onderrand en bumpers
    g.fillStyle = trim; g.beginPath(); rp(x + 1, by - 27, 149, 13, 3); g.fill(); g.stroke();
    g.fillStyle = "#8a8c94"; g.fillRect(x + 3, by - 24, 145, 1.5);
    // ramen: portierruit en een kleine zijruit; daarachter de brede C-stijl in de kleur van de auto,
    // smal bij het dak en breed onderin, en de achterruit als smalle strook langs de schuine achterklep
    g.fillStyle = "#2a3542";
    g.beginPath(); g.moveTo(x + 44, by - 45); g.lineTo(x + 56, by - 60); g.lineTo(x + 64, by - 61); g.lineTo(x + 64, by - 45); g.closePath(); g.fill();
    g.beginPath(); g.moveTo(x + 68, by - 45); g.lineTo(x + 68, by - 61); g.lineTo(x + 89, by - 61); g.quadraticCurveTo(x + 92, by - 60, x + 102, by - 45); g.closePath(); g.fill();
    g.fillStyle = "#1c1c20"; g.fillRect(x + 64, by - 61, 4, 16);
    g.strokeStyle = "#2a3542"; g.lineWidth = 3; g.beginPath(); g.moveTo(x + 19, by - 45); g.lineTo(x + 50, by - 63); g.stroke();
    g.strokeStyle = shade(body, .25); g.lineWidth = 1.2; g.beginPath(); g.moveTo(x + 26, by - 44); g.lineTo(x + 52, by - 60); g.stroke();
    g.fillStyle = "rgba(255,255,255,.22)"; g.fillRect(x + 72, by - 57, 14, 2.5);
    g.beginPath(); g.moveTo(x + 50, by - 49); g.lineTo(x + 56, by - 57); g.lineTo(x + 58, by - 56); g.lineTo(x + 52, by - 48); g.fill();
    g.strokeStyle = OUT; g.lineWidth = 2;
    // lange portier, kruk, ventilatierooster, richtingaanwijzer, lampen
    g.strokeStyle = dark; g.lineWidth = 1.2; g.beginPath(); g.moveTo(x + 66, by - 44); g.lineTo(x + 66, by - 27); g.moveTo(x + 104, by - 44); g.quadraticCurveTo(x + 106, by - 36, x + 104, by - 27); g.stroke();
    g.fillStyle = "#1c1c20"; g.fillRect(x + 71, by - 38, 6, 2); g.fillRect(x + 22, by - 38, 16, 2.5);
    g.fillStyle = "#e8a020"; g.fillRect(x + 112, by - 34, 4, 3);
    g.fillStyle = body; g.beginPath(); g.ellipse(x + 103, by - 46, 3.5, 2.4, 0, 0, 7); g.fill(); g.strokeStyle = OUT; g.lineWidth = 1.5; g.stroke();
    g.fillStyle = "#fff6d8"; g.fillRect(x + 138, by - 35, 9, 5); g.strokeRect(x + 138, by - 35, 9, 5);
    g.fillStyle = "#e8a020"; g.fillRect(x + 134, by - 35, 4, 5);
    g.fillStyle = "#c4202a"; g.fillRect(x + 3, by - 36, 4, 8); g.fillStyle = "#e8a020"; g.fillRect(x + 3, by - 30, 4, 3);
    g.strokeStyle = OUT; g.lineWidth = 2;
    if (opts.tree !== false) {
      // de boom ligt over de lengte op het dak, met touwtjes vast
      const ry = by - 67;
      g.fillStyle = "#5a3a20"; g.fillRect(x + 14, ry - 5, 14, 5); g.strokeRect(x + 14, ry - 5, 14, 5);
      for (let i = 0; i < 5; i++) { const tx = x + 24 + i * 15, h = 18 - i * 3; g.fillStyle = OUT; g.beginPath(); g.moveTo(tx - 1, ry - h - 1); g.lineTo(tx + 24, ry - 2); g.lineTo(tx - 1, ry + 1); g.fill(); g.fillStyle = i % 2 ? "#226b40" : "#1a5634"; g.beginPath(); g.moveTo(tx, ry - h); g.lineTo(tx + 22, ry - 2); g.lineTo(tx, ry); g.fill(); g.fillStyle = "#f4f8ff"; g.fillRect(tx + 2, ry - h + 3, 9, 2); }
      g.strokeStyle = "#c9a34a"; g.lineWidth = 1.5; [x + 40, x + 74].forEach(rx => { g.beginPath(); g.moveTo(rx, ry - 18); g.lineTo(rx - 3, by - 60); g.stroke(); });
      for (let i = 0; i < 6; i++) { g.fillStyle = (Math.floor(frame / 15) + i) % 2 ? "#ffd25e" : "#ff6b6b"; g.beginPath(); g.arc(x + 30 + i * 12, ry - 6 - (i % 2) * 5, 2.2, 0, 7); g.fill(); }
      g.strokeStyle = OUT; g.lineWidth = 2;
    }
    aero(x + 30, 13); aero(x + 120, 13);
  } else if (model === "96") {
    // Saab 96: rond als een druppel
    const body = opts.color || "#7fb0a8";
    shadowAt(x + 55, by, 56);
    g.fillStyle = body; g.beginPath(); g.moveTo(x + 4, by - 14); g.quadraticCurveTo(x + 2, by - 34, x + 18, by - 40); g.quadraticCurveTo(x + 48, by - 70, x + 76, by - 44); g.quadraticCurveTo(x + 104, by - 40, x + 110, by - 26); g.lineTo(x + 108, by - 14); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = "#2a3542"; g.beginPath(); g.moveTo(x + 24, by - 42); g.quadraticCurveTo(x + 48, by - 64, x + 70, by - 44); g.closePath(); g.fill();
    g.fillStyle = body; g.fillRect(x + 46, by - 60, 4, 18);
    g.fillStyle = "#e9e6dc"; g.fillRect(x + 4, by - 20, 104, 3);
    g.fillStyle = "#fff6d8"; g.beginPath(); g.arc(x + 104, by - 30, 4, 0, 7); g.fill(); g.stroke();
    g.fillStyle = "#c4202a"; g.fillRect(x + 4, by - 32, 4, 6);
    wheel(x + 26, 11); wheel(x + 88, 11);
  }
  g.restore();
}

/* ---------- Lego ---------- */
function drawLegoBrick(cx, cy, col, w = 18) {
  g.save(); g.strokeStyle = OUT; g.lineWidth = 1.4;
  g.fillStyle = col; g.beginPath(); rp(cx - w / 2, cy - 4, w, 11, 1.5); g.fill(); g.stroke();
  for (let i = 0; i < Math.round(w / 9); i++) { g.beginPath(); rp(cx - w / 2 + 2 + i * 9, cy - 8, 5, 4, 1); g.fill(); g.stroke(); }
  g.fillStyle = "rgba(255,255,255,.35)"; g.fillRect(cx - w / 2 + 2, cy - 2, w - 4, 2);
  g.restore();
}
const LEGO_COLS = ["#d8232a", "#1e5aa8", "#f5c518", "#2a9a4a", "#f57d20", "#ffffff"];

/* ---------- Uitgang ---------- */
function drawExit(theme) {
  const e = L.exit, x = e.x, by = e.y + e.h;
  g.lineJoin = "round"; g.strokeStyle = OUT; g.lineWidth = 2;
  const style = L.d.exitStyle;
  if (style === "arch") {
    const sn = theme !== "bos";
    [x - 26, x + 50].forEach(px => { g.fillStyle = "#6b4528"; g.fillRect(px, by - 110, 10, 110); g.strokeRect(px, by - 110, 10, 110); g.fillStyle = "#8a5a32"; g.fillRect(px + 2, by - 108, 3, 106); });
    g.font = "700 14px Fredoka, sans-serif"; const w = Math.max(96, g.measureText(L.d.exitLabel).width + 24);
    g.fillStyle = "#c9955a"; g.beginPath(); rp(x + 14 - w / 2, by - 132, w, 30, 4); g.fill(); g.stroke();
    g.fillStyle = "#3a200c"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(L.d.exitLabel, x + 14, by - 116);
    if (sn) { g.fillStyle = "#f4f8ff"; g.beginPath(); rp(x + 10 - w / 2, by - 137, w + 8, 7, 3); g.fill(); }
    else { g.fillStyle = "#4f9e3c"; for (let i = 0; i < 8; i++) { g.beginPath(); g.arc(x + 14 - w / 2 + i * w / 7, by - 132, 5, 0, 7); g.fill(); } }
    const ok = L.keys >= L.need;
    g.fillStyle = ok ? "#59c28a" : "#ff6b6b"; g.beginPath(); g.arc(x + 14, by - 145, 6, 0, 7); g.fill(); g.stroke();
    return;
  }
  if (style === "car") {
    // de twee auto's van de families: de witte Saab 9-3 met dakkoffer en een donkere stationwagen
    drawSaab("93", x - 190, by, { color: "#3a3f4a", roofbox: false });
    drawSaab("93", x - 30, by);
    if (L.keys >= L.need) { emoji("🧦", x + 30, by - 92, 14); emoji("🧳", x + 60, by - 94, 16); }
    return;
  }
  if (style === "door") theme = "huis";
  else if (style === "tree") theme = "sneeuw";
  else if (style === "house") theme = "bos";
  if (theme === "bos") {
    const fx = x - 4 * TS, fw = 9 * TS, top = by - 7 * TS;
    // schoorsteen + rook
    g.fillStyle = "#6b5a52"; g.fillRect(fx + fw - 70, top - 120, 18, 60); g.strokeRect(fx + fw - 70, top - 120, 18, 60);
    for (let i = 0; i < 4; i++) { const t = (frame * .5 + i * 30) % 120; g.fillStyle = `rgba(230,230,235,${.5 - t / 260})`; g.beginPath(); g.arc(fx + fw - 61 + Math.sin(t / 15) * 6 + t * .2, top - 126 - t, 6 + t / 10, 0, 7); g.fill(); }
    // muur
    g.fillStyle = "#cdbdbc"; g.fillRect(fx, top, fw, 7 * TS); g.strokeRect(fx, top, fw, 7 * TS);
    g.fillStyle = "#bfaead"; for (let i = 0; i < 40; i++) g.fillRect(fx + hash(i) * fw, top + hash(i * 3) * 7 * TS, 3, 2);
    g.fillStyle = "#f4f2ee"; for (let y = top; y < by - 24; y += 22) { g.fillRect(fx, y, 12, 12); g.fillRect(fx + fw - 12, y, 12, 12); }
    g.fillStyle = "#8f6e64"; g.fillRect(fx, by - 24, fw, 24); g.strokeRect(fx, by - 24, fw, 24);
    // dak
    g.fillStyle = "#3a3f4b"; g.beginPath(); g.moveTo(fx - 18, top + 6); g.lineTo(fx + fw / 2, top - 118); g.lineTo(fx + fw + 18, top + 6); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = "#4a505e"; for (let i = 1; i < 8; i++) { const yy = top + 6 - i * 15, half = (fw / 2 + 18) * (1 - i / 8.2); g.fillRect(fx + fw / 2 - half, yy, half * 2, 2); }
    g.fillStyle = "#cfd8e2"; g.fillRect(fx + 30, top - 40, 16, 12); g.fillRect(fx + fw - 50, top - 40, 16, 12);
    g.strokeStyle = "#fff"; g.lineWidth = 6; g.beginPath(); g.moveTo(fx + 24, top - 2); g.quadraticCurveTo(fx + fw / 2, top - 126, fx + fw - 24, top - 2); g.stroke();
    g.lineWidth = 2.5; for (let i = 1; i < 9; i++) { const t = i / 9; const ax = fx + 24 + t * (fw - 48); const ay = top - 2 - Math.sin(t * Math.PI) * 60; g.beginPath(); g.moveTo(ax, ay); g.lineTo(fx + fw / 2, top - 70); g.stroke(); }
    g.lineWidth = 2; g.strokeStyle = OUT;
    // ramen
    const lit = L.keys >= 3;
    [[fx + 30, top + 40], [fx + fw - 80, top + 40], [fx + 30, top + 128], [fx + fw - 80, top + 128], [fx + fw / 2 - 25, top - 54]].forEach(([wx, wy]) => {
      g.fillStyle = "#f6f4ef"; g.fillRect(wx - 7, wy - 7, 64, 74); g.strokeRect(wx - 7, wy - 7, 64, 74);
      g.fillStyle = "#435c7a"; g.fillRect(wx, wy, 50, 60);
      g.fillStyle = lit ? "#ffe7a8" : "#6f8aa8"; g.fillRect(wx + 3, wy + 3, 20, 26); g.fillRect(wx + 27, wy + 3, 20, 26);
      g.fillStyle = "rgba(255,255,255,.35)"; g.fillRect(wx + 5, wy + 33, 4, 22);
      g.fillStyle = "#f6f4ef"; g.fillRect(wx + 23, wy, 4, 60); g.fillRect(wx, wy + 29, 50, 4);
      g.fillStyle = "#e7e2d8"; g.fillRect(wx - 10, wy + 66, 70, 6);
    });
    if (lit) { for (let i = 0; i < 16; i++) { g.fillStyle = ["#ff5a5a", "#ffd25e", "#59c28a", "#5aa8ff"][(i + fl(frame / 20)) % 4]; g.beginPath(); g.arc(fx + 10 + i * (fw - 20) / 15, top + 10 + Math.sin(i * .8) * 4, 3, 0, 7); g.fill(); } }
    // deur
    g.fillStyle = "#f6f4ef"; g.fillRect(x - 10, e.y - 14, e.w + 20, e.h + 14); g.strokeRect(x - 10, e.y - 14, e.w + 20, e.h + 14);
    g.fillStyle = lit ? "#ffe7a8" : "#ffffff"; g.fillRect(x - 2, e.y - 6, e.w + 4, e.h + 6); g.strokeRect(x - 2, e.y - 6, e.w + 4, e.h + 6);
    g.strokeStyle = "#d8d2c6"; g.strokeRect(x + 3, e.y, e.w - 6, 24); g.strokeRect(x + 3, e.y + 30, e.w - 6, 28); g.strokeStyle = OUT;
    g.fillStyle = "#c9a34a"; g.beginPath(); g.arc(x + 25, e.y + 30, 2.5, 0, 7); g.fill();
    g.fillStyle = "#2a2a2a"; g.fillRect(x + 50, by - 54, 22, 14); g.strokeRect(x + 50, by - 54, 22, 14); g.fillStyle = "#c9a34a"; g.fillRect(x + 54, by - 50, 14, 2);
    g.fillStyle = "#d8d0c4"; g.fillRect(x - 16, by - 4, e.w + 32, 4);
  } else if (theme === "huis") {
    g.fillStyle = "#3a3a3a"; g.fillRect(x - 10, e.y - 40, e.w + 20, e.h + 40); g.strokeRect(x - 10, e.y - 40, e.w + 20, e.h + 40);
    const sky = g.createLinearGradient(0, e.y - 34, 0, by); sky.addColorStop(0, "#1b2b4a"); sky.addColorStop(1, "#4d6ea6");
    g.fillStyle = sky; g.fillRect(x - 4, e.y - 34, e.w + 8, e.h + 34);
    g.fillStyle = "#e3ecf7"; g.fillRect(x - 4, by - 20, e.w + 8, 20);
    pineShape(x + 6, by - 14, 30, "#1e3b4c", "#163040", "#eef4ff");
    g.fillStyle = "#c7b9a6"; g.beginPath(); g.moveTo(x + 14, e.y - 10); g.lineTo(x + 44, e.y + 2); g.lineTo(x + 14, e.y + 2); g.fill();
    g.fillStyle = "#3a3a3a"; g.fillRect(x + 14, e.y - 34, 4, e.h + 34);
    g.fillStyle = "rgba(255,255,255,.25)"; g.fillRect(x - 2, e.y - 30, 4, e.h + 20);
  } else {
    const cx = x + 16, top = by - 180;
    shadowAt(cx, by, 60);
    g.fillStyle = "#5a3a20"; g.fillRect(cx - 8, by - 24, 16, 24); g.strokeRect(cx - 8, by - 24, 16, 24);
    for (let i = 0; i < 5; i++) {
      const w = 76 - i * 14, yy = by - 22 - i * 30;
      g.fillStyle = OUT; g.beginPath(); g.moveTo(cx - w - 2, yy + 2); g.lineTo(cx + w + 2, yy + 2); g.lineTo(cx, yy - 62); g.fill();
      g.fillStyle = "#226b40"; g.beginPath(); g.moveTo(cx - w, yy); g.lineTo(cx + w, yy); g.lineTo(cx, yy - 58); g.fill();
      g.fillStyle = "#1a5634"; g.beginPath(); g.moveTo(cx, yy); g.lineTo(cx + w, yy); g.lineTo(cx, yy - 58); g.fill();
      g.fillStyle = "#f4f8ff"; g.beginPath(); g.moveTo(cx - w, yy); g.quadraticCurveTo(cx, yy - 8, cx + w, yy); g.lineTo(cx + w - 6, yy - 4); g.quadraticCurveTo(cx, yy - 12, cx - w + 6, yy - 4); g.fill();
    }
    g.strokeStyle = "#ffd25e"; g.lineWidth = 1.5;
    for (let i = 0; i < 3; i++) { g.beginPath(); g.moveTo(cx - 50 + i * 12, by - 40 - i * 34); g.quadraticCurveTo(cx, by - 26 - i * 34, cx + 46 - i * 12, by - 46 - i * 34); g.stroke(); }
    for (let i = 0; i < 18; i++) { g.fillStyle = (fl(frame / 15) + i) % 3 ? "#ffd25e" : "#ff8a8a"; g.beginPath(); g.arc(cx - 54 + hash(i) * 108 * (1 - (i % 5) / 6), by - 34 - (i % 5) * 28, 2.5, 0, 7); g.fill(); }
    [[-30, -50], [28, -84], [-12, -118]].forEach(([dx, dy], i) => {
      if (i < L.keys) drawItem("bauble", cx + dx, by + dy, frame * 16);
      else { g.strokeStyle = "rgba(255,255,255,.6)"; g.setLineDash([3, 3]); g.lineWidth = 1.5; g.beginPath(); g.arc(cx + dx, by + dy + 2, 8, 0, 7); g.stroke(); g.setLineDash([]); }
    });
    g.strokeStyle = OUT; g.lineWidth = 2;
    const done = L.keys >= 3;
    if (done) { const sg = g.createRadialGradient(cx, top + 2, 2, cx, top + 2, 40); sg.addColorStop(0, "rgba(255,230,120,.7)"); sg.addColorStop(1, "rgba(255,230,120,0)"); g.fillStyle = sg; g.fillRect(cx - 40, top - 38, 80, 80); }
    g.fillStyle = done ? "#ffe066" : "#8a8a8a"; star(cx, top + 2, 13); g.stroke();
    [[-58, "#d33a3a", "#ffd25e"], [40, "#3d7fd9", "#fff"], [-20, "#59c28a", "#ff5a7a"]].forEach(([dx, c1, c2], i) => {
      const w = 22 - i * 3; g.fillStyle = c1; g.fillRect(cx + dx, by - w, w + 4, w); g.strokeRect(cx + dx, by - w, w + 4, w);
      g.fillStyle = c2; g.fillRect(cx + dx + w / 2, by - w, 4, w); g.fillRect(cx + dx, by - w * .6, w + 4, 3);
    });
  }
}
function star(cx, cy, r) { g.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr2 = i % 2 ? r * .45 : r; g.lineTo(cx + Math.cos(a) * rr2, cy + Math.sin(a) * rr2); } g.closePath(); g.fill(); }

/* ---------- Bordjes, vlaggen, codepaal, lantaarn ---------- */
function drawSign(s) {
  g.strokeStyle = OUT; g.lineWidth = 2;
  g.fillStyle = "#6b4528"; g.fillRect(s.x + 13, s.y + 2, 6, 30); g.strokeRect(s.x + 13, s.y + 2, 6, 30);
  g.fillStyle = "#c9955a"; g.beginPath(); rp(s.x - 3, s.y - 18, 38, 24, 3); g.fill(); g.stroke();
  g.fillStyle = "#b07e48"; g.fillRect(s.x - 1, s.y - 7, 34, 2);
  g.fillStyle = "#5a3416"; g.fillRect(s.x + 4, s.y - 14, 24, 2); g.fillRect(s.x + 4, s.y - 3, 16, 2);
  g.fillStyle = "#e0e0d8"; g.fillRect(s.x, s.y - 15, 2, 2); g.fillRect(s.x + 30, s.y - 15, 2, 2);
  if (L.d.theme === "sneeuw" || L.d.theme === "stad") { g.fillStyle = "#f4f8ff"; g.beginPath(); rp(s.x - 4, s.y - 22, 40, 6, 3); g.fill(); }
}
/** Checkpoint flags: white until you pass, then the flag of the region (Belgium, Austria, Norway, or a North Pole flag). */
const FLAGS = {
  ardennes: [3, (i, r) => ["#1d1d1d", "#fdda24", "#ef3340"][fl(i / 4)]],
  tirol: [3, (i, r) => r === 1 ? "#ffffff" : "#c8102e"],
  norway: [7, (i, r) => { const v = i === 4 || r === 3, w = i >= 3 && i <= 5 || r >= 2 && r <= 4; return v ? "#00205b" : w ? "#ffffff" : "#ba0c2f"; }],
  pole: [3, (i, r) => ["#d8232a", "#ffffff", "#2a9a4a"][r]]
};
function drawCheck(c) {
  g.strokeStyle = OUT; g.lineWidth = 1.5;
  g.fillStyle = "#d8d8d8"; g.fillRect(c.x + 13, c.y - 30, 4, TS + 30); g.strokeRect(c.x + 13, c.y - 30, 4, TS + 30);
  g.fillStyle = "#ffd25e"; g.beginPath(); g.arc(c.x + 15, c.y - 32, 3.5, 0, 7); g.fill(); g.stroke();
  const [rows, col] = FLAGS[REGION.id] || FLAGS.ardennes, h = 18 / rows;
  for (let i = 0; i < 12; i++) {
    const wav = Math.sin(frame / 8 - i * .5) * (1 + i * .25);
    for (let r = 0; r < rows; r++) { g.fillStyle = c.on ? col(i, r) : r % 2 ? "#b9c6d6" : "#d6dee8"; g.fillRect(c.x + 17 + i * 2, c.y - 28 + r * h + wav, 2.2, h + .3); }
  }
}
function drawPad() {
  const p = L.pad;
  g.strokeStyle = OUT; g.lineWidth = 1.5;
  g.fillStyle = "#4a4a4a"; g.fillRect(p.x + 13, p.y + 4, 6, 28); g.strokeRect(p.x + 13, p.y + 4, 6, 28);
  g.fillStyle = "#59647a"; g.beginPath(); rp(p.x + 2, p.y - 20, 28, 28, 4); g.fill(); g.stroke();
  g.fillStyle = "#0b1520"; g.fillRect(p.x + 6, p.y - 16, 20, 7);
  g.fillStyle = L.codeOpen ? "#59c28a" : (fl(frame / 30) % 2 ? "#ff6b6b" : "#a83a3a"); g.fillRect(p.x + 8, p.y - 14, 16, 3);
  g.fillStyle = "#d6dbe6"; for (let i = 0; i < 9; i++) g.fillRect(p.x + 7 + (i % 3) * 7, p.y - 7 + fl(i / 3) * 4.5, 4.5, 3);
}
function drawLantern(l) {
  if (L.d.theme === "stad") return drawCandles(l);
  const lx = l.x + 16, ly = l.y - 14;
  if (l.lit) { const gl = g.createRadialGradient(lx, ly, 2, lx, ly, 90); gl.addColorStop(0, "rgba(255,220,150,.5)"); gl.addColorStop(1, "rgba(255,220,150,0)"); g.fillStyle = gl; g.fillRect(lx - 90, ly - 90, 180, 180); }
  g.strokeStyle = OUT; g.lineWidth = 1.5;
  g.fillStyle = "#2b2b30"; g.fillRect(lx - 2.5, ly + 10, 5, 36); g.fillRect(lx - 7, ly + 42, 14, 4);
  g.fillStyle = "#2b2b30"; g.beginPath(); g.moveTo(lx - 11, ly - 12); g.lineTo(lx + 11, ly - 12); g.lineTo(lx, ly - 22); g.closePath(); g.fill();
  g.fillStyle = l.lit ? "#ffe8b0" : "#56607a"; g.fillRect(lx - 8, ly - 12, 16, 22); g.strokeRect(lx - 8, ly - 12, 16, 22);
  g.fillStyle = "#2b2b30"; g.fillRect(lx - 1, ly - 12, 2, 22);
  if (l.lit) { g.fillStyle = "#ff9b45"; g.beginPath(); g.ellipse(lx, ly - 1 + Math.sin(frame / 12) * .6, 2.6, 5, 0, 0, 7); g.fill(); g.fillStyle = "#fff3c4"; g.beginPath(); g.ellipse(lx, ly, 1.2, 2.5, 0, 0, 7); g.fill(); }
  g.fillStyle = "#f4f8ff"; g.beginPath(); rp(lx - 12, ly - 16, 24, 4, 2); g.fill();
}

/** Een kaarsenstandaard in de kerk: een paar kaarsjes branden al, en je kunt er een bij aansteken. */
function drawCandles(l) {
  const cx = l.x + 16, by = l.y + TS;
  const lit = [0, 1, 0, 1, 1, 0, 1].map((v, i) => v || (l.lit && i === 2));
  if (lit.some(Boolean)) { const gl = g.createRadialGradient(cx, by - 34, 2, cx, by - 34, 70); gl.addColorStop(0, `rgba(255,214,140,${l.lit ? .55 : .35})`); gl.addColorStop(1, "rgba(255,214,140,0)"); g.fillStyle = gl; g.fillRect(cx - 70, by - 104, 140, 140); }
  g.strokeStyle = OUT; g.lineWidth = 1.5;
  g.fillStyle = "#2b2b30"; g.fillRect(cx - 2, by - 26, 4, 26); g.fillRect(cx - 10, by - 3, 20, 3);
  g.fillStyle = "#3a3a42"; g.beginPath(); rp(cx - 26, by - 30, 52, 6, 2); g.fill(); g.stroke();
  lit.forEach((on, i) => {
    const x = cx - 22 + i * 7.3;
    g.fillStyle = "#f6f1e4"; g.fillRect(x - 1.8, by - 37, 3.6, 7);
    if (on) { g.fillStyle = "#ff9b45"; g.beginPath(); g.ellipse(x, by - 40 + Math.sin(frame / 10 + i) * .4, 1.6, 3, 0, 0, 7); g.fill(); g.fillStyle = "#fff3c4"; g.beginPath(); g.ellipse(x, by - 39.5, .7, 1.5, 0, 0, 7); g.fill(); }
  });
}

/* ---------- Sfeer-deeltjes ---------- */
let leaves = [], motes = [];
function drawAmbient(theme) {
  if (theme === "bos") {
    while (leaves.length < 14) leaves.push({ x: Math.random() * viewW, y: -Math.random() * VIEW_H, vy: .5 + Math.random() * .6, r: Math.random() * 6, c: ["#e0862e", "#f2b53c", "#c9562b"][leaves.length % 3] });
    for (const l of leaves) {
      if (state === "play" && !dialog) { l.y += l.vy; l.x += Math.sin(frame / 40 + l.r) * .8; l.r += .03; }
      if (l.y > VIEW_H) { l.y = -10; l.x = Math.random() * viewW; }
      g.save(); g.translate(l.x, l.y); g.rotate(l.r); g.fillStyle = l.c; g.beginPath(); g.ellipse(0, 0, 5, 2.5, 0, 0, 7); g.fill(); g.restore();
    }
  } else if (theme === "huis") {
    while (motes.length < 26) motes.push({ x: Math.random() * viewW, y: Math.random() * VIEW_H, p: Math.random() * 6 });
    g.fillStyle = "rgba(255,240,200,.55)";
    for (const m of motes) { m.y -= .12; m.x += Math.sin(frame / 60 + m.p) * .15; if (m.y < 0) m.y = VIEW_H; g.fillRect(m.x, m.y, 1.6, 1.6); }
  }
}
function drawFlakes() {
  if (flakes.length < 120) for (let i = 0; i < 120; i++) flakes.push({ x: Math.random() * 2000, y: Math.random() * VIEW_H, vy: .4 + Math.random() * 1, r: .8 + Math.random() * 2.2, p: Math.random() * 6 });
  g.fillStyle = "#fff";
  for (const f of flakes) { g.globalAlpha = .5 + f.r / 6; g.beginPath(); g.arc(f.x % (viewW + 10), f.y, f.r, 0, 7); g.fill(); }
  g.globalAlpha = 1;
}
function vignette() {
  g.fillStyle = grad("vignette", () => {
    const vg = g.createRadialGradient(viewW / 2, VIEW_H * .55, VIEW_H * .45, viewW / 2, VIEW_H * .55, Math.max(viewW, VIEW_H) * .8);
    vg.addColorStop(0, "rgba(0,0,0,0)"); vg.addColorStop(1, "rgba(10,10,30,.32)"); return vg;
  }); g.fillRect(0, 0, viewW, VIEW_H);
}

/* ---------- Alles samen ---------- */
function render() {
  // Geen aparte wisbeurt: de achtergrond (lucht of interieur) bedekt altijd het hele canvas.
  g.setTransform(scale, 0, 0, scale, 0, 0);
  g.imageSmoothingEnabled = true;

  if (!L || state === "title" || state === "map" || state === "hero") {
    drawBackground("sneeuw", frame * .6, REGION.scene);
    drawFlakes(); vignette();
    return;
  }
  const theme = L.d.theme, cx = Math.round(cam);
  drawBackground(theme, cx);
  g.save(); g.translate(-cx, 0);

  for (const [k, x] of L.d.deco) drawDeco(k, x, theme);
  if (L.exit) drawExit(theme);

  const T = getTex(theme);
  g.imageSmoothingEnabled = false;
  const x0 = Math.max(0, fl(cx / TS) - 1), x1 = Math.min(L.w - 1, fl((cx + viewW) / TS) + 1);
  for (let ty = 0; ty < ROWS; ty++) for (let tx = x0; tx <= x1; tx++) { const c = L.grid[ty][tx]; if (c !== " " && c !== "G" && c !== "H") drawTile(c, tx * TS, ty * TS, theme, tx, ty, T); }
  g.imageSmoothingEnabled = true;

  if (!L.groundDecor) L.groundDecor = buildGroundDecor();
  for (const d of L.groundDecor) if (d.x > cx - 20 && d.x < cx + viewW + 20) drawGroundDecor(d, theme);

  drawGates(theme);
  if (L.pad && (!L.codeOpen || L.codeFade > 0)) drawPad();
  for (const c of L.checks) drawCheck(c);
  if (L.lantern) drawLantern(L.lantern);
  for (const s of L.signs) drawSign(s);

  for (const it of L.items) if (!it.taken) {
    const cx2 = it.x + 16, cy2 = it.y + 16 + Math.sin(frame / 18 + it.x) * 3;
    if (it.type === "coin" || it.type === "heart") {
      g.fillStyle = "rgba(0,0,0,.15)"; g.beginPath(); g.ellipse(cx2, it.y + 31, 7, 2, 0, 0, 7); g.fill();
      const m0 = g.getTransform(); g.translate(cx2, cy2);
      g.fillStyle = grad("glow", () => { const gl = g.createRadialGradient(0, 0, 2, 0, 0, 16); gl.addColorStop(0, "rgba(255,240,170,.5)"); gl.addColorStop(1, "rgba(255,240,170,0)"); return gl; });
      g.beginPath(); g.arc(0, 0, 16, 0, 7); g.fill(); g.setTransform(m0); // exact terug, zonder afrondingsfout
      if (it.type === "coin" && L.d.coin === "lego") drawLegoBrick(cx2, cy2 + 2, LEGO_COLS[Math.floor(hash(it.x) * 5)]);
      else emoji(it.type === "coin" ? L.d.coin : "🍫", cx2, cy2, it.type === "coin" ? 22 : 24);
      if ((frame + it.x) % 120 < 14) sparkle(cx2 + 8, cy2 - 8, 3, frame / 10);
    } else drawItem(it.type === "key" ? L.d.keyType : L.d.questType, cx2, cy2, frame * 16);
  }

  const hat = theme === "sneeuw" ? "xmas" : null;
  const scarf = theme === "sneeuw" || theme === "stad";
  for (const n of L.npcs) {
    const face = P.x > n.x ? 1 : -1;
    shadowAt(n.x + 11, n.y + TS, 11);
    drawPerson(n.who, n.x + 11, n.y + TS, 1, face, 0, false, hat, { t: frame * 16 + n.x * 7, scarf, indoor: theme === "huis" });
    g.font = "600 12px Fredoka, sans-serif"; g.textAlign = "center"; g.textBaseline = "middle";
    const tw = g.measureText(n.who.name).width + 12;
    g.fillStyle = OUT; g.beginPath(); rp(n.x + 11 - tw / 2 - 1.5, n.y - 33.5, tw + 3, 19, 6); g.fill();
    g.fillStyle = "#c9955a"; g.beginPath(); rp(n.x + 11 - tw / 2, n.y - 32, tw, 16, 5); g.fill();
    g.fillStyle = "#3a200c"; g.fillText(n.who.name, n.x + 11, n.y - 23.5);
    const needs = n.quest && !L.questDone;
    if (needs || !n.talked) {
      const by = n.y - 48 + Math.sin(frame / 10) * 2;
      g.fillStyle = OUT; g.beginPath(); g.arc(n.x + 11, by, 9.5, 0, 7); g.fill();
      g.fillStyle = needs ? "#ffd25e" : "#ffffff"; g.beginPath(); g.arc(n.x + 11, by, 8, 0, 7); g.fill();
      g.fillStyle = "#3a200c"; g.font = "700 13px Fredoka, sans-serif"; g.fillText(needs ? "!" : "…", n.x + 11, by + 1);
    }
  }
  for (const e of L.enemies) drawEnemy(e, frame * 16);

  if (!(P.inv > 0 && fl(P.inv / 4) % 2)) {
    const ch = heroChar();
    // On the birthday level the birthday boy wears a party hat.
    const pHat = L.d.birthday === ch.name ? "party" : hat;
    if (P.slide) {
      // Op de buik: het staande poppetje een kwartslag gedraaid, hoofd vooruit, buik naar beneden, midden op de plek.
      const cx = P.x + P.w / 2, gy = P.y + P.h;
      shadowAt(cx, gy, 20);
      const m0 = g.getTransform();
      g.translate(cx - P.face * P.h / 2, gy - 9 + Math.sin(frame / 3) * .4); g.rotate(P.face * Math.PI / 2);
      drawPerson(ch, 0, 0, 1, P.face, 0, false, pHat, { t: frame * 16, scarf, indoor: theme === "huis", slide: true });
      g.setTransform(m0);
    } else {
      if (P.onGround) shadowAt(P.x + P.w / 2, P.y + P.h, 11);
      drawPerson(ch, P.x + P.w / 2, P.y + P.h, 1, P.face, P.anim, !P.onGround, pHat, { t: frame * 16, moving: Math.abs(P.vx) > .3, scarf, indoor: theme === "huis" });
    }
  }

  if (!dialog) {
    const near = nearest(L.npcs) || nearest(L.signs) || (L.lantern && Math.abs(L.lantern.x + 16 - (P.x + P.w / 2)) < 44 ? L.lantern : null)
      || (L.pad && !L.codeOpen && Math.abs(L.pad.x + 16 - (P.x + P.w / 2)) < 50 ? L.pad : null);
    if (near) {
      const label = GP.on ? "□" : isTouch ? "💬" : "E", bx = P.x + P.w / 2, byy = P.y - 22 + Math.sin(frame / 8) * 1.5;
      g.fillStyle = OUT; g.beginPath(); rp(bx - 13.5, byy - 11.5, 27, 23, 7); g.fill();
      g.fillStyle = "#ffd25e"; g.beginPath(); rp(bx - 12, byy - 10, 24, 20, 6); g.fill();
      g.fillStyle = "#2a1404"; g.font = "700 13px Fredoka, sans-serif"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(label, bx, byy + 1);
    }
  }
  for (const p of particles) { g.globalAlpha = Math.min(1, p.life / 20); g.fillStyle = p.c; g.fillRect(p.x, p.y, p.s, p.s); }
  g.globalAlpha = 1;
  g.textBaseline = "middle"; g.textAlign = "center"; g.font = "700 15px Fredoka, sans-serif"; g.lineJoin = "round";
  for (const p of popups) { g.globalAlpha = Math.min(1, p.life / 20); g.lineWidth = 4; g.strokeStyle = "rgba(20,10,20,.8)"; g.strokeText(p.text, p.x, p.y); g.fillStyle = p.color; g.fillText(p.text, p.x, p.y); }
  g.globalAlpha = 1;
  g.restore();
  drawAmbient(theme);
  if (theme === "sneeuw" || theme === "stad") drawFlakes();
  vignette();
}
