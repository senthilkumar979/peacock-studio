import { useEffect, useId, useState } from 'react';
import type { FlowCaptureEnvironment } from '@peacock/shared';
import { X } from 'lucide-react';
import { CaptureEnvironmentPanel } from '@/components/flow/CaptureEnvironmentPanel';

const VERSION_HELPER_EXAMPLES =
  '1.0.0, 2.1.0, 1.4.3-beta, 1, 1a, 2026.1.0, v1.2.0-g4b2d9e1, 2.1a, 20260619.1';

export interface FlowDetailsInput {
  title: string;
  description: string;
  version: string;
}

interface FlowDetailsDrawerProps {
  isOpen: boolean;
  initialTitle: string;
  initialDescription: string;
  initialVersion: string;
  captureEnvironment?: FlowCaptureEnvironment | null;
  confirmLabel?: string;
  onSave: (details: FlowDetailsInput) => void;
  onClose: () => void;
}

export const FlowDetailsDrawer = ({
  isOpen,
  initialTitle,
  initialDescription,
  initialVersion,
  captureEnvironment,
  confirmLabel = 'Save',
  onSave,
  onClose,
}: FlowDetailsDrawerProps) => {
  const titleId = useId();
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);
  const [version, setVersion] = useState(initialVersion);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setTitle(initialTitle);
    setDescription(initialDescription);
    setVersion(initialVersion);
    setError(null);
  }, [isOpen, initialTitle, initialDescription, initialVersion]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = () => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setError('Flow title is required.');
      return;
    }

    onSave({
      title: trimmedTitle,
      description: description.trim(),
      version: version.trim(),
    });
  };

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        aria-label="Close drawer"
        className="absolute inset-0 bg-slate-900/50"
        onClick={onClose}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="absolute inset-y-0 right-0 flex w-full max-w-2xl flex-col bg-white shadow-2xl ring-1 ring-slate-900/5"
      >
        <header className="flex shrink-0 items-start justify-between gap-4 border-b border-slate-200 px-6 py-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-peacock-600">
              Flow details
            </p>
            <h2 id={titleId} className="mt-1 text-xl font-semibold text-slate-900">
              Document your flow
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Title, description, and version appear in your library and on exported document
              headers.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close flow details"
            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
          <div className="flex flex-col gap-4">
            <label className="flex flex-col gap-1.5 text-sm">
              <span className="font-medium text-slate-700">Flow title</span>
              <input
                value={title}
                onChange={(event) => {
                  setTitle(event.target.value);
                  setError(null);
                }}
                placeholder="e.g. Create a new order"
                className="rounded-lg border border-slate-300 px-3 py-2 outline-none ring-peacock-500 focus:ring-2"
              />
            </label>

            <label className="flex flex-col gap-1.5 text-sm">
              <span className="font-medium text-slate-700">Description</span>
              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                rows={8}
                placeholder="What does this flow help someone accomplish?"
                className="resize-none rounded-lg border border-slate-300 px-3 py-2 outline-none ring-peacock-500 focus:ring-2"
              />
            </label>

            <label className="flex flex-col gap-1.5 text-sm">
              <span className="font-medium text-slate-700">Version</span>
              <input
                value={version}
                onChange={(event) => setVersion(event.target.value)}
                placeholder="e.g. 1.0.0"
                className="rounded-lg border border-slate-300 px-3 py-2 outline-none ring-peacock-500 focus:ring-2"
              />
              <span className="text-xs leading-relaxed text-slate-500">
                Optional label for this doc revision. Examples: {VERSION_HELPER_EXAMPLES}
              </span>
            </label>

            {captureEnvironment ? (
              <CaptureEnvironmentPanel environment={captureEnvironment} compact />
            ) : null}

            {error ? <p className="text-sm text-red-600">{error}</p> : null}
          </div>
        </div>

        <footer className="flex shrink-0 justify-end gap-2 border-t border-slate-200 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button type="button" onClick={handleSubmit} className="btn-peacock">
            {confirmLabel}
          </button>
        </footer>
      </aside>
    </div>
  );
};
