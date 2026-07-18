import { useCallback, useEffect, useRef, useState } from 'react';

interface UseCopyToClipboardResult {
  copy: (text: string) => Promise<boolean>;
  isCopied: boolean;
}

export function useCopyToClipboard(resetMs = 2000): UseCopyToClipboardResult {
  const [isCopied, setIsCopied] = useState(false);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current !== null) window.clearTimeout(timeoutRef.current);
    };
  }, []);

  const copy = useCallback(
    async (text: string) => {
      if (!text.trim()) return false;

      try {
        await navigator.clipboard.writeText(text);
        setIsCopied(true);
        if (timeoutRef.current !== null) window.clearTimeout(timeoutRef.current);
        timeoutRef.current = window.setTimeout(() => setIsCopied(false), resetMs);
        return true;
      } catch {
        setIsCopied(false);
        return false;
      }
    },
    [resetMs],
  );

  return { copy, isCopied };
}
