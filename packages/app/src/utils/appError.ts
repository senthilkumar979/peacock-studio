export const GENERIC_USER_ERROR_MESSAGE =
  'Something went wrong. Please try again or refresh the page.';

export function logAppError(context: string, error: unknown): void {
  console.error(`[Peacock] ${context}`, error);
}
