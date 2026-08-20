import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { render } from '@testing-library/react';
import { LegacyRouteRedirect } from './LegacyRouteRedirect';

describe('LegacyRouteRedirect', () => {
  it('redirects new mode to /tours/new', () => {
    render(
      <MemoryRouter initialEntries={['/routes/new']}>
        <Routes>
          <Route path="/routes/new" element={<LegacyRouteRedirect mode="new" />} />
          <Route path="/tours/new" element={<div>New tour</div>} />
        </Routes>
      </MemoryRouter>,
    );
    expect(screen.getByText('New tour')).toBeInTheDocument();
  });

  it('redirects edit mode to /tours/:id/edit', () => {
    render(
      <MemoryRouter initialEntries={['/routes/r1/edit']}>
        <Routes>
          <Route path="/routes/:routeId/edit" element={<LegacyRouteRedirect mode="edit" />} />
          <Route path="/tours/:routeId/edit" element={<div>Edit tour</div>} />
        </Routes>
      </MemoryRouter>,
    );
    expect(screen.getByText('Edit tour')).toBeInTheDocument();
  });

  it('redirects view mode to /tours/:id', () => {
    render(
      <MemoryRouter initialEntries={['/routes/r1']}>
        <Routes>
          <Route path="/routes/:routeId" element={<LegacyRouteRedirect mode="view" />} />
          <Route path="/tours/:routeId" element={<div>View tour</div>} />
        </Routes>
      </MemoryRouter>,
    );
    expect(screen.getByText('View tour')).toBeInTheDocument();
  });
});
