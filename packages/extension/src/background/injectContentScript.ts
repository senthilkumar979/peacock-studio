const CONTENT_SCRIPT_PATH = 'content/index.js';

const NON_INJECTABLE_URL_PREFIXES = [
  'chrome://',
  'chrome-extension://',
  'edge://',
  'about:',
  'devtools://',
  'view-source:',
];

export function canInjectIntoUrl(url: string | undefined): boolean {
  if (!url) return false;
  return !NON_INJECTABLE_URL_PREFIXES.some((prefix) => url.startsWith(prefix));
}

export async function isContentScriptReachable(tabId: number): Promise<boolean> {
  try {
    await chrome.tabs.sendMessage(tabId, { type: 'PING' });
    return true;
  } catch {
    return false;
  }
}

export async function ensureContentScript(tabId: number): Promise<boolean> {
  if (await isContentScriptReachable(tabId)) return true;

  const tab = await chrome.tabs.get(tabId);
  if (!canInjectIntoUrl(tab.url)) return false;

  await chrome.scripting.executeScript({
    target: { tabId, allFrames: true },
    files: [CONTENT_SCRIPT_PATH],
  });

  return isContentScriptReachable(tabId);
}
