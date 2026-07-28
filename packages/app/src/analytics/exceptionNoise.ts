/**
 * Browser exceptions that are noise for product Error Tracking.
 * Keep this list tight — only drop messages that are known-benign and frequent.
 */
const BENIGN_EXCEPTION_PATTERNS: RegExp[] = [
  /ResizeObserver loop (limit exceeded|completed with undelivered notifications)/i,
];

export function getExceptionMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  if (error && typeof error === 'object' && 'message' in error) {
    const message = (error as { message: unknown }).message;
    if (typeof message === 'string') return message;
  }
  return String(error);
}

export function isBenignAnalyticsException(error: unknown): boolean {
  const message = getExceptionMessage(error);
  return BENIGN_EXCEPTION_PATTERNS.some((pattern) => pattern.test(message));
}
