## What and why
What changed, and why?

## Release notes
For **Google Play Console → Create new release → Release notes**. Max. 500 characters per language, written for players (what's new or better, not how). Paste as is; Play reads the language tags. Only docs or tests changed? Write `No release note: nothing changes for players.`

```text
<en-GB>
…
</en-GB>
<nl-NL>
…
</nl-NL>
```

## How to try it
Which day, where do you go, what do you do? (Dutch: add `?lang=nl` to the link.)

## Checklist
- [ ] `npm test` passes.
- [ ] `CACHE` in `sw.js` and `GAME_VERSION` in `js/app.js` raised together (for changes to the game).
- [ ] New files are in `index.html` and in `CORE` in `sw.js`.
- [ ] New texts in English and Dutch (`T("…", "…")`, or `data-nl` in `index.html`).
- [ ] Levels can be reached with the real jumps (the test in `tests/dagen.spec.js`).
- [ ] Checked on computer and phone size.
- [ ] `AGENTS.md` updated (solutions, storage, pitfalls).
- [ ] Release notes in en-GB and nl-NL filled in.

## Tests
Which tests were added or changed?
