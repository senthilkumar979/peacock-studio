import type { LucideIcon } from 'lucide-react';
import { ClipboardCheck, GitBranch, TerminalSquare } from 'lucide-react';
import {
  FLOW_MAPS_PATH,
  getFlowMapsDetailPath,
  getPlaywrightTestsDetailPath,
  getTestCasesDetailPath,
  PLAYWRIGHT_TESTS_PATH,
  TEST_CASES_PATH,
} from '@/constants/routes';
import {
  WORKFLOW_ARTIFACT_TYPES,
  type WorkflowArtifactType,
} from '@/types/workflowArtifact';

export interface WorkflowArtifactUiConfig {
  artifactType: WorkflowArtifactType;
  title: string;
  pluralTitle: string;
  description: string;
  generateLabel: string;
  libraryPath: string;
  icon: LucideIcon;
  getDetailPath: (documentId: string) => string;
  fileExtension: string;
}

export const WORKFLOW_ARTIFACT_UI: Record<WorkflowArtifactType, WorkflowArtifactUiConfig> = {
  [WORKFLOW_ARTIFACT_TYPES.testCases]: {
    artifactType: WORKFLOW_ARTIFACT_TYPES.testCases,
    title: 'Test cases',
    pluralTitle: 'Test cases',
    description: 'Human-readable QA checklists generated from your flow steps.',
    generateLabel: 'Generate test cases',
    libraryPath: TEST_CASES_PATH,
    icon: ClipboardCheck,
    getDetailPath: getTestCasesDetailPath,
    fileExtension: 'md',
  },
  [WORKFLOW_ARTIFACT_TYPES.playwright]: {
    artifactType: WORKFLOW_ARTIFACT_TYPES.playwright,
    title: 'Playwright tests',
    pluralTitle: 'Playwright tests',
    description: 'Starter Playwright specs with locators derived from recorded steps.',
    generateLabel: 'Generate Playwright tests',
    libraryPath: PLAYWRIGHT_TESTS_PATH,
    icon: TerminalSquare,
    getDetailPath: getPlaywrightTestsDetailPath,
    fileExtension: 'spec.ts',
  },
  [WORKFLOW_ARTIFACT_TYPES.flowMap]: {
    artifactType: WORKFLOW_ARTIFACT_TYPES.flowMap,
    title: 'Flow map',
    pluralTitle: 'Flow maps',
    description: 'Mermaid flowcharts that visualize sections, steps, and branches.',
    generateLabel: 'Generate flow map',
    libraryPath: FLOW_MAPS_PATH,
    icon: GitBranch,
    getDetailPath: getFlowMapsDetailPath,
    fileExtension: 'md',
  },
};

export function getArtifactUiConfig(
  artifactType: WorkflowArtifactType,
): WorkflowArtifactUiConfig {
  return WORKFLOW_ARTIFACT_UI[artifactType];
}
