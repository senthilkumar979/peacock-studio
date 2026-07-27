import { useEffect, useState } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import StarterKit from '@tiptap/starter-kit';
import { MinimalRichTextToolbar } from '@/components/editor/MinimalRichTextToolbar';
import { FLOW_DESCRIPTION_MAX_CHARS } from '@/utils/richText';

export interface MinimalRichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  /** Plain-text character cap (HTML tags excluded). Defaults to flow description limit. */
  maxChars?: number;
}

const EDITOR_CONTENT_CLASS =
  'min-h-[9.5rem] text-sm text-slate-800 outline-none ' +
  '[&_.ProseMirror]:min-h-[9.5rem] [&_.ProseMirror]:px-3 [&_.ProseMirror]:py-2 [&_.ProseMirror]:outline-none ' +
  '[&_.ProseMirror_p]:my-1 [&_.ProseMirror_p]:leading-relaxed [&_.ProseMirror_p:first-child]:mt-0 ' +
  '[&_.ProseMirror_h1]:my-2 [&_.ProseMirror_h1]:text-2xl [&_.ProseMirror_h1]:font-bold ' +
  '[&_.ProseMirror_h2]:my-1.5 [&_.ProseMirror_h2]:text-xl [&_.ProseMirror_h2]:font-semibold ' +
  '[&_.ProseMirror_h3]:my-1 [&_.ProseMirror_h3]:text-lg [&_.ProseMirror_h3]:font-semibold ' +
  '[&_.ProseMirror_u]:underline ' +
  '[&_.ProseMirror_ul]:my-2 [&_.ProseMirror_ul]:list-disc [&_.ProseMirror_ul]:pl-5 ' +
  '[&_.ProseMirror_ol]:my-2 [&_.ProseMirror_ol]:list-decimal [&_.ProseMirror_ol]:pl-5 ' +
  '[&_.ProseMirror_li]:my-0.5 [&_.ProseMirror_li]:leading-relaxed ' +
  '[&_.ProseMirror_hr]:my-3 [&_.ProseMirror_hr]:border-0 [&_.ProseMirror_hr]:border-t [&_.ProseMirror_hr]:border-slate-300';

function createCharacterLimitPlugin(maxChars: number) {
  return new Plugin({
    key: new PluginKey('characterLimit'),
    filterTransaction: (transaction, state) => {
      if (!transaction.docChanged) return true;
      const nextLength = transaction.doc.textContent.length;
      if (nextLength <= maxChars) return true;
      return nextLength < state.doc.textContent.length;
    },
  });
}

export const MinimalRichTextEditor = ({
  value,
  onChange,
  placeholder,
  disabled = false,
  className = '',
  maxChars = FLOW_DESCRIPTION_MAX_CHARS,
}: MinimalRichTextEditorProps) => {
  const [plainLength, setPlainLength] = useState(0);

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
      setPlainLength(next.state.doc.textContent.length);
      onChange(next.getHTML());
    },
    onCreate: ({ editor: next }) => {
      next.registerPlugin(createCharacterLimitPlugin(maxChars));
      setPlainLength(next.state.doc.textContent.length);
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
    setPlainLength(editor.state.doc.textContent.length);
  }, [editor, value]);

  useEffect(() => {
    if (!editor) return;
    editor.setEditable(!disabled);
  }, [editor, disabled]);

  const showPlaceholder = Boolean(placeholder && editor?.isEmpty);
  const isNearLimit = plainLength >= Math.floor(maxChars * 0.9);
  const isAtLimit = plainLength >= maxChars;

  return (
    <div
      className={`overflow-hidden rounded-lg border border-slate-300 bg-white ring-peacock-500 focus-within:ring-2 ${className}`}
    >
      <MinimalRichTextToolbar editor={editor} disabled={disabled} />
      <div className={`relative ${EDITOR_CONTENT_CLASS}`}>
        {showPlaceholder ? (
          <span className="pointer-events-none absolute left-3 top-2 text-sm leading-relaxed text-slate-400">
            {placeholder}
          </span>
        ) : null}
        <EditorContent editor={editor} />
      </div>
      <div
        className={`flex justify-end border-t border-slate-100 px-3 py-1.5 text-xs ${
          isAtLimit ? 'text-red-600' : isNearLimit ? 'text-amber-700' : 'text-slate-500'
        }`}
        aria-live="polite"
      >
        {plainLength.toLocaleString()} / {maxChars.toLocaleString()}
      </div>
    </div>
  );
};
