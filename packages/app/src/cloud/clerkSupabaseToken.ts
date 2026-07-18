function looksLikeJwt(token: string): boolean {
  const parts = token.split('.');
  return parts.length === 3 && parts.every((part) => part.length > 0);
}

export async function fetchClerkSupabaseAccessToken(
  getSessionToken: () => Promise<string | null>,
): Promise<string> {
  const token = await getSessionToken();
  if (!token) {
    throw new Error('Clerk session is not ready yet. Wait a moment and refresh.');
  }
  if (!looksLikeJwt(token)) {
    throw new Error(
      'Clerk returned an invalid session token. Activate the Supabase integration in Clerk and add Clerk as a third-party auth provider in Supabase.',
    );
  }
  return token;
}
