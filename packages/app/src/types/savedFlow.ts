import type { FlowOutlineItem, FlowPayload } from '@peacock/shared';

export interface FlowShareSettings {
  includeMainFlow: boolean;
  enabledPathIds: string[];
  enabledBranchIds: string[];
}

export interface SavedFlowDocument {
  id: string;
  savedAt: number;
  updatedAt: number;
  flow: FlowPayload;
  steps: FlowOutlineItem[];
  screenshotUrls: Record<string, string>;
  shareSettings?: FlowShareSettings;
}

export interface SavedFlowSummary {
  id: string;
  title: string;
  description: string;
  version: string;
  generatedAt: number;
  updatedAt: number;
  stepCount: number;
}

export type DashboardViewMode = 'table' | 'card' | 'list';
