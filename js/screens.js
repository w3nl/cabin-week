"use strict";
// Top bar, screens (intro, completed, finale), code lock, confetti and the title screen.
/* =====================================================================
   HUD & SCHERMEN
   ===================================================================== */
function updateHud() {
  if (!L) return;
  const d = L.d;
  $("hLvl").textContent = `${d.day} · ${d.name}`;
  $("hKeys").hidden = !L.need; $("hQuest").hidden = !d.gate; $("hCode").hidden = !d.code; $("hCoins").hidden = !L.coinTotal;
  $("hKeys").textContent = `${d.keyHud} ${L.keys}/${L.need}`;
  $("hKeys").classList.toggle("done", L.keys >= L.need);
  $("hQuest").textContent = `${d.questHud} ${L.questDone ? T("done", "klaar") : L.hasQuest ? T("bring back", "breng terug") : T("find", "zoeken")}`;
  $("hQuest").classList.toggle("done", L.questDone);
  $("hCode").textContent = L.codeOpen ? "🔓 code" : "🔒 code";
  $("hCode").classList.toggle("done", L.codeOpen);
  $("hCoins").textContent = `${d.coinHud || d.coin} ${L.coins}/${L.coinTotal}`;
  $("hHearts").textContent = "❤️".repeat(Math.max(0, P.hearts)) + "🤍".repeat(Math.max(0, 3 - P.hearts));
  $("hNights").textContent = nightsLabel(L.idx);
}
function setScreen(s) {
  state = s;
  $("title").hidden = s !== "title";
  $("cardWrap").hidden = !(s === "intro" || s === "card");
  $("padWrap").hidden = s !== "pad";
  $("hud").hidden = !(s === "play" || s === "pad");
  // met een controller zijn de aanraakknoppen niet nodig
  $("touch").hidden = !(isTouch && s === "play" && !GP.on);
  if (s !== "play") { held.left = held.right = held.jump = false; }
  else if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
  menuAutoFocus();
  if (typeof updateHints === "function") updateHints();
}
function card(html, buttons) {
  const c = $("card"); c.innerHTML = html;
  const row = document.createElement("div"); row.className = "cta";
  buttons.forEach(([label, fn, ghost]) => { const b = document.createElement("button"); b.type = "button"; b.className = "btn" + (ghost ? " ghost" : ""); b.textContent = label; b.onclick = fn; row.appendChild(b); });
  c.appendChild(row);
  setTimeout(() => row.querySelector("button")?.focus(), 30);
}

function showIntro() {
  const d = L.d;
  setScreen("intro");
  const head = `<div class="eyebrow">${d.day} · ${L.idx + 1}/${LEVELS.length}</div><h2 style="font-size:30px;margin-top:6px">${d.name}</h2><p>${d.sub}</p>`;
  card(head + `<ul class="missions">
      <li>${d.keyHud} ${T(`Find <b>3 ${d.keyName}</b>. Without them you can't get to the exit.`, `Vind <b>3 ${d.keyName}</b>. Zonder kom je niet bij de uitgang.`)}</li>
      <li>${d.questHud} ${T(`Task: someone needs a <b>${d.questName}</b>. Talk to the people with a <b>!</b> above their head.`, `Opdracht: iemand zoekt een <b>${d.questName}</b>. Praat met de mensen met een <b>!</b> boven hun hoofd.`)}</li>
      <li>🔒 ${T("Crack the <b>code lock</b>. Read the signs along the way carefully.", "Kraak het <b>codeslot</b>. Lees de bordjes onderweg goed.")}</li>
      <li>${d.coinHud || d.coin} ${T(`Bonus: collect ${d.coinName}. 🍫 Chocolate gives you a heart back.`, `Bonus: verzamel ${d.coinName}. 🍫 Chocolade geeft een hartje terug.`)}</li>
    </ul>`, [[T("Play", "Spelen"), () => { setScreen("play"); updateHud(); }], [T("Back to menu", "Terug naar menu"), toTitle, true]]);
}

function completeLevel() {
  const idx = L.idx, secs = Math.round(L.time / 60), d = L.d, last = idx === LEVELS.length - 1;
  save.unlocked = Math.max(save.unlocked, Math.min(LEVELS.length, idx + 2));
  save.best[idx] = Math.max(save.best[idx] || 0, L.coins); persist();
  setScreen("card");
  const next = last ? [] : [[`${T("Next day", "Volgende dag")}: ${DAY_NAMES[idx + 1]}`, () => startLevel(idx + 1)]];
  SFX.win(); confetti(d.quiet ? 0 : 160);
  const stars = P.hearts >= 3 ? "★★★" : P.hearts >= 2 ? "★★" : "★";
  const stats = `<div class="stats"><div><b>${L.coins}/${L.coinTotal}</b><span>${d.coinName}</span></div><div><b>${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, "0")}</b><span>${T("time", "tijd")}</span></div><div><b>${stars}</b><span>${T("hearts left", "hartjes over")}</span></div></div>`;
  if (!last) {
    const msg = d.doneMsg || T("The baubles are hanging, the fire is burning and the biscuits are gone. Merry Christmas!", "De kerstballen hangen, het vuur brandt en de koekjes zijn op. Fijne kerst!");
    card(`<div class="eyebrow">${d.day} · ${T("done", "gehaald")}</div><h2 style="font-size:30px;margin-top:6px">${d.quiet ? d.name : T("You made it! 🎉", "Overleefd! 🎉")}</h2><p>${msg}</p>${stats}${d.quiet ? "" : `<p style="color:var(--muted)">${JOKES[Math.floor(Math.random() * JOKES.length)]}</p>`}`,
      [...next, ["Menu", toTitle, true]]);
  } else {
    card(`<div class="eyebrow">${T(`All ${LEVELS.length} days done`, `Alle ${LEVELS.length} dagen gehaald`)}</div><h2 style="font-size:34px;margin-top:6px">${T("What a week! 🚗🏠", "Wat een week! 🚗🏠")}</h2>
      <p>${T("The arrival, the old railway, Luxembourg, Paul's 40th birthday, two Christmas days, raclette and all the socks back in the suitcase.",
        "De aankomst, het oude spoorpad, Luxemburg, Pauls 40e verjaardag, twee kerstdagen, raclette en alle sokken terug in de koffer.")}</p>
      <p>${T("The Hills and the Woods: two families, one cabin, one big week. Same cabin next year?", "De Hills en de Woods: twee gezinnen, één huis, één grote week. Zelfde huis volgend jaar?")}</p>${stats}`,
      [[T("Start again", "Opnieuw beginnen"), () => startLevel(0)], ["Menu", toTitle, true]]);
  }
}

function toTitle() { hideDialog(); dialog = null; setScreen("title"); buildTitle(); menuAutoFocus(); }

/* ---------- Code lock ---------- */
function openPad() {
  padState = { val: "" };
  const c = L.d.code;
  $("padTitle").textContent = c.title; $("padRiddle").textContent = c.riddle;
  $("padFb").textContent = L.codeTries >= 3 ? hintFor() : "";
  drawDigits(); setScreen("pad");
}
function hintFor() { const a = L.d.code.answer; return T(`Tip: the code starts with ${a.slice(0, L.codeTries >= 5 ? 3 : 2)}...`, `Tip: de code begint met ${a.slice(0, L.codeTries >= 5 ? 3 : 2)}...`); }
function drawDigits(bad) {
  const sp = $("digits").children;
  for (let i = 0; i < 4; i++) sp[i].textContent = padState.val[i] || "";
  $("digits").classList.toggle("bad", !!bad);
}
function padPress(k) {
  if (k === "⌫") padState.val = padState.val.slice(0, -1);
  else if (k === "OK") return padCheck();
  else if (padState.val.length < 4) { padState.val += k; tone(500 + +k * 40, .05, "square", .03); }
  drawDigits();
  if (padState.val.length === 4) setTimeout(padCheck, 150);
}
function padCheck() {
  if (padState.val.length < 4) { $("padFb").textContent = T("The code has 4 digits.", "De code heeft 4 cijfers."); return; }
  if (padState.val === L.d.code.answer) {
    L.codeOpen = true; SFX.open(); $("padFb").textContent = T("Click! Open!", "Klik! Open!");
    setTimeout(() => { setScreen("play"); pop(L.d.code.x * TS + 16, 8 * TS, T("Code cracked!", "Code gekraakt!"), "#8dffb5"); updateHud(); }, 600);
  } else {
    L.codeTries++; SFX.bad(); drawDigits(true);
    const wrong = T(["Bleep. Wrong. The lock is laughing at you.", "No. Try again, and read the signs.", "Still wrong. Ask someone who's paying attention."],
      ["Bliep. Fout. Het slot lacht je uit.", "Nee. Probeer het nog eens, en lees de bordjes.", "Nog steeds fout. Vraag het aan iemand die oplet."]);
    $("padFb").textContent = L.codeTries >= 3 ? hintFor() : wrong[(L.codeTries - 1) % 3];
    setTimeout(() => { padState.val = ""; drawDigits(); }, 500);
  }
}
function padKey(e) {
  if (e.key >= "0" && e.key <= "9") padPress(e.key);
  else if (e.key === "Backspace") padPress("⌫");
  else if (e.key === "Enter") padPress("OK");
  else if (e.key === "Escape") setScreen("play");
}
["1", "2", "3", "4", "5", "6", "7", "8", "9", "⌫", "0", "OK"].forEach(k => {
  const b = document.createElement("button"); b.type = "button"; b.textContent = k; if (k === "OK") b.className = "ok";
  b.onclick = () => padPress(k); $("keys").appendChild(b);
});
$("padClose").onclick = () => setScreen("play");

/* ---------- Confetti (on the canvas) ---------- */
let confettiBits = [];
function confetti(n) { for (let i = 0; i < n; i++) confettiBits.push({ x: Math.random() * innerWidth, y: -20 - Math.random() * 300, vx: (Math.random() - .5) * 2, vy: 2 + Math.random() * 3, r: Math.random() * 6, c: ["#ffd25e", "#ff9b45", "#59c28a", "#5aa8ff", "#ff7aa8"][i % 5] }); }
function drawConfetti() {
  if (!confettiBits.length) return;
  g.setTransform(dpr, 0, 0, dpr, 0, 0);
  for (const p of confettiBits) { p.x += p.vx; p.y += p.vy; p.r += .1; g.save(); g.translate(p.x, p.y); g.rotate(p.r); g.fillStyle = p.c; g.fillRect(-4, -6, 8, 12); g.restore(); }
  confettiBits = confettiBits.filter(p => p.y < innerHeight + 20);
}

/* ---------- Title screen ---------- */
function portrait(c, i) {
  const cvs = document.createElement("canvas"); cvs.width = 108; cvs.height = 128;
  const ctx = cvs.getContext("2d"); const keep = g;
  g = ctx; g.scale(2, 2); drawPerson(c, 27, 61, 1.12, 1, 0, false, null); g = keep;
  return cvs;
}
function buildTitle() {
  // No dates and no countdown: the title shows how far you are in the week.
  const done = LEVELS.filter((_, i) => save.best[i] != null).length;
  const next = Math.min(LEVELS.length - 1, LEVELS.findIndex((_, i) => save.best[i] == null && i + 1 <= save.unlocked));
  if (done === 0) {
    $("cdNum").textContent = LEVELS.length;
    $("cdWord").textContent = T("winter days to play", "winterdagen om te spelen");
    $("cdSub").textContent = T(`A Christmas week in a cabin near ${VILLAGE}.`, `Een kerstweek in een huisje bij ${VILLAGE}.`);
  } else if (done < LEVELS.length) {
    $("cdNum").textContent = `${done}/${LEVELS.length}`;
    $("cdWord").textContent = T("days played", "dagen gespeeld");
    $("cdSub").textContent = next >= 0 ? `${T("Next", "Volgende")}: ${LEVELS[next].name}` : "";
  } else {
    $("cdNum").textContent = "🏆"; $("cdWord").textContent = T("The whole week done!", "De hele week gehaald!"); $("cdSub").textContent = T("Same cabin next year?", "Zelfde huis volgend jaar?");
  }
  $("special").hidden = true;
  const wkEl = $("week"); wkEl.innerHTML = "";
  WEEK.forEach((w, i) => {
    const li = document.createElement("li");
    li.className = (i === next && done < LEVELS.length ? "today " : save.best[i] != null ? "past " : "") + (LEVELS[i].quiet ? "quiet" : "");
    li.innerHTML = `<div class="wd">${w.wd}</div><div class="dd">${i + 1}</div><div class="ic">${w.ic}</div><div class="lb"></div>`;
    li.querySelector(".lb").textContent = w.lb;
    wkEl.appendChild(li);
  });
  const chEl = $("chars"); chEl.innerHTML = "";
  CHARS.forEach((c, i) => {
    const b = document.createElement("button"); b.type = "button"; b.setAttribute("aria-pressed", String(i === save.char));
    b.appendChild(portrait(c, i));
    b.insertAdjacentHTML("beforeend", `<span class="nm"></span><span class="fm"></span>`);
    b.querySelector(".nm").textContent = c.name; b.querySelector(".fm").textContent = c.fam;
    b.onclick = () => { save.char = i; persist(); buildTitle(); tone(660, .06, "triangle", .05); };
    chEl.appendChild(b);
  });
  const lvEl = $("levels"); lvEl.innerHTML = "";
  LEVELS.forEach((d, i) => {
    const b = document.createElement("button"); b.type = "button"; b.disabled = i + 1 > save.unlocked;
    const isNext = i === next && done < LEVELS.length;
    if (isNext) b.classList.add("today");
    b.innerHTML = `<div class="n">${d.day}${b.disabled ? " · 🔒" : save.best[i] != null ? " · ✓" : ""}</div><div class="t"></div><div class="s"></div>`;
    b.querySelector(".t").textContent = d.name; b.querySelector(".s").textContent = d.sub;
    b.onclick = () => startLevel(i);
    lvEl.appendChild(b);
  });
}
let jokeOrder = [];
function nextJoke() {
  if (!jokeOrder.length) jokeOrder = JOKES.map((_, i) => i).sort(() => Math.random() - .5);
  $("ticker").textContent = JOKES[jokeOrder.pop()];
}
$("ticker").onclick = nextJoke;
setInterval(() => { if (state === "title") nextJoke(); }, 9000);

$("hMenu").onclick = toTitle;
$("hSound").onclick = () => { muted = !muted; $("hSound").textContent = muted ? "🔇" : "🔊"; };
