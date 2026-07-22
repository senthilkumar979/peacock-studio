import { Globe2 } from 'lucide-react';
import type { OrgDomainUsageRow } from '@/cloud/repositories/organizationRepository';

interface OrgDomainUsageTableProps {
  rows: OrgDomainUsageRow[];
}

export const OrgDomainUsageTable = ({ rows }: OrgDomainUsageTableProps) => {
  const maxCount = rows.reduce((max, row) => Math.max(max, row.count), 0);

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
      <div className="flex items-center gap-2.5 border-b border-slate-100 px-5 py-4 sm:px-6">
        <span className="inline-flex rounded-lg bg-peacock-50 p-2 text-peacock-700 ring-1 ring-peacock-100">
          <Globe2 className="h-4 w-4" aria-hidden />
        </span>
        <div>
          <h2 className="text-base font-semibold text-slate-900">Domains used in flows</h2>
          <p className="text-xs text-slate-500">
            Hostnames collected from steps when documents are saved
          </p>
        </div>
      </div>

      {rows.length === 0 ? (
        <p className="px-6 py-10 text-center text-sm text-slate-500">
          No domains yet. Save a flow document to start tracking.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/80 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                <th className="px-5 py-3 sm:px-6">Domain</th>
                <th className="px-5 py-3 text-right sm:px-6">Times used</th>
                <th className="hidden px-5 py-3 sm:table-cell sm:px-6 sm:w-48">Share</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((row) => {
                const share = maxCount > 0 ? Math.round((row.count / maxCount) * 100) : 0;
                return (
                  <tr key={row.domain} className="hover:bg-slate-50/60">
                    <td className="px-5 py-3 font-medium text-slate-900 sm:px-6">
                      <span className="inline-flex items-center gap-2">
                        <span
                          aria-hidden
                          className="h-2 w-2 shrink-0 rounded-full bg-peacock-500"
                        />
                        {row.domain}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right tabular-nums font-semibold text-slate-800 sm:px-6">
                      {row.count}
                    </td>
                    <td className="hidden px-5 py-3 sm:table-cell sm:px-6">
                      <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-peacock-500 to-peacock-600"
                          style={{ width: `${share}%` }}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};
