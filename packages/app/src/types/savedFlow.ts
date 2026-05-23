import type { FlowPayload, FlowStep } from '@peacock/shared';

export interface SavedFlowDocument {
  id: string;
  savedAt: number;
  updatedAt: number;
  flow: FlowPayload;
  steps: FlowStep[];
  screenshotUrls: Record<string, string>;
}

export interface SavedFlowSummary {
  id: string;
  title: string;
  description: string;
  generatedAt: number;
  updatedAt: number;
  stepCount: number;
}

export type DashboardViewMode = 'table' | 'card' | 'list';
