"use strict";
// The week, the characters, the jokes and small helpers that are needed while loading.

/** A predictable random generator: the same seed always gives the same level. */
function rng(seed) { let s = (seed >>> 0) || 1; return () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return (s % 100000) / 100000; }; }

/* =====================================================================
   THE WEEK
   Eight days in the cabin near the (fictional) village of Pinebrook, around Christmas.
   No dates: the next day unlocks when you finish the one before.
   ===================================================================== */
const VILLAGE = "Pinebrook";
const WEEK = [
  { wd: T("Mon", "ma"), ic: "🚗", lb: T("Arrival", "Aankomst") },
  { wd: T("Tue", "di"), ic: "🌲", lb: T("Forest", "Bos") },
  { wd: T("Wed", "wo"), ic: "🎡", lb: T("Luxembourg", "Luxemburg") },
  { wd: T("Thu", "do"), ic: "🎂", lb: T("Paul 40", "Paul 40") },
  { wd: T("Fri", "vr"), ic: "🎄", lb: T("Christmas", "1e Kerstdag") },
  { wd: T("Sat", "za"), ic: "🎄", lb: T("Boxing Day", "2e Kerstdag") },
  { wd: T("Sun", "zo"), ic: "🧖", lb: T("Last night", "Laatste avond") },
  { wd: T("Mon", "ma"), ic: "🏠", lb: T("Home", "Naar huis") }
];
/** The label for a day: "Day 3 · Wednesday". */
const DAY_NAMES = T(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday", "Monday"],
                    ["maandag", "dinsdag", "woensdag", "donderdag", "vrijdag", "zaterdag", "zondag", "maandag"]);
const dayLabel = i => `${T("Day", "Dag")} ${i + 1} · ${DAY_NAMES[i]}`;
/** The pill in the top bar: which night of the week it is. */
const nightsLabel = i => i < 7 ? `🌙 ${T("night", "nacht")} ${i + 1}/7` : `🏠 ${T("going home", "naar huis")}`;

/* =====================================================================
   CHARACTERS
   Two (fictional) families share the cabin: the Hills and the Woods. Laura and Anna are sisters.
   ===================================================================== */
// size: height compared to an adult; kid: bigger head. hair: short, bald, bob, curly, long, flowing, ponytail.
// coat: puffer, long, jacket. scarf: stripe colours. glasses: round or thick.
// sweater: Paul wears his green Christmas jumper (with a Saab 900) indoors. beanieCold: only a hat outside in the cold.
const CHARS = [
  { name: "Paul", fam: "Hill", size: 1, hair: "short", hairCol: "#a87c4c",
    coat: "jacket", coatCol: "#b8a586", pants: "#3d5a86", backpack: "#4a5560", sweater: "#1f6a3a" },
  { name: "Laura", fam: "Hill", size: .94, hair: "bob", hairCol: "#e8c47c",
    coat: "long", coatCol: "#e6dccd", pants: "#2f4870", scarf: ["#e4573f", "#f08a70"], beanie: "#8a6a55", beanieCold: true },
  { name: "Sophie", fam: "Hill", size: .88, hair: "ponytail", hairCol: "#ecc979", bow: "#b3202e",
    coat: "puffer", coatCol: "#f4f4f2", pants: "#1f2228", scarf: ["#f2a0a8"] },
  { name: "Lily", fam: "Hill", size: .76, kid: true, hair: "flowing", hairCol: "#f2d184", bun: "#b67ad9", cute: true,
    coat: "puffer", coatCol: "#f1ece3", pants: "#3a2a32", skirt: "#7a2236", shoes: "#2a2a30", laces: ["#ff5a7a", "#ffd25e", "#5aa8ff"] },
  { name: "Rob", fam: "Woods", size: 1.05, hair: "bald", hairCol: "#c9a77a", stubble: true,
    coat: "jacket", coatCol: "#2e3338", pants: "#3d5a86" },
  { name: "Anna", fam: "Woods", size: .94, hair: "curly", hairCol: "#d9a35a",
    coat: "long", coatCol: "#2f7a4a", pants: "#3a2a2e", scarf: ["#d9782e", "#6a8a3a", "#b8303a", "#e8b44a"] },
  { name: "Finn", fam: "Woods", size: .92, hair: "short", hairCol: "#e2c27a", glasses: "round",
    coat: "puffer", coatCol: "#8a8448", pants: "#2c2f36" },
  { name: "Tom", fam: "Woods", size: .76, kid: true, hair: "short", hairCol: "#e6c784", glasses: "thick",
    coat: "puffer", coatCol: "#2c3a30", pants: "#2c2f36", beanie: "#5a6068" },
  { name: "Max", fam: "Woods", size: .68, kid: true, hair: "short", hairCol: "#efd28e",
    coat: "jacket", coatCol: "#b8652a", pants: "#56603d" }
];

/* =====================================================================
   JOKES
   ===================================================================== */
const JOKES = [
  T("🎒 Lily and Tom are in the same class. This week they share a cabin too. Homework stays at home.",
    "🎒 Lily en Tom zitten bij elkaar in de klas. Deze week delen ze ook een huisje. Huiswerk blijft thuis."),
  T("🚗 A Christmas tree on the roof of a Saab 900: the only proper way to transport a tree.",
    "🚗 Een kerstboom op het dak van een Saab 900: de enige juiste manier om een boom te vervoeren."),
  T("🧱 Lego on the floor of a holiday cabin: the fastest way to wake everyone up.",
    "🧱 Lego op de grond in een vakantiehuis: de snelste manier om iedereen wakker te krijgen."),
  T("👭 Two sisters, two families, one cabin. Who wins at Uno? That stays a family secret.",
    "👭 Twee zussen, twee gezinnen, één huis. Wie wint het potje Uno? Dat blijft een familiegeheim."),
  T("🏠 4 bedrooms, 4 bathrooms. The bathroom problem is officially solved. The wifi problem is not.",
    "🏠 4 slaapkamers, 4 badkamers. Het badkamerprobleem is officieel opgelost. Het wifi-probleem nog niet."),
  T("🧖 A sauna for 4, a steam room for 4, and there are 9 of us. There will be a rota. You're on at 6:15.",
    "🧖 Sauna voor 4, stoombad voor 4, en we zijn met 9. Er komt een rooster. Jij staat om 06:15."),
  T("🧀 A raclette grill and a gourmet set in the kitchen. That's not a holiday, that's a cheese expedition.",
    "🧀 Gourmetstel én raclette in de keuken. Dat is geen vakantie, dat is een kaasexpeditie."),
  T("🪵 'No firewood available on site.' Four adults, one gas fire, zero discussion. We hope.",
    "🪵 'Ter plekke geen brandhout voorhanden.' Vier volwassenen, één gaskachel, nul discussie. Hopen we."),
  T("🛁 'Please bring your own bath towels.' Everyone thought someone else had packed them.",
    "🛁 'Badhanddoeken zelf meebrengen.' Iedereen dacht dat iemand anders ze had ingepakt."),
  T("🚗 4 parking spaces for 2 cars. Finally a place with room to spare.",
    "🚗 4 parkeerplaatsen voor 2 auto's. Eindelijk een plek waar we ruimte over hebben."),
  T("⛰️ 'Look at those MOUNTAINS!' — 'That's a hill.'",
    "⛰️ 'Kijk die BERGEN!' — 'Dat is een heuveltje.'"),
  T("📶 Wifi in the cabin: theoretically present.",
    "📶 Wifi in het huisje: theoretisch aanwezig."),
  T("🍟 Proper chips are not a side dish. They are a way of life.",
    "🍟 Echte frietjes zijn geen bijgerecht. Het is een levensstijl."),
  T("🍫 Chocolate bought: 2 kilos. Chocolate that arrived at the cabin: 1.3 kilos.",
    "🍫 Gekochte chocolade: 2 kilo. Aangekomen bij het huis: 1,3 kilo."),
  T("🛏️ Bedroom 3 has 3 beds. Three kids in one room. Expected silence: never.",
    "🛏️ Slaapkamer 3 heeft 3 bedden. Drie kinderen in één kamer. Verwachte stilte: nooit."),
  T("🎲 Uno with two families: two sets of house rules, one winner, zero peace.",
    "🎲 Uno met twee families: twee sets huisregels, één winnaar, nul vrede."),
  T("🍵 A coffee machine and a filter coffee maker in the kitchen. Paul and Laura ask: where's the kettle?",
    "🍵 Nespresso én filterkoffie in de keuken. Paul en Laura vragen: waar staat de waterkoker?"),
  T("🍫 The chocolate supply was meant for the whole week. It lasted until day 2.",
    "🍫 De chocoladevoorraad was voor de hele week bedoeld. Het werd dag 2."),
  T("🍫 Where's the chocolate? Don't ask the ladies. They know nothing. With chocolate around their mouths.",
    "🍫 Waar is de chocolade? Vraag het niet aan de dames. Zij weten van niks. Met chocolade om hun mond."),
  T("🍟 Chips for nine: the chip shop has a 'family' size. We take two.",
    "🍟 Friet voor negen personen: de frituur heeft ook een maat 'familie'. Wij nemen er twee."),
  T("🍟 Mayo, ketchup or curry sauce? The only real problem of the week.",
    "🍟 Mayonaise, ketchup of curry? Het enige echte probleem van deze week."),
  T("📸 Goal of the week: one group photo with all 9 looking at the camera at the same time.",
    "📸 Doel van de week: één groepsfoto waarop alle 9 tegelijk in de camera kijken."),
  T("🦌 At the wildlife park the deer look at us and we look at the deer. Everyone's happy.",
    "🦌 In het wildpark kijken de herten naar ons, wij kijken naar de herten. Iedereen tevreden."),
  T("🔥 Lighting a fire with 4 adults: 4 methods, 1 smoke alarm.",
    "🔥 Een haardvuur aansteken met 4 volwassenen: 4 methodes, 1 rookmelder."),
  T("🌧️ It doesn't rain in Pinebrook. It's 'weather with character'.",
    "🌧️ In Pinebrook regent het niet. Het is 'karaktervol weer'."),
  T("🧩 A 1000-piece puzzle: started on day 1, 3 pieces missing by day 4.",
    "🧩 Puzzel van 1000 stukjes: begonnen op dag 1, 3 stukjes kwijt op dag 4.")
];
