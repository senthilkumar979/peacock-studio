/** Expected share-gate failure — draft docs, bot checks, rate limits. */
export class ShareNotAllowedError extends Error {
  readonly name = 'ShareNotAllowedError';

  constructor(message: string) {
    super(message);
  }
}

export function isShareNotAllowedError(error: unknown): error is ShareNotAllowedError {
  return error instanceof ShareNotAllowedError;
}
