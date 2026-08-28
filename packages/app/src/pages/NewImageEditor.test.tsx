import { describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderAtRoute } from './test/pageTestUtils';

const captureState = {
  settings: {},
  statusMessage: '',
  setStatusMessage: vi.fn(),
  undo: vi.fn(),
  redo: vi.fn(),
  canUndo: () => false,
  canRedo: () => false,
  resetSettings: vi.fn(),
};

vi.mock('@/store/captureEditorStore', () => ({
  useCaptureEditorStore: (selector: (s: typeof captureState) => unknown) => selector(captureState),
}));

vi.mock('@/components/AppHeader', () => ({
  AppHeader: ({ title, children }: { title?: string; children?: React.ReactNode }) => (
    <header>
      <h1>{title}</h1>
      {children}
    </header>
  ),
}));

vi.mock('@/capture-editor/CaptureEditorToolbar', () => ({
  CaptureEditorToolbar: () => <div>capture-toolbar</div>,
}));
vi.mock('@/capture-editor/CaptureEditorSidebar', () => ({
  CaptureEditorSidebar: () => <div>capture-sidebar</div>,
}));
vi.mock('@/capture-editor/CaptureEditorCanvas', () => ({
  CaptureEditorCanvas: () => <div>capture-canvas</div>,
}));

import { NewImageEditor } from './NewImageEditor';

describe('NewImageEditor', () => {
  it('shows an upload prompt before an image is chosen', () => {
    renderAtRoute('/edit/new-image', <NewImageEditor />);
    expect(screen.getByRole('heading', { name: 'Edit image' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Choose image' })).toBeInTheDocument();
    expect(screen.getByText(/The file stays in this tab only/i)).toBeInTheDocument();
  });
});
