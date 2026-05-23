import { Link } from 'react-router-dom';
import { AppHeader } from '@/components/AppHeader';
import { PEACOCK_APP_NAME } from '@/constants/branding';

export const Dashboard = () => (
  <div className="flex min-h-screen flex-col">
    <AppHeader eyebrow={PEACOCK_APP_NAME} title="Flow recorder & editor" />
    <div className="mx-auto flex flex-1 max-w-3xl flex-col justify-center gap-6 px-6 py-10">
      <p className="text-slate-600">
        Install the browser extension, record a flow, and stop recording to open the editor automatically.
      </p>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">Getting started</h2>
      <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-slate-600">
        <li>Load the extension from <code className="rounded bg-slate-100 px-1">packages/extension/dist</code></li>
        <li>Set <code className="rounded bg-slate-100 px-1">VITE_EXTENSION_ID</code> in <code className="rounded bg-slate-100 px-1">packages/app/.env</code></li>
        <li>Run <code className="rounded bg-slate-100 px-1">pnpm dev:app</code> and start recording</li>
      </ol>
      <Link
        to="/editor"
        className="mt-5 mr-3 inline-block rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
      >
        Open editor
      </Link>
      <Link
        to="/player"
        className="mt-5 inline-block rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
      >
        Open player
      </Link>
      </div>
    </div>
  </div>
);
