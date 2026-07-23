import { Children, cloneElement, isValidElement, useId, type ReactElement, type ReactNode } from 'react';
import { cn } from '@/components/ui/cn';

interface FormFieldProps {
  label: string;
  hint?: string;
  error?: string;
  htmlFor?: string;
  className?: string;
  children: ReactNode;
}

export const FormField = ({
  label,
  hint,
  error,
  htmlFor,
  className,
  children,
}: FormFieldProps) => {
  const generatedId = useId();
  const fieldId = htmlFor ?? generatedId;
  const hintId = hint ? `${fieldId}-hint` : undefined;
  const errorId = error ? `${fieldId}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined;

  const control = Children.map(children, (child) => {
    if (!isValidElement(child)) return child;
    const element = child as ReactElement<{ id?: string; 'aria-describedby'?: string; 'aria-invalid'?: boolean }>;
    return cloneElement(element, {
      id: element.props.id ?? fieldId,
      'aria-describedby': element.props['aria-describedby'] ?? describedBy,
      'aria-invalid': error ? true : element.props['aria-invalid'],
    });
  });

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label htmlFor={fieldId} className="text-sm font-medium text-slate-700">
        {label}
      </label>
      {hint ? (
        <p id={hintId} className="text-xs text-slate-500">
          {hint}
        </p>
      ) : null}
      {control}
      {error ? (
        <p id={errorId} className="text-sm text-red-600">
          {error}
        </p>
      ) : null}
    </div>
  );
};
