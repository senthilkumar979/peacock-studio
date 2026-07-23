import type { ReactNode } from 'react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/components/ui/cn';

interface ModalFooterActionsProps {
  onCancel: () => void;
  onConfirm: () => void;
  cancelLabel?: string;
  confirmLabel: string;
  cancelDisabled?: boolean;
  confirmDisabled?: boolean;
  isDestructive?: boolean;
  size?: 'sm' | 'md';
  className?: string;
  confirmClassName?: string;
  trailing?: ReactNode;
}

export const ModalFooterActions = ({
  onCancel,
  onConfirm,
  cancelLabel = 'Cancel',
  confirmLabel,
  cancelDisabled,
  confirmDisabled,
  isDestructive = false,
  size = 'md',
  className,
  confirmClassName,
  trailing,
}: ModalFooterActionsProps) => (
  <div className={cn('flex justify-end gap-2', className)}>
    <Button variant="secondary" size={size} onClick={onCancel} disabled={cancelDisabled}>
      {cancelLabel}
    </Button>
    <Button
      variant={isDestructive ? 'dangerSolid' : 'primary'}
      size={size}
      onClick={onConfirm}
      disabled={confirmDisabled}
      className={confirmClassName}
    >
      {confirmLabel}
    </Button>
    {trailing}
  </div>
);
