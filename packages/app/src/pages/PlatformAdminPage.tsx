import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { BarChart3, Building2 } from 'lucide-react';
import { PlatformAdminOverviewTab } from '@/components/platform-admin/PlatformAdminOverviewTab';
import { PlatformOrgDetailPanel } from '@/components/platform-admin/PlatformOrgDetailPanel';
import { PlatformOrganizationsTable } from '@/components/platform-admin/PlatformOrganizationsTable';
import { PeacockStudioLoader } from '@/components/PeacockStudioLoader';
import { DASHBOARD_PATH } from '@/constants/routes';
import { useIsPlatformSuperAdmin } from '@/hooks/useIsPlatformSuperAdmin';
import { usePlatformAdminData } from '@/hooks/usePlatformAdminData';
import { useSessionMode } from '@/hooks/useSessionMode';

type AdminTab = 'overview' | 'organizations';

export const PlatformAdminPage = () => {
  const sessionMode = useSessionMode();
  const { isPlatformSuperAdmin, isLoading: whoamiLoading } = useIsPlatformSuperAdmin();
  const [tab, setTab] = useState<AdminTab>('overview');
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);
  const {
    overview,
    organizations,
    orgDetail,
    loadingOverview,
    loadingOrgs,
    loadingDetail,
  } = usePlatformAdminData(isPlatformSuperAdmin, tab, selectedOrgId);

  if (sessionMode === 'loading' || sessionMode === 'connecting' || whoamiLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <PeacockStudioLoader size={96} />
      </div>
    );
  }

  if (sessionMode !== 'cloud' || !isPlatformSuperAdmin) {
    return <Navigate to={DASHBOARD_PATH} replace />;
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 px-4 py-8 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-peacock-700">Platform admin</p>
          <h1 className="text-2xl font-bold text-slate-900">Peacock Studio</h1>
        </div>
        <Link
          to={DASHBOARD_PATH}
          className="text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          ← Back to library
        </Link>
      </div>

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
            onClick={() => setTab(id)}
            className={`inline-flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${
              tab === id
                ? 'bg-white text-peacock-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Icon className="h-4 w-4" aria-hidden />
            {label}
          </button>
        ))}
      </div>

      {tab === 'overview' ? (
        loadingOverview || !overview ? (
          <div className="flex justify-center py-12">
            <PeacockStudioLoader size={80} />
          </div>
        ) : (
          <PlatformAdminOverviewTab overview={overview} />
        )
      ) : null}

      {tab === 'organizations' ? (
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
