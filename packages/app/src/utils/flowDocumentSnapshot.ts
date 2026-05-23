import { createId, type FlowPayload, type FlowStep } from '@peacock/shared';
import type { SavedFlowDocument } from '@/types/savedFlow';

interface FlowSnapshotSource {
  flow: FlowPayload | null;
  steps: FlowStep[];
  screenshotUrls: Record<string, string>;
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
  };
}

export function createNewDocumentId(): string {
  return createId();
}
