import { Link } from 'react-router-dom';
import { useState } from 'react';
import { Clock, Layers, Link2, Pencil, Play, Trash2 } from 'lucide-react';
import { ShareProductTourModal } from '@/components/share/ShareProductTourModal';
import type { ProductTourSummary } from '@/types/productTour';

interface ProductTourDocumentActionsProps {
  tourId: string;
  onRequestDelete: () => void;
}

const ACTION_CLASS =
  'inline-flex items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition-colors';

export const ProductTourDocumentActions = ({ tourId, onRequestDelete }: ProductTourDocumentActionsProps) => {
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  return (
    <>
      <div className="flex justify-center gap-2">
        <Link to={`/tours/${tourId}`} className={`${ACTION_CLASS} border-slate-300 text-slate-700 hover:bg-white`}>
          <Play className="h-4 w-4" aria-hidden />
        </Link>
        <Link
          to={`/tours/${tourId}/edit`}
          className={`${ACTION_CLASS} border-peacock-200 bg-peacock-50 text-peacock-800 hover:bg-peacock-100`}
        >
          <Pencil className="h-4 w-4" aria-hidden />
        </Link>
        <button
          type="button"
          onClick={() => setIsShareModalOpen(true)}
          className={`${ACTION_CLASS} border-slate-300 text-slate-700 hover:bg-white`}
        >
          <Link2 className="h-4 w-4" aria-hidden />
        </button>
        <button
          type="button"
          onClick={onRequestDelete}
          className={`${ACTION_CLASS} border-red-200 text-red-700 hover:bg-red-50`}
        >
          <Trash2 className="h-4 w-4" aria-hidden />
        </button>
      </div>
      <ShareProductTourModal
        isOpen={isShareModalOpen}
        tourId={tourId}
        onClose={() => setIsShareModalOpen(false)}
      />
    </>
  );
};

interface ProductTourLibraryCardProps {
  summary: ProductTourSummary;
  onRequestDelete: () => void;
}

export const ProductTourLibraryCard = ({ summary, onRequestDelete }: ProductTourLibraryCardProps) => (
  <article className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm ring-1 ring-slate-900/5 transition-shadow hover:border-brand-violet/30 hover:shadow-lg">
    <div className="h-1 bg-gradient-to-r from-brand-violet via-peacock-500 to-brand-cyan" />
    <div className="flex flex-1 flex-col p-5">
      <p className="text-xs font-semibold uppercase tracking-wide text-brand-violet">{summary.personaName}</p>
      <h3 className="mt-2 line-clamp-2 text-lg font-bold text-slate-900">{summary.title}</h3>
      {summary.description ? (
        <p className="mt-2 line-clamp-2 text-sm text-slate-600">{summary.description}</p>
      ) : null}
      <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-600">
        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1">
          <Layers className="h-3.5 w-3.5" aria-hidden />
          {summary.featureCount} features
        </span>
        {summary.estimatedMinutes ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1">
            <Clock className="h-3.5 w-3.5" aria-hidden />
            ~{summary.estimatedMinutes} min
          </span>
        ) : null}
      </div>
      <div className="mt-5">
        <ProductTourDocumentActions tourId={summary.id} onRequestDelete={onRequestDelete} />
      </div>
    </div>
  </article>
);

interface ProductTourLibraryCardsProps {
  summaries: ProductTourSummary[];
  onRequestDelete: (summary: ProductTourSummary) => void;
}

export const ProductTourLibraryCards = ({ summaries, onRequestDelete }: ProductTourLibraryCardsProps) => (
  <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
    {summaries.map((summary) => (
      <ProductTourLibraryCard
        key={summary.id}
        summary={summary}
        onRequestDelete={() => onRequestDelete(summary)}
      />
    ))}
  </div>
);
