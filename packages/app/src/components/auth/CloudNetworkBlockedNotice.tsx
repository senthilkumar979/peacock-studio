import type { ClassifiedCloudInitError } from '@/cloud/cloudInitErrors';

export interface CloudNetworkBlockedNoticeProps {
  error: ClassifiedCloudInitError;
  /** When true, show the local guest library fallback note. */
  showLocalLibraryNote?: boolean;
}

export const CloudNetworkBlockedNotice = ({
  error,
  showLocalLibraryNote = true,
}: CloudNetworkBlockedNoticeProps) => (
  <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950 shadow-sm">
    <p className="font-semibold">{error.title}</p>
    <p className="mt-1 text-amber-900/90">{error.message}</p>
    {error.workarounds.length > 0 ? (
      <ul className="mt-3 list-disc space-y-1 pl-5 text-xs text-amber-900/90">
        {error.workarounds.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    ) : null}
    {showLocalLibraryNote ? (
      <p className="mt-3 text-xs text-amber-800/80">
        Showing your local guest library for now. Cloud sync will resume when this browser can reach
        Peacock&apos;s cloud servers.
      </p>
    ) : null}
  </div>
);

export interface CloudInitErrorNoticeProps {
  error: ClassifiedCloudInitError;
  showLocalLibraryNote?: boolean;
}

/** Generic cloud init failure — auth/migration copy or network-block workarounds. */
export const CloudInitErrorNotice = ({
  error,
  showLocalLibraryNote = true,
}: CloudInitErrorNoticeProps) => {
  if (error.kind === 'network_blocked') {
    return <CloudNetworkBlockedNotice error={error} showLocalLibraryNote={showLocalLibraryNote} />;
  }

  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950 shadow-sm">
      <p className="font-semibold">{error.title}</p>
      <p className="mt-1 text-amber-900/90">{error.message}</p>
      {showLocalLibraryNote ? (
        <p className="mt-2 text-xs text-amber-800/80">
          Showing your local guest library for now. Sign out from the avatar menu, then sign back in
          after fixing Clerk ↔ Supabase auth.
        </p>
      ) : null}
    </div>
  );
};

export interface CloudInitConnectingErrorProps {
  error: ClassifiedCloudInitError;
  onRetry?: () => void;
}

export const CloudInitConnectingError = ({
  error,
  onRetry,
}: CloudInitConnectingErrorProps) => (
  <div className="mx-auto w-full max-w-lg rounded-2xl border border-slate-200 bg-white px-6 py-8 text-center shadow-sm">
    <h2 className="text-lg font-semibold text-slate-900">{error.title}</h2>
    <p className="mt-2 text-sm leading-relaxed text-slate-600">{error.message}</p>
    {error.workarounds.length > 0 ? (
      <ul className="mt-4 list-disc space-y-1 pl-5 text-left text-xs text-slate-600">
        {error.workarounds.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    ) : null}
    {onRetry ? (
      <button
        type="button"
        onClick={onRetry}
        className="btn-peacock btn-peacock--sm mt-6"
      >
        Retry
      </button>
    ) : null}
  </div>
);
