import { describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithRouter } from './test/pageTestUtils';

vi.mock('@/pages/artifacts/ArtifactLibraryPage', () => ({
  ArtifactLibraryPage: ({ artifactType }: { artifactType: string }) => (
    <div>library:{artifactType}</div>
  ),
}));

vi.mock('@/pages/artifacts/ArtifactDetailPage', () => ({
  ArtifactDetailPage: ({ artifactType }: { artifactType: string }) => (
    <div>detail:{artifactType}</div>
  ),
}));

import { FlowMapsLibraryPage } from './FlowMapsLibraryPage';
import { FlowMapsDetailPage } from './FlowMapsDetailPage';
import { TestCasesLibraryPage } from './TestCasesLibraryPage';
import { TestCasesDetailPage } from './TestCasesDetailPage';
import { PlaywrightTestsLibraryPage } from './PlaywrightTestsLibraryPage';
import { PlaywrightTestsDetailPage } from './PlaywrightTestsDetailPage';

describe('artifact library wrappers', () => {
  it('FlowMapsLibraryPage', () => {
    renderWithRouter(<FlowMapsLibraryPage />);
    expect(screen.getByText('library:flow_map')).toBeInTheDocument();
  });
  it('FlowMapsDetailPage', () => {
    renderWithRouter(<FlowMapsDetailPage />);
    expect(screen.getByText('detail:flow_map')).toBeInTheDocument();
  });
  it('TestCasesLibraryPage', () => {
    renderWithRouter(<TestCasesLibraryPage />);
    expect(screen.getByText('library:test_cases')).toBeInTheDocument();
  });
  it('TestCasesDetailPage', () => {
    renderWithRouter(<TestCasesDetailPage />);
    expect(screen.getByText('detail:test_cases')).toBeInTheDocument();
  });
  it('PlaywrightTestsLibraryPage', () => {
    renderWithRouter(<PlaywrightTestsLibraryPage />);
    expect(screen.getByText('library:playwright')).toBeInTheDocument();
  });
  it('PlaywrightTestsDetailPage', () => {
    renderWithRouter(<PlaywrightTestsDetailPage />);
    expect(screen.getByText('detail:playwright')).toBeInTheDocument();
  });
});
