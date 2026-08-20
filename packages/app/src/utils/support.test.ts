import { afterEach, describe, expect, it, vi } from 'vitest';
import { HIDE_SUPPORT_WIDGET_CLASS, openSupportChat } from './support';

describe('openSupportChat', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    delete window.fcWidget;
    document.documentElement.classList.remove(HIDE_SUPPORT_WIDGET_CLASS);
  });

  it('reveals and opens Freshchat when the widget is loaded', () => {
    const open = vi.fn();
    const show = vi.fn();
    window.fcWidget = { open, show, isLoaded: () => true } as Window['fcWidget'];
    document.documentElement.classList.add(HIDE_SUPPORT_WIDGET_CLASS);

    openSupportChat();

    expect(document.documentElement.classList.contains(HIDE_SUPPORT_WIDGET_CLASS)).toBe(false);
    expect(show).toHaveBeenCalledTimes(1);
    expect(open).toHaveBeenCalledTimes(1);
  });

  it('falls back to mailto when widget is missing', () => {
    const location = { href: '' };
    vi.stubGlobal('window', { location });
    openSupportChat();
    expect(location.href).toBe(
      'mailto:mentorbridgeindia@gmail.com?subject=Peacock%20Support',
    );
  });

  it('falls back to mailto when widget exists but is not loaded', () => {
    const open = vi.fn();
    const location = { href: '' };
    vi.stubGlobal('window', {
      fcWidget: { open, isLoaded: () => false },
      location,
    });
    openSupportChat();
    expect(open).not.toHaveBeenCalled();
    expect(location.href).toBe(
      'mailto:mentorbridgeindia@gmail.com?subject=Peacock%20Support',
    );
  });
});
