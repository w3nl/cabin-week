# Google Play: store listing

The order of all steps (key, Play Console, upload) is in [../publish-android.md](../publish-android.md).

Everything Play Console asks for in **Grow users → Store presence → Main store listing**, and in **Policy → App content**. Make the images again with `npm run store` (for example after a big change to the game).

Set the **default language to English (United States)** and add **Dutch (nl-NL)** as a translation (Store presence → Main store listing → Manage translations).

## Texts: English

**App name** (max. 30 characters)

```text
Cabin Week
```

**Short description** (max. 80 characters)

```text
A Christmas week in a holiday cabin: one level a day, with puzzles and codes.
```

**Full description** (max. 4000 characters)

```text
Two families, nine people, one holiday cabin in the snowy hills. Every day of the Christmas week you play a new level.

Choose your hero and walk, jump and find your way through the forest, the cabin, the snow and a Christmas market. Find the three lost things, help the others with a task and crack the code lock with the clues on the signs along the way.

• 8 levels, one for every day of the week
• 9 characters to choose from
• Code locks, with hints if you get stuck
• Fries, chocolate and Christmas cookies to collect
• Jump on wild boars, robot vacuums and snowmen, or belly-slide into them
• A birthday with Lego, and a Saab with a Christmas tree on the roof
• Play with the TV remote, a controller (PlayStation, Stadia, Xbox) or the touch screen
• In English and Dutch
• Works offline

No ads, no purchases and no data leaves the device.
```

## Texts: Dutch (nl-NL)

**App-naam**

```text
Cabin Week
```

**Korte beschrijving**

```text
Een kerstweek in een vakantiehuisje: elke dag een level met puzzels en codes.
```

**Volledige beschrijving**

```text
Twee gezinnen, negen personen, één vakantiehuisje in de besneeuwde heuvels. Elke dag van de kerstweek speel je een nieuw level.

Kies je held en loop, spring en zoek je een weg door het bos, het huisje, de sneeuw en een kerstmarkt. Vind de drie verdwenen dingen, help de anderen met een opdracht en kraak het codeslot met de aanwijzingen die onderweg op bordjes staan.

• 8 levels, één voor elke dag van de week
• 9 poppetjes om uit te kiezen
• Codesloten, met tips als je vastzit
• Frietjes, chocolade en kerstkoekjes om te verzamelen
• Spring op wilde zwijnen, robotstofzuigers en sneeuwpoppen, of glij er op je buik tegenaan
• Een verjaardag met Lego, en een Saab met een kerstboom op het dak
• Speel met de afstandsbediening, een controller (PlayStation, Stadia, Xbox) of het touchscreen
• In het Engels en Nederlands
• Werkt zonder internet

Geen advertenties, geen aankopen en geen gegevens die het apparaat verlaten.
```

## Images

| What Play asks for | File | Size |
|---|---|---|
| App icon | [`icons/icon-512.png`](../../icons/icon-512.png) | 512 × 512 |
| Feature graphic | [`feature-graphic.png`](feature-graphic.png) | 1024 × 500 |
| Phone screenshots (min. 2) | `screenshot-1` to `screenshot-5` (title, arrival, birthday, Christmas Day, belly slide) | 1920 × 1080 |
| Tablet screenshots (7" and 10", optional) | the same five | 1920 × 1080 |
| **Android TV:** banner | [`tv-banner.png`](tv-banner.png) | 1280 × 720 |
| **Android TV:** screenshots (min. 1) | the same five | 1920 × 1080 |

The Android TV fields only appear after adding Android TV in **Test and release → Advanced settings → Form factors**.

## Other fields

| Field | What to fill in |
|---|---|
| Category | Game → **Adventure** (or Puzzle) |
| Tags | Platformer, Puzzle, Adventure |
| Contact details | An email address is required; it is public for a public app |
| Privacy policy | `https://cabinweek.online/privacy.html` |
| Website | `https://cabinweek.online/` |

## App content (the questionnaires)

| Question | Answer |
|---|---|
| Privacy policy | `https://cabinweek.online/privacy.html` |
| App access | All functionality is available without special access |
| Ads | No |
| Content rating | Category Game. Only violence: cartoon-like (jumping on enemies). Everything else no. Result about PEGI 3 |
| Target audience | 6-8, 9-12, 13-15 and older. Not designed to attract children with ads (there are none) |
| Data safety | Collects no data, shares no data |
| Government, financial features, health | No |
