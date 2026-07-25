import { createId, getPlayableSteps, type FlowOutlineItem, type FlowPayload } from '@peacock/shared';
import type { FlowDocumentStatus, FlowShareSettings, SavedFlowDocument } from '@/types/savedFlow';
import { normalizeFlowStatus, normalizeFlowTitle, normalizeFlowVersion } from '@/utils/flowDocumentMeta';

interface FlowSnapshotSource {
  flow: FlowPayload | null;
  steps: FlowOutlineItem[];
  screenshotUrls: Record<string, string>;
  shareSettings?: FlowShareSettings | null;
  status?: FlowDocumentStatus;
}

export function buildFlowPayloadWithSteps(source: FlowSnapshotSource): FlowPayload | null {
  if (!source.flow) return null;
  return {
    ...source.flow,
    flow: {
      ...source.flow.flow,
      title: normalizeFlowTitle(source.flow.flow.title),
      version: normalizeFlowVersion(source.flow.flow.version),
    },
    steps: source.steps,
  };
}

export function buildSavedFlowDocument(
  source: FlowSnapshotSource,
  documentId: string,
  existing?: Pick<SavedFlowDocument, 'savedAt' | 'status'>,
): SavedFlowDocument | null {
  const flow = buildFlowPayloadWithSteps(source);
  if (!flow) return null;

  const now = Date.now();
  return {
    id: documentId,
    savedAt: existing?.savedAt ?? now,
    updatedAt: now,
    status: normalizeFlowStatus(
      source.status ?? existing?.status,
      existing ? 'live' : 'draft',
    ),
    flow,
    steps: source.steps,
    screenshotUrls: source.screenshotUrls,
    shareSettings: source.shareSettings ?? undefined,
  };
}

export function createNewDocumentId(): string {
  return createId();
}

export function countPlayableSteps(steps: FlowOutlineItem[]): number {
  return getPlayableSteps(steps).length;
}
