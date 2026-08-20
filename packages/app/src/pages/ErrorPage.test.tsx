import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { render } from '@testing-library/react';
import { ERROR_PATH } from '@/constants/routes';
import { buildHardErrorPath, ErrorPage } from './ErrorPage';

describe('buildHardErrorPath', () => {
  it('builds a query string with truncated title and message', () => {
    const path = buildHardErrorPath('Boom', 'Nope');
    expect(path.startsWith(`${ERROR_PATH}?`)).toBe(true);
    expect(path).toContain('title=Boom');
    expect(path).toContain('message=Nope');
  });

  it('truncates long title and message', () => {
    const title = 'T'.repeat(100);
    const message = 'M'.repeat(300);
    const path = buildHardErrorPath(title, message);
    const params = new URLSearchParams(path.split('?')[1]);
    expect(params.get('title')).toHaveLength(80);
    expect(params.get('message')).toHaveLength(280);
  });
});

describe('ErrorPage', () => {
  it('renders title from query params', () => {
    render(
      <MemoryRouter initialEntries={['/error?title=Boom&message=Nope']}>
        <Routes>
          <Route path="/error" element={<ErrorPage />} />
        </Routes>
      </MemoryRouter>,
    );
    expect(screen.getByRole('heading', { name: /boom/i })).toBeInTheDocument();
    expect(screen.getByText(/Nope/)).toBeInTheDocument();
  });

  it('falls back to default title when query is empty', () => {
    render(
      <MemoryRouter initialEntries={['/error']}>
        <Routes>
          <Route path="/error" element={<ErrorPage />} />
        </Routes>
      </MemoryRouter>,
    );
    expect(screen.getByRole('heading', { name: /something went wrong/i })).toBeInTheDocument();
  });
});
