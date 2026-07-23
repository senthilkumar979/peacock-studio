import { forwardRef, type SelectHTMLAttributes } from 'react';
import { cn } from '@/components/ui/cn';
import { fieldErrorClassName, fieldInputClassName } from '@/components/ui/fieldStyles';

interface FieldSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  hasError?: boolean;
}

export const FieldSelect = forwardRef<HTMLSelectElement, FieldSelectProps>(
  ({ className, hasError, children, ...props }, ref) => (
    <select
      ref={ref}
      className={cn(fieldInputClassName, hasError && fieldErrorClassName, className)}
      {...props}
    >
      {children}
    </select>
  ),
);

FieldSelect.displayName = 'FieldSelect';
