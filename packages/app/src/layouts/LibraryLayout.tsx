import type { ReactNode } from 'react';
import { AppFooter } from '@/components/AppFooter';
import { LibraryNav } from '@/components/library/LibraryNav';

interface LibraryLayoutProps {
  children: ReactNode;
}

export const LibraryLayout = ({ children }: LibraryLayoutProps) => (
  <div className="flex min-h-screen flex-col bg-slate-100/80">
    <LibraryNav />
    <div className="flex-1">{children}</div>
    <AppFooter />
  </div>
);
