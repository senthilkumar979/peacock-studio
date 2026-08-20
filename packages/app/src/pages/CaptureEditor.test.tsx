import { describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderAtRoute } from './test/pageTestUtils';

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return { ...actual, useParams: () => ({ captureId: 'cap-1' }) };
});

vi.mock('@/hooks/useCaptureSource', () => ({
  useCaptureSource: () => ({
    source: {
      imageDataUrl: 'data:image/png;base64,aaa',
      naturalWidth: 100,
      naturalHeight: 80,
      mode: 'visible',
    },
    isLoading: false,
    error: null,
  }),
}));

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
vi.mock('@/capture-editor/exportCaptureImage', () => ({
  copyCaptureBlobToClipboard: vi.fn(),
  downloadCaptureBlob: vi.fn(),
}));
vi.mock('@/capture-editor/renderCaptureComposite', () => ({
  renderCaptureComposite: vi.fn(),
}));

import { CaptureEditor } from './CaptureEditor';

describe('CaptureEditor', () => {
  it('renders capture editor chrome', () => {
    renderAtRoute('/captures/cap-1/edit', <CaptureEditor />);
    expect(screen.getByRole('heading', { name: /visible area capture/i })).toBeInTheDocument();
    expect(screen.getByText('capture-toolbar')).toBeInTheDocument();
    expect(screen.getByText('capture-canvas')).toBeInTheDocument();
  });
});
