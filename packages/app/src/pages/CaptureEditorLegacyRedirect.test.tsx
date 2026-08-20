import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { render } from '@testing-library/react';
import { CaptureEditorLegacyRedirect } from './CaptureEditorLegacyRedirect';

describe('CaptureEditorLegacyRedirect', () => {
  it('redirects capture id to /capture/:id/edit', () => {
    render(
      <MemoryRouter initialEntries={['/editor/capture/abc-123']}>
        <Routes>
          <Route path="/editor/capture/:captureId" element={<CaptureEditorLegacyRedirect />} />
          <Route path="/capture/:captureId/edit" element={<div>Capture edit</div>} />
          <Route path="/dashboard" element={<div>Dashboard</div>} />
        </Routes>
      </MemoryRouter>,
    );
    expect(screen.getByText('Capture edit')).toBeInTheDocument();
  });

  it('redirects missing capture id to dashboard', () => {
    render(
      <MemoryRouter initialEntries={['/editor/capture']}>
        <Routes>
          <Route path="/editor/capture" element={<CaptureEditorLegacyRedirect />} />
          <Route path="/editor/capture/:captureId" element={<CaptureEditorLegacyRedirect />} />
          <Route path="/dashboard" element={<div>Dashboard</div>} />
        </Routes>
      </MemoryRouter>,
    );
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });
});
