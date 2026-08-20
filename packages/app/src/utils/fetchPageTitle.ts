export async function fetchPageTitle(url: string): Promise<string | null> {
  try {
    const response = await fetch(`/api/page-title?url=${encodeURIComponent(url)}`);
    if (!response.ok) return null;
    const payload = (await response.json()) as { title?: string | null };
    const title = payload.title?.trim();
    return title || null;
  } catch {
    return null;
  }
}
