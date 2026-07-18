import type { ReactNode } from 'react';
import { FirstTimeTooltip } from '@/components/onboarding/FirstTimeTooltip';

export interface PageHintControl {
  activeHintId: string | null;
  hintStep: (hintId: string) => string;
  dismissHint: (hintId: string) => void;
}

export function isPageHintActive(
  hints: PageHintControl | undefined,
  hintId: string,
): boolean {
  return hints?.activeHintId === hintId;
}

interface HintAnchorProps {
  hints?: PageHintControl;
  hintId: string;
  title: string;
  description: string;
  placement?: 'bottom' | 'bottom-start' | 'top';
  children: ReactNode;
}

export const HintAnchor = ({
  hints,
  hintId,
  title,
  description,
  placement = 'bottom-start',
  children,
}: HintAnchorProps) => (
  <FirstTimeTooltip
    isOpen={isPageHintActive(hints, hintId)}
    stepLabel={hints?.hintStep(hintId) ?? 'Quick tip'}
    title={title}
    description={description}
    placement={placement}
    onDismiss={() => hints?.dismissHint(hintId)}
  >
    {children}
  </FirstTimeTooltip>
);
