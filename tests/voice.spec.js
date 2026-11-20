// Optional voices (js/voice.js): the conversations are read aloud with speechSynthesis when the Voices button is on.
// The test browser has no real voices, so speechSynthesis is replaced by a recorder.
const { test, expect } = require('@playwright/test');
const { seed, startDay, put, skip } = require('./helpers');

const recorder = () => {
  window.__spoken = []; window.__cancels = 0;
  Object.defineProperty(window, 'speechSynthesis', { configurable: true, value: {
    speak: u => window.__spoken.push({ text: u.text, lang: u.lang, pitch: u.pitch, rate: u.rate }),
    cancel: () => { window.__cancels++; },
    getVoices: () => []
  } });
};
const spoken = page => page.evaluate(() => window.__spoken);
// talk to someone in the level: stand next to them and press E
const talkTo = async (page, name) => {
  const n = await page.evaluate(nm => { const n = L.npcs.find(n => n.who.name === nm) || L.npcs[0]; return { x: n.x, y: n.y, name: n.who.name }; }, name);
  await put(page, n.x + 4, n.y + 32);
  await page.keyboard.press('e');
  await expect(page.locator('#dialog')).toBeVisible();
  return n.name;
};

test('voices are off by default; when on, every line is read aloud, each person in their own voice', async ({ page }) => {
  await page.addInitScript(recorder);
  await seed(page);
  await expect(page.locator('#voiceBtn')).toBeVisible();
  await expect(page.locator('#voiceBtn')).toHaveText('🔈 Voices off');

  // off: talking says nothing out loud
  await startDay(page, 0);
  await talkTo(page);
  await skip(page);
  expect(await spoken(page)).toEqual([]);

  // on (on the title screen): a short line to hear it works, in British English
  await page.locator('#hud button', { hasText: 'Menu' }).click();
  await page.locator('#voiceBtn').click();
  await expect(page.locator('#voiceBtn')).toHaveText('🔊 Voices on');
  await expect(page.locator('#voiceBtn')).toHaveAttribute('aria-pressed', 'true');
  await expect.poll(async () => (await spoken(page)).length).toBe(1);
  expect((await spoken(page))[0]).toMatchObject({ text: 'Voices on. Off to the cabin!', lang: 'en-GB' });

  // in a level: each line of a conversation is spoken; the next line when you go on
  await startDay(page, 0);
  const who = await talkTo(page);
  const lines = await page.evaluate(() => dialog.lines);
  await expect.poll(async () => (await spoken(page)).at(-1).text).toBe(lines[0].replace(/\s+/g, ' ').trim());
  if (lines.length > 1) {
    await page.keyboard.press('Space');
    await expect.poll(async () => (await spoken(page)).at(-1).text).toBe(lines[1].replace(/\s+/g, ' ').trim());
  }
  // a kid sounds higher than a grown-up; signs are the narrator
  const pitch = await page.evaluate(nm => voiceStyle(nm).pitch, who);
  expect((await spoken(page)).at(-1).pitch).toBeCloseTo(pitch);
  expect(await page.evaluate(() => [voiceStyle('Lily').pitch > voiceStyle('Paul').pitch, voiceStyle('Sign').pitch])).toEqual([true, 1]);
  // closing the conversation stops the speech
  const cancels = await page.evaluate(() => window.__cancels);
  await skip(page);
  expect(await page.evaluate(() => window.__cancels)).toBeGreaterThan(cancels);
});

test('emoji and arrows are not read aloud; a line of only emoji stays silent', async ({ page }) => {
  await page.addInitScript(recorder);
  await page.addInitScript(() => localStorage.setItem('cabin-week-voice', '1'));
  await seed(page);
  await page.evaluate(() => { localStorage.setItem('cabin-week-voice', '1'); });
  await page.reload();
  await expect(page.locator('#voiceBtn')).toHaveText('🔊 Voices on');
  const out = await page.evaluate(() => {
    window.__spoken.length = 0;
    speakLine('Sign', 'Signpost 2 points ↑. 🕯️ You light a candle.');
    speakLine('Sign', '🎄🎁');
    return window.__spoken.map(s => s.text);
  });
  expect(out).toEqual(['Signpost 2 points . You light a candle.']);
});

test('Dutch: the voices speak Dutch, and the button is translated', async ({ page }) => {
  await page.addInitScript(recorder);
  await seed(page, { lang: 'nl' });
  await expect(page.locator('#voiceBtn')).toHaveText('🔈 Stemmen uit');
  await page.locator('#voiceBtn').click();
  await expect(page.locator('#voiceBtn')).toHaveText('🔊 Stemmen aan');
  await expect.poll(async () => (await spoken(page)).length).toBe(1);
  expect((await spoken(page))[0]).toMatchObject({ text: 'Stemmen aan. Op naar het huisje!', lang: 'nl-NL' });
  // remembered after a reload
  await page.reload();
  await expect(page.locator('#voiceBtn')).toHaveText('🔊 Stemmen aan');
});

test('where the browser cannot speak (like an Android WebView), there is no Voices button', async ({ page }) => {
  await page.addInitScript(() => { delete window.speechSynthesis; delete window.SpeechSynthesisUtterance; });
  await seed(page);
  await expect(page.locator('#voiceBtn')).toBeHidden();
  // and talking still works, silently
  await startDay(page, 0);
  await talkTo(page);
  await skip(page);
});
