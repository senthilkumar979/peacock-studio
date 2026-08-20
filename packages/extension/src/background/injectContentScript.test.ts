import { describe, expect, it, vi } from 'vitest';
import {
  canInjectIntoUrl,
  ensureContentScript,
  isContentScriptReachable,
} from './injectContentScript';

describe('injectContentScript', () => {
  it('rejects missing and restricted urls', () => {
    expect(canInjectIntoUrl(undefined)).toBe(false);
    expect(canInjectIntoUrl('chrome://settings')).toBe(false);
    expect(canInjectIntoUrl('chrome-extension://abc/page.html')).toBe(false);
    expect(canInjectIntoUrl('about:blank')).toBe(false);
    expect(canInjectIntoUrl('https://example.com')).toBe(true);
  });

  it('reports reachability from tabs.sendMessage', async () => {
    vi.mocked(chrome.tabs.sendMessage).mockResolvedValueOnce(undefined);
    await expect(isContentScriptReachable(7)).resolves.toBe(true);

    vi.mocked(chrome.tabs.sendMessage).mockRejectedValueOnce(new Error('no receiver'));
    await expect(isContentScriptReachable(7)).resolves.toBe(false);
  });

  it('skips injection when already reachable', async () => {
    vi.mocked(chrome.tabs.sendMessage).mockResolvedValueOnce(undefined);
    await expect(ensureContentScript(3)).resolves.toBe(true);
    expect(chrome.scripting.executeScript).not.toHaveBeenCalled();
  });

  it('injects and rechecks when missing on an injectable page', async () => {
    vi.mocked(chrome.tabs.sendMessage)
      .mockRejectedValueOnce(new Error('missing'))
      .mockResolvedValueOnce(undefined);
    vi.mocked(chrome.tabs.get).mockResolvedValueOnce({
      id: 3,
      url: 'https://example.com',
    } as chrome.tabs.Tab);
    vi.mocked(chrome.scripting.executeScript).mockResolvedValueOnce([] as never);

    await expect(ensureContentScript(3)).resolves.toBe(true);
    expect(chrome.scripting.executeScript).toHaveBeenCalledWith({
      target: { tabId: 3, allFrames: true },
      files: ['content/index.js'],
    });
  });

  it('returns false for non-injectable tabs', async () => {
    vi.mocked(chrome.tabs.sendMessage).mockRejectedValueOnce(new Error('missing'));
    vi.mocked(chrome.tabs.get).mockResolvedValueOnce({
      id: 3,
      url: 'chrome://extensions',
    } as chrome.tabs.Tab);

    await expect(ensureContentScript(3)).resolves.toBe(false);
    expect(chrome.scripting.executeScript).not.toHaveBeenCalled();
  });
});
