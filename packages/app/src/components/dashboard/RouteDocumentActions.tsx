import { Link } from 'react-router-dom';
import { Pencil, Play, Trash2 } from 'lucide-react';

interface RouteDocumentActionsProps {
  routeId: string;
  onRequestDelete: () => void;
}

const ACTION_CLASS =
  'inline-flex items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition-colors';

export const RouteDocumentActions = ({ routeId, onRequestDelete }: RouteDocumentActionsProps) => (
  <div className="flex justify-center gap-2">
    <Link
      to={`/routes/${routeId}`}
      className={`${ACTION_CLASS} border-slate-300 text-slate-700 hover:bg-white`}
    >
      <Play className="h-4 w-4 shrink-0" aria-hidden />
    </Link>
    <Link
      to={`/routes/${routeId}/edit`}
      className={`${ACTION_CLASS} border-peacock-200 bg-peacock-50 text-peacock-800 hover:bg-peacock-100`}
    >
      <Pencil className="h-4 w-4 shrink-0" aria-hidden />
    </Link>
    <button
      type="button"
      onClick={onRequestDelete}
      className={`${ACTION_CLASS} border-red-200 text-red-700 hover:bg-red-50`}
    >
      <Trash2 className="h-4 w-4 shrink-0" aria-hidden />
    </button>
  </div>
);
