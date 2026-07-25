import type { FlowDocumentStatus } from '@/types/savedFlow';

export const DEFAULT_FLOW_VERSION = '1.0.0';

/** New documents start as draft. Missing status on legacy docs is treated as live. */
export function normalizeFlowStatus(
  status: FlowDocumentStatus | string | null | undefined,
  fallback: FlowDocumentStatus = 'live',
): FlowDocumentStatus {
  if (status === 'draft' || status === 'live') return status;
  return fallback;
}

export function normalizeFlowVersion(version: string | null | undefined): string {
  const trimmed = version?.trim() ?? '';
  return trimmed || DEFAULT_FLOW_VERSION;
}

export function normalizeFlowTitle(title: string | null | undefined): string {
  return title?.trim() || 'Untitled flow';
}

/** Case-insensitive key used for title + version uniqueness. */
export function titleVersionIdentity(
  title: string | null | undefined,
  version: string | null | undefined,
): { titleKey: string; versionKey: string; title: string; version: string } {
  const normalizedTitle = normalizeFlowTitle(title);
  const normalizedVersion = normalizeFlowVersion(version);
  return {
    title: normalizedTitle,
    version: normalizedVersion,
    titleKey: normalizedTitle.toLowerCase(),
    versionKey: normalizedVersion.toLowerCase(),
  };
}

export class TitleVersionConflictError extends Error {
  readonly conflictDocumentId: string;
  readonly title: string;
  readonly version: string;

  constructor(input: { conflictDocumentId: string; title: string; version: string }) {
    super(
      `A documentation named "${input.title}" with version ${input.version} already exists.`,
    );
    this.name = 'TitleVersionConflictError';
    this.conflictDocumentId = input.conflictDocumentId;
    this.title = input.title;
    this.version = input.version;
  }
}

export function isTitleVersionConflictError(
  error: unknown,
): error is TitleVersionConflictError {
  return error instanceof TitleVersionConflictError;
}

/** Prefer semver-like patch bumps; fall back to -copyN suffix. */
export function nextCandidateVersion(baseVersion: string, attempt: number): string {
  if (attempt <= 0) return normalizeFlowVersion(baseVersion);
  const normalized = normalizeFlowVersion(baseVersion);
  const semver = normalized.match(/^(\d+)\.(\d+)\.(\d+)(.*)$/);
  if (semver) {
    const major = Number(semver[1]);
    const minor = Number(semver[2]);
    const patch = Number(semver[3]) + attempt;
    return `${major}.${minor}.${patch}${semver[4] ?? ''}`;
  }
  return `${normalized}-copy${attempt}`;
}
