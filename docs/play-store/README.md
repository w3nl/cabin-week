# Google Play: store listing

The order of all steps (key, Play Console, upload) is in [../publish-android.md](../publish-android.md).

Everything Play Console asks for in **Grow users → Store presence → Main store listing**, and in **Policy → App content**. Make the images again with `npm run store` (for example after a big change to the game).

Set the **default language to English (United Kingdom) – en-GB** and add **Dutch (nl-NL)** as a translation (Store presence → Main store listing → Manage translations).

## Texts: English

**App name** (max. 30 characters)

```text
Cabin Week
```

**Short description** (max. 80 characters)

```text
Trips through Europe: a level a day, with puzzles, code locks and your own hero.
```

**Full description** (max. 4000 characters)

```text
Two families, nine people, six trips. Pick a trip on the map of Europe and play a new level every day of the week: eight days per trip, 48 levels in all.

Walk, jump, slide and swim your way through every day. Find the three lost things, help the others with a task and crack the code lock with the clues on the signs along the way.

Every trip plays differently:
• The Ardennes: a Christmas week in a cabin in the woods, a birthday with Lego and a Saab with a Christmas tree on the roof
• The North Pole: ice floes, slippery ice, Santa's workshop and a dark night lit only by lanterns and the northern lights
• Tirol: climb the mountain, ride the cable car, ski school and the toboggan run
• Norway: cliffs by the fjord, huskies, a kicksled, the stave church and a troll forest by torchlight
• The Netherlands: windmills, dikes and a headwind, canal boats in Amsterdam, Gouda by candlelight and skating in Giethoorn
• Dalmatia in summer: swim in the warm sea, the Krka waterfalls, the walls of Dubrovnik and island hopping by boat

• Play as one of the nine, or make your own hero: height, hair, coat, glasses, hat and scarf
• Code locks, with hints if you get stuck
• Chips, chocolate, ice creams and Christmas biscuits to collect
• Jump on wild boars, robot vacuums, snowmen, lost penguins, mountain goats, little trolls, cross geese, greedy seagulls and crabs, or belly-slide into them
• One app for your phone, tablet and Google TV
• Play with the touch screen, a controller (PlayStation, Stadia, Xbox) or the TV remote
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
Reis door Europa: elke dag een level, met puzzels, codesloten en je eigen held.
```

**Volledige beschrijving**

```text
Twee gezinnen, negen personen, zes reizen. Kies een reis op de kaart van Europa en speel elke dag van de week een nieuw level: acht dagen per reis, 48 levels in totaal.

Loop, spring, glij en zwem je een weg door elke dag. Vind de drie verdwenen dingen, help de anderen met een opdracht en kraak het codeslot met de aanwijzingen die onderweg op bordjes staan.

Elke reis speelt anders:
• De Ardennen: een kerstweek in een huisje in het bos, een verjaardag met Lego en een Saab met een kerstboom op het dak
• De Noordpool: ijsschotsen, glad ijs, de werkplaats van de Kerstman en een donkere nacht met alleen lantaarns en het noorderlicht
• Tirol: de berg op, met de kabelbaan, naar skiles en de rodelbaan
• Noorwegen: kliffen bij het fjord, husky's, een schopslee, de staafkerk en een trollenbos bij zaklamplicht
• Nederland: molens, dijken en tegenwind, rondvaartboten in Amsterdam, Gouda bij kaarslicht en schaatsen in Giethoorn
• Dalmatië in de zomer: zwemmen in de warme zee, de watervallen van Krka, de muren van Dubrovnik en eilandhoppen per boot

• Speel als een van de negen, of maak je eigen held: lengte, haar, jas, bril, muts en sjaal
• Codesloten, met tips als je vastzit
• Frietjes, chocolade, ijsjes en kerstkoekjes om te verzamelen
• Spring op wilde zwijnen, robotstofzuigers, sneeuwpoppen, verdwaalde pinguïns, berggeiten, kleine trollen, boze ganzen, gulzige meeuwen en krabben, of glij er op je buik tegenaan
• Eén app voor je telefoon, tablet en Google TV
• Speel met het touchscreen, een controller (PlayStation, Stadia, Xbox) of de afstandsbediening
• In het Engels en Nederlands
• Werkt zonder internet

Geen advertenties, geen aankopen en geen gegevens die het apparaat verlaten.
```

## What's new (release notes, max. 500 characters)

```text
<en-GB>
Six trips on a map of Europe: the Ardennes, the North Pole, Tirol, Norway, the Netherlands and Dalmatia in summer. Every trip plays differently. Make your own hero. Faster and smaller app.
</en-GB>
<nl-NL>
Zes reizen op een kaart van Europa: de Ardennen, de Noordpool, Tirol, Noorwegen, Nederland en Dalmatië in de zomer. Elke reis speelt anders. Maak je eigen held. Snellere en kleinere app.
</nl-NL>
```

Paste this in **Release notes** when you create a release; Play Console reads the language tags itself.

## Images

When you replace the screenshots in Play Console, delete the old five first (Store listing → Phone / Tablet / Android TV screenshots), then upload the eight new ones in order.


| What Play asks for | File | Size |
|---|---|---|
| App icon | [`icons/icon-512.png`](../../icons/icon-512.png) | 512 × 512 |
| Feature graphic | [`feature-graphic.png`](feature-graphic.png) | 1024 × 500 |
| Phone screenshots (min. 2, max. 8) | `screenshot-1` to `screenshot-8`: the title screen, the map of Europe, swimming in Dalmatia, the cable car in Tirol, the windmills in the Netherlands, the ice floe at the North Pole, belly-sliding on Christmas Day, and making your own hero | 1920 × 1080 |
| Tablet screenshots (7" and 10", optional) | the same eight | 1920 × 1080 |
| **Android TV:** banner | [`tv-banner.png`](tv-banner.png) | 1280 × 720 |
| **Android TV:** screenshots (min. 1) | the same eight | 1920 × 1080 |

The Android TV fields only appear after adding Android TV in **Test and release → Advanced settings → Form factors**. The app is one listing for every device: phone, tablet and TV (the TV banner and TV screenshots are only the extra TV part).

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

## GitHub social preview

[`social-preview.png`](social-preview.png) (1280 × 640, made by `npm run store`) is the image GitHub shows when someone shares a link to the repository. GitHub has no API for it, so upload it by hand: **Settings → General → Social preview → Edit → Upload an image…**
