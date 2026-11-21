# TripScouts for Linux (Snap Store)

TripScouts for Linux is a **snap**: the package format of the Snap Store, where Ubuntu's *App Center* gets its apps. Like the Android app, it is a small wrapper around the same game files as the website:

- `linux/main.js` opens one window with the game. It runs on Electron, the same browser engine as the tests (Chromium), so the keyboard, controllers, sound and voices work as in Chrome.
- The game is served from `app://tripscouts/`, so saved progress has its own fixed place, separate from the website. To bring progress along, use 💾 *Progress* on the map and 💾 *Hero code* in the hero creator.
- Links that open a new window (*Source code*, *Licence*) open in your normal browser. The **TripScouts** menu has **Full screen** (**F11**) and **Quit** (**Ctrl+Q**). In full screen, use **Ctrl+Q** to quit or **F11** to return to the window and its menu. Menu labels follow the system language (English or Dutch).
- `linux/package.json` holds the snap settings for electron-builder: the name `tripscouts`, the summary, the category *Game* and the permissions. *joystick* is added for controllers; the rest is the default set (screen, sound, network for the fonts).

## Building

The workflow **Build the Linux app** (`.github/workflows/linux.yml`) builds the snap on every pull request that changes the game or `linux/`, and on `main`:

- The workflow keeps the snap as an artifact named `tripscouts-linux`, for 30 days.
- On `main` every new version gets its own release, `linux-v1.<GAME_VERSION>.0`, with the snap attached, and it is marked as the latest release. The newest snap is always at `https://github.com/w3nl/tripscouts/releases/latest/download/tripscouts.snap`. Releases in this repository are **immutable** (nothing can be added once published), so the workflow creates each release with the snap in one go. Building the same game version again leaves its release as it is.
- With the secret `SNAPCRAFT_STORE_CREDENTIALS`, the workflow uploads every new version on `main` to the Snap Store, in the channel **edge**. Set the repository variable `SNAP_CHANNEL` to `stable` to publish straight to everyone.

The snap's version follows the game: `GAME_VERSION` 33 becomes `1.33.0`. A new game version is therefore always a newer snap.

To build it yourself on Linux:

```bash
node tools/build-site.js && rm -rf linux/game && cp -r _site linux/game
```

```bash
cd linux && npm ci && npm run snap
```

The snap is then in `linux/dist/`. To try the app without building a snap, run `npm start` in `linux/` after copying the game in.

### Snapcraft and Snap Store source builds

The root `snapcraft.yaml` lets Snapcraft and the Snap Store's **Builds** service build directly from this repository. It is a separate route from the existing electron-builder snap build in GitHub Actions; that working workflow is unchanged.

The recipe builds for **amd64** on `core22`, with the GNOME extension for desktop libraries and integration. It installs Node 26 for the build, copies the game with `tools/build-site.js`, packages the existing Electron app and includes its launcher and icon. The version follows the same rule: `1.<GAME_VERSION>.0`. Keyboard, audio, network and joystick access are retained. Electron runs with `--no-sandbox` inside the strictly confined snap, as is customary for Electron snaps.

To build locally with an initialised LXD installation:

```bash
snapcraft pack --use-lxd
```

For source builds in the store, connect `w3nl/tripscouts` in **My snaps → tripscouts → Builds** and select the branch containing the recipe (normally `main` after merging). Build for amd64. Set the release channel deliberately; avoid publishing the same commit through both the store builder and GitHub Actions, or it will produce duplicate store revisions.

## Installing the snap from the release (without the store)

```bash
sudo snap install --dangerous ./tripscouts.snap
```

`--dangerous` is needed because a snap from outside the store isn't signed by the store. Once it is in the store, install it the normal way, with `sudo snap install tripscouts` or the App Center.

## Publishing in the Snap Store, step by step

1. **An account:** sign in at [snapcraft.io](https://snapcraft.io/) with an Ubuntu One account (create one there if needed).
2. **The name:** on your laptop, install the tools and claim the name `tripscouts`:
   ```bash
   sudo snap install snapcraft --classic
   ```
   ```bash
   snapcraft login
   ```
   ```bash
   snapcraft register tripscouts
   ```
3. **A login for GitHub Actions:** make a login that may only upload this snap, and save it as a secret:
   ```bash
   snapcraft export-login --snaps=tripscouts --channels=edge,stable - | gh secret set SNAPCRAFT_STORE_CREDENTIALS --repo w3nl/tripscouts
   ```
   Or copy the output of `snapcraft export-login --snaps=tripscouts --channels=edge,stable -` into Settings → Secrets and variables → Actions → *New repository secret*, with the name `SNAPCRAFT_STORE_CREDENTIALS`.
4. **The first upload:** run the workflow *Build the Linux app* on `main` (Actions → Run workflow). The snap goes to the channel *edge*. Test it:
   ```bash
   sudo snap install tripscouts --edge
   ```
5. **The store page** (snapcraft.io → *My snaps* → tripscouts → *Listing*):
   - **Title:** TripScouts
   - **Summary:** Scout ten family trips across Europe in a cosy platform game
   - **Description:** use the full description from `docs/play-store/README.md` (English). For example: *Two families want to go on holiday together, but they can't agree where. So you go ahead as their trip scout: try out ten trips across Europe, a week each, from the Ardennes and the North Pole to Scotland and the Veneto. Walk, jump, ski, skate and canoe, find things, help people and crack the code lock at the end of every day. No ads, nothing to buy, nothing collected.*
   - **Category:** Games
   - **Icon:** `icons/icon-512.png`
   - **Featured banner:** [snap-featured-banner.png](play-store/snap-featured-banner.png) (720 × 240 pixels). Regenerate it with `npm run store`; it uses the same TripScouts artwork as the app icons.
   - **Screenshots:** the phone and tablet screenshots from `docs/play-store/`, or new ones from the app (1280×720)
   - **Website:** `https://tripscouts.online/`. **Source code:** `https://github.com/w3nl/tripscouts`. **Licence:** GPL-3.0
6. **Release:** when the edge version works, promote it in *Releases* from *edge* to *stable*, or with `snapcraft release tripscouts <revision> stable`. Then it is in the App Center for everyone.

## Good to know

- **Size:** about 105 MB, because Electron brings its own browser. Updates come in automatically through snapd.
- **Base:** GitHub Actions uses electron-builder's ready-made `core20` template (supported until 2030), so that route needs no LXD to build. The root Snapcraft recipe uses `core22` and the GNOME extension instead; it does not use electron-builder's beta `snapcraft` target.
- **Only amd64** (normal laptops and PCs). An arm64 snap (Raspberry Pi, some laptops) would need an arm64 runner.
