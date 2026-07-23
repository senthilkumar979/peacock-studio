import { useEffect } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { MinimalRichTextToolbar } from '@/components/editor/MinimalRichTextToolbar';

export interface MinimalRichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

const EDITOR_CONTENT_CLASS =
  'min-h-[9.5rem] px-3 py-2 text-sm text-slate-800 outline-none ' +
  '[&_.ProseMirror]:min-h-[8.5rem] [&_.ProseMirror]:outline-none ' +
  '[&_.ProseMirror_p]:my-1 [&_.ProseMirror_p]:leading-relaxed ' +
  '[&_.ProseMirror_h1]:my-2 [&_.ProseMirror_h1]:text-2xl [&_.ProseMirror_h1]:font-bold ' +
  '[&_.ProseMirror_h2]:my-1.5 [&_.ProseMirror_h2]:text-xl [&_.ProseMirror_h2]:font-semibold ' +
  '[&_.ProseMirror_h3]:my-1 [&_.ProseMirror_h3]:text-lg [&_.ProseMirror_h3]:font-semibold ' +
  '[&_.ProseMirror_u]:underline ' +
  '[&_.ProseMirror_ul]:my-2 [&_.ProseMirror_ul]:list-disc [&_.ProseMirror_ul]:pl-5 ' +
  '[&_.ProseMirror_ol]:my-2 [&_.ProseMirror_ol]:list-decimal [&_.ProseMirror_ol]:pl-5 ' +
  '[&_.ProseMirror_li]:my-0.5 [&_.ProseMirror_li]:leading-relaxed ' +
  '[&_.ProseMirror_hr]:my-3 [&_.ProseMirror_hr]:border-0 [&_.ProseMirror_hr]:border-t [&_.ProseMirror_hr]:border-slate-300';

export const MinimalRichTextEditor = ({
  value,
  onChange,
  placeholder,
  disabled = false,
  className = '',
}: MinimalRichTextEditorProps) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        blockquote: false,
        code: false,
        codeBlock: false,
        hardBreak: false,
        link: false,
        strike: false,
        heading: { levels: [1, 2, 3] },
      }),
    ],
    content: value || '',
    editable: !disabled,
    immediatelyRender: false,
    onUpdate: ({ editor: next }) => {
      onChange(next.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'focus:outline-none',
        ...(placeholder ? { 'data-placeholder': placeholder } : {}),
      },
    },
  });

  useEffect(() => {
    if (!editor) return;

    const next = value || '';
    if (!next && editor.isEmpty) return;
    if (next === editor.getHTML()) return;

    editor.commands.setContent(next, { emitUpdate: false });
  }, [editor, value]);

  useEffect(() => {
    if (!editor) return;
    editor.setEditable(!disabled);
  }, [editor, disabled]);

  const showPlaceholder = Boolean(placeholder && editor?.isEmpty);

  return (
    <div
      className={`overflow-hidden rounded-lg border border-slate-300 bg-white ring-peacock-500 focus-within:ring-2 ${className}`}
    >
      <MinimalRichTextToolbar editor={editor} disabled={disabled} />
      <div className={`relative ${EDITOR_CONTENT_CLASS}`}>
        {showPlaceholder ? (
          <span className="pointer-events-none absolute left-3 top-2 text-sm text-slate-400">
            {placeholder}
          </span>
        ) : null}
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};
