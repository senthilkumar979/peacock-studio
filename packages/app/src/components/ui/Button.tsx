import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '@/components/ui/cn';

type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'danger'
  | 'dangerSolid'
  | 'soft'
  | 'ghost'
  | 'ghostDanger';

type ButtonSize = 'sm' | 'md' | 'icon';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

function buttonClassName(variant: ButtonVariant, size: ButtonSize): string {
  if (variant === 'primary') {
    return cn('btn-peacock', size === 'sm' && 'btn-peacock--sm');
  }
  if (variant === 'secondary') {
    return cn(
      'rounded-lg border border-slate-300 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50',
      size === 'sm' ? 'px-3 py-2' : 'px-4 py-2',
    );
  }
  if (variant === 'danger') {
    return 'rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50';
  }
  if (variant === 'dangerSolid') {
    return 'rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50';
  }
  if (variant === 'soft') {
    return 'inline-flex items-center gap-1 rounded-lg border border-peacock-200 bg-peacock-50 px-2 py-1 text-xs font-medium text-peacock-800 hover:bg-peacock-100 disabled:cursor-not-allowed disabled:opacity-50';
  }
  if (variant === 'ghostDanger') {
    return 'inline-flex items-center justify-center rounded-md p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50';
  }
  return 'inline-flex items-center justify-center rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50';
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', type = 'button', ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      className={cn(buttonClassName(variant, size), className)}
      {...props}
    />
  ),
);

Button.displayName = 'Button';
