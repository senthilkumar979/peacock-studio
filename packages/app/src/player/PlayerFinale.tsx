import {
  CheckCircle2,
  GitBranch,
  Layers,
  ListOrdered,
  RotateCcw,
} from 'lucide-react';
import { EmbedGrowthCta } from '@/components/embed/EmbedGrowthCta';
import { RichTextContent } from '@/components/editor/RichTextContent';
import { isEmptyRichText } from '@/utils/richText';

interface PlayerFinaleProps {
  title: string;
  description: string;
  stepCount: number;
  branchCount: number;
  sectionCount: number;
  onReplay: () => void;
  isEmbed?: boolean;
}

export const PlayerFinale = ({
  title,
  description,
  stepCount,
  branchCount,
  sectionCount,
  onReplay,
  isEmbed = false,
}: PlayerFinaleProps) => {
  const hasDescription = !isEmptyRichText(description);

  return (
    <div className={`mx-auto w-full space-y-4 ${isEmbed ? 'max-w-2xl' : 'max-w-xl'}`}>
      <article className="relative overflow-hidden rounded-3xl border border-emerald-200/80 bg-white shadow-xl shadow-emerald-100/40">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-emerald-100/80 via-peacock-50/50 to-transparent"
          aria-hidden
        />

        <div className="relative px-8 py-10 text-center sm:px-10 sm:py-12">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200">
            <CheckCircle2 className="h-8 w-8" aria-hidden />
          </span>

          <span className="mt-5 inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">
            Guide complete
          </span>

          <h2 className="mt-4 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            {title}
          </h2>

          {hasDescription ? (
            <RichTextContent
              html={description}
              className="mx-auto mt-4 max-w-md text-left text-base text-slate-600 sm:text-center [&_p]:sm:text-center"
            />
          ) : (
            <p className="mt-4 text-sm italic text-slate-400">No description provided.</p>
          )}

          <dl className="mt-8 grid grid-cols-3 gap-3">
            <FinaleStat icon={ListOrdered} label="Steps" value={stepCount} />
            <FinaleStat icon={Layers} label="Sections" value={sectionCount} />
            <FinaleStat icon={GitBranch} label="Branches" value={branchCount} />
          </dl>

          <button
            type="button"
            onClick={onReplay}
            className="mt-8 inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/20 transition hover:bg-slate-800"
          >
            <RotateCcw className="h-4 w-4" aria-hidden />
            Replay from beginning
          </button>
        </div>
      </article>

      {isEmbed ? <EmbedGrowthCta /> : null}
    </div>
  );
};

interface FinaleStatProps {
  icon: typeof ListOrdered;
  label: string;
  value: number;
}

const FinaleStat = ({ icon: Icon, label, value }: FinaleStatProps) => (
  <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3">
    <dt className="flex items-center justify-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
      <Icon className="h-3.5 w-3.5" aria-hidden />
      {label}
    </dt>
    <dd className="mt-1 text-xl font-bold text-slate-900">{value}</dd>
  </div>
);
