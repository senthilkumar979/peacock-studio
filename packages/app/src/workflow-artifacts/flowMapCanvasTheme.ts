import type { FlowMapNodeStatus } from '@peacock/shared';
import type { LucideIcon } from 'lucide-react';
import {
  GitBranch,
  Layers3,
  MousePointerClick,
  Signpost,
  Sparkles,
} from 'lucide-react';
import type { WorkflowGraph, WorkflowGraphNode } from '@peacock/shared';

export interface FlowMapKindTheme {
  gradient: string;
  accent: string;
  ring: string;
  edgeStroke: string;
  icon: LucideIcon;
  label: string;
}

export const FLOW_MAP_KIND_THEMES: Record<WorkflowGraphNode['kind'], FlowMapKindTheme> = {
  root: {
    gradient: 'from-peacock-600 to-brand-cyan',
    accent: 'text-peacock-600',
    ring: 'ring-peacock-200',
    edgeStroke: '#0d9488',
    icon: Sparkles,
    label: 'Flow start',
  },
  section: {
    gradient: 'from-violet-500 to-purple-600',
    accent: 'text-violet-600',
    ring: 'ring-violet-200',
    edgeStroke: '#7c3aed',
    icon: Layers3,
    label: 'Section',
  },
  step: {
    gradient: 'from-slate-700 to-slate-900',
    accent: 'text-slate-700',
    ring: 'ring-slate-200',
    edgeStroke: '#475569',
    icon: MousePointerClick,
    label: 'Step',
  },
  branch: {
    gradient: 'from-amber-500 to-orange-600',
    accent: 'text-amber-600',
    ring: 'ring-amber-200',
    edgeStroke: '#d97706',
    icon: GitBranch,
    label: 'Branch',
  },
  path: {
    gradient: 'from-cyan-500 to-teal-600',
    accent: 'text-cyan-600',
    ring: 'ring-cyan-200',
    edgeStroke: '#0891b2',
    icon: Signpost,
    label: 'Path',
  },
};

export interface FlowMapStatusTheme {
  label: string;
  badgeClass: string;
  dotClass: string;
}

export const FLOW_MAP_STATUS_THEMES: Record<FlowMapNodeStatus, FlowMapStatusTheme> = {
  draft: {
    label: 'Draft',
    badgeClass: 'bg-slate-100 text-slate-700 ring-slate-200',
    dotClass: 'bg-slate-400',
  },
  in_review: {
    label: 'In review',
    badgeClass: 'bg-amber-100 text-amber-800 ring-amber-200',
    dotClass: 'bg-amber-500',
  },
  approved: {
    label: 'Approved',
    badgeClass: 'bg-emerald-100 text-emerald-800 ring-emerald-200',
    dotClass: 'bg-emerald-500',
  },
  needs_work: {
    label: 'Needs work',
    badgeClass: 'bg-rose-100 text-rose-800 ring-rose-200',
    dotClass: 'bg-rose-500',
  },
};

export const FLOW_MAP_STATUS_OPTIONS = Object.entries(FLOW_MAP_STATUS_THEMES).map(
  ([value, theme]) => ({
    value: value as FlowMapNodeStatus,
    label: theme.label,
  }),
);

export interface WorkflowGraphStats {
  steps: number;
  sections: number;
  branches: number;
  paths: number;
}

export function getWorkflowGraphStats(graph: WorkflowGraph): WorkflowGraphStats {
  return {
    steps: graph.nodes.filter((node) => node.kind === 'step').length,
    sections: graph.nodes.filter((node) => node.kind === 'section').length,
    branches: graph.nodes.filter((node) => node.kind === 'branch').length,
    paths: graph.nodes.filter((node) => node.kind === 'path').length,
  };
}

export const FLOW_MAP_NODE_WIDTH = 268;
export const FLOW_MAP_NODE_HEIGHT = 112;

export const FLOW_MAP_LAYOUT = {
  gapX: 80,
  gapY: 104,
  marginX: 88,
  marginY: 48,
  compactCols: 3,
  compactGapX: 88,
  compactGapY: 112,
  branchPathExtraY: 52,
} as const;
