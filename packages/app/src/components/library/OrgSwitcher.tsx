import { ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { refreshCloudMemberships } from '@/components/auth/CloudSyncProvider';
import { useActiveOrganization } from '@/hooks/useOrganization';
import { notifyPromise } from '@/utils/notify';

export const OrgSwitcher = () => {
  const { memberships, organizationId, organizationName } = useActiveOrganization();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  if (memberships.length <= 1) {
    return organizationName ? (
      <span className="hidden max-w-[10rem] truncate text-xs text-slate-500 lg:inline">
        {organizationName}
      </span>
    ) : null;
  }

  return (
    <div className="relative">
      <button
        type="button"
        disabled={busy}
        onClick={() => setOpen((value) => !value)}
        className="inline-flex max-w-[12rem] items-center gap-1 rounded-xl border border-slate-200 bg-white px-2.5 py-2 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50"
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <span className="truncate">{organizationName ?? 'Workspace'}</span>
        <ChevronDown className="h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden />
      </button>
      {open ? (
        <ul
          role="listbox"
          className="absolute right-0 z-50 mt-1 min-w-[14rem] overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-lg"
        >
          {memberships.map((membership) => (
            <li key={membership.organizationId}>
              <button
                type="button"
                role="option"
                aria-selected={membership.organizationId === organizationId}
                disabled={busy}
                onClick={() => {
                  void (async () => {
                    if (membership.organizationId === organizationId) {
                      setOpen(false);
                      return;
                    }
                    setBusy(true);
                    try {
                      await notifyPromise(
                        refreshCloudMemberships(membership.organizationId),
                        {
                          loading: 'Switching workspace…',
                          success: `Switched to ${membership.organizationName}`,
                          context: 'Switch organization',
                        },
                      );
                      setOpen(false);
                      window.location.assign('/dashboard');
                    } catch {
                      // Toast already shown
                    } finally {
                      setBusy(false);
                    }
                  })();
                }}
                className={`flex w-full flex-col items-start px-3 py-2 text-left text-sm hover:bg-slate-50 ${
                  membership.organizationId === organizationId
                    ? 'bg-peacock-50 text-peacock-800'
                    : 'text-slate-700'
                }`}
              >
                <span className="font-medium">{membership.organizationName}</span>
                <span className="text-xs text-slate-500">
                  {membership.workspaceType} · {membership.role}
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
};
