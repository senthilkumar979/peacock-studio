import { OrgDomainUsageTable } from '@/components/org-admin/OrgDomainUsageTable';
import { PeacockStudioLoader } from '@/components/PeacockStudioLoader';
import type { PlatformOrganizationDetail } from '@/cloud/repositories/platformAdminRepository';
import { formatBytes } from '@/utils/formatBytes';

interface PlatformOrgDetailPanelProps {
  detail: PlatformOrganizationDetail | null;
  isLoading: boolean;
}

export const PlatformOrgDetailPanel = ({
  detail,
  isLoading,
}: PlatformOrgDetailPanelProps) => {
  if (isLoading) {
    return (
      <div className="flex justify-center rounded-2xl border border-slate-200 bg-white py-16">
        <PeacockStudioLoader size={72} />
      </div>
    );
  }

  if (!detail) {
    return (
      <p className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-6 py-10 text-center text-sm text-slate-500">
        Select an organization to inspect members, counts, domains, and storage.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
        <p className="text-sm font-medium text-peacock-700">Organization detail</p>
        <h2 className="mt-1 text-xl font-bold text-slate-900">{detail.name}</h2>
        <dl className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Stat label="Members" value={String(detail.members.length)} />
          <Stat label="Flow docs" value={String(detail.documentCount)} />
          <Stat label="Product tours" value={String(detail.tourCount)} />
          <Stat label="Org storage" value={formatBytes(detail.storageBytes)} />
          <Stat label="Assets sum" value={formatBytes(detail.assetsStorageBytes)} />
          <Stat label="Plan" value={detail.plan} />
          <Stat label="Type" value={detail.workspaceType} />
          <Stat label="Owner" value={detail.ownerEmail ?? '—'} />
        </dl>
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
          <h3 className="text-base font-semibold text-slate-900">Members</h3>
          <p className="text-xs text-slate-500">Storage attributed from screenshot uploads</p>
        </div>
        {detail.members.length === 0 ? (
          <p className="px-6 py-8 text-center text-sm text-slate-500">No members</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/80 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  <th className="px-5 py-3">User</th>
                  <th className="px-5 py-3">Role</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Storage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {detail.members.map((member) => (
                  <tr key={member.email}>
                    <td className="px-5 py-3">
                      <span className="font-medium text-slate-900">{member.displayName}</span>
                      <span className="mt-0.5 block text-xs text-slate-500">{member.email}</span>
                    </td>
                    <td className="px-5 py-3 capitalize text-slate-600">{member.role}</td>
                    <td className="px-5 py-3 capitalize text-slate-600">{member.status}</td>
                    <td className="px-5 py-3 text-right tabular-nums text-slate-800">
                      {formatBytes(member.storageBytes)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <OrgDomainUsageTable rows={detail.domains} />
    </div>
  );
};

const Stat = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-xl bg-slate-50 px-3 py-2.5 ring-1 ring-slate-100">
    <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{label}</dt>
    <dd className="mt-1 truncate text-sm font-semibold text-slate-900">{value}</dd>
  </div>
);
