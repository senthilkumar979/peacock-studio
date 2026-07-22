import type { useBranchingPlayback } from '@/hooks/useBranchingPlayback';

export type PlayerControlsPositionKind =
  | 'finale'
  | 'section'
  | 'branch'
  | 'path'
  | 'step'
  | 'status';

export interface PlayerControlsPosition {
  kind: PlayerControlsPositionKind;
  title: string;
  subtitle?: string;
  stepNumber?: number;
}

type BranchingPlayback = ReturnType<typeof useBranchingPlayback>;

export function getPlayerControlsPosition(playback: BranchingPlayback): PlayerControlsPosition {
  if (playback.isAtFinale) {
    return { kind: 'finale', title: 'Guide complete' };
  }

  if (playback.isLoadingLinked) {
    return { kind: 'status', title: 'Loading linked demo…' };
  }

  if (playback.linkedError) {
    return { kind: 'status', title: playback.linkedError };
  }

  if (playback.linkedPlayback) {
    const { path, stepIndex, steps } = playback.linkedPlayback;
    const step = steps[stepIndex];
    return {
      kind: 'path',
      title: path.label,
      subtitle: step?.title,
      stepNumber: stepIndex + 1,
    };
  }

  const segment = playback.currentSegment;
  if (!segment) {
    return { kind: 'status', title: 'Guide' };
  }

  if (segment.type === 'section') {
    return { kind: 'section', title: segment.section.title };
  }

  if (segment.type === 'branch') {
    return { kind: 'branch', title: segment.branch.title };
  }

  return {
    kind: 'step',
    title: segment.step.title,
    stepNumber: segment.stepNumber,
  };
}

export function getPlayerControlsProgressLabel(playback: BranchingPlayback): string {
  if (playback.linkedPlayback) {
    const { stepIndex, steps } = playback.linkedPlayback;
    return `Step ${stepIndex + 1} of ${steps.length} in path`;
  }

  return `${playback.currentIndex + 1} of ${playback.totalNavigableSegments} in guide`;
}
