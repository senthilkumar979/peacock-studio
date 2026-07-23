import { PEACOCK_APP_NAME, PEACOCK_LOGO_SRC } from '@/constants/branding';
import { LANDING_PATH } from '@/constants/routes';

/**
 * Non-intrusive embed attribution. Absolutely positioned outside the
 * screenshot coordinate box so click markers stay aligned.
 */
export const PeacockEmbedWatermark = () => (
  <a
    href={`${LANDING_PATH}?utm_source=embed&utm_medium=iframe&utm_campaign=watermark`}
    target="_blank"
    rel="noopener noreferrer"
    className="pointer-events-auto inline-flex items-center gap-1.5 rounded-full border border-white/70 bg-slate-900/75 px-2.5 py-1 text-[10px] font-semibold tracking-wide text-white shadow-lg backdrop-blur-sm transition hover:bg-slate-900/90"
    aria-label={`Loaded from ${PEACOCK_APP_NAME}`}
  >
    <img src={PEACOCK_LOGO_SRC} alt="" width={12} height={12} className="h-3 w-3 opacity-90" />
    Loaded from {PEACOCK_APP_NAME}
  </a>
);
