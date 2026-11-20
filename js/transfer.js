"use strict";
// Taking your progress and your own hero to another device or another web address:
// browsers keep saved data per address, so the game gives you a save code (and a link with it) to copy, or a file to
// download, and takes one back. The 💾 button in the version line on the title screen opens it (state "save").
// A code is "TS1." + the save as JSON in base64url (UTF-8, so a hero's name with ë or é survives). Importing replaces the
// progress on this device; everything is checked first (cleanSave()), so a broken or odd code can't break the game.
// Opening a link with #save=… opens this screen with the code filled in: nothing is replaced until you press Import.
// Loaded after hero.js.
const SAVE_PREFIX = "TS1.";

function b64encode(str) {
  const bytes = new TextEncoder().encode(str); let bin = "";
  bytes.forEach(b => { bin += String.fromCharCode(b); });
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function b64decode(s) {
  const bin = atob(s.replace(/-/g, "+").replace(/_/g, "/"));
  return new TextDecoder().decode(Uint8Array.from(bin, c => c.charCodeAt(0)));
}
/** The save code of this device: progress, hero and settings. */
function exportCode() {
  const get = k => { try { return localStorage.getItem(k); } catch (e) { return null; } };
  const data = { save: cleanSave(save), lang: LANG, voice: get("cabin-week-voice") === "1", amb: get("cabin-week-ambience") === "1" };
  return SAVE_PREFIX + b64encode(JSON.stringify(data));
}
/** The link that opens the game with this save code (the Android app links to the website). A redirect to a new
    address keeps the #save= part, so an old link still works there. */
function exportLink(code) {
  const web = location.protocol.startsWith("http") && location.hostname !== "appassets.androidplatform.net";
  return (web ? location.origin + location.pathname : "https://cabinweek.online/") + "#save=" + code;
}
/** Read a code, a link with #save=, or a downloaded file. Gives { save, lang, voice, amb } or null. */
function readCode(text) {
  if (typeof text !== "string") return null;
  const m = text.match(/TS1\.[A-Za-z0-9_-]+/);
  if (!m) return null;
  try {
    const data = JSON.parse(b64decode(m[0].slice(SAVE_PREFIX.length)));
    const s = cleanSave(data && data.save);
    if (!s) return null;
    return { save: s, lang: data.lang === "nl" || data.lang === "en" ? data.lang : null, voice: data.voice === true, amb: data.amb === true };
  } catch (e) { return null; }
}
/** Keep only what the game knows, with sensible values. */
function cleanSave(s) {
  if (!s || typeof s !== "object" || Array.isArray(s)) return null;
  const day = n => Math.max(1, Math.min(8, Math.floor(+n) || 1));
  const best = b => {
    const o = {};
    if (b && typeof b === "object") for (const k of Object.keys(b)) { const i = +k, v = +b[k]; if (Number.isInteger(i) && i >= 0 && i < 8 && b[k] != null && Number.isFinite(v) && v >= 0) o[i] = Math.min(Math.round(v), 999); }
    return o;
  };
  const out = { unlocked: day(s.unlocked), char: 0, best: best(s.best) };
  if (Number.isInteger(s.char) && s.char >= 0 && s.char < CHARS.length) out.char = s.char;
  if (REGIONS.some(r => r.id === s.region)) out.region = s.region;
  if (s.regions && typeof s.regions === "object") {
    out.regions = {};
    for (const r of REGIONS) { const p = s.regions[r.id]; if (r.id !== "ardennes" && p && typeof p === "object") out.regions[r.id] = { unlocked: day(p.unlocked), best: best(p.best) }; }
  }
  if (s.hero && typeof s.hero === "object") {
    const h = { name: typeof s.hero.name === "string" ? s.hero.name.trim().slice(0, 12) : "" };
    for (const k of Object.keys(HERO_DEFAULT)) {
      if (k === "name") continue;
      const ok = (HERO_OPTS[k] || []).map(optVal);
      h[k] = ok.includes(s.hero[k]) ? s.hero[k] : HERO_DEFAULT[k];
    }
    out.hero = h;
  }
  if (s.char === "me" && out.hero) out.char = "me";
  return out;
}
/** A short line about what a save holds: days scouted, trips, the hero. */
function describeSave(s) {
  let days = 0, trips = 0;
  for (const r of REGIONS) {
    const p = r.id === "ardennes" ? s : (s.regions || {})[r.id];
    const n = p ? Object.keys(p.best || {}).length : 0;
    days += n; if (n >= r.levels.length) trips++;
  }
  const parts = [T(`${days} ${days === 1 ? "day" : "days"} played`, `${days} ${days === 1 ? "dag" : "dagen"} gespeeld`)];
  if (trips) parts.push(T(`${trips} of ${REGIONS.length} trips done`, `${trips} van de ${REGIONS.length} reizen klaar`));
  const who = s.char === "me" && s.hero ? makeHero(s.hero).name : (CHARS[s.char] || CHARS[0]).name;
  parts.push(T(`playing as ${who}`, `je speelt als ${who}`));
  if (s.hero && s.char !== "me") parts.push(T(`own hero ${makeHero(s.hero).name}`, `eigen held ${makeHero(s.hero).name}`));
  return parts.join(" · ");
}

/* ---------- The screen ---------- */
function openSave(incoming) {
  hideDialog(); dialog = null;
  const code = exportCode();
  $("saveCode").value = code;
  $("saveMine").textContent = describeSave(cleanSave(save));
  $("saveIn").value = incoming || "";
  $("saveFb").textContent = ""; $("saveFb").className = "fb";
  if (incoming) saveCheck();
  setScreen("save");
}
/** Show what a pasted code holds, before importing it. */
function saveCheck() {
  const t = $("saveIn").value.trim(), fb = $("saveFb");
  if (!t) { fb.textContent = ""; fb.className = "fb"; return null; }
  const d = readCode(t);
  if (!d) { fb.textContent = T("That isn't a save code of this game.", "Dat is geen bewaarcode van dit spel."); fb.className = "fb bad"; return null; }
  fb.textContent = T("This code: ", "Deze code: ") + describeSave(d.save) + T(". Press Import to use it.", ". Druk op Overnemen om hem te gebruiken.");
  fb.className = "fb ok";
  return d;
}
function saveImport() {
  const d = saveCheck();
  if (!d) { if (!$("saveIn").value.trim()) { $("saveFb").textContent = T("Paste a save code first, or open a file.", "Plak eerst een bewaarcode, of open een bestand."); $("saveFb").className = "fb bad"; } return; }
  save = d.save; persist();
  try {
    if (d.lang) localStorage.setItem(LANG_KEY, d.lang);
    localStorage.setItem("cabin-week-voice", d.voice ? "1" : "0");
    localStorage.setItem("cabin-week-ambience", d.amb ? "1" : "0");
  } catch (e) {}
  SFX.key && SFX.key();
  // reload, so every part of the game starts from the new save (and the language); a #save= link is cleared first
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
  const code = $("saveCode").value, text = T("Save code of your progress. Open the game, press 💾 Progress, then Open file.\n",
    "Bewaarcode van je voortgang. Open het spel, druk op 💾 Voortgang en dan op Bestand openen.\n") + code + "\n";
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([text], { type: "text/plain" }));
  a.download = "cabin-week-progress.txt"; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  $("saveFb").textContent = T("Saved as cabin-week-progress.txt.", "Bewaard als cabin-week-progress.txt."); $("saveFb").className = "fb ok";
}

$("saveBtn").onclick = () => openSave();
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
$("saveClose").onclick = () => toTitle();
$("saveIn").addEventListener("input", saveCheck);
// typing in the fields goes to the field only (not to the menu keys); Escape goes back
["saveIn", "saveCode"].forEach(id => $(id).addEventListener("keydown", e => {
  e.stopPropagation();
  if (e.key === "Escape") toTitle();
  else if (e.key === "Enter" && id === "saveIn") { e.preventDefault(); saveImport(); }
}));
$("saveCode").addEventListener("focus", e => e.target.select());
// In the Android app there are no downloads or files: copy and paste only.
if (location.hostname === "appassets.androidplatform.net") { $("saveDownload").hidden = true; $("saveOpen").hidden = true; }
// A link with #save=…: open the screen with that code filled in (after the title screen is built in app.js).
function saveFromLink() {
  const m = location.hash.match(/^#save=(.+)$/);
  if (!m) return false;
  history.replaceState(null, "", location.href.split("#")[0]);
  openSave(decodeURIComponent(m[1]));
  return true;
}
// the same page with only a new #save=… (a pasted link in the same tab) doesn't reload: listen for it
addEventListener("hashchange", () => { if (state !== "play") saveFromLink(); });
