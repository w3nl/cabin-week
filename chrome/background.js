// The Chrome extension: the toolbar button (and the first install) opens the game in a tab, or brings back the one already open.
const GAME_URL = chrome.runtime.getURL("index.html");

async function openGame() {
  const [open] = await chrome.runtime.getContexts({ contextTypes: ["TAB"], documentUrls: [GAME_URL] });
  if (open && open.tabId >= 0) {
    await chrome.tabs.update(open.tabId, { active: true });
    await chrome.windows.update(open.windowId, { focused: true });
  } else {
    await chrome.tabs.create({ url: GAME_URL });
  }
}

chrome.action.onClicked.addListener(openGame);
chrome.runtime.onInstalled.addListener(d => { if (d.reason === "install") openGame(); });
