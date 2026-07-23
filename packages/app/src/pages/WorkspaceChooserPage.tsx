import { useEffect, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Building2, User } from 'lucide-react';
import { refreshCloudMemberships } from '@/components/auth/CloudSyncProvider';
import { PeacockStudioLoader } from '@/components/PeacockStudioLoader';
import {
  acceptOrganizationInvitation,
  createPersonalWorkspace,
  createTeamWorkspace,
  listMyPendingInvitations,
} from '@/cloud/repositories/organizationRepository';
import { DASHBOARD_PATH, LANDING_PATH, ORG_ADMIN_PATH } from '@/constants/routes';
import { useCloudAuthContext, useNeedsWorkspaceOnboarding } from '@/hooks/useOrganization';
import { useSessionMode } from '@/hooks/useSessionMode';
import type { PendingInvitation } from '@/cloud/types/organization';
import { reportAppError } from '@/utils/appError';
import { notifyError, notifyPromise } from '@/utils/notify';
import { AnalyticsEvents } from '@/analytics/events';

type ChooserMode = 'choose' | 'team-form';

function formatExpiry(expiresAt: string): string {
  const ms = new Date(expiresAt).getTime() - Date.now();
  if (ms <= 0) return 'Expired';
  const days = Math.floor(ms / (24 * 60 * 60 * 1000));
  const hours = Math.floor((ms % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
  if (days > 0) return `${days}d ${hours}h left`;
  const minutes = Math.floor((ms % (60 * 60 * 1000)) / (60 * 1000));
  return hours > 0 ? `${hours}h ${minutes}m left` : `${minutes}m left`;
}

export const WorkspaceChooserPage = () => {
  const navigate = useNavigate();
  const sessionMode = useSessionMode();
  const needsOnboarding = useNeedsWorkspaceOnboarding();
  const context = useCloudAuthContext();

  const [pendingInvites, setPendingInvites] = useState<PendingInvitation[]>([]);
  const [loadingInvites, setLoadingInvites] = useState(true);
  const [mode, setMode] = useState<ChooserMode>('choose');
  const [companyName, setCompanyName] = useState('');
  const [website, setWebsite] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (sessionMode !== 'onboarding' || !context) {
      setLoadingInvites(false);
      return;
    }

    let cancelled = false;
    const load = async () => {
      try {
        const invites = await listMyPendingInvitations();
        if (!cancelled) setPendingInvites(invites);
      } catch (err) {
        const classified = reportAppError('Failed to load pending invitations', err);
        if (!cancelled) {
          setError(classified.userMessage);
          notifyError(classified.title, classified.userMessage);
        }
      } finally {
        if (!cancelled) setLoadingInvites(false);
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [sessionMode, context]);

  if (sessionMode === 'loading' || sessionMode === 'connecting') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <PeacockStudioLoader size={96} />
      </div>
    );
  }

  if (sessionMode === 'guest') {
    return <Navigate to="/sign-in" replace />;
  }

  if (sessionMode === 'cloud' && !needsOnboarding) {
    return <Navigate to={DASHBOARD_PATH} replace />;
  }

  const handleIndividual = async () => {
    setBusy(true);
    setError(null);
    try {
      const orgId = await notifyPromise(
        createPersonalWorkspace(context?.userDisplayName ?? null).then(async (id) => {
          await refreshCloudMemberships(id);
          return id;
        }),
        {
          loading: 'Creating workspace…',
          success: 'Personal workspace ready',
          context: 'Create personal workspace',
          event: AnalyticsEvents.workspaceCreatedPersonal,
        },
      );
      void orgId;
      navigate(DASHBOARD_PATH, { replace: true });
    } catch (err) {
      setError(reportAppError('Failed to create personal workspace', err).userMessage);
    } finally {
      setBusy(false);
    }
  };

  const handleTeam = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const orgId = await notifyPromise(
        createTeamWorkspace(companyName, website).then(async (id) => {
          await refreshCloudMemberships(id);
          return id;
        }),
        {
          loading: 'Creating organization…',
          success: 'Team workspace created',
          successDescription: 'Invite teammates from Admin when you are ready.',
          context: 'Create team workspace',
          event: AnalyticsEvents.workspaceCreatedTeam,
        },
      );
      void orgId;
      navigate(ORG_ADMIN_PATH, { replace: true });
    } catch (err) {
      setError(reportAppError('Failed to create organization', err).userMessage);
    } finally {
      setBusy(false);
    }
  };

  const handleAcceptInvite = async (token: string) => {
    setBusy(true);
    setError(null);
    try {
      const orgId = await notifyPromise(
        acceptOrganizationInvitation(token).then(async (id) => {
          await refreshCloudMemberships(id);
          return id;
        }),
        {
          loading: 'Joining workspace…',
          success: 'You joined the workspace',
          context: 'Accept organization invitation',
          event: AnalyticsEvents.workspaceInviteAccepted,
        },
      );
      void orgId;
      navigate(DASHBOARD_PATH, { replace: true });
    } catch (err) {
      setError(reportAppError('Failed to accept invitation', err).userMessage);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100 px-6 py-12">
      <Link to={LANDING_PATH} className="mb-8 text-sm font-semibold text-peacock-700 hover:text-peacock-800">
        ← Peacock Studio
      </Link>

      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">Set up your workspace</h1>
        <p className="mt-2 text-sm text-slate-600">
          Choose how you want to use Peacock, or accept an invitation if you were invited to a team.
        </p>

        {error ? (
          <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
            {error}
          </p>
        ) : null}

        {loadingInvites ? (
          <div className="flex justify-center py-10">
            <PeacockStudioLoader size={72} />
          </div>
        ) : pendingInvites.length > 0 ? (
          <div className="mt-6 space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Pending invitations
            </h2>
            {pendingInvites.map((invite) => (
              <div
                key={invite.id}
                className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-medium text-slate-900">{invite.organizationName}</p>
                  <p className="text-sm text-slate-500">
                    Role: {invite.role} · {formatExpiry(invite.expiresAt)}
                  </p>
                </div>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void handleAcceptInvite(invite.token)}
                  className="rounded-lg bg-peacock-600 px-4 py-2 text-sm font-semibold text-white hover:bg-peacock-700 disabled:opacity-60"
                >
                  Accept
                </button>
              </div>
            ))}
            <p className="pt-2 text-center text-xs text-slate-400">
              Or create your own workspace below
            </p>
          </div>
        ) : null}

        {mode === 'choose' ? (
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              disabled={busy}
              onClick={() => void handleIndividual()}
              className="flex flex-col items-start gap-2 rounded-xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:border-peacock-300 hover:ring-1 hover:ring-peacock-200 disabled:opacity-60"
            >
              <User className="h-6 w-6 text-peacock-600" aria-hidden />
              <span className="font-semibold text-slate-900">Individual</span>
              <span className="text-sm text-slate-500">
                Personal workspace. You are the admin.
              </span>
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => setMode('team-form')}
              className="flex flex-col items-start gap-2 rounded-xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:border-peacock-300 hover:ring-1 hover:ring-peacock-200 disabled:opacity-60"
            >
              <Building2 className="h-6 w-6 text-peacock-600" aria-hidden />
              <span className="font-semibold text-slate-900">Organization</span>
              <span className="text-sm text-slate-500">
                Team workspace with invites and roles.
              </span>
            </button>
          </div>
        ) : (
          <form onSubmit={(e) => void handleTeam(e)} className="mt-6 space-y-4">
            <div>
              <label htmlFor="company-name" className="block text-sm font-medium text-slate-700">
                Company name
              </label>
              <input
                id="company-name"
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-peacock-500 focus:ring-2"
                placeholder="Acme Inc."
              />
            </div>
            <div>
              <label htmlFor="website" className="block text-sm font-medium text-slate-700">
                Website
              </label>
              <input
                id="website"
                required
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-peacock-500 focus:ring-2"
                placeholder="https://example.com"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={busy}
                onClick={() => setMode('choose')}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={busy}
                className="rounded-lg bg-peacock-600 px-4 py-2 text-sm font-semibold text-white hover:bg-peacock-700 disabled:opacity-60"
              >
                Create organization
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
