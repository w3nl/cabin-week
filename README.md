# Cabin Week

A platform game in the browser about winter trips of two families, **the Hills and the Woods**: nine people, one cabin. Choose a trip on the map of Europe (the Ardennes, the North Pole, Tirol or Norway) and play its week: eight days, **one level a day**.

Play as one of the nine, or **make your own hero** (name, height, skin, hair, coat, glasses, hat and scarf). You walk and jump through the forest, the cabin, the snow and a Christmas market. You find lost things, help the others with a task, and crack a code lock with clues written on signs along the way. Finish a day to unlock the next one.

**In English and Dutch** (choose at the bottom of the title screen, or add `?lang=nl` to the link).

## Play

- **Online:** [cabinweek.online](https://cabinweek.online/) (GitHub Pages).
- **Android app (test):** the app is in a test on Google Play. Testers join once at [play.google.com/apps/testing/nl.w3nl.cabinweek](https://play.google.com/apps/testing/nl.w3nl.cabinweek) (with the Google account that is on the tester list), then install it from [Cabin Week on Google Play](https://play.google.com/store/apps/details?id=nl.w3nl.cabinweek). Publishing it: [docs/publish-android.md](docs/publish-android.md).
- **On your phone or tablet:** open the site and choose "Add to Home screen" (or the Android app, offered in the game). After that the game also works offline. iPhone and iPad: see [docs/iphone-ipad.md](docs/iphone-ipad.md).
- **On the TV (Google TV):** in a browser app, by casting, or as an app on the home screen. See [docs/google-tv.md](docs/google-tv.md).
- **Locally:**

```bash
npm install
```

```bash
npm start          # http://127.0.0.1:4180
```

### Controls

| | Computer | Phone |
|---|---|---|
| Walk | ← → (or A, D) | ◀ ▶ |
| Run | hold Shift (or Ctrl), or double-tap ← / → and hold | double-tap ◀ / ▶ and hold |
| Jump | Space or ↑ (or W) | ⤒ |
| Talk, read, use | E or ↓ (or Enter) | 💬 |
| Belly slide | walk + ↓ (or E) | walk + 💬 |
| Menu | Esc | Menu |

**With a controller** (PlayStation, Stadia, Xbox; USB or Bluetooth, on computer, tablet and phone): walk with the left stick or the D-pad, run with R1/L1 (or R2/L2), jump with ✕/A, talk with □/X or ○/B, Start for the menu. In menus, choose with the stick or the D-pad and press ✕/A; ○/B goes back. Press a button first after connecting, so the browser sees the controller.

Jump on wild boars, robot vacuums, snowmen, lost penguins, mountain goats and little trolls, or belly-slide into them (you slide furthest in the snow). Watch out for brambles, Lego bricks and icicles. Chocolate gives you a heart back.

## The trips

Choose a trip on the **map of Europe** (🗺️ on the title screen). Every trip is a week of eight days, one level a day, with its own progress: you can start anywhere.

| Trip | Where | Days |
|---|---|---|
| 🌲 **Ardennes** | a cabin near Pinebrook | arrival, the old railway, a Christmas market in Luxembourg, Paul's birthday (with Lego), Christmas Day, the wildlife park, the last evening, going home |
| 🎅 **North Pole** | Santa's village | landing on the ice, the reindeer stables, Santa's workshop, building an igloo, the post office, northern lights, Christmas Eve, going home |
| ⛷️ **Tirol** | a chalet in Lindenalm | arrival, ski school, the cable car, the Christmas market in Innsbruck, the toboggan run, the mountain hut, fondue night, going home |
| 🌌 **Norway** | a red cabin by the fjord near Fjordvik | arrival, kicksled shopping, a husky safari, the stave church, the fishing village, the troll forest, northern lights, going home |

Coming later: Iceland, Scania, Tuscany, Veneto and Dalmatia.

## Contributing

- [AGENTS.md](AGENTS.md): how the code works, the solutions, the pitfalls and the checklists.
- [docs/domain.md](docs/domain.md): the domain (cabinweek.online) and its DNS settings.
- [docs/publish-android.md](docs/publish-android.md): publishing the Android app in Google Play, and getting the `.aab`, step by step.
- [docs/android-key.md](docs/android-key.md): the signing key for the Android app, in detail.
- [docs/blueprint.md](docs/blueprint.md): the recipe for a game like this (in Dutch).
- [docs/agent-workflow.md](docs/agent-workflow.md): from idea to pull request with AI agents.

```bash
npx playwright install chromium   # only the first time
```

```bash
npm test                          # plays every day, plus controls, title, saving, phone and the app
```

Cabin Week grew out of a game made for one family's Christmas week; this version has fictional names and places. Licence: GPL-3.0.
