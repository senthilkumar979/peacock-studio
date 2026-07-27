import { ExternalLink } from 'lucide-react';
import { shouldShowEmbedWatermark } from '@/cloud/planLimits';
import { PEACOCK_APP_NAME, PEACOCK_LOGO_SRC } from '@/constants/branding';
import { LANDING_PATH, PRICING_PATH } from '@/constants/routes';

const SIGNUP_HREF = `${LANDING_PATH}?utm_source=embed&utm_medium=iframe&utm_campaign=create_like_this`;
const LEARN_HREF = `${PRICING_PATH}?utm_source=embed&utm_medium=iframe&utm_campaign=learn_more`;

interface EmbedGrowthCtaProps {
  compact?: boolean;
  /** Org plan; paid plans (pro/team) hide the growth CTA. Defaults to free. */
  plan?: string | null;
}

/**
 * End-of-guide growth CTA for embeds. Rendered outside the screenshot stage
 * so hotspot coordinates stay correct.
 */
export const EmbedGrowthCta = ({ compact = false, plan }: EmbedGrowthCtaProps) => {
  if (!shouldShowEmbedWatermark(plan)) return null;

  return (
    <aside
      className={`rounded-2xl border border-peacock-200/80 bg-gradient-to-br from-white via-peacock-50/40 to-slate-50 shadow-sm ${
        compact ? 'p-4' : 'p-5 sm:p-6'
      }`}
    >
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-peacock-700">
        Built with {PEACOCK_APP_NAME}
      </p>
      <h3
        className={`font-bold tracking-tight text-slate-900 ${compact ? 'mt-1 text-base' : 'mt-2 text-lg'}`}
      >
        Would you like to create a flow doc like this?
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">
        Capture clicks, branch decisions, and screenshots into interactive guides your team can
        share, embed, and keep up to date — without rewriting docs by hand.
      </p>
      <ul className="mt-3 space-y-1.5 text-sm text-slate-600">
        <li>· Record once from your browser extension</li>
        <li>· Publish share links or embeds in minutes</li>
        <li>· Keep every step tied to the real UI</li>
      </ul>
      <div className="mt-4 flex flex-wrap gap-2">
        <a
          href={SIGNUP_HREF}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-xl bg-peacock-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-peacock-600/20 transition hover:bg-peacock-700"
        >
          Start free
          <ExternalLink className="h-3.5 w-3.5" aria-hidden />
        </a>
        <a
          href={LEARN_HREF}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
        >
          <img src={PEACOCK_LOGO_SRC} alt="" width={16} height={16} className="h-4 w-4" />
          See how {PEACOCK_APP_NAME} works
        </a>
      </div>
    </aside>
  );
};
