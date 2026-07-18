import { Link } from 'react-router-dom';
import { ClipboardCheck, GitBranch, TerminalSquare } from 'lucide-react';
import { isCloudSyncEnabled } from '@/cloud/config';
import { CloudAuthActions } from '@/components/auth/CloudAuthActions';
import {
  FLOW_MAPS_PATH,
  PLAYWRIGHT_TESTS_PATH,
  TEST_CASES_PATH,
} from '@/constants/routes';
import { useSessionMode } from '@/hooks/useSessionMode';

const OUTPUT_LINKS = [
  {
    href: TEST_CASES_PATH,
    title: 'Test cases',
    description: 'QA checklists generated from your flows',
    icon: ClipboardCheck,
  },
  {
    href: PLAYWRIGHT_TESTS_PATH,
    title: 'Playwright tests',
    description: 'Starter automation specs for engineering',
    icon: TerminalSquare,
  },
  {
    href: FLOW_MAPS_PATH,
    title: 'Flow maps',
    description: 'Visual maps of steps, sections, and branches',
    icon: GitBranch,
  },
] as const;

export const DashboardWorkflowOutputsSection = () => {
  const sessionMode = useSessionMode();

  if (!isCloudSyncEnabled()) return null;

  return (
    <section className="mx-auto w-full max-w-7xl px-6 pb-10">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-peacock-700">
          Workflow outputs
        </p>
        <h2 className="mt-2 text-xl font-bold text-slate-900">Generated artifacts</h2>
        <p className="mt-2 max-w-2xl text-sm text-slate-600">
          Browse test cases, Playwright specs, and flow maps you have generated on demand from
          flow documents.
        </p>

        {sessionMode !== 'cloud' ? (
          <div className="mt-5">
            <CloudAuthActions
              variant="callout"
              title="Workflow outputs"
              message="Sign in to generate test cases, Playwright specs, and flow maps."
            />
          </div>
        ) : null}

        <ul className="mt-5 grid gap-3 md:grid-cols-3">
          {OUTPUT_LINKS.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  to={item.href}
                  className="flex h-full flex-col rounded-xl border border-slate-200 p-4 transition hover:border-peacock-200 hover:bg-peacock-50/40"
                >
                  <Icon className="h-5 w-5 text-peacock-700" aria-hidden />
                  <p className="mt-3 font-semibold text-slate-900">{item.title}</p>
                  <p className="mt-1 text-sm text-slate-600">{item.description}</p>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
};
