export function getAppOrigin(): string {
  const raw = import.meta.env.VITE_APP_URL ?? 'http://localhost:5173';
  try {
    return new URL(raw).origin;
  } catch {
    return 'http://localhost:5173';
  }
}

export function getEditorPageUrl(): string {
  const raw = import.meta.env.VITE_APP_URL ?? 'http://localhost:5173/editor';
  return raw.replace(/\/$/, '');
}

export function getDashboardPageUrl(): string {
  return `${getAppOrigin()}${'/dashboard'}`;
}

export function getCaptureEditorPageUrl(captureId: string): string {
  return `${getAppOrigin()}/capture/${encodeURIComponent(captureId)}/edit`;
}
