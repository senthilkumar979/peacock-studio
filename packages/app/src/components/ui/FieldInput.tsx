import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '@/components/ui/cn';
import { fieldErrorClassName, fieldInputClassName } from '@/components/ui/fieldStyles';

interface FieldInputProps extends InputHTMLAttributes<HTMLInputElement> {
  hasError?: boolean;
}

export const FieldInput = forwardRef<HTMLInputElement, FieldInputProps>(
  ({ className, hasError, type = 'text', ...props }, ref) => (
    <input
      ref={ref}
      type={type}
      className={cn(fieldInputClassName, hasError && fieldErrorClassName, className)}
      {...props}
    />
  ),
);

FieldInput.displayName = 'FieldInput';
