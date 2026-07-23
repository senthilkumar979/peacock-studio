import {
  contributorInitials,
  type ContributorBoard,
} from '@/components/org-admin/contributorLeadersHelpers';

interface ContributorBoardCardProps {
  board: ContributorBoard;
}

export const ContributorBoardCard = ({ board }: ContributorBoardCardProps) => {
  const Icon = board.icon;
  const max = board.rows[0]?.count ?? 0;

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
      <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-3.5">
        <span
          className={`inline-flex rounded-xl bg-gradient-to-br ${board.accent} p-2 text-white shadow-md`}
        >
          <Icon className="h-4 w-4" aria-hidden />
        </span>
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-slate-900">{board.title}</h3>
          <p className="text-[11px] text-slate-500">{board.subtitle}</p>
        </div>
      </div>

      {board.rows.length === 0 ? (
        <p className="px-4 py-8 text-center text-sm text-slate-500">No data yet.</p>
      ) : (
        <ol className="divide-y divide-slate-100">
          {board.rows.slice(0, 5).map((row, index) => {
            const share = max > 0 ? Math.round((row.count / max) * 100) : 0;
            return (
              <li key={`${board.title}-${row.email}`} className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                      index === 0
                        ? 'bg-amber-100 text-amber-800 ring-1 ring-amber-200'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                    title={row.displayName}
                  >
                    {index === 0 ? '1' : contributorInitials(row.displayName)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="truncate text-sm font-medium text-slate-900">
                        {row.displayName}
                        {index === 0 ? (
                          <span className="ml-2 text-[10px] font-semibold uppercase tracking-wide text-amber-700">
                            Leading
                          </span>
                        ) : null}
                      </p>
                      <p className="shrink-0 text-sm font-semibold tabular-nums text-slate-800">
                        {row.count}
                        <span className="ml-1 text-xs font-medium text-slate-400">{board.unit}</span>
                      </p>
                    </div>
                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className={`h-full rounded-full bg-gradient-to-r ${board.accent}`}
                        style={{ width: `${share}%` }}
                      />
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </article>
  );
};
