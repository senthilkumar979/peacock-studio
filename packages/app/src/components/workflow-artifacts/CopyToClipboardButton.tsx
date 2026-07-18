import { Check, Copy } from 'lucide-react';
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard';

interface CopyToClipboardButtonProps {
  content: string;
  label?: string;
  copiedLabel?: string;
  className?: string;
}

export const CopyToClipboardButton = ({
  content,
  label = 'Copy',
  copiedLabel = 'Copied!',
  className = 'inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50',
}: CopyToClipboardButtonProps) => {
  const { copy, isCopied } = useCopyToClipboard();

  return (
    <button
      type="button"
      onClick={() => void copy(content)}
      className={className}
      aria-live="polite"
    >
      {isCopied ? (
        <Check className="h-4 w-4 text-emerald-600" aria-hidden />
      ) : (
        <Copy className="h-4 w-4" aria-hidden />
      )}
      {isCopied ? copiedLabel : label}
    </button>
  );
};
