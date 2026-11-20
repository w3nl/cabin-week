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

/* Animal sounds, made with Web Audio like everything else (no sound files). call(): a voice that slides from f to f2,
   with a wobble (vib: speed in Hz, depth in Hz) and a soft start, like a bleat, a moo or a squawk. hiss(): a burst of
   filtered noise (a grunt's breath, a click, a splash). vol is scaled by `loud` (quieter for calls further away). */
function audio() { if (muted) return null; try { actx = actx || new (window.AudioContext || window.webkitAudioContext)(); if (actx.state === "suspended") actx.resume(); return actx; } catch (e) { return null; } }
function call(f, f2, d, type = "sawtooth", vol = .04, delay = 0, vib = 0, depth = 0, filt = 0) {
  const a = audio(); if (!a) return;
  try {
    const t0 = a.currentTime + delay, o = a.createOscillator(), gn = a.createGain();
    o.type = type; o.frequency.setValueAtTime(f, t0); if (f2 && f2 !== f) o.frequency.exponentialRampToValueAtTime(f2, t0 + d);
    if (vib) { const l = a.createOscillator(), lg = a.createGain(); l.frequency.value = vib; lg.gain.value = depth; l.connect(lg).connect(o.frequency); l.start(t0); l.stop(t0 + d + .02); }
    gn.gain.setValueAtTime(.0001, t0); gn.gain.exponentialRampToValueAtTime(vol, t0 + Math.min(.04, d / 4)); gn.gain.exponentialRampToValueAtTime(.0001, t0 + d);
    let out = o;
    if (filt) { const bq = a.createBiquadFilter(); bq.type = "lowpass"; bq.frequency.value = filt; out = o.connect(bq); }
    out.connect(gn).connect(a.destination); o.start(t0); o.stop(t0 + d + .02);
  } catch (e) {}
}
let NOISE = null;
function hiss(d, vol = .04, freq = 1200, delay = 0, q = 1) {
  const a = audio(); if (!a) return;
  try {
    if (!NOISE) { NOISE = a.createBuffer(1, a.sampleRate, a.sampleRate); const ch = NOISE.getChannelData(0); for (let i = 0; i < ch.length; i++) ch[i] = Math.random() * 2 - 1; }
    const t0 = a.currentTime + delay, s = a.createBufferSource(), bq = a.createBiquadFilter(), gn = a.createGain();
    s.buffer = NOISE; bq.type = "bandpass"; bq.frequency.value = freq; bq.Q.value = q;
    gn.gain.setValueAtTime(vol, t0); gn.gain.exponentialRampToValueAtTime(.0001, t0 + d);
    s.connect(bq).connect(gn).connect(a.destination); s.start(t0); s.stop(t0 + d + .02);
  } catch (e) {}
}
/* One sound per animal (the enemies, the moose and the lost animals you bring back, by their emoji). l = loudness, 0–1. */
const ANIMAL_SFX = {
  zwijn: l => { [0, .18].forEach(t => { call(120, 85, .16, "sawtooth", .05 * l, t, 30, 14, 700); hiss(.14, .035 * l, 400, t, 2); }); },
  robot: l => [880, 660, 990].forEach((f, i) => call(f, f, .06, "square", .025 * l, i * .08)),
  sneeuwpop: l => { hiss(.35, .03 * l, 900, 0, .7); call(160, 120, .3, "triangle", .03 * l, 0, 18, 20); },
  pinguin: l => [0, .2].forEach(t => call(620, 480, .16, "sawtooth", .035 * l, t, 30, 40, 2400)),
  geit: l => call(430, 400, .55, "sawtooth", .035 * l, 0, 17, 35, 2000),
  troll: l => call(95, 75, .5, "sawtooth", .045 * l, 0, 6, 10, 600),
  gans: l => [0, .19].forEach(t => call(560, 430, .15, "square", .03 * l, t, 0, 0, 1800)),
  meeuw: l => [0, .22, .4].forEach((t, i) => call(1450 - i * 80, 900, .2, "triangle", .04 * l, t, 9, 25)),
  krab: l => [0, .08, .2, .28].forEach(t => hiss(.03, .05 * l, 3500, t, 4)),
  marmot: l => call(2300, 2700, .3, "sine", .035 * l, 0, 5, 30),
  speelgoed: l => { [0, .1, .2, .3].forEach(t => hiss(.025, .04 * l, 4200, t, 5)); call(1200, 1600, .08, "square", .02 * l, .42); },
  pakje: l => { call(140, 60, .16, "sine", .07 * l); hiss(.1, .03 * l, 300, 0, 1); },
  poolvos: l => [0, .14].forEach(t => call(850, 1400, .1, "triangle", .04 * l, t)),
  lemming: l => [0, .1].forEach(t => call(2600, 3200, .07, "sine", .03 * l, t)),
  mygga: l => call(560, 600, .7, "sawtooth", .012 * l, 0, 22, 25, 3000),
  wesp: l => call(240, 260, .6, "sawtooth", .02 * l, 0, 30, 18, 1600),
  duif: l => { call(400, 340, .25, "sine", .04 * l, 0, 12, 12); call(380, 320, .4, "sine", .04 * l, .3, 12, 12); },
  bever: l => { hiss(.08, .07 * l, 700, 0, .8); call(180, 90, .1, "sine", .05 * l); },
  alg: l => call(150, 105, 1, "sawtooth", .05 * l, 0, 5, 6, 500),
  // the lost animals you bring back (task "follow"), by their emoji
  "🐑": l => call(520, 480, .5, "sawtooth", .03 * l, 0, 16, 40, 2200),
  "🐐": l => call(470, 430, .5, "sawtooth", .03 * l, 0, 18, 40, 2200),
  "🦌": l => call(700, 520, .3, "triangle", .04 * l, 0, 10, 20),
  "🐶": l => [0, .16].forEach(t => { call(700, 460, .09, "square", .035 * l, t, 0, 0, 1800); hiss(.05, .03 * l, 1200, t); }),
  "🐮": l => call(220, 170, .9, "sawtooth", .05 * l, 0, 5, 6, 700),
  "🐔": l => [0, .12, .24, .42].forEach((t, i) => call(i === 3 ? 900 : 700, i === 3 ? 600 : 650, i === 3 ? .2 : .07, "sawtooth", .03 * l, t, 0, 0, 2400)),
  "🦩": l => [0, .2].forEach(t => call(500, 420, .16, "square", .03 * l, t, 0, 0, 1400)),
  "🐦": l => [0, .2].forEach((t, i) => call(1400 - i * 100, 950, .18, "triangle", .035 * l, t, 9, 25)),
  "🦔": l => [0, .07, .14].forEach(t => hiss(.04, .04 * l, 2200, t, 3)),
  "🐢": l => call(200, 150, .12, "sine", .03 * l)
};
/** Knocked over: a cartoon "whee" going down, and right after the stomp the animal's own sound, loud and clear. */
function animalDefeat(kind) {
  call(760, 240, .28, "triangle", .035, .05);
  setTimeout(() => animalSound(kind, 1), 110);
}
function animalSound(kind, l = 1) { const f = ANIMAL_SFX[kind]; if (f && l > .05) f(Math.min(1, l)); }
