"use strict";
// Taking your progress or your own hero to another device or another web address (cabinweek.online →
// tripscouts.online): browsers keep saved data per address, so the game gives you a code (and a link with it) to copy, or a file to download, and takes one back (state "save").
// Two kinds, so you can take one without the other:
//   - a progress code: the days of every trip (unlocked, best, the chosen trip). The 💾 button on the map opens it.
//   - a hero code: your own hero. The 💾 button in the hero creator opens it.
// A code is "TS1." + JSON in base64url (UTF-8, so a hero's name with ë or é survives), with `kind` "progress" or "hero".
// Importing a progress code replaces the days on this device (your hero stays); a hero code replaces your own hero (the
// days stay). Everything is checked first (cleanProgress(), cleanHero()), so a broken or odd code can't break the game.
// Opening a link with #save=… opens the screen for that kind of code with it filled in: nothing changes until Import.
// Loaded after hero.js.
const SAVE_PREFIX = "TS1.";
let saveKind = "progress", saveFrom = "title";

function b64encode(str) {
  const bytes = new TextEncoder().encode(str); let bin = "";
  bytes.forEach(b => { bin += String.fromCharCode(b); });
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function b64decode(s) {
  const bin = atob(s.replace(/-/g, "+").replace(/_/g, "/"));
  return new TextDecoder().decode(Uint8Array.from(bin, c => c.charCodeAt(0)));
}
/** The hero you see: the one in the creator (also before Done), else the saved one. */
function currentHero() {
  if (heroDraft && saveFrom === "hero") return Object.assign({}, heroDraft, { name: $("heroName").value });
  return save.hero || HERO_DEFAULT;
}
/** The code of this device: its progress, or its own hero. */
function exportCode(kind) {
  const data = kind === "hero" ? { kind, hero: cleanHero(currentHero()) } : { kind: "progress", progress: cleanProgress(save) };
  return SAVE_PREFIX + b64encode(JSON.stringify(data));
}
/** The link that opens the game with this code. From the old address and the Android app it goes to
    tripscouts.online; a redirect keeps the #save= part, so a link copied on the old address works too. */
function exportLink(code) {
  const web = location.protocol.startsWith("http") && location.hostname !== "appassets.androidplatform.net" && !/cabinweek\.online$/.test(location.hostname);
  return (web ? location.origin + location.pathname : "https://tripscouts.online/") + "#save=" + code;
}
/** Read a code, a link with #save=, or a downloaded file. Gives { kind: "progress", progress } or { kind: "hero", hero }, or null. */
function readCode(text) {
  if (typeof text !== "string") return null;
  const m = text.match(/TS1\.[A-Za-z0-9_-]+/);
  if (!m) return null;
  try {
    const data = JSON.parse(b64decode(m[0].slice(SAVE_PREFIX.length)));
    if (data && data.kind === "hero") { const hero = cleanHero(data.hero); return hero ? { kind: "hero", hero } : null; }
    if (data && data.kind === "progress") { const progress = cleanProgress(data.progress); return progress ? { kind: "progress", progress } : null; }
    return null;
  } catch (e) { return null; }
}
/** The days of every trip, with sensible values only. */
function cleanProgress(s) {
  if (!s || typeof s !== "object" || Array.isArray(s)) return null;
  const day = n => Math.max(1, Math.min(8, Math.floor(+n) || 1));
  const best = b => {
    const o = {};
    if (b && typeof b === "object") for (const k of Object.keys(b)) { const i = +k, v = +b[k]; if (Number.isInteger(i) && i >= 0 && i < 8 && b[k] != null && Number.isFinite(v) && v >= 0) o[i] = Math.min(Math.round(v), 999); }
    return o;
  };
  const out = { unlocked: day(s.unlocked), best: best(s.best), regions: {} };
  if (REGIONS.some(r => r.id === s.region)) out.region = s.region;
  if (s.regions && typeof s.regions === "object") {
    // a trip that hasn't started yet (day 1, nothing done) is left out: the map makes those just by looking
    for (const r of REGIONS) {
      const p = s.regions[r.id]; if (r.id === "ardennes" || !p || typeof p !== "object") continue;
      const q = { unlocked: day(p.unlocked), best: best(p.best) };
      if (q.unlocked > 1 || Object.keys(q.best).length) out.regions[r.id] = q;
    }
  }
  return out;
}
/** Your own hero, with only the options the creator has, and a name of at most 12 characters. */
function cleanHero(src) {
  if (!src || typeof src !== "object" || Array.isArray(src)) return null;
  const h = { name: typeof src.name === "string" ? src.name.trim().slice(0, 12) : "" };
  for (const k of Object.keys(HERO_DEFAULT)) {
    if (k === "name") continue;
    const ok = (HERO_OPTS[k] || []).map(optVal);
    h[k] = ok.includes(src[k]) ? src[k] : HERO_DEFAULT[k];
  }
  return h;
}
/** A short line about what a code holds. */
function describeProgress(p) {
  let days = 0, trips = 0;
  for (const r of REGIONS) {
    const q = r.id === "ardennes" ? p : (p.regions || {})[r.id];
    const n = q ? Object.keys(q.best || {}).length : 0;
    days += n; if (n >= r.levels.length) trips++;
  }
  const parts = [T(`${days} ${days === 1 ? "day" : "days"} scouted`, `${days} ${days === 1 ? "dag" : "dagen"} verkend`)];
  if (trips) parts.push(T(`${trips} of ${REGIONS.length} trips scouted`, `${trips} van de ${REGIONS.length} reizen verkend`));
  return parts.join(" · ");
}
function describeHero(h) {
  const size = { kid: T("a kid", "een kind"), teen: T("a teen", "een tiener"), adult: T("a grown-up", "een volwassene") }[h.size];
  return T(`Hero ${makeHero(h).name}, ${size}`, `Held ${makeHero(h).name}, ${size}`);
}
const describeCode = d => d.kind === "hero" ? describeHero(d.hero) : describeProgress(d.progress);

/* ---------- The screen ---------- */
const SAVE_TEXT = {
  progress: {
    eyebrow: T("Your progress", "Jouw voortgang"), title: T("Take your days along", "Neem je dagen mee"),
    out: T("Copy the link and open it on the other device or address. The days of every trip come along; your hero stays where it is.",
      "Kopieer de link en open hem op het andere apparaat of adres. De dagen van elke reis gaan mee; je held blijft waar hij is."),
    inEyebrow: T("Bring progress here", "Voortgang overnemen"),
    in: T("Paste a progress code or open a file. This replaces the days on this device, not your hero.",
      "Plak een voortgangscode of open een bestand. Dit vervangt de dagen op dit apparaat, niet je held."),
    file: "tripscouts-progress.txt"
  },
  hero: {
    eyebrow: T("Your own hero", "Jouw eigen held"), title: T("Take your hero along", "Neem je held mee"),
    out: T("Copy the link and open it on the other device or address, or send it to someone to play with your hero. Only the hero comes along, not your days.",
      "Kopieer de link en open hem op het andere apparaat of adres, of stuur hem naar iemand om met jouw held te spelen. Alleen de held gaat mee, niet je dagen."),
    inEyebrow: T("Bring a hero here", "Een held overnemen"),
    in: T("Paste a hero code or open a file. This replaces your own hero on this device, not your days.",
      "Plak een heldcode of open een bestand. Dit vervangt je eigen held op dit apparaat, niet je dagen."),
    file: "tripscouts-hero.txt"
  }
};
/** Open the screen for a kind of code ("progress" or "hero"), from the map, the hero creator or a link. */
function openSave(kind, from, incoming) {
  hideDialog(); dialog = null;
  saveKind = kind; saveFrom = from;
  const t = SAVE_TEXT[kind];
  $("saveEyebrow").textContent = t.eyebrow; $("saveTitle").textContent = t.title; $("saveHelpOut").textContent = t.out;
  $("saveEyebrowIn").textContent = t.inEyebrow; $("saveHelpIn").textContent = t.in;
  $("saveCode").value = exportCode(kind);
  $("saveMine").textContent = kind === "hero" ? describeHero(cleanHero(currentHero())) : describeProgress(cleanProgress(save));
  $("saveIn").value = incoming || "";
  $("saveFb").textContent = ""; $("saveFb").className = "fb";
  if (incoming) saveCheck();
  setScreen("save");
}
/** Back to where you came from. */
function saveBack() {
  if (saveFrom === "map") openMap();
  else if (saveFrom === "hero" && heroDraft) { setScreen("hero"); heroPreview(); }
  else toTitle();
}
/** Show what a pasted code holds, before importing it. */
function saveCheck() {
  const t = $("saveIn").value.trim(), fb = $("saveFb");
  if (!t) { fb.textContent = ""; fb.className = "fb"; return null; }
  const d = readCode(t);
  if (!d) { fb.textContent = T("That isn't a TripScouts code.", "Dat is geen code van TripScouts."); fb.className = "fb bad"; return null; }
  if (d.kind !== saveKind) {
    fb.textContent = d.kind === "hero" ? T("That is a hero code: bring it in with 💾 in the hero creator.", "Dat is een heldcode: neem hem over met 💾 bij het maken van je held.")
      : T("That is a progress code: bring it in with 💾 on the map.", "Dat is een voortgangscode: neem hem over met 💾 op de kaart.");
    fb.className = "fb bad"; return null;
  }
  fb.textContent = T("This code: ", "Deze code: ") + describeCode(d) + T(". Press Import to use it.", ". Druk op Overnemen om hem te gebruiken.");
  fb.className = "fb ok";
  return d;
}
function saveImport() {
  const d = saveCheck();
  if (!d) { if (!$("saveIn").value.trim()) { $("saveFb").textContent = T("Paste a code first, or open a file.", "Plak eerst een code, of open een bestand."); $("saveFb").className = "fb bad"; } return; }
  SFX.key();
  if (d.kind === "hero") {
    // your own hero: saved and chosen right away, then shown in the creator
    save.hero = d.hero; save.char = "me"; persist();
    openHero();
    return;
  }
  // the days: your hero and the hero you play with stay; reload, so every part of the game starts from the new progress
  const p = d.progress;
  save.unlocked = p.unlocked; save.best = p.best; save.regions = p.regions;
  if (p.region) save.region = p.region; else delete save.region;
  persist();
  setTimeout(() => { location.replace(location.href.split("#")[0]); }, 250);
}
async function saveCopy(text, okMsg) {
  const fb = $("saveFb");
  let ok = false;
  try { await navigator.clipboard.writeText(text); ok = true; } catch (e) {
    const ta = document.createElement("textarea"); ta.value = text; ta.style.position = "fixed"; ta.style.opacity = "0"; document.body.appendChild(ta); ta.select();
    try { ok = document.execCommand("copy"); } catch (x) {}
    ta.remove();
  }
  fb.textContent = ok ? okMsg : T("Copying didn't work here: select the code and copy it yourself.", "Kopiëren lukte hier niet: selecteer de code en kopieer hem zelf.");
  fb.className = ok ? "fb ok" : "fb bad";
}
function saveDownload() {
  const code = $("saveCode").value, hero = saveKind === "hero";
  const text = (hero ? T("TripScouts hero code. Open tripscouts.online, open your own hero, press 💾 Hero code, then Open file.\n",
    "Heldcode van TripScouts. Open tripscouts.online, open je eigen held, druk op 💾 Heldcode en dan op Bestand openen.\n")
    : T("TripScouts progress code. Open tripscouts.online, open the map, press 💾 Progress, then Open file.\n",
      "Voortgangscode van TripScouts. Open tripscouts.online, open de kaart, druk op 💾 Voortgang en dan op Bestand openen.\n")) + code + "\n";
  const name = SAVE_TEXT[saveKind].file, a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([text], { type: "text/plain" }));
  a.download = name; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  $("saveFb").textContent = T(`Saved as ${name}.`, `Bewaard als ${name}.`); $("saveFb").className = "fb ok";
}

$("mapSave").onclick = () => openSave("progress", "map");
$("heroShare").onclick = () => openSave("hero", "hero");
$("saveCopyLink").onclick = () => saveCopy(exportLink($("saveCode").value), T("Link copied. Open it on the other device or address.", "Link gekopieerd. Open hem op het andere apparaat of adres."));
$("saveCopyCode").onclick = () => saveCopy($("saveCode").value, T("Code copied.", "Code gekopieerd."));
$("saveDownload").onclick = saveDownload;
$("saveOpen").onclick = () => $("saveFile").click();
$("saveFile").onchange = e => {
  const f = e.target.files && e.target.files[0]; if (!f) return;
  f.text().then(t => { $("saveIn").value = (t.match(/TS1\.[A-Za-z0-9_-]+/) || [t.trim()])[0]; saveCheck(); }).catch(() => {});
  e.target.value = "";
};
$("saveImport").onclick = saveImport;
$("saveClose").onclick = saveBack;
$("saveIn").addEventListener("input", saveCheck);
// typing in the fields goes to the field only (not to the menu keys); Escape goes back
["saveIn", "saveCode"].forEach(id => $(id).addEventListener("keydown", e => {
  e.stopPropagation();
  if (e.key === "Escape") saveBack();
  else if (e.key === "Enter" && id === "saveIn") { e.preventDefault(); saveImport(); }
}));
$("saveCode").addEventListener("focus", e => e.target.select());
// In the Android app there are no downloads or files: copy and paste only.
if (location.hostname === "appassets.androidplatform.net") { $("saveDownload").hidden = true; $("saveOpen").hidden = true; }
// A link with #save=…: open the screen for that kind of code, with it filled in (after the title screen is built in app.js).
function saveFromLink() {
  const m = location.hash.match(/^#save=(.+)$/);
  if (!m) return false;
  history.replaceState(null, "", location.href.split("#")[0]);
  const code = decodeURIComponent(m[1]), d = readCode(code);
  openSave(d ? d.kind : "progress", "title", code);
  return true;
}
// the same page with only a new #save=… (a pasted link in the same tab) doesn't reload: listen for it
addEventListener("hashchange", () => { if (state !== "play") saveFromLink(); });
