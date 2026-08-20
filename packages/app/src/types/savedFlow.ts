import type { FlowOutlineItem, FlowPayload, StepResource } from '@peacock/shared';

export type FlowDocumentStatus = 'draft' | 'live';

export interface FlowShareSettings {
  includeMainFlow: boolean;
  enabledPathIds: string[];
  enabledBranchIds: string[];
}

export interface SavedFlowDocument {
  id: string;
  savedAt: number;
  updatedAt: number;
  /** Publish lifecycle — drafts cannot be shared publicly. */
  status: FlowDocumentStatus;
  /** Email of creator when known (cloud); null for guest/legacy. */
  createdBy?: string | null;
  /** Email of last editor when known (cloud); null for guest/legacy. */
  updatedBy?: string | null;
  flow: FlowPayload;
  steps: FlowOutlineItem[];
  screenshotUrls: Record<string, string>;
  shareSettings?: FlowShareSettings;
  /** Loaded from step_resources store; not persisted inside documents JSON. */
  stepResources?: StepResource[];
}

export interface SavedFlowSummary {
  id: string;
  title: string;
  description: string;
  version: string;
  status: FlowDocumentStatus;
  generatedAt: number;
  updatedAt: number;
  createdBy?: string | null;
  updatedBy?: string | null;
  stepCount: number;
}

export type DashboardViewMode = 'table' | 'card' | 'list';
