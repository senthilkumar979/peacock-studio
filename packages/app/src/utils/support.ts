const SUPPORT_EMAIL = 'mentorbridgeindia@gmail.com';

/**
 * Opens the Tawk.to live-chat widget when it is loaded, otherwise falls back to
 * a support email. Keeps the "get help" affordance working whether or not the
 * chat widget is configured.
 */
export function openSupportChat(): void {
  if (window.Tawk_API?.maximize) {
    window.Tawk_API.maximize();
    return;
  }
  window.location.href = `mailto:${SUPPORT_EMAIL}?subject=Peacock%20Support`;
}
