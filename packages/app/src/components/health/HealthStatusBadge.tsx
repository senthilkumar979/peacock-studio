import {
  AlertTriangle,
  CheckCircle2,
  CircleDashed,
  Loader2,
  XCircle,
} from 'lucide-react';
import type { HealthStatus } from '@/types/health';

const STATUS_STYLES: Record<
  HealthStatus,
  { label: string; className: string; Icon: typeof CheckCircle2 }
> = {
  pass: {
    label: 'Pass',
    className: 'bg-emerald-50 text-emerald-800 ring-emerald-200',
    Icon: CheckCircle2,
  },
  warn: {
    label: 'Warn',
    className: 'bg-amber-50 text-amber-900 ring-amber-200',
    Icon: AlertTriangle,
  },
  fail: {
    label: 'Fail',
    className: 'bg-red-50 text-red-800 ring-red-200',
    Icon: XCircle,
  },
  skip: {
    label: 'Skip',
    className: 'bg-slate-50 text-slate-600 ring-slate-200',
    Icon: CircleDashed,
  },
  checking: {
    label: 'Checking',
    className: 'bg-peacock-50 text-peacock-800 ring-peacock-200',
    Icon: Loader2,
  },
};

interface HealthStatusBadgeProps {
  status: HealthStatus;
}

export const HealthStatusBadge = ({ status }: HealthStatusBadgeProps) => {
  const { label, className, Icon } = STATUS_STYLES[status];
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ring-1 ${className}`}
    >
      <Icon
        className={`h-3.5 w-3.5 ${status === 'checking' ? 'animate-spin' : ''}`}
        aria-hidden
      />
      {label}
    </span>
  );
};
