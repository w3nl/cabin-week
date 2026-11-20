"use strict";
// Your own hero: choose a name, height, skin, hair (and a bun, bow or hairband), coat, trousers/shorts/skirt/dress, glasses, hat and scarf.
// The hero is saved in save.hero; save.char === "me" means you play with it. Loaded after screens.js.
const HERO_OPTS = {
  size: [["kid", T("Kid", "Kind")], ["teen", T("Teen", "Tiener")], ["adult", T("Adult", "Volwassen")]],
  skin: ["#f6d3b8", "#f4caa6", "#e2b088", "#c68a5c", "#9a6440", "#6e4428"],
  hair: [["short", T("Short", "Kort")], ["bob", T("Bob", "Bob")], ["curly", T("Curly", "Krullen")], ["long", T("Long", "Lang")],
    ["flowing", T("Wavy", "Golvend")], ["ponytail", T("Ponytail", "Staart")], ["bald", T("Bald", "Kaal")]],
  hairCol: ["#f2d184", "#d9a35a", "#a87c4c", "#6b4426", "#2a1d16", "#b5512a", "#b9b4ac"],
  coat: [["puffer", T("Puffer", "Gewatteerd")], ["long", T("Long coat", "Lange jas")], ["jacket", T("Jacket", "Jack")]],
  coatCol: ["#d8423a", "#2f7a4a", "#2e5a9a", "#f1ece3", "#2e3338", "#e8a33a", "#8a4ab0", "#e07aa0"],
  legs: [["trousers", T("Trousers", "Lange broek")], ["shorts", T("Shorts", "Korte broek")], ["skirt", T("Skirt", "Rok")], ["dress", T("Dress", "Jurk")]],
  pants: ["#2f4870", "#2c2f36", "#56603d", "#7a2236", "#6b5a48", "#e07aa0", "#8a4ab0", "#4aa0c8"],
  extra: [[null, T("None", "Niets")], ["bun", T("Bun", "Knotje")], ["bow", T("Bow", "Strik")], ["headband", T("Hairband", "Haarband")]],
  extraCol: ["#b67ad9", "#b3202e", "#e07aa0", "#2e5a9a", "#e8b44a", "#59c28a", "#f1ece3"],
  glasses: [[null, T("None", "Geen")], ["round", T("Round", "Rond")], ["thick", T("Thick", "Breed")]],
  beanie: [null, "#c43a3a", "#2e5a9a", "#5a6068", "#2f7a4a", "#f1ece3"],
  scarf: [null, "#d33a3a", "#2e5a9a", "#e8b44a", "#59c28a", "#e07aa0"],
  // the voice when the conversations are read aloud (js/voice.js): in the same row as the height, so everything fits
  voice: [["f", "♀", T("Voice of a girl or woman", "Stem van een meisje of vrouw")], ["m", "♂", T("Voice of a boy or man", "Stem van een jongen of man")]]
};
const HERO_ROWS = [["size", T("Height, voice", "Lengte, stem"), "voice"], ["skin", T("Skin", "Huid")], ["hair", T("Hair", "Haar")], ["hairCol", T("Hair colour", "Haarkleur")],
  ["extra", T("In your hair", "In je haar")], ["extraCol", T("Clip colour", "Kleur clipje")],
  ["coat", T("Coat", "Jas")], ["coatCol", T("Coat colour", "Jaskleur")], ["legs", T("Bottoms", "Broek of rok")], ["pants", T("Colour", "Kleur")],
  ["glasses", T("Glasses", "Bril")], ["beanie", T("Hat", "Muts")], ["scarf", T("Scarf", "Sjaal")]];
const HERO_DEFAULT = { name: "", size: "kid", skin: "#f4caa6", hair: "short", hairCol: "#a87c4c", coat: "puffer", coatCol: "#2e5a9a", legs: "trousers", pants: "#2c2f36", extra: null, extraCol: "#b67ad9", glasses: null, beanie: "#c43a3a", scarf: null, voice: "f" };
const optVal = o => Array.isArray(o) ? o[0] : o;
/** Turn the saved choices into a character for drawPerson(). */
function makeHero(h) {
  h = Object.assign({}, HERO_DEFAULT, h || {});
  const c = { name: (h.name || "").trim() || T("Me", "Ik"), fam: T("You", "Jij"), size: { kid: .76, teen: .88, adult: 1 }[h.size] || .88, kid: h.size === "kid",
    hair: h.hair, hairCol: h.hairCol, skin: h.skin, coat: h.coat, coatCol: h.coatCol, pants: h.pants, voice: h.voice, own: true };
  // Shorts: bare legs. Skirt or dress: dark tights in the cold, bare legs in summer.
  if (h.legs === "shorts") c.shorts = true;
  if (h.legs === "skirt" || h.legs === "dress") { c[h.legs] = h.pants; c.pants = "#2e2a30"; c.bareSummer = true; }
  if (h.extra) c[h.extra] = h.extraCol;
  if (h.glasses) c.glasses = h.glasses;
  if (h.beanie) c.beanie = h.beanie;
  if (h.scarf) c.scarf = [h.scarf, shade(h.scarf, .35)]; else c.noScarf = true;
  return c;
}
/** The character you play with: one of the nine, or your own hero. */
function heroChar() { return save.char === "me" && save.hero ? makeHero(save.hero) : CHARS[save.char] || CHARS[0]; }

/* ---------- The hero creator ---------- */
let heroDraft = null, heroAnim = 0;
function openHero() {
  heroDraft = Object.assign({}, HERO_DEFAULT, save.hero || {});
  $("heroName").value = heroDraft.name || "";
  $("heroKeys").hidden = true; $("heroRows").hidden = false;
  buildHeroRows(); setScreen("hero"); heroPreview();
}
function buildHeroRows() {
  const box = $("heroRows"); box.innerHTML = "";
  HERO_ROWS.forEach(([first, label, second]) => {
    const row = document.createElement("div"); row.className = "hero-row";
    row.innerHTML = `<span class="hl"></span><span class="hv"></span>`;
    row.querySelector(".hl").textContent = label;
    for (const key of second ? [first, second] : [first]) HERO_OPTS[key].forEach((o, j) => {
      const v = optVal(o), b = document.createElement("button"); b.type = "button";
      b.setAttribute("aria-pressed", String(heroDraft[key] === v));
      b.dataset.key = key;
      if (Array.isArray(o)) { b.className = "chip" + (key === second && !j ? " gap" : ""); b.textContent = o[1]; if (o[2]) b.setAttribute("aria-label", b.title = o[2]); }
      else { b.className = "swatch" + (v ? "" : " none"); b.style.setProperty("--c", v || "transparent"); b.setAttribute("aria-label", `${label}: ${v || T("none", "geen")}`); if (!v) b.textContent = "✕"; }
      b.onclick = () => { heroDraft[key] = v; row.querySelectorAll(`button[data-key="${key}"]`).forEach(x => x.setAttribute("aria-pressed", String(x === b))); tone(620, .04, "triangle", .04); };
      row.querySelector(".hv").appendChild(b);
    });
    box.appendChild(row);
  });
}
/** A walking preview of the hero, outside in the snow (with hat and scarf). */
function heroPreview() {
  cancelAnimationFrame(heroAnim);
  const cvs = $("heroCanvas"), ctx = cvs.getContext("2d");
  const loop = () => {
    if (state !== "hero") return;
    heroDraft.name = $("heroName").value;
    const keep = g; g = ctx;
    g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, cvs.width, cvs.height);
    g.setTransform(3, 0, 0, 3, 0, 0);
    g.fillStyle = "#e6effa"; g.beginPath(); g.ellipse(40, 92, 30, 5, 0, 0, 7); g.fill();
    const t = performance.now();
    drawPerson(makeHero(heroDraft), 40, 92, 1.6, 1, Math.floor(t / 110) % 4, false, null, { t, moving: true, scarf: true });
    g = keep;
    heroAnim = requestAnimationFrame(loop);
  };
  loop();
}
function heroRandom() {
  const pick = a => optVal(a[Math.floor(Math.random() * a.length)]);
  for (const [key, , second] of HERO_ROWS) { heroDraft[key] = pick(HERO_OPTS[key]); if (second) heroDraft[second] = pick(HERO_OPTS[second]); }
  buildHeroRows(); tone(880, .08, "triangle", .05);
}
function heroSave() {
  heroDraft.name = $("heroName").value.trim().slice(0, 12);
  save.hero = Object.assign({}, heroDraft); save.char = "me"; persist();
  SFX.key(); toTitle();
}
/* ---------- Moving around the creator with arrows, a remote or a controller ----------
   The creator is a grid of rows, so it gets its own navigation instead of "the nearest button in that direction"
   (that jumped over rows of different lengths, and never reached the name field):
   ↑/↓ always go to the row above or below, to the option closest to where you came from (and back again);
   ←/→ go along a row; ← from the first option goes to the buttons by the preview, → from there back to the rows.
   The name field sits above Done; ↑/↓ also leave the name field. */
let heroNavX = null;
function heroMove(dir) {
  if (heroKeysOpen()) return false; // the letter keyboard is an even grid: the usual navigation works there
  const name = $("heroName"), cur = document.activeElement;
  const cta = [...document.querySelectorAll("#heroWrap .cta button")].filter(b => b.offsetParent !== null);
  const rows = [...document.querySelectorAll("#heroRows .hero-row")].map(r => [...r.querySelectorAll("button")]);
  if (!rows.length) return false;
  const box = el => el.getBoundingClientRect(), cx = el => box(el).left + box(el).width / 2, cy = el => box(el).top + box(el).height / 2;
  const near = (list, x) => list.reduce((a, b) => Math.abs(cx(b) - x) < Math.abs(cx(a) - x) ? b : a);
  const chosen = list => list.find(b => b.getAttribute("aria-pressed") === "true") || list[0];
  // Side by side (wide screens): the rows are to the right of the preview. Otherwise (an upright phone) below it.
  const beside = box($("heroRows")).left >= box(document.querySelector("#heroWrap .hero-side")).right - 4;
  const go = el => { if (el) gpFocus(el); return true; };
  const ri = rows.findIndex(r => r.includes(cur));
  if (ri >= 0) {
    const row = rows[ri], i = row.indexOf(cur);
    if (dir === "left") { heroNavX = null; return go(i > 0 ? row[i - 1] : beside ? cta[0] : null); }
    if (dir === "right") { heroNavX = null; return go(row[i + 1]); }
    const x = heroNavX ?? cx(cur), to = rows[ri + (dir === "down" ? 1 : -1)];
    heroNavX = x;
    if (to) return go(near(to, x));
    return go(dir === "up" && !beside ? cta[0] : null);
  }
  heroNavX = null;
  const ci = cta.indexOf(cur);
  if (ci >= 0) {
    if (dir === "left") return go(cta[ci - 1]);
    if (dir === "right") return go(cta[ci + 1] || (beside ? chosen(rows.reduce((a, r) => Math.abs(cy(r[0]) - cy(cur)) < Math.abs(cy(a[0]) - cy(cur)) ? r : a)) : null));
    if (dir === "up") return go(name);
    return go(beside ? null : chosen(rows[0]));
  }
  if (cur === name) {
    if (dir === "down") return go(cta[0]);
    if (dir === "right" && beside) return go(chosen(rows[0]));
    return true;
  }
  return false; // nothing in the creator has focus yet: the menu code puts it on Done
}

$("heroDone").onclick = heroSave;
$("heroRandom").onclick = heroRandom;
$("heroCancel").onclick = toTitle;
/* ---------- Letters on screen: a name with a remote or a controller ----------
   OK/Enter (without typing) or ✕/A on the name field shows a keyboard of letters in place of the rows. A name starts with
   a capital, the rest is small. Back, Escape or OK closes it again. Typing on a real keyboard still works as before. */
function heroKeysOpen() { return !$("heroKeys").hidden; }
function openHeroKeys() {
  const box = $("heroKeys"), name = $("heroName"); box.innerHTML = "";
  const add = (label, fn, cls = "", aria) => { const b = document.createElement("button"); b.type = "button"; b.className = "key " + cls; b.textContent = label; if (aria) b.setAttribute("aria-label", aria); b.onclick = () => { fn(); tone(660, .03, "triangle", .03); }; box.appendChild(b); return b; };
  const put = v => { name.value = v.slice(0, 12); heroDraft.name = name.value; };
  [..."ABCDEFGHIJKLMNOPQRSTUVWXYZ"].forEach(ch => add(ch, () => { const v = name.value; put(v + (!v || v.endsWith(" ") ? ch : ch.toLowerCase())); }));
  add(T("Space", "Spatie"), () => { if (name.value && !name.value.endsWith(" ")) put(name.value + " "); }, "wide");
  add("⌫", () => put(name.value.slice(0, -1)), "", T("Delete a letter", "Letter weg"));
  add("OK", () => closeHeroKeys(), "ok");
  $("heroRows").hidden = true; box.hidden = false; name.blur();
  gpFocus(box.querySelector("button"));
}
function closeHeroKeys() {
  $("heroKeys").hidden = true; $("heroRows").hidden = false;
  gpFocus($("heroDone"));
}

// Typing a name: other keys stay in the field (not the game or the menu). ↑/↓ leave the field, Escape goes back.
// Enter saves once you have typed something; Enter (or OK on a remote) on the field without typing does nothing
// special, so on a TV it can open the on-screen keyboard instead of saving straight away.
let heroNameTyped = false;
$("heroName").addEventListener("focus", () => { heroNameTyped = false; });
$("heroName").addEventListener("input", () => { heroNameTyped = true; });
$("heroName").addEventListener("keydown", e => {
  e.stopPropagation();
  if (e.key === "ArrowUp" || e.key === "ArrowDown") { e.preventDefault(); lastInput = "key"; heroMove(e.key === "ArrowUp" ? "up" : "down"); }
  else if (e.key === "Enter") { e.preventDefault(); if (heroNameTyped) heroSave(); else openHeroKeys(); }
  else if (e.key === "Escape") toTitle();
});
