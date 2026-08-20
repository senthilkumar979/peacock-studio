import { describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '@/test/renderWithProviders';

vi.mock('@tiptap/react', () => ({
  useEditor: () => ({
    commands: { setContent: vi.fn() },
    isActive: () => false,
    chain: () => ({ focus: () => ({ toggleBold: () => ({ run: vi.fn() }), run: vi.fn() }) }),
    can: () => ({ chain: () => ({ focus: () => ({ toggleBold: () => ({ run: () => true }) }) }) }),
    state: { doc: { textContent: 'Hello' } },
    getHTML: () => '<p>Hello</p>',
    registerPlugin: vi.fn(),
    setEditable: vi.fn(),
    destroy: vi.fn(),
  }),
  EditorContent: () => <div data-testid="editor-content">Editor</div>,
}));

vi.mock('@tiptap/starter-kit', () => ({
  default: { configure: () => ({}) },
}));

vi.mock('@tiptap/pm/state', () => ({
  Plugin: class {},
  PluginKey: class {},
}));

vi.mock('@/components/editor/MinimalRichTextToolbar', () => ({
  MinimalRichTextToolbar: () => <div>Toolbar</div>,
}));

import { MinimalRichTextEditor } from './MinimalRichTextEditor';
import { RichTextContent } from './RichTextContent';

describe('rich text smoke', () => {
  it('MinimalRichTextEditor renders toolbar and content', () => {
    renderWithProviders(
      <MinimalRichTextEditor value="<p>Hi</p>" onChange={vi.fn()} />,
    );
    expect(screen.getByText('Toolbar')).toBeInTheDocument();
    expect(screen.getByTestId('editor-content')).toBeInTheDocument();
  });

  it('RichTextContent renders html', () => {
    renderWithProviders(<RichTextContent html="<p>Hello world</p>" />);
    expect(screen.getByText('Hello world')).toBeInTheDocument();
  });
});
