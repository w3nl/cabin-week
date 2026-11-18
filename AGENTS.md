# AGENTS.md: working on Cabin Week

Notes for AI agents and new helpers. The README says what the game is; this file says what you cannot see straight from the code. The general recipe for a game like this is in [docs/blueprint.md](docs/blueprint.md) (in Dutch).

> **Spoilers:** the solutions of all code locks are below. You need them to test.

## What this is

A platform game in the browser (walk, jump, find things, do tasks, crack codes) about a Christmas week of two families in a holiday cabin near the **fictional** village of **Pinebrook**, in snowy hills.

- **The Hills:** Paul and Laura with Sophie and Lily. **The Woods:** Rob and Anna with Finn, Tom and Max. **Laura and Anna are sisters.** Lily and Tom are in the same class. 4 adults and 5 kids. You choose one of the nine, or **make your own hero** (the tenth tile, "+ Your hero"); you meet the others in the levels.
- **Regions:** six trips (five in winter, Dalmatia in summer), chosen on a **map of Europe** (the 🗺️ button on the title screen): the **Ardennes** (the original week near Pinebrook), the **North Pole** (Santa's village), **Tirol** (a ski week in the fictional village of Lindenalm), **Norway** (a red cabin by the fjord near the fictional village of Fjordvik) the **Netherlands** (a little house by a windmill near the fictional village of Tulpendam) and **Dalmatia** in **summer** (the fictional Camp Lavanda on the Croatian coast). Each region is its own week of **eight days, one level a day**, with its own progress: you can start any region at day 1. More places are on the map as grey dots (Iceland, Småland, Tuscany, Veneto, Scotland, Catalonia, Ardèche, Greece: "coming later", not built yet; the ideas are in [docs/ideas.md](docs/ideas.md)).
- A day unlocks when you finish the day before. **There are no dates and no countdown**: the title screen shows your progress in the region (`8 winter days to play`, `3/8 days played`, `🏆 The whole week done!`).
- **English by default, Dutch as an option** (see "Languages").
- **Plain HTML, CSS and JavaScript with canvas. No build, no framework, no runtime dependencies** (only Google Fonts). All graphics are drawn in code; there are no images except the app icons.
- Static site at **https://cabinweek.online/** (GitHub Pages, see [docs/domain.md](docs/domain.md)), installable as an app, playable offline. Also works as a loose file (`file://`), but then without app and offline.
- One Android app for phones, tablets and Google TV (`android-tv/`, package `nl.w3nl.cabinweek`; the folder, the workflow file `google-tv.yml` and the release tag `google-tv` keep the old TV name on purpose, because links and tools use them). Google Play Games on PC is optional and not turned on.
- `package.json` and `node_modules/` are only for the tests, the local server and the tools.

### No personal information

Cabin Week is a public version of a game that was made for one family. **Keep it fictional:** no real surnames, no real village or address, no dates or countdown, no birth years, nothing about anyone who passed away. The tests check for a hashed list of words from the original (`tests/titel.spec.js`). Real *places* that anyone visits are fine (the Ardennes as a region, Luxembourg's Christmas market, Innsbruck, the North Pole), and so are the Lego and the Saabs. Villages where the families stay are fictional (Pinebrook, Lindenalm, Fjordvik, Tulpendam, Camp Lavanda).

### Special days

- **Day 3, the Christmas market in Luxembourg**, is a quiet day (`quiet`): something to find, a task and a code lock, but no enemies, spikes or pits, no confetti and no joke when you finish. In the church you can light a candle ("You light a candle."); it is optional, gives nothing and names **no one**. Keep this day calm.
- **Day 4 is Paul's birthday** (he turns **40**), at the cabin, **with Lego**: the collectables are Lego bricks, on level 2 there is a Lego build with "40" and a Saab made of Lego, and the spikes are Lego bricks on the floor. Paul wears a party hat in that level (`birthday: "Paul"`).
- **Saabs:** Paul drives a **Saab 9-3 SportCombi in silver with a roof box** (on arrival, and on the drive home next to a dark estate car). On Christmas Day there is a **red Saab 900 three-door with a Christmas tree on the roof**. In Luxembourg a **Saab 96** is parked. Indoors (theme `huis`) Paul wears a **green Christmas jumper with a Saab 900**. Never draw number plates.
- **Days 5 and 6** are Christmas Day and Boxing Day.

## Map of the repository

| Path | What |
|---|---|
| `index.html` | The page: canvas, top bar (`#hud`), dialogue (`#dialog`), touch buttons (`#touch`), title screen (`#title`, with the language buttons `.lang`), card (`#cardWrap`/`#card`, for intro, complete and finale), code lock (`#padWrap`), update bar. English text, with Dutch in `data-nl` attributes. Loads the scripts in a fixed order |
| `css/game.css` | All styles, with tokens on `:root`. One theme (dark, winter night) |
| `js/i18n.js` | `LANG`, `T(en, nl)`, `setLang()`, and the Dutch texts of `index.html` (`data-nl`, `data-nl-label`, `data-nl-title`, `data-nl-content`). Loaded first |
| `js/data.js` | `rng()`, `VILLAGE`, the week (`WEEK`, `DAY_NAMES`, `dayLabel()`, `nightsLabel()`), `CHARS` (the nine), `JOKES` |
| `js/levels.js` | `LEVELS`: the three hand-built levels (days 1, 4 and 5) |
| `js/levelgen.js` | `genLevel(o)` and the five generated Ardennes days (`DAY22`, `DAY23`, `DAY26`, `DAY27`, `DAY28`: the names come from the original calendar), put in place in `LEVELS` with `splice`/`push`. Also the gates and locks of the other regions (`task`, `code.kind`), `lockKeys()`, `NOTES`, `COLOURS` and `ARROWS` |
| `js/region-pole.js`, `js/region-tirol.js`, `js/region-norway.js`, `js/region-netherlands.js`, `js/region-dalmatia.js` | `POLE_LEVELS`, `TIROL_LEVELS`, `NORWAY_LEVELS`, `NL_LEVELS`, `DALMATIA_LEVELS`: eight generated levels per region |
| `js/regions.js` | `REGIONS` (id, name, icon, map position `lon`/`lat`, `scene`, `place`, `blurb`, `levels`, `week`, `finale`), `SOON` (grey dots on the map), `REGION` (the active one), `prog()` (progress of a region), `regionDone()`, `setRegion(id, store)`. Loaded after `core.js` |
| `js/core.js` | `save`/`persist()` (saving), `tone()` and `SFX` (sound with Web Audio) |
| `js/canvas.js` | `TS` (32), `ROWS` (15), `VIEW_H`, the canvas `cv`, the global drawing context `g`, `resize()`, `hash()`, `$()`, `emoji()`, and the drawing helpers `OUT`, `mk()`, `withCtx()`, `shade()`, `rp()`, `blob()`, `sparkle()` |
| `js/sprites.js` | `drawPerson()` (hair: `short`, `bald`, `bob`, `curly`, `long`, `flowing`, `ponytail`, with `bun`; coat: `puffer`, `long`, `jacket`; scarf, glasses, beanie, bow, skirt, coloured laces, backpack, stubble, `cute`), `shadowAt()`, `drawEnemy()`, `drawItem()` |
| `js/game.js` | Game state (`state`, `L`, `P`, `cam`), `buildLevel()`, `cell()`, `isSolid()`, `startLevel()`, input (`held`, `edges`, `KEYMAP`, `bindTouch()`), dialogue (`say()`, `advanceDialog()`), `hurt()`, `respawn()`, `nearest()`, `interact()`, `step()` |
| `js/world.js` | Drawing: tile textures, background layers, the interior, decoration (`drawDeco()`: market stalls, church, Lego, Saabs), `drawSaab()` (`93`, `900`, `96`), `drawLegoBrick()`, exits, signs, flags, code post, lantern and candle stand (`drawCandles()`), particles, `render()` |
| `js/screens.js` | `updateHud()`, `setScreen()`, `card()`, `showIntro()`, `completeLevel()`, `toTitle()`, the code lock (`openPad()`, `padPress()`, `padCheck()`), confetti, `buildTitle()`, the map (`COASTS`, `mapXY()`, `buildMap()`, `openMap()`, `mapInfo()`), the joke ticker |
| `js/hero.js` | Your own hero: `HERO_OPTS` and `HERO_ROWS` (height, skin, hair, hair colour, coat, coat colour, trousers, glasses, hat, scarf), `makeHero()` (choices → a character for `drawPerson()`), `heroChar()` (the character you play with), and the creator (`#heroWrap`, state `"hero"`: `openHero()`, a walking preview, 🎲 `heroRandom()`, `heroSave()`). Loaded after `screens.js` |
| `js/gamepad.js` | Controllers (Gamepad API, standard layout): `GP`, `padHeld`, `pollGamepads()`, menu navigation (`gpMove()`, `gpPress()`, `gpBack()`), `gpStatus()`, `gpRumble()` |
| `js/app.js` | `GAME_VERSION`, service worker and update bar (`swVersion()`), install and rotate hints, language buttons, the game loop |
| `sw.js`, `manifest.webmanifest`, `icons/` | The web app. `icons/icon.svg` is the source; `npm run icons` makes the PNGs |
| `android-tv/` | The Android app (phone, tablet, Google TV; Java, one WebView). `MainActivity.java` loads the game from `assets/game` (put there by the workflow *Build the Android app*) via `appassets.androidplatform.net`, passes a controller as `window.__nativePad` and the Back button as `window.tvBack()`. The workflow builds an `.apk` and, with the secrets `ANDROID_KEYSTORE_BASE64`/`ANDROID_KEYSTORE_PASSWORD`, a signed `.aab` for Google Play (key alias `cabinweek`, or the repository variable `ANDROID_KEY_ALIAS`), optimised with **R8** (`isMinifyEnabled`/`isShrinkResources` on the release build only; rules in `android-tv/app/proguard-rules.pro`: there is no JavaScript bridge to keep, the app only uses `evaluateJavascript`; the mapping file goes in the 7z as `cabin-week-mapping.txt`). **The `.aab` is never public:** only in the artifact `cabin-week-google-play`, a 7z with `ANDROID_KEYSTORE_PASSWORD` as password; the release only has the `.apk`. See [docs/google-tv.md](docs/google-tv.md) and [docs/android-key.md](docs/android-key.md) |
| `privacy.html` | Privacy policy (English and Dutch; the game collects nothing), for Google Play. Its own styles; published via `build-site.js`, not in `CORE` |
| `docs/` | `domain.md`, `google-tv.md`, `publish-android.md` (publishing in Google Play and getting the `.aab`, step by step), `android-key.md` (the signing key), `iphone-ipad.md`, `agent-workflow.md`, `blueprint.md`, and `play-store/` (store texts in English and Dutch, and images: `npm run store`) |
| `tools/` | `build-site.js` (the site in `_site/` for GitHub Pages), `bundle.js` (one loose HTML file in `dist/`), `build-aab.js` (runs the GitHub Actions build and downloads/extracts the protected Google Play bundle), `icons.js`, `store.js` |
| `tests/` | Playwright: `dagen` (every day of every region), `regio` (map and regions), `held` (your own hero), `besturing`, `codeslot`, `controller`, `titel`, `voortgang`, `telefoon`, `pwa`; `helpers.js` (`seed(page, { unlocked, char, lang, region })`); `serve.js` |
| `.github/` | Workflows (see "Workflow" and [docs/agent-workflow.md](docs/agent-workflow.md)), the issue form *Idea*, the PR template |

## Languages

- **Every text in the game is written as `T("English", "Nederlands")`.** `T` picks one when the scripts load, so level data, jokes and names of things are plain strings afterwards. Never write a bare string the player sees.
- **`index.html`** has the English text in the page and the Dutch in `data-nl` (innerHTML), `data-nl-label` (aria-label), `data-nl-title` (title) and `data-nl-content` (meta). `js/i18n.js` swaps them when `LANG === "nl"`.
- **Choosing:** the buttons *English* / *Nederlands* at the bottom of the title screen call `setLang()`, which saves the choice in `localStorage['cabin-week-lang']` and reloads. `?lang=nl` or `?lang=en` in the link also works and is remembered. Default: English.
- Dutch texts are usually longer: check the menu on 960×540 in Dutch (`tests/telefoon.spec.js` does that).

## How it fits together

- **Plain scripts in one shared scope**, loaded by `index.html` in this order: `i18n`, `data`, `levels`, `levelgen`, `region-pole`, `region-tirol`, `region-norway`, `region-netherlands`, `region-dalmatia`, `core`, `regions`, `canvas`, `sprites`, `game`, `world`, `screens`, `hero`, `gamepad`, `app`. Every top-level name must be unique across all files.
- **Order matters while loading.** Functions are only hoisted within their own file, and `const`/`let` only exist after their line. Code that runs while loading (like `genLevel()` in `levelgen.js`) may only use things from earlier files. That is why `rng()` is in `data.js` and `T()` in `i18n.js`.
- **One drawing context `g`** (a `let`). `withCtx(ctx, fn)` swaps it to another canvas for a moment, so the same drawing functions also draw textures, background layers and portraits.
- **The world is a grid** of 15 rows of 32 px; the screen always shows all 15 rows and scales (`scale`). Characters in `L.grid`: `#` ground, `=` platform (only from above), `S` block, `^` spikes (brambles, Lego bricks, icicles), `G` task gate, `H` code door. Row 12 is the normal ground; you stand on row 11.
- **A fixed time step** of 1/60 s (`step()` in a loop in `app.js`), drawn with interpolation (`renderSmooth()`), so walking is smooth on a 50 Hz TV too. `render()` must not change `P.x`, `cam` or enemy positions. One-shot keys (jump, talk) go through `edges`; held keys through `held` (keyboard and touch), `padHeld` (controller) and `tvHeld` (controller in the Android app). Keyboard, remote and the TV app pass the moment of pressing and releasing (`queueHold()`, `applyHolds(simT)`), so a short tap is a short step even on a busy device.
- **The wide menu** (`html.wide`, `fitMenu()` in `canvas.js`): on a screen wider than tall, the title screen has two columns and scales with `--fit` from a 960×540 design, so nothing scrolls. Adding something to the title screen? Check 960×540, 1366×768 and 740×360, in Dutch too.
- **Menus with keyboard, remote and controller:** arrows choose the nearest button, Enter/OK/✕/A presses, Back/○/B goes back (`tvBack()`). Until mouse or touch is used, focus is on a button right away (`menuAutoFocus()`).
- **Physics** (in `step()`): gravity 0.55 (1.1 when jump is released while rising), jump −11.6, max. 4.4 px per step sideways, smooth acceleration on the ground (0.12 rising to 0.7). **Running** (Shift/Ctrl, L1/R1/L2/R2, or double-tap and hold) raises the top speed to 6.2. Coyote time 7 steps, jump buffer 8 steps. You jump just over **3 tiles up** and **4 tiles across**. **Belly slide** (`P.slide`): walking plus ↓/E/□/○/💬 with nothing to talk to: you shoot ahead and slide (furthest in the snow); sliding knocks over animals, but spikes, pits and bumping still count. `tests/besturing.spec.js` guards this; if you change the physics, check every level.
- **Regions** (`js/regions.js`): `LEVELS` and `WEEK` always hold the days of the active region; `setRegion()` swaps their contents, so the rest of the game keeps using `LEVELS[i]`. The map (`#mapWrap`, state `"map"`) draws Europe as an SVG from hand-simplified coastlines (`COASTS`, longitude/latitude, projected flat with `mapXY()`), with a button (`.pin`) per region; in landscape the map is on the left and the text on the right. Arrows, Enter, Back and the controller work there like in every menu (`gpRoot()`/`gpDefault()` in `gamepad.js`). Adding a region: a `region-….js` with eight `genLevel()` levels, an entry in `REGIONS` (with a `week` and a `finale`), the file in `index.html` and `CORE`, a `FLAGS` entry for its checkpoint flag in `world.js`, and the region in the loop in `tests/dagen.spec.js`.
- **Region gameplay:** every region plays differently, not only looks different. Options on a level (read by `genLevel()`, `step()` and `render()`):
  - `hills: [low, high]`: the ground goes up and down between those rows (12 is normal, 9 is high), at most 2 rows at a time so you can always jump it. Everything in a piece of the level is placed relative to the ground there; the start, the gate and the code door are on flat ground. Tirol climbs like a mountain; Norway has cliffs.
  - `movers: "floe" | "gondola" | "boat"`: a gap of 7 tiles (too wide to jump) with an ice floe, a cable-car gondola or a rowing boat that goes back and forth (`L.movers`, waiting at each end) and carries you (`P.mover`). Stand on it like on a plank. A **gondola rides a slanted cable**: up the mountain (2 or 3 rows, the ground on the far side is that much higher) or down where the ground is already high (`rise` on the mover; `y0`/`y1`, and `dy` moves you along), with a station post at each end. Floes and boats stay level. The reachability test in `tests/dagen.spec.js` counts its whole track as standable.
  - `ice: true`: slow to get going, slow to turn, and you keep sliding when you let go (North Pole, the toboggan run, the kicksled).
  - `water: true`: the gaps are water (North Pole, Norway), drawn by `drawWater()`.
  - `dark: { r, key, quest }`: darkness with a circle of light around you of radius `r`, bigger for every thing you find (`key`) and once you have the task item (`quest`). The northern lights night at the North Pole (lanterns) and the troll forest in Norway (the torch). `drawDark()`.
  - `wind: n`: gusts that push you (`windNow()`: mostly against you, sometimes from behind; `n` is the strength, about .35 to .7), less in the air than on the ground, shown as white streaks (`drawWind()`). The Netherlands.
  - `summer: true` (Dalmatia): no snow anywhere, summer clothes (`drawPerson(..., { summer: true })`: a light T-shirt instead of the coat, shorts, no hat or scarf), "summer days" on the title screen, turquoise water, and no snow on the title background.
  - `swim: true` (Dalmatia, where the sea is warm): in the water of a gap you float (`P.swim`, the surface is `SWIM_Y`) instead of falling, and you can jump out again. The reachability test counts the water as standable. Where `swim` is off, water is still deadly (Norway, the North Pole, Plitvice: no swimming in the national park).
  - `stalls`: the names on the market stalls of a level (otherwise mulled wine, waffles, and so on).
  - `interior: "wood" | "workshop"`: indoor levels with pine panelling (Tirol) or red-and-white stripes (Santa's workshop and post office).
  The Ardennes use none of these (a test checks that), so they stay exactly as they were.
- **Gates and locks** (the other regions; the Ardennes keep "bring something" and symbol codes). Every day has a gate halfway and a lock at the end, and each region mixes them, so no two days feel the same (`tests/regio.spec.js` checks: at least 6 kinds of lock and 4 kinds of gate per region, nothing more than twice, at most two "bring something"):
  - **The gate** (`quest` as before, or `task: { kind, hud, name, need, done, after }`, or neither for no gate): `levers` (3 levers before the gate, `L.switches`), `lights` (3 lamps, or torches with `look: "torch"`; in a dark level each lit lamp makes the light bigger, `dark.lamp`), `timer` (ring the bell `L.bell` well before the gate; the gate stays open `secs` seconds, then closes again unless you are through or standing in it), `follow` (a lost animal `L.animal`, drawn as the emoji `animal`, follows your footsteps half a second behind; talk to its owner at the gate while it is near). The generator gives these things room (`room()`), so nobody stands right next to them.
  - **The lock** (`code.kind`): `symbols` (signs `symbol = digit`, as before), `count` (`code.count: [[decoKind, name]]`: the generator places exactly that many of each, and never as random decoration), `melody` (numbered bells along the way play a note when you pass or talk to them; the keys are 5 coloured notes do re mi sol la, or 1–5 on the keyboard), `colours` (numbered lamps; `code.palette`, default `RYGBWP`), `arrows` (numbered signposts), `word` (numbered letters on stones, wooden blocks indoors; the keys are the letters of the word plus `code.extra`; the word may differ per language), `clock` (four digits shown as HH:MM; `code.signs` give the time). One pad for all of them (`openPad()` builds the slots and keys from `code.keys`, made by `lockKeys()` in `levelgen.js`); clues are `clue` entities (`L.clues`, `drawClue()`).
- **Regional animals:** enemies and scenery belong to the region. Robot vacuums, Lego bricks and the "PAUL 40" garland are only in the Ardennes cabin (`birthday`). Indoors elsewhere: a toy robot and toy blocks in Santa's workshop, runaway parcels and drawing pins in the post office, a marmot and pine cones in the Tirolean hut (`spikeKind`: `blocks`, `pins`, `cones`). At the North Pole there is only one lost penguin (day 1); otherwise arctic foxes and lemmings, with polar bears, walruses and a musk ox as scenery.
- **Scenery:** `theme` decides the tiles, the snow and the sliding (`bos`, `huis`, `sneeuw`, `stad`); `scene` (optional) replaces only the background: `pole` (ice floes, Santa's village, northern lights), `alps` (sharp peaks, chalets, a cable car) `fjord` (fjord, red cabins, northern lights), `polder` (flat land, windmills on the dike, reeds), `grachten` (canal houses with stepped, neck and bell gables, the canal, bridges with lights) or `duinen` (the sea with a lighthouse, dunes with marram grass, pines), in `getSceneLayers()`, `drawSceneSky()` and `drawAurora()`. The title screen shows the scene of the active region. Checkpoint flags are white until you pass them, then the flag of the region (`FLAGS`: Belgium, a red-white-green North Pole flag, Austria, Norway, the Netherlands, Croatia).
- **Levels** are objects in `LEVELS` with: `day` (`dayLabel(i)`), `name`, `theme` (`bos`, `huis`, `sneeuw`, `stad`), `w`, `sub`, what you look for (`keyType`, `keyHud`, `keyName`), the task (`questType`, `questHud`, `questName`), `coin`/`coinName`, `enemy` (`zwijn`, `robot`, `sneeuwpop`, `pinguin` (a lost penguin at the North Pole), `geit` (an Alpine goat), `troll` (a small Norwegian troll), `gans` (a cross Dutch goose), `meeuw` (a seagull after your chips), `krab` (a crab on the rocks), `poolvos` (an arctic fox), `lemming`, `marmot`, `speelgoed` (a wind-up toy robot), `pakje` (a runaway parcel)), `spikeMsg`, `ground`, `plats`, `blocks`, `spikes`, `gate`, `code`, `ents`, `deco`, `exitStyle` (`house`, `door`, `tree`, `arch`, `car`), `doneMsg`, and optionally `scene`, `quiet`, `birthday`, `keysNeeded`, `fixedInterior`, `labels`, `coinHud`, and for the generator `lantern`, `lanternDeco` (`church`) and `decoExtra`. Theme and enemy names are internal (Dutch) keys; do not translate them.
- **The level generator** (`genLevel(o)`) builds a level from pieces (`pit`, `plat2`, `steps`, `tower`, `run`) with a fixed `seed`, so a day always looks the same. It puts the gate at 60% of the width, a tower before the gate for the task item, spreads the 3 things, puts the code door 14 tiles before the end, and four signs with `symbol = digit`. Change a `seed` and the whole level changes; run the tests.
- **Height** of a character is `40 × size` px; jumping is the same for everyone. Your own hero is a kid (`.76`, bigger head), a teen (`.88`) or an adult (`1`).
- **Your own hero:** the tenth tile on the title screen. Not made yet: "+ Your hero" opens the creator. Made: the tile chooses it, and pressing it again (when chosen) opens the creator to change it. Every option is a button (chips and colour swatches), so the creator works with a remote and a controller; the name field is optional (max. 12 characters, empty becomes "Me"/"Ik"), and keys typed there go to the field only (Enter saves, Escape goes back). `drawPerson()` takes an optional `skin` colour (the nine keep the default). The creator fits on 960×540, 740×360 and an upright phone (`tests/held.spec.js`).
- **Interactions** (talk, read, lantern, code lock) all go through `interact()` (E, ↓, Enter or 💬). A character with a `quest` opens the gate once you have the item (`L.hasQuest`). The exit only works with enough things (`L.need`).
- **Fast enough for the TV:** layers drawn once per theme and only the band that has content (`layerBand()`), tiles from one atlas per theme, reused gradients (`grad()`), emoji cached as images (`EMOJI_CACHE`), an opaque canvas. Reset a translated context with `setTransform()`.

### State and saving

- Saved in `localStorage['cabin-week']`: `{ unlocked, char, best, region, regions }`. `unlocked` and `best` are the progress of the **Ardennes** (so older saves keep working); the other regions are in `regions[id] = { unlocked, best }` (`prog(id)` gives the right one). `region` is the region chosen on the map. `char` is 0–8 (one of the nine) or `"me"` (your own hero); `hero` holds the choices of your own hero (`{ name, size, skin, hair, hairCol, coat, coatCol, pants, glasses, beanie, scarf }`). Use `heroChar()` for the character you play with, never `CHARS[save.char]`. A day counts as **done** when it has a `best` entry. The language is in `localStorage['cabin-week-lang']`. Every access is in `try/catch`; without storage the game still works (`tests/voortgang.spec.js`).
- Progress inside a level is not saved: a level takes a few minutes.
- The service worker cache is `cabinweek-vN`; it only removes its own old caches (`cabinweek-`).

## Solutions (spoilers)

**Ardennes:**


| Day | Level | 3 things | Task | Code | Where the digits are |
|---|---|---|---|---|---|
| 1 · Mon | Arrival in Pinebrook (`bos`, by hand) | cabin keys 🔑 | cup of tea 🍵 at the gate | **4944** | bedrooms 4, people 9, parking spaces 4, stars 4 (signs in the level) |
| 2 · Tue | Forest & Old Railway (`bos`, seed 2212) | map pieces 🗺️ | plaster 🩹 for a grazed knee | **3817** | 🍄=3 🌲=8 🦔=1 🍂=7 |
| 3 · Wed | Christmas Market in Luxembourg (`stad`, seed 2323, `quiet`) | mittens 🧤 | carousel ticket 🎟️ | **6382** | ⭐=6 🔔=3 🎠=8 🥨=2; in the church you can light a candle (optional) |
| 4 · Thu | Paul's Birthday (`huis`, by hand, Lego) | presents 🎁 | bath towel 🛁 for the door upstairs | **4022** | Paul's new age 40, cake layers 2, floors above the ground floor 2 (garland on level 2, sign on level 0) |
| 5 · Fri | Christmas Day (`sneeuw`, by hand) | baubles 🎄 | firewood 🪵 for the campfire | **5474** | kids 5, adults 4, nights 7, sauna 4 |
| 6 · Sat | The Wildlife Park (`sneeuw`, seed 2626) | animal photos 📸 | carrots 🥕 for the deer | **6254** | 🦌=6 🐗=2 🦉=5 🦊=4 |
| 7 · Sun | The Last Evening (`huis`, seed 2727) | raclette cheeses 🧀 | Uno cards 🃏 | **7924** | 🌙 nights 7, 👨‍👩‍👧 people 9, 🛏️ people per bedroom 2, 🧖 sauna 4 |
| 8 · Mon | Going Home (`bos`, seed 2828) | lost socks 🧦 | suitcase 🧳 with the presents | **2128** | 🚗=2 🧳=1 🎄=2 🏠=8 |

**North Pole** (Santa's village, scene `pole`; one lost penguin on day 1, otherwise arctic foxes `poolvos` and lemmings `lemming`; polar bears, walruses and a musk ox in the scenery; indoors a wind-up toy robot `speelgoed` in the workshop and runaway parcels `pakje` in the post office):

| Day | Level | 3 things | Gate | Lock | Answer | Clues |
|---|---|---|---|---|---|---|
| 1 | Landing at the North Pole (seed 3101) | backpacks 🎒 | no gate | symbols | **5180** | ❄️=5 🦌=1 🎅=8 ⭐=0 |
| 2 | The Reindeer Stables (3202) | reindeer bells 🔔 | bring back 🦌 reindeer calf | melody | **1355** | do mi la la |
| 3 | Santa's Workshop (3303, `huis`) | teddy bears 🧸 | bring screwdriver 🪛 | word | **ELVES** (NL **ELFEN**) | numbered letters |
| 4 | Building an Igloo (3404) | ice blocks 🧊 | 3 levers 🔧 | count | **342** | igloos 3, piles of presents 4, candy canes 2 |
| 5 | The Post Office (3505, `huis`) | letters ✉️ | bell 🔔 6 s | colours | **RGBY** | red, green, blue, yellow |
| 6 | Northern Lights Night (3606) | lanterns 🏮 | light 3 lamps 🏮 | arrows | **↑→→↓** | numbered signposts |
| 7 | Christmas Eve (3707) | presents 🎁 | bring route map 🗺️ | clock | **2345** | signs with the time |
| 8 | Going Home (3808) | scarves 🧣 | no gate | count | **253** | reindeer 2, sleighs 5, piles of presents 3 |

**Tirol** (Lindenalm, scene `alps`, enemy `geit`; indoors a marmot `marmot` and pine cones on the floor):

| Day | Level | 3 things | Gate | Lock | Answer | Clues |
|---|---|---|---|---|---|---|
| 1 | Arrival in Lindenalm (4101) | chalet keys 🔑 | bring back 🐐 goat kid | symbols | **4718** | 🏔️=4 🔑=7 🐐=1 ⛪=8 |
| 2 | Ski School (4202) | pairs of skis 🎿 | bell 🔔 7 s | arrows | **→↓→↓** | numbered signposts |
| 3 | The Cable Car (4303) | lift passes 🎫 | no gate | count | **324** | chalets 3, pairs of skis 2, chamois 4 |
| 4 | Christmas Market in Innsbruck (4404, `stad`, snowmen) | candles 🕯️ | bring trumpet 🎺 | melody | **5315** | la mi do la |
| 5 | The Toboggan Run (4505) | sledges 🛷 | bell 🔔 7 s | arrows | **↓←↓→** | numbered signposts |
| 6 | The Mountain Hut (4606, `huis`) | eggs 🥚 | light 3 lamps 🪔 | clock | **1930** | signs with the time |
| 7 | Fondue Night (4707, `huis`) | fondue forks 🍴 | bring bread 🥖 | word | **FONDUE** | numbered letters |
| 8 | Going Home (4808) | ski boots 🥾 | 3 levers 🔧 | colours | **RWRG** | red, white, red, green |

**Norway** (Fjordvik, scene `fjord`, enemy `troll`):

| Day | Level | 3 things | Gate | Lock | Answer | Clues |
|---|---|---|---|---|---|---|
| 1 | Arrival at the Fjord (5101) | cabin keys 🔑 | 3 levers 🔧 | symbols | **6273** | 🌊=6 ⛰️=2 🏠=7 ⭐=3 |
| 2 | Kicksled to the Shop (5202) | blocks of brown cheese 🧀 | bring kicksled 🛷 | count | **432** | red cabins 4, kicksleds 3, elks 2 |
| 3 | Husky Safari (5303) | bags of dog biscuits 🦴 | bring back 🐶 husky pup | arrows | **→↑←→** | numbered signposts |
| 4 | The Stave Church (5404, `stad`, no enemies, pits or spikes) | paper stars ⭐ | light 3 lamps 🕯️ | melody | **5432** | la sol mi re |
| 5 | The Fishing Village (5505) | fish 🐟 | 3 levers 🔧 | colours | **RYBR** | red, yellow, blue, red |
| 6 | The Troll Forest (5606) | bells 🔔 | light 3 lamps 🔥 | word | **TROLL** | numbered letters |
| 7 | Northern Lights (5707) | cups of hot chocolate ☕ | no gate | clock | **2200** | signs with the time |
| 8 | Going Home (5808) | woolly socks 🧦 | bring backpack 🎒 | word | **HOME** (NL **THUIS**) | numbered letters |

**Dalmatia** in summer (Camp Lavanda, theme `kust`: limestone, dry grass and sea urchins as spikes; scenes `adriatic`, `oldtown` and `falls`; enemy `krab`, also `meeuw` and `geit`):

| Day | Level | 3 things | Gate | Lock | Answer | Clues | Gameplay |
|---|---|---|---|---|---|---|---|
| 1 | Arrival at Camp Lavanda (7101) | mobile-home keys 🔑 | bring back 🐢 tortoise | symbols | **2463** | ☀️=2 🌊=4 🏕️=6 🦀=3 | swimming |
| 2 | The Krka Waterfalls (7202) | butterfly photos 🦋 | bell 🔔 7 s | count | **352** | waterfalls 3, cypress trees 5, olive trees 2 | hills, swimming, boat |
| 3 | The Walls of Dubrovnik (7303) | kittens 🐈 | no gate | word | **WALLS** (NL **MUREN**) | numbered letters | high city walls (hills to row 9), seagulls |
| 4 | Island Hopping (7404) | snorkels 🤿 | bring skipper's map 🗺️ | arrows | **←↑→↑** | numbered signposts | swimming, boat |
| 5 | The Plitvice Lakes (7505) | lake photos 📸 | 3 levers 🔧 | colours | **BGWB** | blue, green, white, blue | hills, boat, NO swimming |
| 6 | Zadar and the Sea Organ (7606) | music notes 🎵 | light 3 lamps ☀️ | melody | **3521** | mi la re do | swimming, seagulls |
| 7 | Šibenik and the Rocky Beach (7707) | flip-flops 🩴 | bring sunscreen 🧴 | clock | **1950** | signs with the time | rocky hills, swimming, crabs |
| 8 | Going Home (7808) | caps 🧢 | no gate | melody | **1531** | do la mi do | swimming |

**Netherlands** (Tulpendam, scenes `polder`, `grachten` and `duinen`, enemy `gans`; `zwijn` on the Veluwe, `meeuw` on the island):

| Day | Level | 3 things | Gate | Lock | Answer | Clues | Gameplay |
|---|---|---|---|---|---|---|---|
| 1 | Arrival at the Zaanse Schans (6101) | house keys 🔑 | bring back 🐑 lamb | symbols | **3164** | 🌬️=3 🧀=1 🌷=6 🚲=4 | wind, canals |
| 2 | The Windmills of Kinderdijk (6202) | tulip bulbs 🌷 | 3 levers 🔧 | count | **453** | windmills 4, cows 5, tulip beds 3 | dikes (hills), strong wind |
| 3 | Amsterdam by Canal Boat (6303, `stad`) | bike bells 🔔 | bell 🔔 6 s | colours | **GBRG** | green, blue, red, green | canal boats carry you |
| 4 | Gouda by Candlelight (6404, `stad`, no enemies) | cheeses 🧀 | bring big candle 🕯️ | word | **GOUDA** | numbered letters | dark, light grows with the candle |
| 5 | Skating in Giethoorn (6505) | pairs of skates ⛸️ | no gate | clock | **1415** | signs with the time | ice, holes in the ice |
| 6 | The Hoge Veluwe (6606) | white bikes 🚲 | bring museum ticket 🖼️ | arrows | **→→↑←** | numbered signposts | drifting-sand hills, wild boar |
| 7 | A Wadden Island (6707) | shells 🐚 | light 3 lamps 🏮 | melody | **1324** | do mi re sol | strongest wind, ferry, seagulls, dunes |
| 8 | Going Home (6808) | pairs of clogs 👞 | 3 levers 🔧 | colours | **RWB** | red, white, blue | dikes, wind |

The Ardennes keep their original codes and gates. In the other regions the gate halfway and the lock at the end differ per day (see "Gates and locks").

After three wrong codes the lock gives a hint with the first two parts (digits, notes, colours, arrows or letters), after five the first three.

## Facts about the cabin (used in jokes and riddles)

A 4-star holiday cabin for 9 people near Pinebrook. Ground floor: hall, two living rooms (one with a gas fire and TV), dining room, kitchen (coffee machine, filter coffee, induction hob, oven, microwave, dishwasher, gourmet set, raclette, toastie maker), utility room, separate toilet. Level 1: wellness (sauna and steam room, each for 4, shower), bedrooms 1 and 2 (2 people each, own shower room), separate toilet. Level 2: bedroom 3 (3 single beds), bedroom 4 (2 people), each with a bathroom with a bath. Outside: a garden, two terraces, parking for 4 cars. No firewood on site; bring your own bath towels. Nearby: forest, an old railway path, shops, a bakery. Further: a wildlife park, Luxembourg.

## Tone and writing

- **Funny and warm.** Jokes about the cabin, the wifi, the bathroom rota, Uno, gourmet and raclette, chips (fries) and chocolate. Never mean about a person.
- **Tea, chocolate and chips:** Paul and Laura drink tea, not coffee (never let them ask for coffee). The ladies love chocolate, and everyone loves chips (fries).
- **Calm on day 3** (see above).
- The characters are fictional. Keep their looks as in `CHARS` (`js/data.js`): Paul short light-brown hair, beige jacket, backpack (indoors his green Christmas jumper with a Saab 900); Laura shoulder-length blonde hair, a light long coat, a coral scarf and a brown beanie only outside in the cold (`beanieCold`: at the Christmas market; in the snow everyone wears a Santa hat); Sophie long blonde ponytail with a red bow and a white puffer; Lily long wavy blonde hair with a bun (purple clip), big eyes, a cream puffer, a burgundy skirt and shoes with coloured laces; Rob bald with stubble and a dark jacket; Anna blonde curls, a green long coat and a striped autumn scarf; Finn blond with round glasses and an olive puffer; Tom blond with dark thick glasses, a dark coat and a grey beanie; Max blond, a rust-brown jacket and green trousers. Height (`size`) follows age; primary-school kids (`kid`) have bigger heads.
- No names, characters, art, music or levels from existing games: the game fits the genre, but everything is its own work.
- Short sentences. Say what happens ("The door upstairs is open"). Write both languages naturally, not word for word.

## Pitfalls (lessons learned)

Everything in "Lessons learned" in [docs/blueprint.md](docs/blueprint.md) applies. In particular:

- `[hidden] { display: none !important; }` in `css/game.css` must stay: the top bar and the dialogue use `display: flex`.
- **A key that opens a window is only handled in the next `step()`.** In tests: wait until the window is visible.
- **`page.goto` to the same page with only a different `#` does not reload.** Use `seed()` (which reloads) or the Menu button.
- **Levels must be reachable with the real jumps:** max. 3 tiles up, 4 tiles across. `tests/dagen.spec.js` checks every level with a search and plays every day.
- **Gates and code doors go up to row 2**, so you cannot jump over them. No platforms right in front of a gate.
- **No `alert/confirm/prompt`.** Buttons have `type="button"`.
- **Raise `CACHE` in `sw.js` and `GAME_VERSION` in `js/app.js` together** on every change to the game, and put new files in `CORE` and `index.html` (a test checks this).
- **Hints** (`updateHints()` in `app.js`): the install bar only on the title screen (Android: web app or the app on Google Play `https://play.google.com/store/apps/details?id=nl.w3nl.cabinweek`; computer: web app; iPhone/iPad: Share → Add to Home Screen), not when running as an app or in the TV app; *Not now* hides it for 14 days (`localStorage['cabin-week-install-later']`). The rotate hint only on a touch screen in portrait.
- **iPhone and iPad (Safari):** sound starts after a tap (`unlockAudio()`); `-webkit-text-size-adjust: 100%` must stay; the `apple-mobile-web-app-*` meta tags give full screen from the home screen. Test with the Playwright iPhone/iPad sizes in Chromium.
- Emoji look different per system. Use them for small things; draw important things yourself.

## Checklists

### Adding or changing a level
1. With the generator: an object with `seed`, `w`, `day`, `name`, `theme`, what you look for, the task (`quest: { need, done, after }`), `code: { answer, title, syms, flavor }`, `npcs`, `intro`, `decoKinds`, `exitStyle`, `doneMsg`, and `genLevel()`. By hand: see `js/levels.js`. Every text in `T("…", "…")`.
2. Put it in the right place in `LEVELS` (the order is the order of the days) and in `WEEK`/`DAY_NAMES` in `js/data.js`.
3. Add the day to `DAYS` in `tests/dagen.spec.js`, to the issue form and to the table above.
4. `npm test`, and look at the level on computer and phone size, in English and Dutch.

### Before every pull request
- `npm test` passes.
- `CACHE` and `GAME_VERSION` raised together; new files in `CORE` and `index.html`.
- New texts in English and Dutch.
- `AGENTS.md` updated (solutions, storage, pitfalls).
- Screenshots checked of everything you changed, on computer and phone size.

## Workflow

**Never push directly to `main`.** Every change goes through a branch from the latest `origin/main` and a pull request; the owner reviews and merges. The workflow *Play the game* runs all tests on every pull request, and *Publish the game* publishes `main` to GitHub Pages. The review and playtest agents run on demand: the label `agent-review` or `agent-speeltest` on a pull request, or Actions → Run workflow. Ideas can be refined and built by the AI agents via the issue form *Idea*: see [docs/agent-workflow.md](docs/agent-workflow.md).

```bash
npm install
npx playwright install chromium   # only the first time
npm test
npm start                          # http://127.0.0.1:4180
npm run build:aab                  # build/download the protected Google Play bundle (needs gh, 7z and GitHub secrets)
```

Without internet (or with an installed Chromium): `PW_CHROMIUM=/path/to/chromium npm test`.

Licence: GPL-3.0.
