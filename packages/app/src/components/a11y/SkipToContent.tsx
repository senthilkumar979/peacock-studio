/** Keyboard-first skip link; pair with `id="main-content"` on the page main landmark. */
export const SkipToContent = () => (
  <a
    href="#main-content"
    className="absolute left-4 top-4 z-[100] -translate-y-16 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-peacock-800 shadow-lg ring-1 ring-slate-200 transition focus:translate-y-0 focus:outline-none focus:ring-2 focus:ring-peacock-500"
  >
    Skip to content
  </a>
);
