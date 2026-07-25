import { useState } from 'react';
import {
  Activity,
  ClipboardCopy,
  HeartPulse,
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

type HealthTab = 'overview' | 'pages' | 'connections' | 'logs';

const PAGE_HREFS: Record<string, string> = {
  'page-dashboard': DASHBOARD_PATH,
  'page-tours': PRODUCT_TOURS_PATH,
  'page-flow-docs': FLOW_DOCS_PATH,
  'page-test-cases': TEST_CASES_PATH,
  'page-playwright': PLAYWRIGHT_TESTS_PATH,
  'page-flow-maps': FLOW_MAPS_PATH,
};

const TABS = [
  { id: 'overview', label: 'Overview', icon: Activity },
  { id: 'pages', label: 'Pages', icon: LayoutGrid },
  { id: 'connections', label: 'Connections', icon: Link2 },
  { id: 'logs', label: 'Logs', icon: ScrollText },
] as const;

export const HealthCheckerPage = () => {
  const { results, isRunning, ranAt, error, refresh, copyReport } = useHealthChecks();
  const [tab, setTab] = useState<HealthTab>('overview');
  const [copyMessage, setCopyMessage] = useState<string | null>(null);

  const handleCopy = async () => {
    const ok = await copyReport();
    setCopyMessage(ok ? 'Report copied to clipboard.' : 'Could not copy report.');
    window.setTimeout(() => setCopyMessage(null), 2500);
  };

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 px-4 py-8 sm:px-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-peacock-700">Diagnostics</p>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900">
            <HeartPulse className="h-6 w-6 text-peacock-600" aria-hidden />
            Health Checker
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-500">
            Check library pages, cloud and local connections, and client diagnostic logs.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="secondary" size="sm" onClick={() => void handleCopy()} disabled={!ranAt}>
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
        {TABS.map(({ id, label, icon: Icon }) => (
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
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      {tab === 'overview' ? (
        <HealthOverviewPanel results={results} isRunning={isRunning} ranAt={ranAt} />
      ) : null}
      {tab === 'pages' ? (
        <HealthCheckList
          title="Pages"
          description="Library shell routes and whether session data can load."
          category="pages"
          results={results}
          hrefById={PAGE_HREFS}
        />
      ) : null}
      {tab === 'connections' ? (
        <HealthCheckList
          title="Connections"
          description="Extension bridge, IndexedDB, cloud config, Supabase, and observability."
          category="connections"
          results={results}
        />
      ) : null}
      {tab === 'logs' ? (
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
