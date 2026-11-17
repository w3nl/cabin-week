# Domain: cabinweek.online

The game is meant to live at **https://cabinweek.online/**. GitHub Pages publishes it (workflow *Publish the game*, `pages.yml`). Until the domain is set up it is at `https://w3nl.github.io/cabin-week/`.

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

A GitHub Pages site has only one custom domain. If you also own `cabin-week.online`, set up a **redirect (301)** to `https://cabinweek.online/` at its registrar; do not point A records at GitHub for it.

## In GitHub

1. **Settings → Pages → Custom domain:** `cabinweek.online` → *Save*. GitHub checks the DNS (this can take a while).
2. Once the certificate is there (minutes to a day): tick **Enforce HTTPS**.
3. Recommended: verify the domain in your **account settings → Pages → Add a domain** (a TXT record), so nobody else can attach it to their own GitHub site.

## Good to know

- **Saved progress belongs to the address.** Players who started on `w3nl.github.io/cabin-week` start again at day 1 on cabinweek.online.
- **Google Play:** use `https://cabinweek.online/privacy.html` as the privacy policy and `https://cabinweek.online/` as the website.
- **If the domain expires,** remove it under *Custom domain*; the game is then back at `w3nl.github.io/cabin-week`.
