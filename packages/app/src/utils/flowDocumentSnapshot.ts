import { createId, getPlayableSteps, type FlowOutlineItem, type FlowPayload } from '@peacock/shared';
import type { SavedFlowDocument } from '@/types/savedFlow';

import type { FlowShareSettings } from '@/types/savedFlow';

interface FlowSnapshotSource {
  flow: FlowPayload | null;
  steps: FlowOutlineItem[];
  screenshotUrls: Record<string, string>;
  shareSettings?: FlowShareSettings | null;
}

export function buildFlowPayloadWithSteps(source: FlowSnapshotSource): FlowPayload | null {
  if (!source.flow) return null;
  return { ...source.flow, steps: source.steps };
}

export function buildSavedFlowDocument(
  source: FlowSnapshotSource,
  documentId: string,
  existing?: Pick<SavedFlowDocument, 'savedAt'>
): SavedFlowDocument | null {
  const flow = buildFlowPayloadWithSteps(source);
  if (!flow) return null;

  const now = Date.now();
  return {
    id: documentId,
    savedAt: existing?.savedAt ?? now,
    updatedAt: now,
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
