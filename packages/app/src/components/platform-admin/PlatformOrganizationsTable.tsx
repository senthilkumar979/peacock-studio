import { formatBytes } from '@/utils/formatBytes';
import type { PlatformOrganizationSummary } from '@/cloud/repositories/platformAdminRepository';

interface PlatformOrganizationsTableProps {
  organizations: PlatformOrganizationSummary[];
  selectedId: string | null;
  onSelect: (organizationId: string) => void;
}

export const PlatformOrganizationsTable = ({
  organizations,
  selectedId,
  onSelect,
}: PlatformOrganizationsTableProps) => {
  if (organizations.length === 0) {
    return (
      <p className="rounded-2xl border border-slate-200 bg-white px-6 py-10 text-center text-sm text-slate-500">
        No organizations yet.
      </p>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/80 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              <th className="px-4 py-3">Organization</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3 text-right">Members</th>
              <th className="px-4 py-3 text-right">Docs</th>
              <th className="px-4 py-3 text-right">Tours</th>
              <th className="px-4 py-3 text-right">Storage</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {organizations.map((org) => {
              const selected = org.id === selectedId;
              return (
                <tr key={org.id}>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => onSelect(org.id)}
                      className={`text-left font-medium transition ${
                        selected
                          ? 'text-peacock-700'
                          : 'text-slate-900 hover:text-peacock-700'
                      }`}
                    >
                      {org.name}
                      {org.ownerEmail ? (
                        <span className="mt-0.5 block text-xs font-normal text-slate-500">
                          {org.ownerEmail}
                        </span>
                      ) : null}
                    </button>
                  </td>
                  <td className="px-4 py-3 capitalize text-slate-600">
                    {org.workspaceType}
                    <span className="mt-0.5 block text-xs text-slate-400">{org.plan}</span>
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-slate-800">
                    {org.memberCount}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-slate-800">
                    {org.documentCount}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-slate-800">
                    {org.tourCount}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-slate-800">
                    {formatBytes(org.storageBytes)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
