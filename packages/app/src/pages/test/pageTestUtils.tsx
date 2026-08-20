import type { ReactElement, ReactNode } from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { render, type RenderResult } from '@testing-library/react';

/** Wraps UI in MemoryRouter; optionally mounts at a route path. */
export function renderWithRouter(
  ui: ReactElement,
  options?: {
    initialEntries?: string[];
    routePath?: string;
  },
): RenderResult {
  const { initialEntries = ['/'], routePath } = options ?? {};

  if (routePath) {
    return render(
      <MemoryRouter initialEntries={initialEntries}>
        <Routes>
          <Route path={routePath} element={ui} />
        </Routes>
      </MemoryRouter>,
    );
  }

  return render(<MemoryRouter initialEntries={initialEntries}>{ui}</MemoryRouter>);
}

export function renderAtRoute(
  path: string,
  element: ReactElement,
  routePath = path.split('?')[0],
): RenderResult {
  return renderWithRouter(element, { initialEntries: [path], routePath });
}

export function PassThrough({ children }: { children?: ReactNode }) {
  return <>{children}</>;
}
