import { useState } from 'react';
import {
  Activity,
  ClipboardCopy,
  Link2,
  LayoutGrid,
  RefreshCw,
  ScrollText,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { HealthCheckList } from '@/components/health/HealthCheckList';
import { HealthOverviewPanel } from '@/components/health/HealthOverviewPanel';
import { useHealthChecks } from '@/hooks/useHealthChecks';
import {
  DASHBOARD_PATH,
  FLOW_DOCS_PATH,
  FLOW_MAPS_PATH,
  PLAYWRIGHT_TESTS_PATH,
  PRODUCT_TOURS_PATH,
  TEST_CASES_PATH,
} from '@/constants/routes';

type HealthSubTab = 'overview' | 'pages' | 'connections' | 'logs';

const PAGE_HREFS: Record<string, string> = {
  'page-dashboard': DASHBOARD_PATH,
  'page-tours': PRODUCT_TOURS_PATH,
  'page-flow-docs': FLOW_DOCS_PATH,
  'page-test-cases': TEST_CASES_PATH,
  'page-playwright': PLAYWRIGHT_TESTS_PATH,
  'page-flow-maps': FLOW_MAPS_PATH,
};

const SUB_TABS = [
  { id: 'overview', label: 'Overview', icon: Activity },
  { id: 'pages', label: 'Pages', icon: LayoutGrid },
  { id: 'connections', label: 'Connections', icon: Link2 },
  { id: 'logs', label: 'Logs', icon: ScrollText },
] as const;

/** Health diagnostics panel for the Super Admin shell. */
export const SuperAdminHealthTab = () => {
  const { results, isRunning, ranAt, error, refresh, copyReport } = useHealthChecks();
  const [subTab, setSubTab] = useState<HealthSubTab>('overview');
  const [copyMessage, setCopyMessage] = useState<string | null>(null);

  const handleCopy = async () => {
    const ok = await copyReport();
    setCopyMessage(ok ? 'Report copied to clipboard.' : 'Could not copy report.');
    window.setTimeout(() => setCopyMessage(null), 2500);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-slate-500">
          Library pages, cloud/local connections, and client diagnostic logs.
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="secondary"
            className="flex"
            size="sm"
            onClick={() => void handleCopy()}
            disabled={!ranAt}
          >
            <ClipboardCopy className="mr-1.5 h-4 w-4" aria-hidden />
            Copy report
          </Button>
          <Button variant="primary" size="sm" onClick={refresh} disabled={isRunning}>
            <RefreshCw
              className={`mr-1.5 h-4 w-4 ${isRunning ? 'animate-spin' : ''}`}
              aria-hidden
            />
            {isRunning ? 'Checking…' : 'Re-run checks'}
          </Button>
        </div>
      </div>

      {copyMessage ? (
        <p className="text-sm font-medium text-peacock-700" role="status">
          {copyMessage}
        </p>
      ) : null}
      {error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </p>
      ) : null}

      <div className="flex gap-1 rounded-xl bg-slate-100 p-1 ring-1 ring-slate-200/80">
        {SUB_TABS.map(({ id, label, icon: Icon }) => (
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
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      {subTab === 'overview' ? (
        <HealthOverviewPanel results={results} isRunning={isRunning} ranAt={ranAt} />
      ) : null}
      {subTab === 'pages' ? (
        <HealthCheckList
          title="Pages"
          description="Library shell routes and whether session data can load."
          category="pages"
          results={results}
          hrefById={PAGE_HREFS}
        />
      ) : null}
      {subTab === 'connections' ? (
        <HealthCheckList
          title="Connections"
          description="Extension bridge, IndexedDB, cloud config, Supabase, and observability."
          category="connections"
          results={results}
        />
      ) : null}
      {subTab === 'logs' ? (
        <HealthCheckList
          title="Logs"
          description="Client-side diagnostic messages from the latest health run."
          category="logs"
          results={results}
        />
      ) : null}
    </div>
  );
};
