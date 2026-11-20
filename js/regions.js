"use strict";
// Regions: the trips the families can choose from (TripScouts: you scout them all, so they can decide). Every region is its own week with 8 levels. Choose one on the map; each region keeps its own progress.
// LEVELS and WEEK (from levels.js and data.js) always hold the days of the active region: setRegion() swaps their contents,
// so the rest of the game keeps working with LEVELS[i] and WEEK[i].
const regionWeek = (list) => list.map(([ic, en, nl], i) => ({ wd: DAY_ABBR[i], ic, lb: T(en, nl) }));
const REGIONS = [
  { id: "ardennes", name: T("Ardennes", "Ardennen"), icon: "🌲", lon: 5.6, lat: 50.1, labelLeft: true, scene: "sneeuw",
    place: VILLAGE, blurb: T(`A Christmas week in a cabin near ${VILLAGE}.`, `Een kerstweek in een huisje bij ${VILLAGE}.`),
    levels: LEVELS.slice(), week: WEEK.slice(),
    verdict: T("⭐⭐⭐⭐⭐ A cosy cabin, Lego, Saabs and raclette. Book it again!", "⭐⭐⭐⭐⭐ Een knus huisje, Lego, Saabs en raclette. Meteen weer boeken!"),
    finale: [T("What a week! 🚗🏠", "Wat een week! 🚗🏠"),
      T("The arrival, the old railway, Luxembourg, Paul's 40th birthday, two Christmas days, raclette and all the socks back in the suitcase.",
        "De aankomst, het oude spoorpad, Luxemburg, Pauls 40e verjaardag, twee kerstdagen, raclette en alle sokken terug in de koffer.")] },
  { id: "pole", name: T("North Pole", "Noordpool"), icon: "🎅", lon: 30, lat: 69.4, offMap: true, labelLeft: true, scene: "pole",
    place: T("Santa's village", "het dorp van de Kerstman"), blurb: T("A week at the North Pole, in Santa's village.", "Een week op de Noordpool, in het dorp van de Kerstman."),
    levels: POLE_LEVELS,
    week: regionWeek([["✈️", "Landing", "Landen"], ["🦌", "Reindeer", "Rendieren"], ["🧸", "Workshop", "Werkplaats"], ["🧊", "Igloo", "Iglo"],
      ["✉️", "Post office", "Postkantoor"], ["🌌", "Northern lights", "Noorderlicht"], ["🎅", "Christmas Eve", "Kerstavond"], ["🏠", "Home", "Naar huis"]]),
    verdict: T("⭐⭐⭐⭐⭐ Cold, but pure magic. Only minus: the elves drink all the hot chocolate.", "⭐⭐⭐⭐⭐ Koud, maar pure magie. Enige minpunt: de elfjes drinken alle warme chocolademelk op."),
    finale: [T("Ho ho home! ✈️🏠", "Ho ho naar huis! ✈️🏠"),
      T("A lost penguin, nine reindeer, a workshop full of elves, an igloo, millions of letters, the northern lights and Santa's sleigh taking off.",
        "Een verdwaalde pinguïn, negen rendieren, een werkplaats vol elfjes, een iglo, miljoenen brieven, het noorderlicht en de slee van de Kerstman die vertrekt.")] },
  { id: "tirol", name: "Tirol", icon: "⛷️", lon: 11.4, lat: 47.25, labelDy: -.35, scene: "alps",
    place: "Lindenalm", blurb: T("A ski week in a chalet in Lindenalm, high in the Alps.", "Een skiweek in een chalet in Lindenalm, hoog in de Alpen."),
    levels: TIROL_LEVELS,
    week: regionWeek([["🏔️", "Arrival", "Aankomst"], ["🎿", "Ski school", "Skiles"], ["🚡", "Cable car", "Kabelbaan"], ["🎄", "Innsbruck", "Innsbruck"],
      ["🛷", "Toboggan", "Rodelen"], ["🍳", "Mountain hut", "Berghut"], ["🧀", "Fondue", "Fondue"], ["🏠", "Home", "Naar huis"]]),
    verdict: T("⭐⭐⭐⭐ Great slopes and fondue. The goats always have right of way.", "⭐⭐⭐⭐ Mooie pistes en fondue. De geiten hebben altijd voorrang."),
    finale: [T("Servus, Tirol! 🏔️🚗", "Servus, Tirol! 🏔️🚗"),
      T("Ski school, the cable car, the market in Innsbruck, the toboggan run on Christmas Day, Kaiserschmarrn and fondue. And a lot of goats.",
        "Skiles, de kabelbaan, de markt in Innsbruck, de rodelbaan op eerste kerstdag, Kaiserschmarrn en fondue. En heel veel geiten.")] },
  { id: "norway", name: T("Norway", "Noorwegen"), icon: "🌌", lon: 6.8, lat: 61.2, labelLeft: true, scene: "fjord",
    place: "Fjordvik", blurb: T("A week in a red cabin by the fjord, under the northern lights.", "Een week in een rood huisje bij het fjord, onder het noorderlicht."),
    levels: NORWAY_LEVELS,
    week: regionWeek([["🌊", "Arrival", "Aankomst"], ["🛷", "Kicksled", "Schopslee"], ["🐕", "Huskies", "Husky's"], ["⛪", "Christmas Eve", "Kerstavond"],
      ["🐟", "Christmas Day", "1e Kerstdag"], ["🌲", "Troll forest", "Trollenbos"], ["🌌", "Northern lights", "Noorderlicht"], ["🏠", "Home", "Naar huis"]]),
    verdict: T("⭐⭐⭐⭐⭐ The northern lights win. Pack woolly socks. Lots of them.", "⭐⭐⭐⭐⭐ Het noorderlicht wint. Neem wollen sokken mee. Heel veel."),
    finale: [T("Ha det, Norway! 🌌🚗", "Ha det, Noorwegen! 🌌🚗"),
      T("A red cabin by the fjord, brown cheese, huskies, the stave church on Christmas Eve, the troll forest and a sky that danced.",
        "Een rood huisje bij het fjord, bruine kaas, husky's, de staafkerk op kerstavond, het trollenbos en een lucht die danste.")] }
,
  { id: "netherlands", name: T("Netherlands", "Nederland"), icon: "🌷", lon: 5.4, lat: 53.0, scene: "polder",
    place: "Tulpendam", blurb: T("A winter week in a little house by a windmill near Tulpendam: canals, cheese, skating and the Wadden.",
      "Een winterweek in een huisje bij een molen bij Tulpendam: grachten, kaas, schaatsen en de Wadden."),
    levels: NL_LEVELS,
    week: regionWeek([["🌬️", "Windmills", "Molens"], ["⚙️", "Kinderdijk", "Kinderdijk"], ["🚲", "Amsterdam", "Amsterdam"], ["🕯️", "Gouda", "Gouda"],
      ["⛸️", "Skating", "Schaatsen"], ["🦌", "Veluwe", "Veluwe"], ["🐚", "Wadden", "Wadden"], ["🏠", "Home", "Naar huis"]]),
    verdict: T("⭐⭐⭐⭐ Windmills, cheese and skating. The wind always blows the wrong way.", "⭐⭐⭐⭐ Molens, kaas en schaatsen. De wind staat altijd verkeerd."),
    finale: [T("Doei, Netherlands! 🌷🚗", "Doei, Nederland! 🌷🚗"),
      T("Windmills, dikes and a headwind, Amsterdam by boat, Gouda by candlelight, skating in Giethoorn, the white bikes, herring on the island and a cheese for the neighbours.",
        "Molens, dijken en tegenwind, Amsterdam per boot, Gouda bij kaarslicht, schaatsen in Giethoorn, de witte fietsen, haring op het eiland en een kaas voor de buren.")] }
,
  { id: "dalmatia", name: T("Dalmatia", "Dalmatië"), icon: "☀️", lon: 16.6, lat: 43.1, labelDy: .45, scene: "adriatic", summer: true,
    place: T("Camp Lavanda", "Camping Lavanda"), blurb: T("A summer week at Camp Lavanda on the Croatian coast: islands, waterfalls, old towns and a warm sea to swim in.",
      "Een zomerweek op Camping Lavanda aan de Kroatische kust: eilanden, watervallen, oude stadjes en een warme zee om in te zwemmen."),
    levels: DALMATIA_LEVELS,
    week: regionWeek([["🏕️", "Camping", "Camping"], ["💧", "Krka", "Krka"], ["🏰", "Dubrovnik", "Dubrovnik"], ["🏝️", "Islands", "Eilanden"],
      ["🌲", "Plitvice", "Plitvice"], ["🎵", "Zadar", "Zadar"], ["🩴", "Beach", "Strand"], ["🏠", "Home", "Naar huis"]]),
    verdict: T("⭐⭐⭐⭐⭐ Sun, sea and island hopping. Mind the sea urchins.", "⭐⭐⭐⭐⭐ Zon, zee en eilandhoppen. Pas op voor de zee-egels."),
    finale: [T("Doviđenja, Dalmatia! ☀️🚗", "Doviđenja, Dalmatië! ☀️🚗"),
      T("Camp Lavanda, the Krka waterfalls, the walls of Dubrovnik, island hopping, the lakes of Plitvice, the sea organ in Zadar and the rocky beach. Salty, sunny and happy.",
        "Camping Lavanda, de watervallen van Krka, de muren van Dubrovnik, eilandhoppen, de meren van Plitvice, het zeeorgel in Zadar en het rotsstrand. Zout, zonnig en blij.")] }
,
  { id: "smaland", name: "Småland", icon: "🛶", lon: 15.2, lat: 57.3, scene: "smaland", summer: true,
    place: "Lingonby", blurb: T("A summer week in a red cottage by a lake near Lingonby: forest, moose, fika, midsummer and a car meet.",
      "Een zomerweek in een rood huisje aan een meer bij Lingonby: bos, elanden, fika, midzomer en een autotreffen."),
    levels: SMALAND_LEVELS,
    week: regionWeek([["🏠", "Arrival", "Aankomst"], ["☕", "Fika", "Fika"], ["🌲", "Moose forest", "Elandenbos"], ["🐦", "Glassworks", "Glasblazerij"],
      ["🌼", "Midsummer", "Midzomer"], ["🛶", "Canoe", "Kano"], ["🚗", "Car meet", "Autotreffen"], ["🏠", "Home", "Naar huis"]]),
    verdict: T("⭐⭐⭐⭐ Fika every day and moose to bounce on. Bring mosquito spray.", "⭐⭐⭐⭐ Elke dag fika en elanden om op te stuiteren. Neem muggenspray mee."),
    finale: [T("Hej då, Småland! 🛶🚗", "Hej då, Småland! 🛶🚗"),
      T("A red cottage by the lake, fika with princess cake, moose to bounce on, glass birds, dancing like frogs at midsummer, a canoe that tipped over and a parade of Saabs.",
        "Een rood huisje aan het meer, fika met prinsessentaart, elanden om op te stuiteren, glazen vogeltjes, als kikkers dansen met midzomer, een kano die omsloeg en een parade van Saabs.")] },
  { id: "scotland", name: T("Scotland", "Schotland"), icon: "🏰", lon: -4.3, lat: 57.0, labelLeft: true, scene: "highlands", summer: true,
    place: "Glen Rowan", blurb: T("A summer week in a fictional Highland village: rugged glens, lochs, old castles, ceilidh music and long daylight.",
      "Een zomerweek in een fictief dorp in de Highlands: ruige dalen, lochs, oude kastelen, ceilidhmuziek en lange dagen."),
    levels: SCOTLAND_LEVELS,
    week: regionWeek([["🏔️", "Glen Coe", "Glen Coe"], ["🌊", "Loch Ness", "Loch Ness"], ["🏰", "Castle", "Kasteel"], ["🎶", "Ceilidh", "Ceilidh"],
      ["⛴️", "Isles", "Eilanden"], ["🏘️", "Edinburgh", "Edinburgh"], ["🎻", "Glasgow", "Glasgow"], ["🏠", "Home", "Naar huis"]]),
    verdict: T("⭐⭐⭐⭐ Castles, a ceilidh and four kinds of weather a day. Braw!", "⭐⭐⭐⭐ Kastelen, een ceilidh en vier soorten weer per dag. Prachtig (braw)!"),
    finale: [T("Slàinte, Scotland! 🏰🚗", "Slàinte, Schotland! 🏰🚗"),
      T("The Highlands, a loch-side boat trip, old castle stones, a braw ceilidh, island ferries, Edinburgh's closes and Glasgow's music. The long summer light came all the way home with us. Haste ye back!",
        "De Highlands, een boottocht op de loch, oude kasteelstenen, een ceilidh, veerboten naar de eilanden, de steegjes van Edinburgh en de muziek van Glasgow. Het lange zomerlicht ging met ons mee naar huis. Haste ye back!")] },
  { id: "ardeche", name: "Ardèche", icon: "🌻", lon: 4.4, lat: 44.7, labelLeft: true, scene: "ardeche", summer: true,
    place: "Roquelune", blurb: T("A summer week at a campsite by the river near Roquelune: canoes, the Pont d'Arc, a painted cave, markets, lavender and sunflowers.",
      "Een zomerweek op een camping aan de rivier bij Roquelune: kano's, de Pont d'Arc, een beschilderde grot, markten, lavendel en zonnebloemen."),
    levels: ARDECHE_LEVELS,
    week: regionWeek([["🏕️", "Campsite", "Camping"], ["🛶", "Pont d'Arc", "Pont d'Arc"], ["🥖", "Market", "Markt"], ["🦣", "Chauvet Cave", "Grot van Chauvet"],
      ["🌻", "Lavender", "Lavendel"], ["🍇", "Grape harvest", "Druivenoogst"], ["⛪", "Old village", "Oud dorp"], ["🏠", "Home", "Naar huis"]]),
    verdict: T("⭐⭐⭐⭐⭐ Canoeing, cave paintings and nougat. Oh là là!", "⭐⭐⭐⭐⭐ Kanoën, grotschilderingen en nougat. Oh là là!"),
    finale: [T("Merci, Ardèche! 🌻🚗", "Merci, Ardèche! 🌻🚗"),
      T("Cicadas, a canoe under the Pont d'Arc, Josette the hen, 36,000-year-old horses on a cave wall, lavender, grape juice from our own harvest and a picnic in an old village. And a 2CV on every corner.",
        "Cicaden, een kano onder de Pont d'Arc, Josette de kip, paarden van 36.000 jaar oud op een grotwand, lavendel, druivensap van onze eigen oogst en een picknick in een oud dorp. En op elke hoek een 2CV.")] },
  { id: "veneto", name: "Veneto", icon: "🎭", lon: 12.3, lat: 45.5, scene: "laguna", summer: true,
    place: "Portoverde", blurb: T("A summer week by the lagoon near Portoverde: Venice and its islands, flamingos, Verona's Arena, the Dolomites and the Lido.",
      "Een zomerweek aan de lagune bij Portoverde: Venetië en zijn eilanden, flamingo's, de Arena van Verona, de Dolomieten en het Lido."),
    levels: VENETO_LEVELS,
    week: regionWeek([["🏕️", "Lagoon", "Lagune"], ["🎭", "Venice", "Venetië"], ["🔮", "Murano & Burano", "Murano & Burano"], ["🦩", "Flamingos", "Flamingo's"],
      ["🎶", "Verona", "Verona"], ["⛰️", "Dolomites", "Dolomieten"], ["🏖️", "Lido", "Lido"], ["🏠", "Home", "Naar huis"]]),
    verdict: T("⭐⭐⭐⭐⭐ Gelato, gondolas and flamingos. Grazie mille!", "⭐⭐⭐⭐⭐ Gelato, gondels en flamingo's. Grazie mille!"),
    finale: [T("Grazie, Veneto! 🎭🚗", "Grazie, Veneto! 🎭🚗"),
      T("Flamingos on one leg, the vaporetto from island to island, glass from Murano, the colours of Burano, opera by candlelight in the Arena, pink mountains and a day at the Lido. And far too much gelato.",
        "Flamingo's op één poot, de vaporetto van eiland naar eiland, glas uit Murano, de kleuren van Burano, opera bij kaarslicht in de Arena, roze bergen en een dag op het Lido. En veel te veel gelato.")] }
];
/** Places on the map that are not playable yet. */
const SOON = [
  { name: T("Iceland", "IJsland"), lon: -19, lat: 64.9 },
  { name: T("Tuscany", "Toscane"), lon: 11.1, lat: 43.4 },
  { name: T("Catalonia", "Catalonië"), lon: 1.8, lat: 41.9 },
  { name: T("Greece", "Griekenland"), lon: 22.0, lat: 39.6 }
];
let REGION = REGIONS[0];
/** Progress of a region: the Ardennes keep the top-level unlocked/best (old saves keep working), the others save.regions[id]. */
function prog(id = REGION.id) {
  if (id === "ardennes") return save;
  if (!save.regions || typeof save.regions !== "object") save.regions = {};
  const p = save.regions[id] || (save.regions[id] = { unlocked: 1, best: {} });
  if (!p.best) p.best = {};
  return p;
}
function regionDone(id) { const r = REGIONS.find(x => x.id === id), p = prog(id); return r.levels.filter((_, i) => p.best[i] != null).length; }
/** Make a region active: its levels and week go into LEVELS and WEEK. */
function setRegion(id, store) {
  REGION = REGIONS.find(r => r.id === id) || REGIONS[0];
  LEVELS.length = 0; LEVELS.push(...REGION.levels);
  WEEK.length = 0; WEEK.push(...REGION.week);
  if (store) { save.region = REGION.id; persist(); }
}
setRegion(save.region);
