const SUPPORT_EMAIL = 'mentorbridgeindia@gmail.com';

/** Applied to <html> on routes where the Freshchat launcher must stay hidden. */
export const HIDE_SUPPORT_WIDGET_CLASS = 'peacock-hide-support-widget';

function isFreshchatReady(): boolean {
  const widget = window.fcWidget;
  return Boolean(widget?.isLoaded?.()) && typeof widget?.open === 'function';
}

/**
 * Opens the Freshchat live-chat widget when it is loaded, otherwise falls back to
 * a support email. Keeps the "get help" affordance working whether or not the
 * chat widget is configured.
 */
export function openSupportChat(): void {
  if (!isFreshchatReady()) {
    window.location.href = `mailto:${SUPPORT_EMAIL}?subject=Peacock%20Support`;
    return;
  }

  // Pricing (and other non-launcher routes) hide the iframe with CSS; reveal it
  // before open() so the conversation is actually visible.
  document.documentElement.classList.remove(HIDE_SUPPORT_WIDGET_CLASS);
  window.fcWidget?.show?.();
  window.fcWidget?.open();
}
