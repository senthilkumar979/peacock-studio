import { forwardRef, type TextareaHTMLAttributes } from 'react';
import { cn } from '@/components/ui/cn';
import { fieldErrorClassName, fieldTextareaClassName } from '@/components/ui/fieldStyles';

interface FieldTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  hasError?: boolean;
}

export const FieldTextarea = forwardRef<HTMLTextAreaElement, FieldTextareaProps>(
  ({ className, hasError, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(fieldTextareaClassName, hasError && fieldErrorClassName, className)}
      {...props}
    />
  ),
);

FieldTextarea.displayName = 'FieldTextarea';
