import { Link } from 'react-router-dom';
import { CheckSquare, Share2, UserPlus } from 'lucide-react';
import { DASHBOARD_PATH } from '@/constants/routes';

interface OrgAdminFirstWeekChecklistProps {
  onOpenMembers: () => void;
  onOpenActivity?: () => void;
}

/** Thin first-week checklist when the org still has only the admin (no teammates). */
export const OrgAdminFirstWeekChecklist = ({
  onOpenMembers,
  onOpenActivity,
}: OrgAdminFirstWeekChecklistProps) => (
  <section className="rounded-2xl border border-dashed border-peacock-200 bg-peacock-50/40 p-5">
    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-peacock-700">
      First week
    </p>
    <h2 className="mt-1 text-base font-semibold text-slate-900">Get your workspace ready</h2>
    <p className="mt-1 text-sm text-slate-600">
      You&apos;re the only member so far. A few steps help the team start documenting together.
    </p>
    <ul className="mt-4 space-y-3">
      <li className="flex items-start gap-3 rounded-xl border border-white/80 bg-white/80 px-3 py-2.5">
        <span className="mt-0.5 inline-flex rounded-lg bg-peacock-50 p-2 text-peacock-700 ring-1 ring-peacock-100">
          <UserPlus className="h-4 w-4" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-slate-900">Invite a teammate</p>
          <p className="mt-0.5 text-xs leading-relaxed text-slate-600">
            Add an editor so docs stay owned by the team, not one inbox.
          </p>
          <button
            type="button"
            onClick={onOpenMembers}
            className="mt-1.5 text-xs font-semibold text-peacock-700 hover:text-peacock-900"
          >
            Open Members →
          </button>
        </div>
      </li>
      <li className="flex items-start gap-3 rounded-xl border border-white/80 bg-white/80 px-3 py-2.5">
        <span className="mt-0.5 inline-flex rounded-lg bg-peacock-50 p-2 text-peacock-700 ring-1 ring-peacock-100">
          <Share2 className="h-4 w-4" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-slate-900">Share a flow doc</p>
          <p className="mt-0.5 text-xs leading-relaxed text-slate-600">
            Publish a secure share link from any saved documentation.
          </p>
          <Link
            to={DASHBOARD_PATH}
            className="mt-1.5 inline-block text-xs font-semibold text-peacock-700 hover:text-peacock-900"
          >
            Go to library →
          </Link>
        </div>
      </li>
      <li className="flex items-start gap-3 rounded-xl border border-white/80 bg-white/80 px-3 py-2.5">
        <span className="mt-0.5 inline-flex rounded-lg bg-peacock-50 p-2 text-peacock-700 ring-1 ring-peacock-100">
          <CheckSquare className="h-4 w-4" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-slate-900">Review workspace activity</p>
          <p className="mt-0.5 text-xs leading-relaxed text-slate-600">
            Check the Activity tab after the first views and exports land.
          </p>
          {onOpenActivity ? (
            <button
              type="button"
              onClick={onOpenActivity}
              className="mt-1.5 text-xs font-semibold text-peacock-700 hover:text-peacock-900"
            >
              Open Activity →
            </button>
          ) : null}
        </div>
      </li>
    </ul>
  </section>
);
