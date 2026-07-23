import type { ReactNode } from 'react';
import type { Editor } from '@tiptap/react';
import {
  Bold,
  Heading1,
  Heading2,
  Heading3,
  Italic,
  List,
  ListOrdered,
  Minus,
  Pilcrow,
  Underline,
} from 'lucide-react';

interface MinimalRichTextToolbarProps {
  editor: Editor | null;
  disabled?: boolean;
}

interface ToolbarButtonProps {
  label: string;
  active: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: ReactNode;
}

const ToolbarButton = ({ label, active, disabled, onClick, children }: ToolbarButtonProps) => (
  <button
    type="button"
    aria-label={label}
    aria-pressed={active}
    disabled={disabled}
    onMouseDown={(event) => event.preventDefault()}
    onClick={onClick}
    className={`inline-flex h-8 w-8 items-center justify-center rounded-md text-sm transition ${
      active
        ? 'bg-peacock-100 text-peacock-800 ring-1 ring-peacock-300'
        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
    } disabled:cursor-not-allowed disabled:opacity-50`}
  >
    {children}
  </button>
);

export const MinimalRichTextToolbar = ({ editor, disabled }: MinimalRichTextToolbarProps) => {
  if (!editor) return null;

  const isDisabled = disabled || !editor.isEditable;

  return (
    <div
      role="toolbar"
      aria-label="Text formatting"
      className="flex flex-wrap items-center gap-0.5 border-b border-slate-200 bg-slate-50/80 px-2 py-1.5"
    >
      <ToolbarButton
        label="Bold"
        active={editor.isActive('bold')}
        disabled={isDisabled}
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        <Bold className="h-4 w-4" aria-hidden />
      </ToolbarButton>
      <ToolbarButton
        label="Italic"
        active={editor.isActive('italic')}
        disabled={isDisabled}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        <Italic className="h-4 w-4" aria-hidden />
      </ToolbarButton>
      <ToolbarButton
        label="Underline"
        active={editor.isActive('underline')}
        disabled={isDisabled}
        onClick={() => editor.chain().focus().toggleUnderline().run()}
      >
        <Underline className="h-4 w-4" aria-hidden />
      </ToolbarButton>

      <span className="mx-1 h-5 w-px bg-slate-200" aria-hidden />

      <ToolbarButton
        label="Heading 1"
        active={editor.isActive('heading', { level: 1 })}
        disabled={isDisabled}
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
      >
        <Heading1 className="h-4 w-4" aria-hidden />
      </ToolbarButton>
      <ToolbarButton
        label="Heading 2"
        active={editor.isActive('heading', { level: 2 })}
        disabled={isDisabled}
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
      >
        <Heading2 className="h-4 w-4" aria-hidden />
      </ToolbarButton>
      <ToolbarButton
        label="Heading 3"
        active={editor.isActive('heading', { level: 3 })}
        disabled={isDisabled}
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
      >
        <Heading3 className="h-4 w-4" aria-hidden />
      </ToolbarButton>
      <ToolbarButton
        label="Paragraph"
        active={editor.isActive('paragraph')}
        disabled={isDisabled}
        onClick={() => editor.chain().focus().setParagraph().run()}
      >
        <Pilcrow className="h-4 w-4" aria-hidden />
      </ToolbarButton>

      <span className="mx-1 h-5 w-px bg-slate-200" aria-hidden />

      <ToolbarButton
        label="Bullet list"
        active={editor.isActive('bulletList')}
        disabled={isDisabled}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        <List className="h-4 w-4" aria-hidden />
      </ToolbarButton>
      <ToolbarButton
        label="Ordered list"
        active={editor.isActive('orderedList')}
        disabled={isDisabled}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      >
        <ListOrdered className="h-4 w-4" aria-hidden />
      </ToolbarButton>
      <ToolbarButton
        label="Separator"
        active={false}
        disabled={isDisabled}
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
      >
        <Minus className="h-4 w-4" aria-hidden />
      </ToolbarButton>
    </div>
  );
};
