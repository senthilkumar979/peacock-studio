import { Link, useSearchParams } from 'react-router-dom';
import { BookOpen, HeartPulse, Shield, TrendingUp } from 'lucide-react';
import { RequirePlatformSuperAdmin } from '@/components/auth/RequirePlatformSuperAdmin';
import { SuperAdminAcquisitionTab } from '@/components/super-admin/SuperAdminAcquisitionTab';
import { SuperAdminApiTab } from '@/components/super-admin/SuperAdminApiTab';
import { SuperAdminHealthTab } from '@/components/super-admin/SuperAdminHealthTab';
import { SuperAdminPlatformTab } from '@/components/super-admin/SuperAdminPlatformTab';
import { DASHBOARD_PATH } from '@/constants/routes';

/** Top-level Super Admin tabs — add future sections here. */
export const SUPER_ADMIN_TABS = [
  { id: 'platform', label: 'Platform', icon: Shield },
  { id: 'acquisition', label: 'Acquisition', icon: TrendingUp },
  { id: 'health', label: 'Health', icon: HeartPulse },
  { id: 'api', label: 'API', icon: BookOpen },
] as const;

export type SuperAdminTabId = (typeof SUPER_ADMIN_TABS)[number]['id'];

function isSuperAdminTab(value: string | null): value is SuperAdminTabId {
  return SUPER_ADMIN_TABS.some((tab) => tab.id === value);
}

export const SuperAdminPage = () => (
  <RequirePlatformSuperAdmin>
    <SuperAdminPageInner />
  </RequirePlatformSuperAdmin>
);

const SuperAdminPageInner = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const rawTab = searchParams.get('tab');
  const tab: SuperAdminTabId = isSuperAdminTab(rawTab) ? rawTab : 'platform';

  const setTab = (next: SuperAdminTabId) => {
    setSearchParams(next === 'platform' ? {} : { tab: next }, { replace: true });
  };

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 px-4 py-8 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-peacock-700">Super admin</p>
          <h1 className="text-2xl font-bold text-slate-900">Peacock Studio</h1>
          <p className="mt-1 text-sm text-slate-500">
            Platform-wide tools reserved for operators on the SUPER_ADMIN_EMAILS allowlist.
          </p>
        </div>
        <Link
          to={DASHBOARD_PATH}
          className="text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          ← Back to library
        </Link>
      </div>

      <div className="flex gap-1 rounded-xl bg-slate-100 p-1 ring-1 ring-slate-200/80">
        {SUPER_ADMIN_TABS.map(({ id, label, icon: Icon }) => (
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

      {tab === 'platform' ? <SuperAdminPlatformTab /> : null}
      {tab === 'acquisition' ? <SuperAdminAcquisitionTab /> : null}
      {tab === 'health' ? <SuperAdminHealthTab /> : null}
      {tab === 'api' ? <SuperAdminApiTab /> : null}
    </div>
  );
};
