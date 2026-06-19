import { Layers } from 'lucide-react';

interface FlowStepCountBadgeProps {
  stepCount: number;
}

export const FlowStepCountBadge = ({ stepCount }: FlowStepCountBadgeProps) => (
  <span className="inline-flex items-center gap-1.5 rounded-full bg-peacock-50 px-2.5 py-0.5 text-xs font-semibold text-peacock-700 ring-1 ring-peacock-100">
    <Layers className="h-3.5 w-3.5 shrink-0 text-peacock-500" aria-hidden />
    {stepCount} {stepCount === 1 ? 'step' : 'steps'}
  </span>
);
