import { GitBranch, Layers, ListOrdered, RotateCcw } from "lucide-react";
import { EmbedGrowthCta } from "@/components/embed/EmbedGrowthCta";
import { PersonaAvatar } from "@/components/persona/PersonaAvatar";
import type { Persona } from "@/types/persona";
import type { ProductTour } from "@/types/productTour";
import { stripHtmlTags } from "@/utils/richText";

interface TourCompletePanelProps {
  tour: ProductTour;
  persona: Persona;
  featureCount: number;
  demoCount: number;
  stepCount: number;
  onReplay: () => void;
  isEmbed?: boolean;
}

export const TourCompletePanel = ({
  tour,
  persona,
  featureCount,
  demoCount,
  stepCount,
  onReplay,
  isEmbed = false,
}: TourCompletePanelProps) => (
  <div className="mx-auto w-full max-w-2xl space-y-4">
    <article className="relative overflow-hidden rounded-3xl border border-rose-200/60 shadow-xl">
      <div
        className="absolute inset-0 bg-gradient-to-br from-rose-50 via-rose-300 to-amber-300"
        aria-hidden
      />
      <div className="relative z-10 p-8 sm:p-10">
        <div className="flex items-start gap-4">
          <PersonaAvatar persona={persona} size="lg" />
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-rose-800">
              Tour complete
            </p>
            <h2 className="mt-1 text-3xl font-bold text-slate-900">{tour.title}</h2>
            {tour.description ? (
              <p className="mt-3 text-base text-slate-800">{stripHtmlTags(tour.description)}</p>
            ) : null}
          </div>
        </div>

        <dl className="mt-8 grid grid-cols-3 gap-3">
          <Stat icon={Layers} label="Features" value={featureCount} />
          <Stat icon={GitBranch} label="Demos" value={demoCount} />
          <Stat icon={ListOrdered} label="Steps" value={stepCount} />
        </dl>
        <div className="mt-8 flex justify-center gap-4">
          {tour.completionCta?.url ? (
            <a
              href={tour.completionCta.url}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-800 sm:w-auto"
            >
              {tour.completionCta.label || "Continue"}
            </a>
          ) : null}

          <button
            type="button"
            onClick={onReplay}
            className="flex items-center justify-center gap-2 rounded-xl border border-white/70 bg-white/70 px-6 py-3 text-sm font-semibold text-slate-900 backdrop-blur-sm"
          >
            <RotateCcw className="h-4 w-4" aria-hidden />
            Replay tour
          </button>
        </div>
      </div>
    </article>
    {isEmbed ? <EmbedGrowthCta /> : null}
  </div>
);

const Stat = ({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Layers;
  label: string;
  value: number;
}) => (
  <div className="rounded-2xl border border-white/70 bg-white/60 px-3 py-3 backdrop-blur-sm">
    <dt className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-rose-900/70">
      <Icon className="h-3 w-3" aria-hidden />
      {label}
    </dt>
    <dd className="mt-1 text-xl font-bold text-slate-900">{value}</dd>
  </div>
);
