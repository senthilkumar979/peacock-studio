import { PEACOCK_APP_NAME, PEACOCK_LOGO_SRC } from '@/constants/branding';
import { LANDING_PATH } from '@/constants/routes';

/**
 * Non-intrusive embed attribution. Rendered in the embed chrome footer,
 * outside the screenshot coordinate box so click markers stay aligned.
 */
export const PeacockEmbedWatermark = () => (
  <a
    href={`${LANDING_PATH}?utm_source=embed&utm_medium=iframe&utm_campaign=watermark`}
    target="_blank"
    rel="noopener noreferrer"
    className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[10px] font-semibold tracking-wide text-slate-600 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-800"
    aria-label={`Loaded from ${PEACOCK_APP_NAME}`}
  >
    <img src={PEACOCK_LOGO_SRC} alt="" width={12} height={12} className="h-3 w-3 opacity-90" />
    Loaded from {PEACOCK_APP_NAME}
  </a>
);
