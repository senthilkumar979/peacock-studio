import { Link } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';
import { ChromeWebStoreLink } from '@/components/extension/ChromeWebStoreLink';

interface LibraryEmptyCtaProps {
  icon: LucideIcon;
  title: string;
  description: string;
  /** When set, shows Create tour (or similar) primary link */
  primaryHref?: string;
  primaryLabel?: string;
  /** Show Chrome Web Store install as primary when no primaryHref */
  showExtensionCta?: boolean;
}

export const LibraryEmptyCta = ({
  icon: Icon,
  title,
  description,
  primaryHref,
  primaryLabel,
  showExtensionCta = false,
}: LibraryEmptyCtaProps) => (
  <div className="mx-auto max-w-md rounded-xl border border-dashed border-slate-300 bg-slate-50/80 px-6 py-10 text-center">
    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-peacock-50 text-peacock-600 ring-1 ring-peacock-100">
      <Icon className="h-6 w-6" aria-hidden />
    </div>
    <h3 className="mt-4 text-base font-semibold text-slate-900">{title}</h3>
    <p className="mt-2 text-sm leading-relaxed text-slate-600">{description}</p>
    <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
      {primaryHref && primaryLabel ? (
        <Link
          to={primaryHref}
          className="inline-flex items-center justify-center rounded-xl bg-peacock-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-peacock-800"
        >
          {primaryLabel}
        </Link>
      ) : null}
      {showExtensionCta ? (
        <ChromeWebStoreLink className="inline-flex items-center gap-2 rounded-xl bg-peacock-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-peacock-800" />
      ) : null}
    </div>
  </div>
);
