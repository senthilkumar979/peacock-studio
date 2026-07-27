/**
 * Stub for optional AI step-description rewrite.
 *
 * TODO: Wire a real LLM rewrite behind an explicit user opt-in (never default-on).
 * Deterministic step descriptions from `@peacock/shared` must remain the default path.
 */
export function rewriteStepDescription(text: string): string {
  return text;
}
