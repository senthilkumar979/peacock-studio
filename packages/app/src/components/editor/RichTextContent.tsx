import type { ReactNode } from 'react';
import { isEmptyRichText, sanitizeRichHtml } from '@/utils/richText';

export interface RichTextContentProps {
  html: string;
  className?: string;
  emptyFallback?: ReactNode;
}

const CONTENT_CLASS =
  '[&_p]:my-1 [&_p]:leading-relaxed ' +
  '[&_h1]:my-2 [&_h1]:text-2xl [&_h1]:font-bold ' +
  '[&_h2]:my-1.5 [&_h2]:text-xl [&_h2]:font-semibold ' +
  '[&_h3]:my-1 [&_h3]:text-lg [&_h3]:font-semibold ' +
  '[&_u]:underline [&_strong]:font-bold [&_em]:italic ' +
  '[&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-5 ' +
  '[&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-5 ' +
  '[&_li]:my-0.5 [&_li]:leading-relaxed ' +
  '[&_hr]:my-3 [&_hr]:border-0 [&_hr]:border-t [&_hr]:border-slate-300';

export const RichTextContent = ({
  html,
  className = '',
  emptyFallback = null,
}: RichTextContentProps) => {
  if (isEmptyRichText(html)) return <>{emptyFallback}</>;

  return (
    <div
      className={`${CONTENT_CLASS} ${className}`}
      dangerouslySetInnerHTML={{ __html: sanitizeRichHtml(html) }}
    />
  );
};
