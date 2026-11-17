# AGENTS.md: working on Cabin Week

Notes for AI agents and new helpers. The README says what the game is; this file says what you cannot see straight from the code. The general recipe for a game like this is in [docs/blueprint.md](docs/blueprint.md) (in Dutch).

> **Spoilers:** the solutions of all code locks are below. You need them to test.

## What this is

A platform game in the browser (walk, jump, find things, do tasks, crack codes) about a Christmas week of two families in a holiday cabin near the **fictional** village of **Pinebrook**, in snowy hills.

- **The Hills:** Paul and Laura with Sophie and Lily. **The Woods:** Rob and Anna with Finn, Tom and Max. **Laura and Anna are sisters.** Lily and Tom are in the same class. 4 adults and 5 kids. You choose one of the nine; you meet the others in the levels.
- **Eight days, one level a day.** A day unlocks when you finish the day before. **There are no dates and no countdown**: the title screen shows your progress (`8 winter days to play`, `3/8 days played`, `🏆 The whole week done!`).
- **English by default, Dutch as an option** (see "Languages").
- **Plain HTML, CSS and JavaScript with canvas. No build, no framework, no runtime dependencies** (only Google Fonts). All graphics are drawn in code; there are no images except the app icons.
- Static site at **https://cabinweek.online/** (GitHub Pages, see [docs/domain.md](docs/domain.md)), installable as an app, playable offline. Also works as a loose file (`file://`), but then without app and offline.
- An Android app for phones, tablets and Google TV (`android-tv/`, package `nl.w3nl.cabinweek`).
- `package.json` and `node_modules/` are only for the tests, the local server and the tools.

### No personal information

Cabin Week is a public version of a game that was made for one family. **Keep it fictional:** no real surnames, no real village or address, no dates or countdown, no birth years, nothing about anyone who passed away. The tests check for a list of words from the original (`tests/titel.spec.js`). Real *places* that anyone visits are fine (Luxembourg's Christmas market), and so are the Lego and the Saabs.

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
| `js/levelgen.js` | `genLevel(o)` and the five generated days (`DAY22`, `DAY23`, `DAY26`, `DAY27`, `DAY28`: the names come from the original calendar), put in place in `LEVELS` with `splice`/`push` |
| `js/core.js` | `save`/`persist()` (saving), `tone()` and `SFX` (sound with Web Audio) |
| `js/canvas.js` | `TS` (32), `ROWS` (15), `VIEW_H`, the canvas `cv`, the global drawing context `g`, `resize()`, `hash()`, `$()`, `emoji()`, and the drawing helpers `OUT`, `mk()`, `withCtx()`, `shade()`, `rp()`, `blob()`, `sparkle()` |
| `js/sprites.js` | `drawPerson()` (hair: `short`, `bald`, `bob`, `curly`, `long`, `flowing`, `ponytail`, with `bun`; coat: `puffer`, `long`, `jacket`; scarf, glasses, beanie, bow, skirt, coloured laces, backpack, stubble, `cute`), `shadowAt()`, `drawEnemy()`, `drawItem()` |
| `js/game.js` | Game state (`state`, `L`, `P`, `cam`), `buildLevel()`, `cell()`, `isSolid()`, `startLevel()`, input (`held`, `edges`, `KEYMAP`, `bindTouch()`), dialogue (`say()`, `advanceDialog()`), `hurt()`, `respawn()`, `nearest()`, `interact()`, `step()` |
| `js/world.js` | Drawing: tile textures, background layers, the interior, decoration (`drawDeco()`: market stalls, church, Lego, Saabs), `drawSaab()` (`93`, `900`, `96`), `drawLegoBrick()`, exits, signs, flags, code post, lantern and candle stand (`drawCandles()`), particles, `render()` |
| `js/screens.js` | `updateHud()`, `setScreen()`, `card()`, `showIntro()`, `completeLevel()`, `toTitle()`, the code lock (`openPad()`, `padPress()`, `padCheck()`), confetti, `buildTitle()`, the joke ticker |
| `js/gamepad.js` | Controllers (Gamepad API, standard layout): `GP`, `padHeld`, `pollGamepads()`, menu navigation (`gpMove()`, `gpPress()`, `gpBack()`), `gpStatus()`, `gpRumble()` |
| `js/app.js` | `GAME_VERSION`, service worker and update bar (`swVersion()`), install and rotate hints, language buttons, the game loop |
| `sw.js`, `manifest.webmanifest`, `icons/` | The web app. `icons/icon.svg` is the source; `npm run icons` makes the PNGs |
| `android-tv/` | The Android app (phone, tablet, Google TV; Java, one WebView). `MainActivity.java` loads the game from `assets/game` (put there by the workflow *Build the Google TV app*) via `appassets.androidplatform.net`, passes a controller as `window.__nativePad` and the Back button as `window.tvBack()`. The workflow builds an `.apk` and, with the secrets `ANDROID_KEYSTORE_BASE64`/`ANDROID_KEYSTORE_PASSWORD`, a signed `.aab` for Google Play (key alias `cabinweek`, or the repository variable `ANDROID_KEY_ALIAS`). **The `.aab` is never public:** only in the artifact `cabin-week-google-play`, a 7z with `ANDROID_KEYSTORE_PASSWORD` as password; the release only has the `.apk`. See [docs/google-tv.md](docs/google-tv.md) and [docs/android-key.md](docs/android-key.md) |
| `privacy.html` | Privacy policy (English and Dutch; the game collects nothing), for Google Play. Its own styles; published via `build-site.js`, not in `CORE` |
| `docs/` | `domain.md`, `google-tv.md`, `publish-android.md` (publishing in Google Play and getting the `.aab`, step by step), `android-key.md` (the signing key), `iphone-ipad.md`, `agent-workflow.md`, `blueprint.md`, and `play-store/` (store texts in English and Dutch, and images: `npm run store`) |
| `tools/` | `build-site.js` (the site in `_site/` for GitHub Pages), `bundle.js` (one loose HTML file in `dist/`), `icons.js`, `store.js` |
| `tests/` | Playwright: `dagen`, `besturing`, `codeslot`, `controller`, `titel`, `voortgang`, `telefoon`, `pwa`; `helpers.js`; `serve.js` |
| `.github/` | Workflows (see "Workflow" and [docs/agent-workflow.md](docs/agent-workflow.md)), the issue form *Idea*, the PR template |

## Languages

- **Every text in the game is written as `T("English", "Nederlands")`.** `T` picks one when the scripts load, so level data, jokes and names of things are plain strings afterwards. Never write a bare string the player sees.
- **`index.html`** has the English text in the page and the Dutch in `data-nl` (innerHTML), `data-nl-label` (aria-label), `data-nl-title` (title) and `data-nl-content` (meta). `js/i18n.js` swaps them when `LANG === "nl"`.
- **Choosing:** the buttons *English* / *Nederlands* at the bottom of the title screen call `setLang()`, which saves the choice in `localStorage['cabin-week-lang']` and reloads. `?lang=nl` or `?lang=en` in the link also works and is remembered. Default: English.
- Dutch texts are usually longer: check the menu on 960×540 in Dutch (`tests/telefoon.spec.js` does that).

## How it fits together

- **Plain scripts in one shared scope**, loaded by `index.html` in this order: `i18n`, `data`, `levels`, `levelgen`, `core`, `canvas`, `sprites`, `game`, `world`, `screens`, `gamepad`, `app`. Every top-level name must be unique across all files.
- **Order matters while loading.** Functions are only hoisted within their own file, and `const`/`let` only exist after their line. Code that runs while loading (like `genLevel()` in `levelgen.js`) may only use things from earlier files. That is why `rng()` is in `data.js` and `T()` in `i18n.js`.
- **One drawing context `g`** (a `let`). `withCtx(ctx, fn)` swaps it to another canvas for a moment, so the same drawing functions also draw textures, background layers and portraits.
- **The world is a grid** of 15 rows of 32 px; the screen always shows all 15 rows and scales (`scale`). Characters in `L.grid`: `#` ground, `=` platform (only from above), `S` block, `^` spikes (brambles, Lego bricks, icicles), `G` task gate, `H` code door. Row 12 is the normal ground; you stand on row 11.
- **A fixed time step** of 1/60 s (`step()` in a loop in `app.js`), drawn with interpolation (`renderSmooth()`), so walking is smooth on a 50 Hz TV too. `render()` must not change `P.x`, `cam` or enemy positions. One-shot keys (jump, talk) go through `edges`; held keys through `held` (keyboard and touch), `padHeld` (controller) and `tvHeld` (controller in the Android app). Keyboard, remote and the TV app pass the moment of pressing and releasing (`queueHold()`, `applyHolds(simT)`), so a short tap is a short step even on a busy device.
- **The wide menu** (`html.wide`, `fitMenu()` in `canvas.js`): on a screen wider than tall, the title screen has two columns and scales with `--fit` from a 960×540 design, so nothing scrolls. Adding something to the title screen? Check 960×540, 1366×768 and 740×360, in Dutch too.
- **Menus with keyboard, remote and controller:** arrows choose the nearest button, Enter/OK/✕/A presses, Back/○/B goes back (`tvBack()`). Until mouse or touch is used, focus is on a button right away (`menuAutoFocus()`).
- **Physics** (in `step()`): gravity 0.55 (1.1 when jump is released while rising), jump −11.6, max. 4.4 px per step sideways, smooth acceleration on the ground (0.12 rising to 0.7). **Running** (Shift/Ctrl, L1/R1/L2/R2, or double-tap and hold) raises the top speed to 6.2. Coyote time 7 steps, jump buffer 8 steps. You jump just over **3 tiles up** and **4 tiles across**. **Belly slide** (`P.slide`): walking plus ↓/E/□/○/💬 with nothing to talk to: you shoot ahead and slide (furthest in the snow); sliding knocks over animals, but spikes, pits and bumping still count. `tests/besturing.spec.js` guards this; if you change the physics, check every level.
- **Levels** are objects in `LEVELS` with: `day` (`dayLabel(i)`), `name`, `theme` (`bos`, `huis`, `sneeuw`, `stad`), `w`, `sub`, what you look for (`keyType`, `keyHud`, `keyName`), the task (`questType`, `questHud`, `questName`), `coin`/`coinName`, `enemy` (`zwijn`, `robot`, `sneeuwpop`), `spikeMsg`, `ground`, `plats`, `blocks`, `spikes`, `gate`, `code`, `ents`, `deco`, `exitStyle` (`house`, `door`, `tree`, `arch`, `car`), `doneMsg`, and optionally `quiet`, `birthday`, `keysNeeded`, `fixedInterior`, `labels`, `coinHud`, and for the generator `lantern`, `lanternDeco` (`church`) and `decoExtra`. Theme and enemy names are internal (Dutch) keys; do not translate them.
- **The level generator** (`genLevel(o)`) builds a level from pieces (`pit`, `plat2`, `steps`, `tower`, `run`) with a fixed `seed`, so a day always looks the same. It puts the gate at 60% of the width, a tower before the gate for the task item, spreads the 3 things, puts the code door 14 tiles before the end, and four signs with `symbol = digit`. Change a `seed` and the whole level changes; run the tests.
- **Height** of a character is `40 × size` px; jumping is the same for everyone.
- **Interactions** (talk, read, lantern, code lock) all go through `interact()` (E, ↓, Enter or 💬). A character with a `quest` opens the gate once you have the item (`L.hasQuest`). The exit only works with enough things (`L.need`).
- **Fast enough for the TV:** layers drawn once per theme and only the band that has content (`layerBand()`), tiles from one atlas per theme, reused gradients (`grad()`), emoji cached as images (`EMOJI_CACHE`), an opaque canvas. Reset a translated context with `setTransform()`.

### State and saving

- Saved in `localStorage['cabin-week']`: `{ unlocked, char, best }` (number of unlocked days, chosen character, best number of collectables per day). A day counts as **done** when it has a `best` entry. The language is in `localStorage['cabin-week-lang']`. Every access is in `try/catch`; without storage the game still works (`tests/voortgang.spec.js`).
- Progress inside a level is not saved: a level takes a few minutes.
- The service worker cache is `cabinweek-vN`; it only removes its own old caches (`cabinweek-`).

## Solutions (spoilers)

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

After three wrong codes the lock gives a hint with the first two digits, after five the first three.

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
```

Without internet (or with an installed Chromium): `PW_CHROMIUM=/path/to/chromium npm test`.

Licence: GPL-3.0.
