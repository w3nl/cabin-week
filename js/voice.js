"use strict";
// Optional voices, like in the escape rooms: every dialogue line is read aloud with the browser's own speech
// (Web Speech API: speechSynthesis and SpeechSynthesisUtterance). Off by default; the Voices button on the title
// screen turns it on, saved per device in localStorage['cabin-week-voice']. say() and advanceDialog() in game.js call
// speakLine(); hideDialog() stops it. The button stays hidden where the browser cannot speak (often in an Android
// WebView, so in the Android app). Loaded after hero.js.
const VOICE_KEY = "cabin-week-voice";
const canSpeak = "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;
let voiceOn = (() => { try { return localStorage.getItem(VOICE_KEY) === "1"; } catch (e) { return false; } })();

/* How someone sounds. The nine: by age group (primary-school kids highest, then the teens, then the grown-ups), with a
   small difference per person and, where the device has several voices, a voice of their own. Everything else (signs,
   bells, letters, the church) is the narrator. */
function voiceStyle(name, calm) {
  if (calm) return { pitch: .95, rate: .85, slot: 0 };
  const i = CHARS.findIndex(c => c.name === name), c = CHARS[i];
  if (!c) return { pitch: 1, rate: 1, slot: 0 };
  const base = c.kid ? { pitch: 1.35, rate: 1.08 } : c.size < .95 ? { pitch: 1.15, rate: 1.04 } : { pitch: .9, rate: .97 };
  return { pitch: base.pitch + (i % 3) * .06, rate: base.rate, slot: i + 1 };
}

/* The device's voices for the current language: British English or Dutch, falling back to any English voice. */
function voicesFor(lang) {
  const all = speechSynthesis.getVoices();
  if (lang === "nl") return all.filter(v => /^nl/i.test(v.lang));
  const gb = all.filter(v => /^en[-_]GB/i.test(v.lang));
  return gb.length ? gb : all.filter(v => /^en/i.test(v.lang));
}

function speakLine(name, text, calm) {
  if (!canSpeak || !voiceOn) return;
  speechSynthesis.cancel();
  // emoji and arrows are for the eyes: leave them out of the speech
  const clean = String(text).replace(/[\u{1F000}-\u{1FFFF}\u{2190}-\u{21FF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}️‍]/gu, " ").replace(/…/g, "... ").replace(/\s+/g, " ").trim();
  if (!/[\p{L}\p{N}]/u.test(clean)) return;
  const u = new SpeechSynthesisUtterance(clean), st = voiceStyle(name, calm), vs = voicesFor(LANG);
  u.lang = LANG === "nl" ? "nl-NL" : "en-GB";
  if (vs.length) u.voice = vs[st.slot % vs.length];
  u.pitch = st.pitch; u.rate = st.rate; u.volume = .9;
  speechSynthesis.speak(u);
}
function stopSpeaking() { if (canSpeak) speechSynthesis.cancel(); }

/* ---------- the Voices button (title screen) ---------- */
function showVoice() {
  const b = $("voiceBtn");
  b.hidden = !canSpeak;
  b.textContent = voiceOn ? T("🔊 Voices on", "🔊 Stemmen aan") : T("🔈 Voices off", "🔈 Stemmen uit");
  b.setAttribute("aria-pressed", String(voiceOn));
  b.title = T("Reads the conversations aloud with the voices on your device.", "Leest de gesprekken voor met de stemmen op je apparaat.");
}
$("voiceBtn").onclick = () => {
  voiceOn = !voiceOn;
  try { localStorage.setItem(VOICE_KEY, voiceOn ? "1" : "0"); } catch (e) {}
  showVoice(); tone(700, .04, "triangle", .04);
  if (voiceOn) speakLine("Paul", T("Voices on. Off to the cabin!", "Stemmen aan. Op naar het huisje!"));
  else stopSpeaking();
};
if (canSpeak) speechSynthesis.getVoices(); // some browsers only load their voices after the first ask
showVoice();
