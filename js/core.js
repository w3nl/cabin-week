"use strict";
// Opslaan en geluid.
/* =====================================================================
   OPSLAG
   ===================================================================== */
let save = { unlocked: 1, char: 0, best: {} };
try { const s = JSON.parse(localStorage.getItem("cabin-week") || "null"); if (s) save = Object.assign(save, s); } catch (e) {}
function persist() { try { localStorage.setItem("cabin-week", JSON.stringify(save)); } catch (e) {} }

/* =====================================================================
   GELUID
   ===================================================================== */
let actx = null, muted = false;
/* iPhone en iPad (en Chrome) starten geluid pas na een tik of toets van de speler, en zetten het stil als de app even
   op de achtergrond was. Daarom: bij de eerste tik of toets het geluid aanzetten, en bij terugkomen weer aan. */
function unlockAudio() {
  try {
    actx = actx || new (window.AudioContext || window.webkitAudioContext)();
    if (actx.state !== "running") actx.resume();
    const b = actx.createBuffer(1, 1, 22050), s = actx.createBufferSource(); s.buffer = b; s.connect(actx.destination); s.start(0);
  } catch (e) {}
}
["pointerdown", "touchend", "keydown"].forEach(ev => addEventListener(ev, unlockAudio, { capture: true, passive: true }));
addEventListener("visibilitychange", () => { if (!document.hidden && actx && actx.state !== "running") { try { actx.resume(); } catch (e) {} } });
function tone(f, d = .08, type = "square", vol = .04, slide = 0, delay = 0) {
  if (muted) return;
  try {
    actx = actx || new (window.AudioContext || window.webkitAudioContext)();
    if (actx.state === "suspended") actx.resume();
    const t0 = actx.currentTime + delay, o = actx.createOscillator(), gn = actx.createGain();
    o.type = type; o.frequency.setValueAtTime(f, t0);
    if (slide) o.frequency.exponentialRampToValueAtTime(slide, t0 + d);
    gn.gain.setValueAtTime(vol, t0); gn.gain.exponentialRampToValueAtTime(.0001, t0 + d);
    o.connect(gn).connect(actx.destination); o.start(t0); o.stop(t0 + d + .02);
  } catch (e) {}
}
const SFX = {
  jump: () => tone(320, .12, "square", .03, 640),
  coin: () => { tone(988, .06); tone(1319, .1, "square", .04, 0, .06); },
  key: () => [523, 659, 784, 1047].forEach((f, i) => tone(f, .1, "triangle", .06, 0, i * .07)),
  hurt: () => tone(220, .25, "sawtooth", .05, 70),
  stomp: () => tone(180, .12, "square", .05, 90),
  slide: () => tone(520, .3, "triangle", .04, 160),
  open: () => [392, 523, 659].forEach((f, i) => tone(f, .14, "triangle", .06, 0, i * .09)),
  bad: () => tone(160, .2, "square", .04, 120),
  win: () => [523, 659, 784, 1047, 784, 1047].forEach((f, i) => tone(f, .14, "triangle", .06, 0, i * .11))
};
