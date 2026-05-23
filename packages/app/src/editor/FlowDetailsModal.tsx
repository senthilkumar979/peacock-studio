import { useEffect, useId, useState } from 'react';

interface FlowDetailsModalProps {
  isOpen: boolean;
  initialTitle: string;
  initialDescription: string;
  confirmLabel?: string;
  onSave: (title: string, description: string) => void;
  onClose: () => void;
}

export const FlowDetailsModal = ({
  isOpen,
  initialTitle,
  initialDescription,
  confirmLabel = 'Save',
  onSave,
  onClose,
}: FlowDetailsModalProps) => {
  const titleId = useId();
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setTitle(initialTitle);
    setDescription(initialDescription);
    setError(null);
  }, [isOpen, initialTitle, initialDescription]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = () => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setError('Flow title is required.');
      return;
    }

    onSave(trimmedTitle, description.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close dialog"
        className="absolute inset-0 bg-slate-900/50"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl ring-1 ring-slate-900/5"
      >
        <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">Flow details</p>
        <h2 id={titleId} className="mt-1 text-xl font-semibold text-slate-900">
          Document your flow
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Title and description appear on the PDF cover page and in the exported document header.
        </p>

        <div className="mt-6 flex flex-col gap-4">
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium text-slate-700">Flow title</span>
            <input
              value={title}
              onChange={(event) => {
                setTitle(event.target.value);
                setError(null);
              }}
              placeholder="e.g. Create a new order"
              className="rounded-lg border border-slate-300 px-3 py-2 outline-none ring-blue-500 focus:ring-2"
            />
          </label>

          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium text-slate-700">Description</span>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={4}
              placeholder="What does this flow help someone accomplish?"
              className="resize-none rounded-lg border border-slate-300 px-3 py-2 outline-none ring-blue-500 focus:ring-2"
            />
          </label>

          {error ? <p className="text-sm text-red-600">{error}</p> : null}
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
