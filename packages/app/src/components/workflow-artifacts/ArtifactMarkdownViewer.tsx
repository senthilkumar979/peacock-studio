interface ArtifactMarkdownViewerProps {
  content: string;
}

export const ArtifactMarkdownViewer = ({ content }: ArtifactMarkdownViewerProps) => (
  <pre className="overflow-x-auto rounded-2xl border border-slate-200 bg-slate-950 p-5 text-sm leading-relaxed text-slate-100">
    <code>{content}</code>
  </pre>
);
