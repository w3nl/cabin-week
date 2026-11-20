// The TripScouts artwork: winter and summer side by side, split on a diagonal, with Paul (the scout, with his
// backpack) standing on the line. Drawn with the game's own drawing code (drawPerson, pineShape), so he looks exactly
// like in the game. Not part of the game itself: tools/icons.js and tools/store.js load this into the running game page
// and call drawTripScene() to make the app icons, the TV banner and the store images.
/* global g, withCtx, drawPerson, pineShape, CHARS */
window.drawTripScene = function (ctx, W, H, o = {}) {
  // Everything is designed 512 high; k scales it to the real height. The split runs at 45° through (split, 256).
  const k = H / 512, w = W / k, split = o.split ?? w / 2, paulX = o.paulX ?? split, paulS = o.paulS ?? 5.9;
  const top = split + 256, bottom = split - 256; // where the split line meets the top and the bottom edge
  withCtx(ctx, () => {
    g.setTransform(k, 0, 0, k, 0, 0); g.lineJoin = "round"; g.lineCap = "round";
    const winter = () => { g.beginPath(); g.moveTo(-10, -10); g.lineTo(top, -10); g.lineTo(bottom, 522); g.lineTo(-10, 522); g.closePath(); };
    const summer = () => { g.beginPath(); g.moveTo(top, -10); g.lineTo(w + 10, -10); g.lineTo(w + 10, 522); g.lineTo(bottom, 522); g.closePath(); };

    // Winter: a starry night, the moon, snowy mountains, pines and snow.
    // With o.winterImg / o.summerImg (screenshots of real levels, the same size as the picture), those fill the halves.
    g.save(); winter(); g.clip();
    if (o.winterImg) g.drawImage(o.winterImg, 0, 0, w, 512);
    else {
    let gr = g.createLinearGradient(0, 0, 0, 512); gr.addColorStop(0, "#0b1631"); gr.addColorStop(1, "#3d5f99");
    g.fillStyle = gr; g.fillRect(-10, -10, w + 20, 532);
    g.fillStyle = "#fff";
    for (let i = 0; i < Math.ceil(w / 40); i++) { const x = (i * 97) % (w + 40) - 20, y = 20 + (i * 53) % 200; g.globalAlpha = .5 + (i % 3) * .2; g.beginPath(); g.arc(x, y, 2.5 + (i % 2), 0, 7); g.fill(); }
    g.globalAlpha = 1;
    const mx = o.moonX ?? split - 51, my = o.moonY ?? 120;
    g.fillStyle = "#f7f3dc"; g.beginPath(); g.arc(mx, my, 34, 0, 7); g.fill(); g.fillStyle = "#14244a"; g.beginPath(); g.arc(mx + 15, my - 10, 31, 0, 7); g.fill();
    // a range of snowy mountains, repeated to the left on wide images
    for (let x0 = split - 276; x0 > -400; x0 -= 300) {
      g.fillStyle = "#8fa9d6"; g.beginPath(); g.moveTo(x0 - 20, 360); g.lineTo(x0 + 90, 200); g.lineTo(x0 + 170, 300); g.lineTo(x0 + 240, 230); g.lineTo(x0 + 360, 380); g.lineTo(x0 - 20, 400); g.fill();
      g.fillStyle = "#f4f8ff";
      [[90, 200, 30, 44, 56], [240, 230, 28, 36, 48]].forEach(([px, py, hw, d1, d2]) => { g.beginPath(); g.moveTo(x0 + px, py); g.lineTo(x0 + px + hw, py + d1); g.lineTo(x0 + px + hw * .45, py + d1 - 6); g.lineTo(x0 + px, py + d2); g.lineTo(x0 + px - hw * .45, py + d1 - 8); g.lineTo(x0 + px - hw, py + d1); g.closePath(); g.fill(); });
    }
    for (let x = split - 196; x > -60; x -= 150) { pineShape(x, 420, 150, "#1f4152", "#173444", "#f4f8ff", "#0f2230"); pineShape(x + 80, 410, 110, "#1f4152", "#173444", "#f4f8ff", "#0f2230"); }
    g.fillStyle = "#e6effa"; g.beginPath(); g.moveTo(-10, 400); g.quadraticCurveTo(w / 2, 380, w + 10, 410); g.lineTo(w + 10, 522); g.lineTo(-10, 522); g.fill();
    }
    g.restore();

    // Summer: a blue sky, the sun, the sea, a beach and a parasol.
    g.save(); summer(); g.clip();
    if (o.summerImg) g.drawImage(o.summerImg, 0, 0, w, 512);
    else {
    const gr = g.createLinearGradient(0, 0, 0, 512); gr.addColorStop(0, "#3a8ad6"); gr.addColorStop(.7, "#9fd3f0");
    g.fillStyle = gr; g.fillRect(-10, -10, w + 20, 532);
    const sx = split + 164;
    const halo = g.createRadialGradient(sx, 170, 30, sx, 170, 110); halo.addColorStop(0, "rgba(255,245,190,.9)"); halo.addColorStop(1, "rgba(255,245,190,0)");
    g.fillStyle = halo; g.fillRect(sx - 120, 50, 240, 240);
    g.fillStyle = "#ffd25e"; g.beginPath(); g.arc(sx, 170, 46, 0, 7); g.fill();
    g.fillStyle = "#2a9fd0"; g.fillRect(-10, 330, w + 20, 90);
    g.fillStyle = "rgba(255,255,255,.55)"; for (let x = split + 44; x < w; x += 60) g.fillRect(x, 352 + (x % 3) * 14, 34, 3);
    g.fillStyle = "#f2d68a"; g.beginPath(); g.moveTo(-10, 412); g.quadraticCurveTo(w / 2, 395, w + 10, 400); g.lineTo(w + 10, 522); g.lineTo(-10, 522); g.fill();
    for (let px = split + 196; px < w + 80; px += 330) {
      g.strokeStyle = "#1e1622"; g.lineWidth = 6; g.beginPath(); g.moveTo(px - 12, 420); g.lineTo(px, 300); g.stroke();
      ["#e8423a", "#f4f4f0", "#e8423a", "#f4f4f0"].forEach((c, i) => { g.fillStyle = c; g.beginPath(); g.moveTo(px, 300); g.arc(px, 300, 70, Math.PI + i * Math.PI / 4, Math.PI + (i + 1) * Math.PI / 4); g.closePath(); g.fill(); });
    }
    }
    g.restore();

    // The split: a white line with a thin dark edge.
    g.strokeStyle = "#fff"; g.lineWidth = 10; g.beginPath(); g.moveTo(top, 0); g.lineTo(bottom, 512); g.stroke();
    g.strokeStyle = "#1e1622"; g.lineWidth = 3; g.beginPath(); g.moveTo(top + 6, -6); g.lineTo(bottom - 6, 518); g.stroke();

    // A soft shade behind the name, so it stays readable on a busy screenshot.
    if (o.title && o.winterImg) { const sh = g.createLinearGradient(0, 0, split, 0); sh.addColorStop(0, "rgba(11,22,49,.75)"); sh.addColorStop(1, "rgba(11,22,49,0)"); g.fillStyle = sh; g.fillRect(0, 0, split, 512); }
    // The scout: Paul with his backpack, on the line between winter and summer, looking towards the summer.
    g.fillStyle = "rgba(0,0,0,.25)"; g.beginPath(); g.ellipse(paulX, 452, 64 * paulS / 5.9, 11, 0, 0, 7); g.fill();
    drawPerson(CHARS[0], paulX, 452, paulS, 1, 0, false, null, { t: 1000, moving: false, scarf: true });

    // Optional title: "Trip" in snow white and "Scouts" in ember orange, like the title screen.
    if (o.title) {
      const { x, y, size, sub } = o.title;
      g.textBaseline = "alphabetic"; g.textAlign = "left"; g.lineJoin = "round";
      g.font = `700 ${size}px Fredoka, sans-serif`;
      const tw = g.measureText("Trip").width;
      g.lineWidth = size * .16; g.strokeStyle = "rgba(11,22,49,.85)";
      g.strokeText("Trip", x, y); g.strokeText("Scouts", x + tw, y);
      g.fillStyle = "#eef4f8"; g.fillText("Trip", x, y);
      g.fillStyle = "#7a3418"; g.fillText("Scouts", x + tw + size * .06, y + size * .06);
      g.fillStyle = "#ff9b45"; g.fillText("Scouts", x + tw, y);
      if (sub) {
        g.font = `600 ${size * .3}px Fredoka, sans-serif`; g.lineWidth = size * .07;
        g.strokeText(sub, x, y + size * .55); g.fillStyle = "#ffd25e"; g.fillText(sub, x, y + size * .55);
      }
    }
  });
};
