import type { ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/components/ui/cn';

interface ModalFooterActionsProps {
  onCancel: () => void;
  onConfirm: () => void;
  cancelLabel?: string;
  confirmLabel: string;
  cancelDisabled?: boolean;
  confirmDisabled?: boolean;
  isConfirmLoading?: boolean;
  confirmLoadingLabel?: string;
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
  isConfirmLoading = false,
  confirmLoadingLabel = 'Saving…',
  isDestructive = false,
  size = 'md',
  className,
  confirmClassName,
  trailing,
}: ModalFooterActionsProps) => (
  <div className={cn('flex justify-end gap-2', className)}>
    <Button
      variant="secondary"
      size={size}
      onClick={onCancel}
      disabled={cancelDisabled || isConfirmLoading}
    >
      {cancelLabel}
    </Button>
    <Button
      variant={isDestructive ? 'dangerSolid' : 'primary'}
      size={size}
      onClick={onConfirm}
      disabled={confirmDisabled || isConfirmLoading}
      className={cn(isConfirmLoading && 'gap-2', confirmClassName)}
    >
      {isConfirmLoading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          {confirmLoadingLabel}
        </>
      ) : (
        confirmLabel
      )}
    </Button>
    {trailing}
  </div>
);
