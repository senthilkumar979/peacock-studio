import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { PEACOCK_APP_NAME, PEACOCK_LOGO_SRC } from '@/constants/branding';

interface AppHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  homeLink?: boolean;
  children?: ReactNode;
}

export const AppHeader = ({
  eyebrow,
  title,
  description,
  homeLink = false,
  children,
}: AppHeaderProps) => {
  const logoMark = (
    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-peacock-500 to-peacock-700 p-1.5 shadow-md shadow-peacock-500/20 ring-1 ring-peacock-600/10 transition-shadow group-hover:shadow-lg group-hover:shadow-peacock-500/25">
      <img
        src={PEACOCK_LOGO_SRC}
        alt={PEACOCK_APP_NAME}
        width={28}
        height={28}
        className="h-7 w-7 object-contain"
      />
    </span>
  );

  const brandBlock = homeLink ? (
    <Link
      to="/"
      className="group flex shrink-0 items-center gap-2.5 rounded-xl outline-none ring-peacock-500 focus-visible:ring-2"
    >
      {logoMark}
      <span className="hidden text-sm font-semibold tracking-tight text-slate-900 sm:inline">
        {PEACOCK_APP_NAME}
      </span>
    </Link>
  ) : (
    <div className="flex shrink-0 items-center gap-2.5">
      {logoMark}
      <span className="hidden text-sm font-semibold tracking-tight text-slate-900 sm:inline">
        {PEACOCK_APP_NAME}
      </span>
    </div>
  );

  const hasContext = Boolean(eyebrow || title || description);

  return (
    <header className="sticky top-0 z-50 shrink-0 border-b border-slate-200/70 bg-white/90 shadow-sm backdrop-blur-lg supports-[backdrop-filter]:bg-white/80">
      <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-3 px-4 py-3 sm:gap-4 sm:px-6">
        <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
          {brandBlock}

          {hasContext ? (
            <>
              <ChevronRight
                className="hidden h-4 w-4 shrink-0 text-slate-300 sm:block"
                aria-hidden
              />
              <div className="min-w-0 flex-1 sm:border-l sm:border-slate-200 sm:pl-3">
                {eyebrow ? (
                  <p className="truncate text-[11px] font-semibold uppercase tracking-wider text-peacock-600">
                    {eyebrow}
                  </p>
                ) : null}
                <h1 className="truncate text-base font-bold leading-tight text-slate-900 sm:text-lg">
                  {title}
                </h1>
                {description ? (
                  <p className="mt-0.5 line-clamp-1 text-xs text-slate-500 sm:text-sm">
                    {description}
                  </p>
                ) : null}
              </div>
            </>
          ) : null}
        </div>

        {children ? (
          <div className="flex shrink-0 flex-wrap items-center justify-end gap-2 sm:border-l sm:border-slate-200 sm:pl-4">
            {children}
          </div>
        ) : null}
      </div>
    </header>
  );
};
