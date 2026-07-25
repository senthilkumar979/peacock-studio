import { useState } from 'react';
import { BarChart3, Building2 } from 'lucide-react';
import { PlatformAdminOverviewTab } from '@/components/platform-admin/PlatformAdminOverviewTab';
import { PlatformOrgDetailPanel } from '@/components/platform-admin/PlatformOrgDetailPanel';
import { PlatformOrganizationsTable } from '@/components/platform-admin/PlatformOrganizationsTable';
import { PeacockStudioLoader } from '@/components/PeacockStudioLoader';
import { usePlatformAdminData } from '@/hooks/usePlatformAdminData';

type PlatformSubTab = 'overview' | 'organizations';

/** Platform stats + org browser for the Super Admin shell. */
export const SuperAdminPlatformTab = () => {
  const [subTab, setSubTab] = useState<PlatformSubTab>('overview');
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);
  const {
    overview,
    organizations,
    orgDetail,
    loadingOverview,
    loadingOrgs,
    loadingDetail,
  } = usePlatformAdminData(true, subTab, selectedOrgId);

  return (
    <div className="space-y-6">
      <div className="flex gap-1 rounded-xl bg-slate-100 p-1 ring-1 ring-slate-200/80">
        {(
          [
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'organizations', label: 'Organizations', icon: Building2 },
          ] as const
        ).map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setSubTab(id)}
            className={`inline-flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${
              subTab === id
                ? 'bg-white text-peacock-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Icon className="h-4 w-4" aria-hidden />
            {label}
          </button>
        ))}
      </div>

      {subTab === 'overview' ? (
        loadingOverview || !overview ? (
          <div className="flex justify-center py-12">
            <PeacockStudioLoader size={80} />
          </div>
        ) : (
          <PlatformAdminOverviewTab overview={overview} />
        )
      ) : null}

      {subTab === 'organizations' ? (
        loadingOrgs ? (
          <div className="flex justify-center py-12">
            <PeacockStudioLoader size={80} />
          </div>
        ) : (
          <div className="space-y-6">
            <PlatformOrganizationsTable
              organizations={organizations}
              selectedId={selectedOrgId}
              onSelect={setSelectedOrgId}
            />
            <PlatformOrgDetailPanel detail={orgDetail} isLoading={loadingDetail} />
          </div>
        )
      ) : null}
    </div>
  );
};
