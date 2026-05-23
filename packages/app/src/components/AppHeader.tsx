import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
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
  const brand = (
    <div className="flex min-w-0 items-center gap-3">
      <img
        src={PEACOCK_LOGO_SRC}
        alt={PEACOCK_APP_NAME}
        width={36}
        height={36}
        className="h-9 w-9 shrink-0 object-contain"
      />
      <div className="min-w-0">
        {eyebrow ? (
          <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">{eyebrow}</p>
        ) : null}
        <h1 className="truncate text-xl font-semibold text-slate-900">{title}</h1>
        {description ? (
          <p className="mt-0.5 line-clamp-1 max-w-xl text-sm text-slate-500">{description}</p>
        ) : null}
      </div>
    </div>
  );

  return (
    <header className="flex shrink-0 items-center justify-between gap-4 border-b border-slate-200 bg-white px-6 py-4">
      {homeLink ? (
        <Link to="/" className="min-w-0 rounded-lg outline-none ring-blue-500 focus-visible:ring-2">
          {brand}
        </Link>
      ) : (
        brand
      )}
      {children ? <div className="flex shrink-0 items-center gap-3">{children}</div> : null}
    </header>
  );
};
