/** PostgREST / Supabase auth errors surfaced as plain objects or StorageApiError. */
export function isPostgrestSessionError(error: unknown): boolean {
  if (typeof error === 'string') {
    return /jwt expired|exp claim timestamp check failed|session expired/i.test(error);
  }
  if (!error || typeof error !== 'object') return false;

  const record = error as { code?: string | number; message?: string; name?: string };
  const code = String(record.code ?? '');
  const msg = String(record.message ?? record.name ?? '').toLowerCase();

  return (
    code === 'PGRST303' ||
    code === 'PGRST301' ||
    /jwt expired|exp claim timestamp check failed|session expired|invalid jwt/i.test(msg)
  );
}
