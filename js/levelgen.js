"use strict";
// The level generator and the days made with it (days 2, 3, 6, 7 and 8).
/* =====================================================================
   LEVEL GENERATOR (for the days that are not built by hand)
   ===================================================================== */
function genLevel(o) {
  // Options that make a region play differently (see AGENTS.md, "Region gameplay"):
  //   hills: [low, high] – the ground goes up and down between those rows (12 = normal ground, 9 = high), like a mountain.
  //   movers: "floe" | "gondola" | "boat" – wide gaps (too wide to jump) with something that carries you across.
  //     A gondola rides on a slanted cable: up the mountain (2 or 3 rows), or down where the ground is already high.
  //   ice, dark, water, interior – used by the game and the drawing code, not by the generator.
  const R = rng(o.seed), w = o.w;
  const gateX = o.quest ? Math.round(w * .6) : -99, codeX = o.code ? w - 14 : -99;
  const ground = [], plats = [], blocks = [], spikes = [], ents = [], slots = [], bad = new Set(), used = new Set();
  const coin = (x, y) => { if (o.coins !== false) ents.push(["coin", x, y]); };
  let cur = 0, x = 12, towerDone = !o.quest, gy = 12, ferryDone = !o.movers;
  const [hLow, hHigh] = o.hills || [12, 12];
  const limit = (o.code ? codeX : w - 8) - 10;
  while (x < limit) {
    if (o.quest && x > gateX - 9 && x < gateX + 5) { x = gateX + 5; continue; }
    let type;
    if (!towerDone && x > w * .3) type = "tower";
    else if (!ferryDone && x > w * .12) type = "ferry";
    else { const r = R(); type = r < .22 && o.pits ? "pit" : r < .3 && o.movers ? "ferry" : r < .45 ? "plat2" : r < .6 ? "steps" : r < .72 ? "tower" : "run"; }
    const width = { pit: 8, plat2: 10, steps: 9, tower: 10, run: 11, ferry: 11 }[type];
    if (x + width > limit || (o.quest && x <= gateX - 9 && x + width > gateX - 9)) { x += 3; continue; }
    // Hills: before a piece the ground may go up (at most 2 rows, so you can always jump it) or down.
    if (o.hills && type !== "ferry") {
      let ny = gy + [-2, -1, 0, 1, 2][Math.floor(R() * 5)];
      ny = Math.max(hHigh, Math.min(hLow, ny));
      if (ny !== gy) { ground.push([cur, x, gy]); cur = x + 1; gy = ny; bad.add(x); bad.add(x + 1); }
    }
    const d = gy - 12; // everything in a piece is placed relative to the ground here
    if (type === "pit") {
      const gw = R() < .5 ? 2 : 3;
      ground.push([cur, x + 1, gy]);
      for (let i = 0; i < gw; i++) { bad.add(x + 2 + i); coin(x + 2 + i, (i === 0 || i === gw - 1 ? 9 : 8) + d); }
      bad.add(x + 1); bad.add(x + 2 + gw);
      cur = x + 2 + gw;
    } else if (type === "ferry") {
      // a gap of 7 tiles: too wide to jump, so you ride across on an ice floe, a gondola or a boat
      ground.push([cur, x + 1, gy]);
      for (let i = 0; i < 7; i++) bad.add(x + 2 + i);
      bad.add(x + 1); bad.add(x + 9);
      let rise = 0;
      if (o.movers === "gondola") { const up = gy - hHigh, down = hLow - gy; rise = up >= 2 ? -Math.min(3, up) : down >= 2 ? Math.min(3, down) : 0; }
      ents.push(["mover", x + 2, gy, { range: 5, n: 2, rise }]);
      [3, 5, 7].forEach(i => coin(x + i, 8 + d + Math.round(rise * (i - 2) / 6)));
      cur = x + 9; ferryDone = true;
      gy += rise;
    } else if (type === "plat2") {
      plats.push([x + 1, 9 + d, 3], [x + 5, 7 + d, 3]); slots.push([x + 2, 8 + d], [x + 6, 6 + d]);
      coin(x + 1, 10 + d); coin(x + 3, 10 + d); coin(x + 7, 5 + d);
    } else if (type === "steps") {
      blocks.push([x + 1, 11 + d, 1], [x + 2, 10 + d, 2], [x + 3, 9 + d, 3]); [1, 2, 3].forEach(i => bad.add(x + i));
      plats.push([x + 5, 7 + d, 3]); slots.push([x + 6, 6 + d]);
      coin(x + 1, 10 + d); coin(x + 2, 9 + d); coin(x + 3, 8 + d);
    } else if (type === "tower") {
      plats.push([x + 1, 9 + d, 2], [x + 4, 7 + d, 2], [x + 7, 5 + d, 2]); slots.push([x + 4, 6 + d], [x + 7, 4 + d, "high"]);
      coin(x + 1, 8 + d); coin(x + 2, 8 + d); towerDone = true;
    } else {
      if (o.enemies) ents.push(["enemy", x + 4, 11 + d]);
      for (let i = 2; i <= 6; i++) coin(x + i, 10 + d);
      if (o.spikes) { spikes.push([x + 8, 11 + d, 2]); bad.add(x + 8); bad.add(x + 9); }
    }
    x += width;
  }
  ground.push([cur, w - 1, gy]);
  // The ground row of every column (ROWS where there is no ground: a pit or a gap).
  const topAt = Array(w).fill(ROWS_GEN);
  for (const [a, b, t] of ground) for (let c = a; c <= b; c++) topAt[c] = Math.min(topAt[c], t);
  const yAt = c => (topAt[c] < ROWS_GEN ? topAt[c] : 12) - 1;
  const free = (t) => { t = Math.round(t); for (let dd = 0; dd < 30; dd++) for (const c of [t + dd, t - dd]) if (c > 2 && c < w - 2 && !bad.has(c) && !used.has(c) && topAt[c] < ROWS_GEN) { used.add(c); return c; } return t; };
  [gateX, gateX - 1, gateX + 1, codeX, codeX - 1, codeX + 1, w - 6].forEach(c => used.add(c));

  if (o.intro) { const c = free(5); ents.push(["sign", c, yAt(c), o.intro]); }
  let gate = null, code = null;
  if (o.quest) {
    gate = [gateX, 2, yAt(gateX)];
    used.add(gateX - 3); ents.push(["npc", gateX - 3, yAt(gateX - 3), { quest: o.quest }]);
    ents.push(["check", gateX + 2, yAt(gateX + 2)]);
    const pre = slots.filter(s => s[0] < gateX - 6).sort((a, b) => a[1] - b[1] || a[0] - b[0]);
    const q = pre[0]; slots.splice(slots.indexOf(q), 1); ents.push(["quest", q[0], q[1]]);
  }
  const keysNeeded = o.keysNeeded ?? 3;
  if (keysNeeded) {
    while (slots.length < 3) { const fx = free(w * (.2 + slots.length * .25)), fy = yAt(fx) - 2; plats.push([fx, fy, 3]); slots.push([fx + 1, fy - 1]); }
    slots.sort((a, b) => a[0] - b[0]);
    for (let i = 0; i < 3; i++) { const s = slots[Math.floor(slots.length * (i + .5) / 3)]; ents.push(["key", s[0], s[1]]); }
  }
  { const c = free(w * .3); ents.push(["check", c, yAt(c)]); }
  if (!o.quest) { const c = free(w * .62); ents.push(["check", c, yAt(c)]); }
  (o.npcs || []).forEach((lines, i) => { const c = free(w * [.2, .46, .8][i]); ents.push(["npc", c, yAt(c), { lines }]); });
  (o.signs || []).forEach(([f, lines]) => { const c = free(w * f); ents.push(["sign", c, yAt(c), lines]); });
  if (o.code) {
    const syms = o.code.syms, digits = o.code.answer.split("");
    code = { x: codeX, y1: 2, y2: yAt(codeX), pad: codeX - 2, answer: o.code.answer, title: o.code.title,
      riddle: T(`Four symbols: ${syms.join("  ")}. Signs along the way tell you which digit goes with which symbol.`,
        `Vier symbolen: ${syms.join("  ")}. Onderweg staan bordjes die vertellen welk cijfer bij welk symbool hoort.`) };
    used.add(codeX - 2);
    [.14, .37, .56, .74].forEach((f, i) => { const k = [2, 0, 3, 1][i], c = free(w * f); ents.push(["sign", c, yAt(c), [T(`Someone scratched something on this sign: ${syms[k]} = ${digits[k]}`, `Op dit bordje is iets gekrast: ${syms[k]} = ${digits[k]}`), o.code.flavor[k]]]); });
  }
  let lanternX = null;
  if (o.lantern) { const lx = free(w * .7); lanternX = lx; ents.push(["lantern", lx, yAt(lx)]); for (let dd = -3; dd <= 3; dd++) used.add(lx + dd); }
  ents.push(["exit", w - 6, yAt(w - 6)]);
  if (o.enemyExtra) o.enemyExtra.forEach(f => { const c = free(w * f); ents.push(["enemy", c, yAt(c)]); });

  const deco = [];
  for (let dx = 3; dx < w - 8; dx += 5 + Math.floor(R() * 7)) {
    if (bad.has(dx) || topAt[dx] >= ROWS_GEN || Math.abs(dx - gateX) < 4 || Math.abs(dx - codeX) < 5) continue;
    if (o.lantern && o.lanternDeco === "church" && lanternX != null && dx > lanternX - 7 && dx < lanternX + 6) continue;
    deco.push([o.decoKinds[Math.floor(R() * o.decoKinds.length)], dx]);
  }
  if (o.lantern) { const l = ents.find(e => e[0] === "lantern"); deco.push(o.lanternDeco === "church" ? ["church", l[1] - 3] : ["bench", l[1] + 1]); }
  (o.decoExtra || []).forEach(([k, f]) => deco.push([k, Math.round(w * f)]));
  return Object.assign({}, o, { ground, plats, blocks, spikes, gate, code, ents, deco, keysNeeded });
}
/** The number of rows (canvas.js has ROWS, but that file loads after this one). */
const ROWS_GEN = 15;

const DAY22 = genLevel({
  seed: 2212, w: 150, day: dayLabel(1), name: T("Forest & Old Railway", "Bos & oude spoorlijn"), theme: "bos",
  sub: T("The walking map has blown away in three pieces. Without the map we'll never find the old railway path.",
    "De wandelkaart is in drie stukken gewaaid. Zonder kaart vinden we het oude spoorpad nooit terug."),
  keyType: "🗺️", keyHud: "🗺️", keyName: T("map pieces", "kaartstukjes"),
  questType: "🩹", questHud: "🩹", questName: T("plaster", "pleister"),
  coin: "🍟", coinName: T("chips", "frietjes"), enemy: "zwijn", spikeMsg: T("Ouch, brambles!", "Au, bramen!"),
  pits: true, enemies: true, spikes: true, exitStyle: "arch", exitLabel: T("Trail → cabin", "Spoorpad → huis"),
  intro: T(["The old railway: once a train line, now a path for walking and cycling.", "Flat as a pancake, they say. We call it a challenge."],
    ["De oude spoorlijn: ooit een treinspoor, nu een fiets- en wandelpad.", "Plat als een pannenkoek, zeggen ze. Wij noemen het een uitdaging."]),
  quest: {
    need: T(["Ouch! I fell over and grazed my knee.", "The first aid bag with plasters is hanging somewhere high up in the trees. Don't ask how it got there."],
      ["Au! Ik ben gevallen en heb mijn knie geschaafd.", "Ergens hoog in de bomen hangt de EHBO-tas met pleisters. Vraag niet hoe die daar komt."]),
    done: T(["A plaster with dinosaurs on it! Now I don't feel a thing.", "The gate is open. Keep going!"], ["Een pleister met dinosaurussen erop! Nu voel ik niks meer.", "Het hek is open. Doorlopen!"]),
    after: T(["Look at my plaster. Cool, right?"], ["Kijk, mijn pleister. Stoer hè?"]) },
  npcs: [T(["According to the app it's only 2 more kilometres.", "The app said that an hour ago too."], ["Volgens de app is het nog maar 2 kilometer.", "Dat zei de app een uur geleden ook."]),
         T(["I saw a squirrel! Or it was a leaf. It did move."], ["Ik heb een eekhoorn gezien! Of het was een bladje. Het bewoog wel."]),
         T(["Nearly back. I can smell the chips already. Or that's my imagination."], ["Bijna terug. Ik ruik de frieten al. Of dat is de verbeelding."])],
  code: { answer: "3817", title: T("Barrier on the old railway", "Slagboom van het spoorpad"), syms: ["🍄", "🌲", "🦔", "🍂"],
    flavor: T(["Mushrooms: look, don't eat.", "Pine trees smell like Christmas.", "Hedgehogs sleep in winter. Except this one.", "Autumn leaves, even in December."],
      ["Paddenstoelen: kijken mag, eten niet.", "Dennen ruiken naar kerst.", "Egels slapen in de winter. Behalve deze.", "Herfstblaadjes, zelfs in december."]) },
  decoKinds: ["tree", "tree", "pine"],
  doneMsg: T("The map is complete and everyone is back. Tired, muddy and happy.", "De kaart is compleet en iedereen is terug. Moe, modderig en vrolijk.")
});

const DAY23 = genLevel({
  seed: 2323, w: 140, day: dayLabel(2), name: T("Christmas Market in Luxembourg", "Kerstmarkt in Luxemburg"), theme: "stad", quiet: true,
  sub: T("A day in Luxembourg: the red bridge, the glass lift and the Christmas market. In the crowds everyone has lost a mitten.",
    "Een dagje Luxemburg: de rode brug, de glazen lift en de kerstmarkt. In de drukte is iedereen een want kwijt."),
  keyType: "🧤", keyHud: "🧤", keyName: T("mittens", "wanten"),
  questType: "🎟️", questHud: "🎟️", questName: T("carousel ticket", "draaimolenkaartje"),
  coin: "🌰", coinName: T("roasted chestnuts", "gepofte kastanjes"), enemy: "sneeuwpop", spikeMsg: "",
  pits: false, enemies: false, spikes: false, lantern: true, lanternDeco: "church",
  exitStyle: "arch", exitLabel: T("Back to the car", "Terug naar de auto"),
  intro: T(["Welcome to Luxembourg! Here the bus is free and the lift is made of glass.", "The Christmas market smells of waffles, chestnuts and mulled wine."],
    ["Welkom in Luxemburg! Hier is de bus gratis en de lift van glas.", "Op de kerstmarkt ruikt het naar wafels, kastanjes en glühwein."]),
  quest: {
    need: T(["The carousel is about to start, but my ticket blew away.", "It blew that way. Up. Why does everything always blow upwards?"],
      ["De draaimolen gaat zo draaien, maar mijn kaartje is weggewaaid.", "Het waaide die kant op. Naar boven. Waarom waait alles altijd naar boven?"]),
    done: T(["My ticket! Three rides. On the horse. No, the carriage. No, the horse after all.", "The gate to the rest of the market is open."],
      ["Mijn kaartje! Drie rondjes. Op het paard. Nee, de koets. Nee, toch het paard.", "Het hek naar de rest van de markt is open."]),
    after: T(["One more ride. Really the last one. Really."], ["Nog één rondje. Echt de laatste. Echt."]) },
  npcs: [T(["The red bridge is really called the Grand Duchess Charlotte Bridge. Red is easier to remember."], ["De rode brug heet eigenlijk de Groothertogin Charlotte-brug. Rood is makkelijker te onthouden."]),
         T(["The glass lift takes you from the old town straight down. Don't look down. Or do."], ["Met de glazen lift ga je zo van de oude stad naar beneden. Niet naar beneden kijken. Of juist wel."]),
         T(["Mulled wine for the grown-ups, hot chocolate for the kids. And for anyone who can't decide: both."], ["Glühwein voor de volwassenen, warme chocomel voor de kinderen. En voor wie twijfelt: allebei."])],
  code: { answer: "6382", title: T("Christmas market gate", "Hek van de kerstmarkt"), syms: ["⭐", "🔔", "🎠", "🥨"],
    flavor: T(["The star on top of the big Christmas tree.", "The bells of the cathedral.", "The carousel goes round and round.", "A pretzel from the bakery stall."],
      ["De ster boven op de grote kerstboom.", "De klokken van de kathedraal.", "De draaimolen draait rondjes.", "Een krakeling uit de bakkerskraam."]) },
  decoKinds: ["stall", "stall", "streetlamp", "xtree"], decoExtra: [["saab96", .1]],
  doneMsg: T("A lovely day in Luxembourg. Tomorrow is Paul's birthday.", "Een mooie dag in Luxemburg. Morgen is Paul jarig.")
});

const DAY26 = genLevel({
  seed: 2626, w: 160, day: dayLabel(5), name: T("The Wildlife Park", "Het wildpark"), theme: "sneeuw",
  sub: T("Boxing Day. Take 3 animal photos for the group chat and make sure the animals get fed.",
    "Tweede kerstdag. Maak 3 dierenfoto's voor de groepsapp en zorg dat de dieren te eten krijgen."),
  keyType: "📸", keyHud: "📸", keyName: T("animal photos", "dierenfoto's"),
  questType: "🥕", questHud: "🥕", questName: T("bag of carrots", "zak wortels"),
  coin: "🍪", coinName: T("Christmas biscuits", "kerstkoekjes"), enemy: "sneeuwpop", spikeMsg: T("Slippery! Icicles!", "Glad! IJspegels!"),
  pits: true, enemies: true, spikes: true, exitStyle: "arch", exitLabel: T("Park exit", "Uitgang wildpark"),
  intro: T(["Welcome to the wildlife park! Deer, wild boars and lots of snow.", "Only feed the animals the right food. Christmas biscuits are for us."],
    ["Welkom in het wildpark! Herten, wilde zwijnen en heel veel sneeuw.", "Voeren mag alleen met de juiste voeding. Kerstkoekjes zijn voor ons."]),
  quest: {
    need: T(["The deer are looking at me very expectantly.", "There's a bag of carrots on top of the lookout tower. Will you get it?"],
      ["De herten kijken me heel verwachtingsvol aan.", "Er ligt een zak wortels bovenop de uitkijktoren. Haal jij hem?"]),
    done: T(["Carrots! The deer will be grateful forever.", "The gate to the next part of the park is open."], ["Wortels! De herten zijn je eeuwig dankbaar.", "Het hek naar het volgende deel van het park is open."]),
    after: T(["That deer with the huge antlers? That's the boss here."], ["Dat hert met dat grote gewei? Dat is de baas hier."]) },
  npcs: [T(["I've got 40 photos of the same deer. They're all a bit different. A bit."], ["Ik heb al 40 foto's van hetzelfde hert. Ze zijn allemaal een beetje anders. Een beetje."]),
         T(["The owls here only wake up when we've gone. Typical."], ["De uilen hier worden pas wakker als wij weg zijn. Typisch."]),
         T(["Hot chocolate at the exit. That's the real reason we're here."], ["Warme chocolademelk bij de uitgang. Dat is de echte reden dat we hier zijn."])],
  code: { answer: "6254", title: T("Wildlife park gate", "Poort van het wildpark"), syms: ["🦌", "🐗", "🦉", "🦊"],
    flavor: T(["The deer has antlers. Or a coat rack.", "Wild boar: don't stroke.", "The owl is looking at you. It knows the code.", "The fox is too clever for this sign."],
      ["Het hert heeft een gewei. Of een kapstok.", "Wild zwijn: niet aaien.", "De uil kijkt je aan. Hij weet de code.", "De vos is te slim voor dit bordje."]) },
  decoKinds: ["pine", "pine", "deer"],
  doneMsg: T("Three photos in the group chat, 47 replies within a minute. Well done!", "Drie foto's in de groepsapp, 47 reacties binnen een minuut. Goed gedaan!")
});

const DAY27 = genLevel({
  seed: 2727, w: 150, day: dayLabel(6), name: T("The Last Evening", "De laatste avond"), theme: "huis",
  sub: T("Raclette night! Find 3 pieces of raclette cheese and the Uno cards for the last game.",
    "Raclette-avond! Vind 3 stukken raclettekaas en de Uno-kaarten voor het laatste potje."),
  keyType: "🧀", keyHud: "🧀", keyName: T("raclette cheeses", "raclettekazen"),
  questType: "🃏", questHud: "🃏", questName: T("Uno cards", "Uno-kaarten"),
  coin: "🧇", coinName: T("waffles", "wafels"), enemy: "robot", spikeMsg: T("OUCH! A Lego brick!", "AU! Een legosteentje!"),
  pits: false, enemies: true, spikes: true, exitStyle: "door",
  labels: T([["Living room", 2], ["Dining room", 50], ["Wellness", 95]], [["Zitkamer", 2], ["Eetkamer", 50], ["Wellness", 95]]),
  intro: T(["The last evening. Who packs tonight, and who panics tomorrow?", "Raclette first. Packing can wait."],
    ["De laatste avond. Wie pakt vanavond al in, en wie morgen in paniek?", "Eerst nog raclette. Inpakken kan altijd nog."]),
  quest: {
    need: T(["No Uno, no last game. No last game, no winner of the week.", "The cards are somewhere up high. Someone hid them after last night's game..."],
      ["Zonder Uno geen laatste potje. Zonder laatste potje geen winnaar van de week.", "De kaarten liggen ergens hoog. Iemand heeft ze verstopt na het potje van gisteren..."]),
    done: T(["There they are! Someone kept the +4 cards very safe.", "The door to the dining room is open. Raclette!"], ["Daar zijn ze! Iemand heeft de +4-kaarten wel heel goed bewaard.", "De deur naar de eetkamer is open. Raclette!"]),
    after: T(["I'm not saying who won yesterday. I'm only saying: it was me."], ["Ik zeg niks over wie er gisteren won. Ik zeg alleen: dat was ik."]) },
  npcs: [T(["The sauna is open until 10 pm. After that it's just a warm wooden shed."], ["Sauna is open tot 22:00. Daarna is het gewoon een warm houten hok."]),
         T(["I've already packed my suitcase. Just kidding. It's still open on the bed."], ["Ik heb mijn koffer al ingepakt. Grapje. Hij ligt nog open op bed."]),
         T(["Home tomorrow. I'll miss the steam room. And the gourmet set. And the raclette."], ["Morgen naar huis. Ik ga het stoombad missen. En de gourmet. En de raclette."])],
  code: { answer: "7924", title: T("Door to the terrace", "Deur naar het terras"), syms: ["🌙", "👨‍👩‍👧", "🛏️", "🧖"],
    flavor: T(["Count the nights this week.", "Count everyone in the cabin.", "Two bedrooms for two people. How many per room?", "How many people fit in the sauna?"],
      ["Tel de nachtjes deze week.", "Tel alle mensen in het huis.", "Twee slaapkamers voor twee personen. Hoeveel per kamer?", "Hoeveel mensen passen in de sauna?"]) },
  decoKinds: ["sofa", "lamp", "table", "bed", "stove"],
  doneMsg: T("Raclette gone, Uno won (by someone who won't say it out loud). Good night!", "Raclette op, Uno gewonnen (door iemand die het niet hardop zegt). Welterusten!")
});

const DAY28 = genLevel({
  seed: 2828, w: 160, day: dayLabel(7), name: T("Going Home", "Naar huis"), theme: "bos",
  sub: T("Everything has to go! Find 3 lost socks and the last suitcase before the car leaves.",
    "Alles moet mee! Vind 3 verdwaalde sokken en de laatste koffer voordat de auto vertrekt."),
  keyType: "🧦", keyHud: "🧦", keyName: T("lost socks", "verdwaalde sokken"),
  questType: "🧳", questHud: "🧳", questName: T("suitcase", "koffer"),
  coin: "🍫", coinName: T("leftover chocolate", "restjes chocolade"), enemy: "zwijn", spikeMsg: T("Ouch, brambles!", "Au, bramen!"),
  pits: true, enemies: true, spikes: true, exitStyle: "car",
  intro: T(["Last day. Everything has to go, except the brambles.", "There are still socks in the forest. How? Nobody knows."],
    ["Laatste dag. Alles moet mee, behalve de bramen.", "Er liggen nog sokken in het bos. Hoe? Niemand weet het."]),
  quest: {
    need: T(["There's still a suitcase missing. The one with... all the Christmas presents.", "It's somewhere up high. Why? Because it's a game."],
      ["Er mist nog een koffer. De koffer met... alle kerstcadeaus.", "Hij staat ergens hoog. Waarom? Omdat het een spel is."]),
    done: T(["Found it! Without that suitcase it would have been a very quiet drive home.", "The way to the car is clear."], ["Gevonden! Zonder die koffer was het een héél stille terugreis geworden.", "De weg naar de auto is vrij."]),
    after: T(["Who's in the back? I'm in the front. I called it first."], ["Wie zit er achterin? Ik zit voorin. Ik heb het als eerste geroepen."]) },
  npcs: [T(["I've packed everything. Except my toothbrush. And my charger."], ["Ik heb alles ingepakt. Behalve mijn tandenborstel. En mijn oplader."]),
         T(["It was a great week. Same cabin next year?"], ["Het was een topweek. Zelfde huis volgend jaar?"]),
         T(["Are we there yet? We haven't even left."], ["Zijn we er al? We zijn nog niet eens vertrokken."])],
  code: { answer: "2128", title: T("Driveway gate", "Hek van de oprit"), syms: ["🚗", "🧳", "🎄", "🏠"],
    flavor: T(["The car is ready.", "Suitcases: always one more than you think.", "The Christmas tree stays here. It won't fit in the car.", "Your own bed is waiting at home."],
      ["De auto staat klaar.", "Koffers: altijd één meer dan je denkt.", "De kerstboom blijft hier. Hij past niet in de auto.", "Thuis wacht je eigen bed."]) },
  decoKinds: ["tree", "tree", "pine"],
  doneMsg: ""
});

LEVELS.splice(1, 0, DAY22, DAY23);
LEVELS.push(DAY26, DAY27, DAY28);
