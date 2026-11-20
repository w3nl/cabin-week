# Domain: tripscouts.online

The game lives at **https://tripscouts.online/** (it was called Cabin Week and lived at cabinweek.online; see "Moving from cabinweek.online" below). GitHub Pages publishes it (workflow *Publish the game*, `pages.yml`). Until the domain is set up it is at `https://w3nl.github.io/cabin-week/`.

Nothing in the code needs to change: all paths are relative (`./`, `sw.js`, `manifest.webmanifest`), and the Android app has the game built in. A `CNAME` file is not needed: when publishing with GitHub Actions, GitHub keeps the domain in **Settings → Pages → Custom domain**.

## First time: turn on Pages

**Settings → Pages → Build and deployment → Source: GitHub Actions.** The next push to `main` publishes the game.

## DNS at the registrar

| Type | Name | Value |
|---|---|---|
| A | `@` | `185.199.108.153` |
| A | `@` | `185.199.109.153` |
| A | `@` | `185.199.110.153` |
| A | `@` | `185.199.111.153` |
| AAAA | `@` | `2606:50c0:8000::153` |
| AAAA | `@` | `2606:50c0:8001::153` |
| AAAA | `@` | `2606:50c0:8002::153` |
| AAAA | `@` | `2606:50c0:8003::153` |
| CNAME | `www` | `w3nl.github.io` |

Remove old A, AAAA or CNAME records for `@` and `www` (such as a parking page of the registrar).

A GitHub Pages site has only one custom domain. For every other domain you own (`cabinweek.online`, `cabin-week.online`), set up a **redirect (301)** to `https://tripscouts.online/` at its registrar; do not point A records at GitHub for it.

## In GitHub

1. **Settings → Pages → Custom domain:** `tripscouts.online` → *Save*. GitHub checks the DNS (this can take a while).
2. Once the certificate is there (minutes to a day): tick **Enforce HTTPS**.
3. Recommended: verify the domain in your **account settings → Pages → Add a domain** (a TXT record), so nobody else can attach it to their own GitHub site.

## Good to know

- **Saved progress belongs to the address.** Players who played on cabinweek.online (or `w3nl.github.io/cabin-week`) start again at day 1 on tripscouts.online. The Android app keeps its progress: the game is built into the app.
- **Google Play:** use `https://tripscouts.online/privacy.html` as the privacy policy and `https://tripscouts.online/` as the website.
- **If the domain expires,** remove it under *Custom domain*; the game is then back at `w3nl.github.io/cabin-week` (the repository keeps its old name).

## Moving from cabinweek.online

Do these in this order, so the game never goes offline:

1. **DNS for tripscouts.online:** add the records above at the registrar of tripscouts.online.
2. **GitHub:** Settings → Pages → Custom domain: change `cabinweek.online` to `tripscouts.online` → *Save*. Wait for the certificate, then tick **Enforce HTTPS**. (The `CNAME` file in the repository says `tripscouts.online` too, but with GitHub Actions the setting is what counts.)
3. **cabinweek.online:** at its registrar, replace its A/AAAA records by a **301 redirect** to `https://tripscouts.online/`, so old links and installed web apps still find the game. Keep the domain for at least a year.
4. **Google Play:** update the website and privacy policy (see [play-store/README.md](play-store/README.md)).
5. **The games overview** (w3nl/games) and anywhere else that links to cabinweek.online.
