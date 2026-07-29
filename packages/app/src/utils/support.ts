const SUPPORT_EMAIL = 'mentorbridgeindia@gmail.com';

/**
 * Opens the Freshchat live-chat widget when it is loaded, otherwise falls back to
 * a support email. Keeps the "get help" affordance working whether or not the
 * chat widget is configured.
 */
export function openSupportChat(): void {
  if (typeof window.fcWidget?.open === 'function') {
    window.fcWidget.open();
    return;
  }
  window.location.href = `mailto:${SUPPORT_EMAIL}?subject=Peacock%20Support`;
}
