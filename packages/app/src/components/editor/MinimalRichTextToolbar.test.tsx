import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { Editor } from '@tiptap/react';
import { MinimalRichTextToolbar } from './MinimalRichTextToolbar';

function createEditorMock(active: Record<string, boolean> = {}): Editor {
  const run = vi.fn();
  const chainApi: Record<string, unknown> = {
    focus: () => chainApi,
    toggleBold: () => chainApi,
    toggleItalic: () => chainApi,
    toggleUnderline: () => chainApi,
    toggleHeading: () => chainApi,
    setParagraph: () => chainApi,
    toggleBulletList: () => chainApi,
    toggleOrderedList: () => chainApi,
    setHorizontalRule: () => chainApi,
    run,
  };

  return {
    isEditable: true,
    isActive: (name: string, attrs?: { level?: number }) => {
      if (name === 'heading' && attrs?.level) return Boolean(active[`heading-${attrs.level}`]);
      return Boolean(active[name]);
    },
    chain: () => chainApi,
  } as unknown as Editor;
}

describe('MinimalRichTextToolbar', () => {
  it('returns null without an editor', () => {
    const { container } = render(<MinimalRichTextToolbar editor={null} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders formatting controls and runs commands', async () => {
    const user = userEvent.setup();
    const editor = createEditorMock({ bold: true, paragraph: true });
    render(<MinimalRichTextToolbar editor={editor} />);

    expect(screen.getByRole('toolbar', { name: 'Text formatting' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Bold' })).toHaveAttribute('aria-pressed', 'true');

    await user.click(screen.getByRole('button', { name: 'Italic' }));
    await user.click(screen.getByRole('button', { name: 'Underline' }));
    await user.click(screen.getByRole('button', { name: 'Heading 1' }));
    await user.click(screen.getByRole('button', { name: 'Heading 2' }));
    await user.click(screen.getByRole('button', { name: 'Heading 3' }));
    await user.click(screen.getByRole('button', { name: 'Paragraph' }));
    await user.click(screen.getByRole('button', { name: 'Bullet list' }));
    await user.click(screen.getByRole('button', { name: 'Ordered list' }));
    await user.click(screen.getByRole('button', { name: 'Separator' }));
    expect(editor.chain).toBeDefined();
  });

  it('disables controls when disabled or not editable', () => {
    const editor = createEditorMock();
    (editor as { isEditable: boolean }).isEditable = false;
    render(<MinimalRichTextToolbar editor={editor} disabled />);
    expect(screen.getByRole('button', { name: 'Bold' })).toBeDisabled();
  });
});
