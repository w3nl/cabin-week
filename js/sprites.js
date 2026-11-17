"use strict";
// Poppetjes, vijanden en voorwerpen.
/* ---------- Poppetje ---------- */
function drawPerson(c, cx, by, s, face, phase, air, hat, opts = {}) {
  const t = opts.t || 0, moving = !!opts.moving, kid = !!c.kid, sz = c.size || 1;
  const skin = "#f4caa6", skinD = "#d9a07c", shoe = c.shoes || "#3a2a22";
  // Indoors Paul wears his green Christmas jumper with a Saab 900 on it.
  const sweater = opts.indoor && c.sweater;
  const coat = sweater ? c.sweater : c.coatCol, coatD = shade(coat, -.3), coatL = shade(coat, .25);
  const pants = c.pants, pantsD = shade(pants, -.28);
  const hairC = c.hairCol, hairL = shade(hairC, .3), hairD = shade(hairC, -.35);
  const bob = (!moving && !air) ? Math.sin(t / 280) * .5 : 0;
  const sw = air ? .5 : moving ? Math.sin(phase) * .7 : 0;
  // Kinderen hebben een iets grotere kop en een korter lijf.
  const hr = kid ? 9.4 : 8.6, hip = kid ? -12 : -13, top = (kid ? -26 : -28) + bob, hy = top - hr + .6;
  const longCoat = c.coat === "long" && !opts.indoor;
  // Buikglijden (opts.slide): het hoofd kijkt omhoog-vooruit (gekanteld rond de nek) en de armen gaan gestrekt naar voren.
  // De wereld draait het hele poppetje een kwartslag (world.js); hier draaien hoofd en armen terug.
  const tilt = opts.slide ? -1.3 : 0;
  const tiltOn = () => { if (tilt) { g.save(); g.translate(0, top); g.rotate(tilt); g.translate(0, -top); } };
  const tiltOff = () => { if (tilt) g.restore(); };
  g.save(); g.translate(cx, by); g.scale(face * s * sz, s * sz);
  g.lineJoin = "round"; g.lineCap = "round"; g.lineWidth = 1.5; g.strokeStyle = OUT;

  // rugzak en haar achter het lijf
  if (c.backpack && !sweater) { blob(c.backpack, () => rp(-12.5, top + 1, 7, 15, 2.5)); g.fillStyle = shade(c.backpack, .2); g.fillRect(-11.5, top + 9, 5, 2); }
  tiltOn();
  if (c.hair === "long") blob(hairC, () => rp(-hr - 1.5, hy - 3, hr + 4, top - hy + 13, 5));
  if (c.hair === "flowing") {
    // lang, golvend haar tot halverwege de rug
    // Bij het lopen waait het haar naar achteren en zwaait het mee op de stappen; bij een sprong waait het op.
    const len = top - hy + 19;
    // Bij buikglijden waait het haar naar achteren, net als bij een sprong.
    const blown = air || opts.slide;
    const trail = blown ? -7 : moving ? -5 : 0;
    const swing = moving ? Math.sin(phase) * 3.5 : Math.sin(t / 400) * .6;
    const lift = blown ? -7 : moving ? -1.5 - Math.abs(Math.sin(phase)) * 2 : 0;
    const tipX = -5 + trail + swing, tipY = hy + len + lift, midX = -hr - 5 + trail * .6 + swing * .5;
    blob(hairC, () => { g.moveTo(-1, hy - hr); g.quadraticCurveTo(-hr - 6 + trail * .3, hy - 1, midX, hy + len * .55 + lift * .4); g.quadraticCurveTo(midX + 1, tipY + 1, tipX, tipY); g.quadraticCurveTo(0, tipY - 3, 1, hy + len * .5); g.lineTo(3, hy); g.closePath(); });
    g.strokeStyle = shade(hairC, -.2); g.lineWidth = .9; for (let i = 0; i < 3; i++) { g.beginPath(); g.moveTo(-3 - i * 2, hy + 2); g.quadraticCurveTo(midX + 6 - i, hy + len * .5 + lift * .4, tipX - i * 1.5, tipY - 2); g.stroke(); }
    g.strokeStyle = OUT; g.lineWidth = 1.5;
  }
  if (c.hair === "bob" || c.hair === "curly") {
    blob(hairC, () => rp(-hr - 2, hy - hr - .5, hr * 2 + 2.5, hr * 2 + 4, hr));
    if (c.hair === "curly") { g.fillStyle = hairC; for (let i = 0; i < 6; i++) { const a = Math.PI * (.55 + i * .17); g.beginPath(); g.arc(-1 + Math.cos(a) * (hr + 1.5), hy + 1 + Math.sin(a) * (hr + 1.5), 2.6, 0, 7); g.fill(); g.stroke(); } }
  }
  if (c.hair === "ponytail") {
    g.save(); g.translate(-hr + .5, hy - 1); g.rotate(.5 + Math.sin(t / 160) * (moving ? .25 : .08));
    blob(hairC, () => g.ellipse(-1, 8, 3.2, 8.5, 0, 0, 7)); g.restore();
  }
  tiltOff();

  // benen
  const leg = (x, a, col) => {
    g.save(); g.translate(x, hip); g.rotate(a);
    blob(col, () => g.rect(-2.7, 0, 5.4, -hip - 2));
    blob(shoe, () => rp(-3.2, -hip - 3.6, 8.2, 4.2, 1.6));
    if (c.laces) c.laces.forEach((lc, i) => { g.fillStyle = lc; g.fillRect(-1.5 + i * 2, -hip - 3, 1.4, 1.4); });
    g.fillStyle = "rgba(255,255,255,.25)"; g.fillRect(-2, -hip - 3, 4, 1);
    g.restore();
  };
  leg(-3, sw, pantsD);
  // achterste arm
  g.save(); g.translate(-3, top + 2); g.rotate(opts.slide ? Math.PI - .3 : air ? 2.3 : sw * .8);
  blob(coatD, () => rp(-2.3, 0, 4.6, 11, 2)); blob(skinD, () => g.arc(0, 11.6, 2.3, 0, 7)); g.restore();
  leg(3, -sw, pants);

  // rokje over de maillot
  if (c.skirt) {
    blob(c.skirt, () => { g.moveTo(-7.5, hip - 2); g.lineTo(7.5, hip - 2); g.lineTo(9.5, hip + 4.5); g.lineTo(-9.5, hip + 4.5); g.closePath(); });
    g.strokeStyle = shade(c.skirt, -.3); g.lineWidth = .9; [-4, 0, 4].forEach(px => { g.beginPath(); g.moveTo(px, hip - 1); g.lineTo(px * 1.25, hip + 4); g.stroke(); }); g.strokeStyle = OUT; g.lineWidth = 1.5;
  }
  // jas
  const bodyH = longCoat ? (hip + 8) - top : hip + 2 - top;
  const bodyPath = () => { if (longCoat) { g.moveTo(-8, top + 3); g.quadraticCurveTo(-8, top, -5, top); g.lineTo(5, top); g.quadraticCurveTo(8, top, 8, top + 3); g.lineTo(9.5, top + bodyH); g.lineTo(-9.5, top + bodyH); g.closePath(); } else rp(c.coat === "puffer" ? -8.8 : -8, top, c.coat === "puffer" ? 17.6 : 16, bodyH, c.coat === "puffer" ? 5.5 : 4); };
  g.save(); g.beginPath(); bodyPath(); g.fillStyle = coat; g.fill(); g.clip();
  g.fillStyle = coatD; g.fillRect(-10, top, 4.5, bodyH + 2);
  g.fillStyle = coatL; g.fillRect(2, top + 2, 3, 9);
  if (sweater) {
    // kerstpatroon: een witte rand met sneeuwvlokjes en een kleine auto
    g.fillStyle = "#f4f8ff"; for (let x = -9; x < 10; x += 3) { g.fillRect(x, top + 2, 1.4, 1.4); g.fillRect(x + 1.5, top + 3.5, 1.4, 1.4); }
    g.fillRect(-6, top + 9, 9, 2.4); g.fillRect(-4, top + 7.6, 5, 1.6); g.beginPath(); g.arc(-4, top + 11.8, 1.2, 0, 7); g.arc(2, top + 11.8, 1.2, 0, 7); g.fill();
    g.fillStyle = "#2a9a4a"; g.fillRect(-3, top + 5.8, 3, 1.8);
  }
  if (c.coat === "puffer" && !opts.indoor) { g.strokeStyle = coatD; g.lineWidth = 1; for (let y = top + 4.5; y < top + bodyH; y += 4.2) { g.beginPath(); g.moveTo(-10, y); g.lineTo(10, y); g.stroke(); } }
  g.strokeStyle = coatD; g.lineWidth = 1; g.beginPath(); g.moveTo(4, top + 1); g.lineTo(4, top + bodyH); g.stroke();
  if (c.coat !== "puffer" && !sweater) { g.fillStyle = coatD; g.fillRect(-4, top + bodyH - (longCoat ? 12 : 6), 5, 1.2); }
  g.restore();
  g.lineWidth = 1.5; g.strokeStyle = OUT; g.beginPath(); bodyPath(); g.stroke();

  // sjaal: eigen sjaal, of een rode in de sneeuw
  const scarf = c.scarf || (opts.scarf ? ["#d33a3a", "#ffffff"] : null);
  if (scarf) {
    const band = () => rp(-8.8, top - 2.5, 17.6, 5.5, 2.5);
    g.save(); g.beginPath(); band(); g.clip(); scarf.forEach((col, i) => { g.fillStyle = col; g.fillRect(-9 + i * 18 / scarf.length, top - 3, 18 / scarf.length + .5, 6); }); g.restore();
    g.beginPath(); band(); g.stroke();
    g.save(); g.translate(5, top + 1.5); g.rotate(-.12 + Math.sin(t / 150) * .08 * (moving ? 2 : 1));
    g.beginPath(); rp(-2.2, 0, 4.6, kid ? 9 : 12, 1.5); g.save(); g.clip(); scarf.forEach((col, i) => { g.fillStyle = col; g.fillRect(-3, i * 3, 6, 3); }); for (let i = scarf.length; i < 5; i++) { g.fillStyle = scarf[i % scarf.length]; g.fillRect(-3, i * 3, 6, 3); } g.restore(); g.stroke();
    g.restore();
  } else { g.fillStyle = skin; g.beginPath(); g.moveTo(-1, top); g.lineTo(5, top); g.lineTo(2, top + 4); g.fill(); }

  // nek en hoofd
  g.fillStyle = skinD; g.fillRect(-2, top - 2, 4, 3);
  tiltOn();
  blob(skin, () => g.arc(0, hy, hr, 0, 7));
  g.fillStyle = skinD; g.beginPath(); g.ellipse(-3.2, hy + 1, 1.6, 2.2, 0, 0, 7); g.fill();
  g.strokeStyle = "#b9805e"; g.lineWidth = .8; g.stroke(); g.strokeStyle = OUT; g.lineWidth = 1.5;

  // haar voor
  if (c.hair === "bald") {
    g.strokeStyle = hairC; g.globalAlpha = .55; g.lineWidth = 2; g.beginPath(); g.arc(0, hy, hr - 1, Math.PI * .75, Math.PI * 1.1); g.stroke(); g.globalAlpha = 1;
    g.fillStyle = "rgba(255,255,255,.35)"; g.beginPath(); g.ellipse(1, hy - hr + 2.5, 3, 1.4, -.2, 0, 7); g.fill();
  } else if (c.hair === "short") {
    blob(hairC, () => { g.moveTo(-hr - .4, hy + 3); g.arc(0, hy - 1, hr + .4, Math.PI * .98, Math.PI * 2.02); g.lineTo(hr - .2, hy - 2); g.quadraticCurveTo(4, hy - 4.5, 1, hy - 3.8); g.lineTo(-4, hy - 1); g.lineTo(-5, hy + 4); g.closePath(); });
  } else {
    // lang, bob, krullen, paardenstaart: haar over de bovenkant met een lok over het voorhoofd
    blob(hairC, () => { g.moveTo(-hr - .8, hy + 4); g.arc(0, hy - .5, hr + .8, Math.PI * .95, Math.PI * 2.05); g.lineTo(hr + .2, hy + 1); g.quadraticCurveTo(5, hy - 3.5, 1, hy - 4); g.quadraticCurveTo(-3, hy - 2, -4, hy + 5); g.closePath(); });
  }
  if (c.hair !== "bald") { g.strokeStyle = hairL; g.lineWidth = 1.4; g.beginPath(); g.arc(-1, hy - 2, hr - 2.6, Math.PI * 1.15, Math.PI * 1.55); g.stroke(); }
  if (c.bun) {
    // een knotje boven op het hoofd, met een clipje
    g.strokeStyle = OUT; g.lineWidth = 1.3;
    blob(hairC, () => g.arc(-1.5, hy - hr - 1.2, 3.8, 0, 7));
    g.strokeStyle = shade(hairC, -.2); g.lineWidth = .9; g.beginPath(); g.arc(-1.5, hy - hr - 1.5, 2.2, .5, 4.5); g.stroke();
    g.fillStyle = c.bun; g.strokeStyle = OUT; g.lineWidth = 1; g.beginPath(); rp(1, hy - hr - 2.5, 3.2, 2.2, 1); g.fill(); g.stroke();
    g.fillStyle = "#fff"; g.fillRect(-3, hy - hr - 4, 1, 1); g.fillRect(.5, hy - hr - 5, 1, 1);
    g.strokeStyle = OUT; g.lineWidth = 1.5;
  }
  if (c.bow) { g.fillStyle = c.bow; g.strokeStyle = OUT; g.lineWidth = 1.2; [-1, 1].forEach(d => { g.beginPath(); g.moveTo(-hr + 1, hy - 2); g.lineTo(-hr + 1 + d * 4, hy - 5); g.lineTo(-hr + 1 + d * 4, hy + 1); g.closePath(); g.fill(); g.stroke(); }); }
  g.strokeStyle = OUT; g.lineWidth = 1.5;

  // gezicht
  const blink = (t % 3800) < 110;
  if (blink) { g.beginPath(); g.moveTo(2.4, hy - .5); g.lineTo(5.6, hy - .5); g.stroke(); }
  else {
    const ew = c.cute ? 2.5 : 2.1, eh = c.cute ? 3 : 2.6, pr = c.cute ? 1.7 : 1.3;
    g.lineWidth = .9; blob("#fff", () => g.ellipse(4, hy - .6, ew, eh, 0, 0, 7));
    g.fillStyle = "#3b5a7a"; g.beginPath(); g.arc(4.7, hy - .2, pr, 0, 7); g.fill();
    g.fillStyle = "#fff"; g.fillRect(4.9, hy - 1.5, 1, 1); if (c.cute) g.fillRect(4, hy + .4, .6, .6);
    if (c.cute) { g.strokeStyle = OUT; g.lineWidth = .9; g.beginPath(); g.moveTo(5.6, hy - 3.2); g.lineTo(7, hy - 4.2); g.moveTo(6.2, hy - 2.4); g.lineTo(7.6, hy - 3); g.stroke(); }
  }
  g.strokeStyle = c.hair === "bald" ? shade(hairC, -.2) : hairD; g.lineWidth = 1.2; g.beginPath(); g.moveTo(2, hy - 4.2); g.lineTo(6, hy - 4.6); g.stroke();
  g.fillStyle = skinD; g.beginPath(); g.arc(hr - .3, hy + 1.6, 1.5, 0, 7); g.fill();
  g.fillStyle = c.cute ? "rgba(255,110,130,.5)" : "rgba(255,110,110,.35)"; g.beginPath(); g.arc(4.6, hy + 2.8, c.cute ? 2.1 : 1.8, 0, 7); g.fill();
  g.strokeStyle = "#8a3a2a"; g.lineWidth = 1; g.beginPath(); g.arc(4.6, hy + 3.5, 1.9, .2, Math.PI - .4); g.stroke();
  if (c.stubble) { g.fillStyle = "rgba(110,80,50,.45)"; for (let i = 0; i < 9; i++) g.fillRect(-.5 + (i % 5) * 1.6, hy + 4.2 + Math.floor(i / 5) * 1.4, .9, .9); }
  if (c.glasses === "round") {
    g.strokeStyle = "#7a5a3a"; g.lineWidth = .8; g.beginPath(); g.arc(4.2, hy - .5, 2.8, 0, 7); g.stroke();
    g.beginPath(); g.moveTo(1.3, hy - 1); g.lineTo(-2.2, hy - .5); g.moveTo(7.1, hy - .9); g.lineTo(hr, hy - .6); g.stroke();
  } else if (c.glasses === "thick") {
    g.strokeStyle = "#151515"; g.lineWidth = 1.7; g.beginPath(); rp(1, hy - 3, 6.6, 5, 1.4); g.stroke();
    g.beginPath(); g.moveTo(1, hy - 1.5); g.lineTo(-2.2, hy - 1); g.stroke();
  }
  g.strokeStyle = OUT; g.lineWidth = 1.5;

  tiltOff();

  // voorste arm
  g.save(); g.translate(3, top + 2); g.rotate(opts.slide ? Math.PI + .15 : air ? -2.5 : -sw * .8);
  blob(coat, () => rp(-2.3, 0, 4.6, 11, 2)); blob(skin, () => g.arc(0, 11.6, 2.3, 0, 7)); g.restore();
  if (c.backpack && !sweater) { g.strokeStyle = shade(c.backpack, -.2); g.lineWidth = 1.8; g.beginPath(); g.moveTo(-2, top + .5); g.lineTo(-3, top + 11); g.stroke(); g.strokeStyle = OUT; g.lineWidth = 1.5; }

  // haarband, muts en hoedjes
  tiltOn();
  if (c.headband && !hat) { g.strokeStyle = c.headband; g.lineWidth = 3; g.beginPath(); g.arc(0, hy - .5, hr - .2, Math.PI * 1.08, Math.PI * 1.92); g.stroke(); g.strokeStyle = OUT; g.lineWidth = 1.5; }
  // beanieCold: de muts alleen buiten in de kou (sneeuw en kerstmarkt: daar krijgt iedereen een sjaal), niet binnen of op het portretje.
  const beanie = c.beanie && !(c.beanieCold && (opts.indoor || !opts.scarf));
  const ownHat = !hat && beanie ? "beanie" : hat;
  if (ownHat === "xmas") {
    blob("#d8323a", () => { g.moveTo(-9, hy - 6); g.quadraticCurveTo(-2, hy - 22, -12, hy - 17); g.lineTo(8, hy - 6); g.closePath(); });
    blob("#fff", () => rp(-10, hy - 8.5, 19.5, 4.5, 2)); blob("#fff", () => g.arc(-12, hy - 17, 3, 0, 7));
  } else if (ownHat === "party") {
    blob("#ffd25e", () => { g.moveTo(-6, hy - 6); g.lineTo(6, hy - 6); g.lineTo(0, hy - 21); g.closePath(); });
    g.fillStyle = "#3aa0ff"; g.fillRect(-3, hy - 12, 6, 2);
    blob("#ff5a7a", () => g.arc(0, hy - 21, 2.6, 0, 7));
  } else if (ownHat === "beanie") {
    blob(c.beanie, () => { g.arc(0, hy - 1.5, hr + .6, Math.PI, 0); g.closePath(); });
    g.strokeStyle = shade(c.beanie, -.25); g.lineWidth = 1; for (let x = -hr + 2; x < hr; x += 2.6) { g.beginPath(); g.moveTo(x, hy - 2); g.lineTo(x, hy - hr + 1); g.stroke(); }
    g.strokeStyle = OUT; g.lineWidth = 1.5;
    blob(shade(c.beanie, .15), () => rp(-hr - .8, hy - 3.5, hr * 2 + 1.6, 3.8, 1.6));
  }
  tiltOff();
  g.restore();
}
function shadowAt(x, y, w) { g.fillStyle = "rgba(0,0,0,.22)"; g.beginPath(); g.ellipse(x, y, w, 3, 0, 0, 7); g.fill(); }

/* ---------- Vijanden ---------- */
function drawEnemy(e, t) {
  const f = e.vx > 0 ? 1 : -1;
  shadowAt(e.x + e.w / 2, e.y + e.h, 14);
  g.save(); g.translate(e.x + e.w / 2, e.y + e.h); g.scale(f, 1);
  if (e.dead) g.scale(1.1, .35);
  g.lineJoin = "round"; g.lineCap = "round"; g.lineWidth = 1.6; g.strokeStyle = OUT;
  if (e.kind === "zwijn") {
    const st = Math.sin(e.x * .35) * 3; // pas op de afgelegde weg, zodat de pootjes vloeiend meelopen
    // staart
    g.strokeStyle = "#3a2618"; g.lineWidth = 1.8; g.beginPath(); g.moveTo(-15, -15); g.bezierCurveTo(-22, -20, -20, -10, -17, -13); g.stroke();
    g.strokeStyle = OUT; g.lineWidth = 1.6;
    // poten
    [[-10, st], [-4, -st], [5, st], [10, -st]].forEach(([x, d], i) => {
      blob(i % 2 ? "#3c2a1d" : "#4a3424", () => g.rect(x - 2, -8 + (i % 2 ? 0 : 0), 4, 7 + d * .3));
      g.fillStyle = "#1c1410"; g.fillRect(x - 2, -2 + d * .3, 4, 2);
    });
    // lijf
    g.save(); g.beginPath(); g.ellipse(0, -14, 16, 10, 0, 0, 7); g.fillStyle = "#5e432f"; g.fill(); g.clip();
    g.fillStyle = "#4a3324"; g.fillRect(-16, -12, 32, 10); g.fillStyle = "#77563d"; g.beginPath(); g.ellipse(2, -19, 10, 3, 0, 0, 7); g.fill();
    g.restore(); g.beginPath(); g.ellipse(0, -14, 16, 10, 0, 0, 7); g.stroke();
    // manen
    g.fillStyle = "#2e2016"; for (let i = -12; i <= 8; i += 3.5) { g.beginPath(); g.moveTo(i, -22); g.lineTo(i + 1.8, -28 - (i % 2 ? 1 : 0)); g.lineTo(i + 3.5, -22); g.fill(); }
    // kop
    blob("#6a4c35", () => g.ellipse(14, -13, 8, 7, -.2, 0, 7));
    blob("#5a3f2c", () => { g.moveTo(9, -18); g.lineTo(11, -25); g.lineTo(14, -18); g.closePath(); });
    blob("#d9a48f", () => g.ellipse(21, -11, 3.5, 4, 0, 0, 7));
    g.fillStyle = "#6a3a30"; g.fillRect(20.5, -13, 1.2, 1.6); g.fillRect(20.5, -10, 1.2, 1.6);
    blob("#fff6e0", () => { g.moveTo(17, -8); g.quadraticCurveTo(21, -10, 20, -16); g.lineTo(18.5, -9.5); g.closePath(); }, false);
    g.lineWidth = 1; g.beginPath(); g.moveTo(17, -8); g.quadraticCurveTo(21, -10, 20, -16); g.stroke();
    blob("#fff", () => g.arc(15.5, -16, 2, 0, 7));
    g.fillStyle = "#b31d1d"; g.beginPath(); g.arc(16.2, -15.8, 1.1, 0, 7); g.fill();
    g.lineWidth = 1.6; g.beginPath(); g.moveTo(13, -19.5); g.lineTo(18, -18); g.stroke();
  } else if (e.kind === "robot") {
    // stofsporen
    blob("#2b2f38", () => g.ellipse(0, -6, 15.5, 6.5, 0, 0, 7));
    g.save(); g.beginPath(); g.ellipse(0, -10, 15, 7, 0, 0, 7); g.fillStyle = "#9aa4b4"; g.fill(); g.clip();
    g.fillStyle = "#c4ccd8"; g.beginPath(); g.ellipse(-3, -13, 11, 4, 0, 0, 7); g.fill();
    g.fillStyle = "#6f7889"; g.fillRect(-15, -6, 30, 3); g.restore();
    g.beginPath(); g.ellipse(0, -10, 15, 7, 0, 0, 7); g.stroke();
    blob("#1c2230", () => rp(-6, -14.5, 13, 5, 2));
    const on = Math.floor(t / 300) % 2;
    g.fillStyle = on ? "#3df0ff" : "#ff5a5a"; g.fillRect(-3.5, -13.2, 2.5, 2); g.fillRect(2, -13.2, 2.5, 2);
    g.strokeStyle = "#e1e6ee"; g.lineWidth = 1.4; const sp = t / 50;
    for (let i = 0; i < 3; i++) { const a = sp + i * 2.1; g.beginPath(); g.moveTo(13, -2); g.lineTo(13 + Math.cos(a) * 7, -2 + Math.sin(a) * 2.5); g.stroke(); }
    g.fillStyle = "rgba(160,150,140,.35)"; for (let i = 0; i < 3; i++) g.fillRect(-18 - i * 4 - (t / 40 % 4), -3 - i, 2, 2);
  } else {
    g.strokeStyle = "#4a6a95";
    const wob = Math.sin(e.x * .12) * .08; // waggelen met de afgelegde weg (niet t + e.x: dat springt elke stap)
    g.rotate(wob);
    blob("#f6f9ff", () => g.arc(0, -10, 10.5, 0, 7));
    g.fillStyle = "#cbdaf0"; g.beginPath(); g.arc(-3, -7, 7, 0, 7); g.fill();
    g.fillStyle = "#f6f9ff"; g.beginPath(); g.arc(1.5, -11.5, 8, 0, 7); g.fill();
    blob("#f6f9ff", () => g.arc(0, -25, 7.5, 0, 7));
    g.strokeStyle = "#6b4426"; g.lineWidth = 1.6;
    g.beginPath(); g.moveTo(-8, -14); g.lineTo(-17, -20 + Math.sin(t / 100) * 3); g.moveTo(-14, -18); g.lineTo(-16, -23); g.stroke();
    g.beginPath(); g.moveTo(8, -14); g.lineTo(16, -19 - Math.sin(t / 100) * 3); g.stroke();
    g.strokeStyle = OUT; g.lineWidth = 1.4;
    blob("#c43a3a", () => rp(-7, -19.5, 14, 3.5, 1.5));
    blob("#c43a3a", () => rp(-6, -18, 3.5, 8, 1));
    blob("#222", () => g.rect(-6.5, -33, 13, 2.5)); blob("#222", () => g.rect(-4.5, -41, 9, 8));
    g.fillStyle = "#b8322e"; g.fillRect(-4.5, -35.5, 9, 1.8);
    blob("#ff8a2a", () => { g.moveTo(5, -26); g.lineTo(13, -24.5); g.lineTo(5, -23); g.closePath(); });
    g.fillStyle = "#1d1d26"; g.fillRect(1.5, -29, 2, 2); g.fillRect(5, -29, 2, 2);
    [[0, -14], [0, -9], [0, -4]].forEach(([x, y]) => { g.beginPath(); g.arc(x + 2, y, 1.3, 0, 7); g.fill(); });
  }
  g.restore();
}

/* ---------- Voorwerpen ---------- */
function drawItem(kind, cx, cy, t) {
  g.save();
  const gl = g.createRadialGradient(cx, cy, 2, cx, cy, 19);
  gl.addColorStop(0, "rgba(255,240,170,.55)"); gl.addColorStop(1, "rgba(255,240,170,0)");
  g.fillStyle = gl; g.beginPath(); g.arc(cx, cy, 19, 0, 7); g.fill();
  g.lineJoin = "round"; g.lineCap = "round"; g.lineWidth = 1.6; g.strokeStyle = OUT;
  if (kind === "key") {
    g.save(); g.translate(cx, cy); g.rotate(-.35);
    blob("#ffcf3f", () => { g.arc(-6, 0, 6, 0, 7); g.moveTo(-3.5, 0); g.arc(-6, 0, 2.5, 0, 7, true); });
    blob("#ffcf3f", () => { g.rect(-1, -2, 14, 4); g.rect(8, 1, 2.8, 5); g.rect(11.5, 1, 2.6, 3.5); });
    g.fillStyle = "#fff6c0"; g.fillRect(0, -1.4, 10, 1.2); g.beginPath(); g.arc(-8, -2.5, 1.2, 0, 7); g.fill();
    g.restore();
  } else if (kind === "charger") {
    g.strokeStyle = "#f2f2f2"; g.lineWidth = 2.2; g.beginPath(); g.moveTo(cx, cy + 6); g.bezierCurveTo(cx, cy + 15, cx + 13, cy + 11, cx + 11, cy + 2); g.stroke();
    g.strokeStyle = OUT; g.lineWidth = 1.6;
    blob("#9aa3ad", () => { g.rect(cx - 4.5, cy - 14, 2.6, 6); g.rect(cx + 1.9, cy - 14, 2.6, 6); });
    blob("#f7f7f7", () => rp(cx - 7.5, cy - 8.5, 15, 15, 3));
    g.fillStyle = "#d9dde2"; g.fillRect(cx - 7, cy + 2, 14, 4);
    g.fillStyle = "#38d07a"; g.fillRect(cx - 2, cy - 4, 4, 4); g.fillStyle = "#1e1622"; g.font = "700 6px sans-serif"; g.textAlign = "center"; g.fillText("⚡", cx, cy + 4);
  } else if (kind === "bauble") {
    blob("#ffd25e", () => rp(cx - 3.5, cy - 10, 7, 4.5, 1));
    g.strokeStyle = "#ffd25e"; g.lineWidth = 1.4; g.beginPath(); g.arc(cx, cy - 12, 2, 0, 7); g.stroke(); g.strokeStyle = OUT; g.lineWidth = 1.6;
    const gr = g.createRadialGradient(cx - 3, cy - 1, 1, cx, cy + 2, 10); gr.addColorStop(0, "#ff9a9a"); gr.addColorStop(.6, "#d4202e"); gr.addColorStop(1, "#8a0f1a");
    blob(gr, () => g.arc(cx, cy + 2, 9, 0, 7));
    g.strokeStyle = "rgba(255,230,140,.9)"; g.lineWidth = 1.5; g.beginPath(); g.arc(cx, cy + 2, 6, .3, 2.8); g.stroke();
    g.fillStyle = "#fff"; g.beginPath(); g.ellipse(cx - 3.5, cy - 1.5, 2, 3, -.6, 0, 7); g.fill();
  } else if (kind === "coffee" || kind === "tea") {
    const tea = kind === "tea";
    blob("#e9edf2", () => g.ellipse(cx, cy + 8, 13, 3.5, 0, 0, 7));
    blob("#ffffff", () => { g.moveTo(cx - 9, cy - 4); g.lineTo(cx + 7, cy - 4); g.lineTo(cx + 5, cy + 7); g.lineTo(cx - 7, cy + 7); g.closePath(); });
    g.lineWidth = 1.8; g.beginPath(); g.arc(cx + 8, cy + 1, 3.5, -1.3, 1.3); g.stroke(); g.lineWidth = 1.6;
    g.fillStyle = tea ? "#b8742a" : "#6b3a1c"; g.beginPath(); g.ellipse(cx - 1, cy - 3.5, 7.5, 1.6, 0, 0, 7); g.fill();
    if (tea) { g.strokeStyle = "#e8e2d0"; g.lineWidth = 1; g.beginPath(); g.moveTo(cx + 2, cy - 4); g.quadraticCurveTo(cx + 9, cy - 8, cx + 10, cy - 1); g.stroke(); g.fillStyle = "#f2d14a"; g.fillRect(cx + 8, cy - 1, 5, 6); g.strokeStyle = OUT; g.lineWidth = 1; g.strokeRect(cx + 8, cy - 1, 5, 6); g.lineWidth = 1.6; }
    g.fillStyle = "#c0392b"; g.fillRect(cx - 6, cy + 1, 10, 2.2);
    g.strokeStyle = "rgba(255,255,255,.8)"; g.lineWidth = 1.4;
    for (let i = 0; i < 2; i++) { g.beginPath(); const x = cx - 3 + i * 4; g.moveTo(x, cy - 7); g.bezierCurveTo(x - 3, cy - 10 - Math.sin(t / 150 + i) * 2, x + 3, cy - 13, x, cy - 17); g.stroke(); }
  } else if (kind === "towel") {
    blob("#5fb6e0", () => rp(cx - 12, cy - 9, 24, 17, 3));
    g.fillStyle = "#fff"; g.fillRect(cx - 11, cy - 4, 22, 2.5); g.fillRect(cx - 11, cy + 2, 22, 2);
    g.fillStyle = "#86cdee"; g.fillRect(cx - 11, cy - 8, 22, 2);
    blob("#4aa2cc", () => rp(cx - 12, cy + 4, 24, 5, 2));
  } else if (kind === "wood") {
    [[-6, 4], [6, 4], [0, -4]].forEach(([dx, dy]) => {
      blob("#7a4a26", () => rp(cx + dx - 10, cy + dy - 4.5, 19, 9, 4));
      g.fillStyle = "#5e381b"; g.fillRect(cx + dx - 7, cy + dy - 1, 10, 1.2);
      blob("#e0b077", () => g.ellipse(cx + dx + 8, cy + dy, 3.4, 4.5, 0, 0, 7));
      g.strokeStyle = "#a8763f"; g.lineWidth = 1; g.beginPath(); g.ellipse(cx + dx + 8, cy + dy, 1.6, 2.4, 0, 0, 7); g.stroke(); g.strokeStyle = OUT; g.lineWidth = 1.6;
    });
  } else emoji(kind, cx, cy, 22);
  sparkle(cx + 11, cy - 11, 3 + Math.sin(t / 120) * 1.5, t / 400);
  g.restore();
}
