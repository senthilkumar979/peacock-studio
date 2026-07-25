import { useEffect, useState } from 'react';
import { MailPlus, Shield, UserRound } from 'lucide-react';
import {
  ALL_CAPABILITIES_TRUE,
  DEFAULT_MEMBER_CAPABILITIES,
  type MemberCapabilities,
  type MemberRole,
} from '@/cloud/types/organization';
import { CapabilityChipGrid } from '@/components/org-admin/CapabilityChipGrid';
import { FieldInput, FormField } from '@/components/ui';

interface InviteMemberFormProps {
  busy: boolean;
  onInvite: (input: {
    email: string;
    role: MemberRole;
    capabilities: MemberCapabilities;
  }) => Promise<void>;
  onCancel: () => void;
}

export const InviteMemberForm = ({ busy, onInvite, onCancel }: InviteMemberFormProps) => {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<MemberRole>('member');
  const [capabilities, setCapabilities] = useState<MemberCapabilities>({
    ...DEFAULT_MEMBER_CAPABILITIES,
  });
  const [emailError, setEmailError] = useState<string | null>(null);

  useEffect(() => {
    setCapabilities(
      role === 'admin' ? { ...ALL_CAPABILITIES_TRUE } : { ...DEFAULT_MEMBER_CAPABILITIES },
    );
  }, [role]);

  return (
    <form
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        const trimmed = email.trim();
        if (!trimmed || !trimmed.includes('@')) {
          setEmailError('Enter a valid work email.');
          return;
        }
        setEmailError(null);
        void (async () => {
          await onInvite({ email: trimmed, role, capabilities });
          setEmail('');
          setRole('member');
        })();
      }}
      className="relative overflow-hidden rounded-2xl border border-peacock-200/50 bg-white shadow-sm shadow-peacock-900/5"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-br from-peacock-600 via-peacock-700 to-brand-violet"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl"
      />

      <div className="relative px-6 pb-6 pt-5 sm:px-7">
        <div className="flex items-start justify-between gap-3 text-white">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 inline-flex rounded-xl bg-white/15 p-2.5 ring-1 ring-white/20 backdrop-blur-sm">
              <MailPlus className="h-5 w-5" aria-hidden />
            </span>
            <div>
              <h2 className="text-lg font-semibold tracking-tight">Invite a teammate</h2>
              <p className="mt-1 max-w-xl text-sm text-peacock-100/90">
                Send a secure invitation that expires in 7 days. Set their role and permissions
                before they join.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="shrink-0 rounded-lg px-2.5 py-1.5 text-sm font-medium text-white/90 transition hover:bg-white/10 disabled:opacity-60"
          >
            Cancel
          </button>
        </div>

        <div className="mt-6 space-y-5 rounded-2xl border border-slate-200/80 bg-white/95 p-5 shadow-sm backdrop-blur-sm sm:p-6">
          <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
            <FormField
              label="Work email"
              htmlFor="invite-email"
              className="gap-1.5"
              error={emailError ?? undefined}
            >
              <FieldInput
                id="invite-email"
                type="email"
                value={email}
                hasError={Boolean(emailError)}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (emailError) setEmailError(null);
                }}
                className="rounded-xl border-slate-200 bg-slate-50/80 px-3.5 py-2.5 text-slate-900 placeholder:text-slate-400 focus:border-peacock-400 focus:bg-white focus:ring-peacock-500/20"
                placeholder="colleague@company.com"
                autoComplete="email"
              />
            </FormField>

            <fieldset>
              <legend className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Role
              </legend>
              <div className="mt-1.5 grid grid-cols-2 gap-2">
                {(
                  [
                    {
                      id: 'member' as const,
                      label: 'Member',
                      hint: 'Create & collaborate',
                      icon: UserRound,
                    },
                    {
                      id: 'admin' as const,
                      label: 'Admin',
                      hint: 'Full org control',
                      icon: Shield,
                    },
                  ] as const
                ).map(({ id, label, hint, icon: Icon }) => {
                  const selected = role === id;
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setRole(id)}
                      className={`rounded-xl border px-3 py-2.5 text-left transition ${
                        selected
                          ? 'border-peacock-400 bg-peacock-50 ring-2 ring-peacock-500/20'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <Icon
                          className={`h-4 w-4 ${selected ? 'text-peacock-700' : 'text-slate-400'}`}
                          aria-hidden
                        />
                        <span
                          className={`text-sm font-semibold ${
                            selected ? 'text-peacock-900' : 'text-slate-700'
                          }`}
                        >
                          {label}
                        </span>
                      </span>
                      <span className="mt-1 block text-[11px] text-slate-500">{hint}</span>
                    </button>
                  );
                })}
              </div>
            </fieldset>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Permissions
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Toggle what this person can do once they accept.
            </p>
            <div className="mt-3">
              <CapabilityChipGrid value={capabilities} onChange={setCapabilities} disabled={busy} />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
            <p className="text-xs text-slate-500">Invitation link expires automatically after 7 days.</p>
            <button
              type="submit"
              disabled={busy || !email.trim()}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-peacock-600 to-peacock-700 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-peacock-600/25 transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <MailPlus className="h-4 w-4" aria-hidden />
              Send invitation
            </button>
          </div>
        </div>
      </div>
    </form>
  );
};
