import { useEffect, useId, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { FlowCaptureEnvironment } from "@peacock/shared";
import { X } from "lucide-react";
import { MinimalRichTextEditor } from "@/components/editor/MinimalRichTextEditor";
import {
  Button,
  FieldInput,
  FormField,
  ModalFooterActions,
} from "@/components/ui";
import { normalizeRichText, FLOW_DESCRIPTION_MAX_CHARS, richTextPlainLength } from "@/utils/richText";

const VERSION_HELPER_EXAMPLES =
  "1.0.0, 2.1.0, 1.4.3-beta, 1, 1a, 2026.1.0, v1.2.0-g4b2d9e1, 2.1a, 20260619.1";

const DRAWER_SLIDE_TRANSITION = {
  duration: 1.25,
  ease: [0.22, 1, 0.36, 1] as const,
};

export interface FlowDetailsInput {
  title: string;
  description: string;
  version: string;
}

interface FlowDetailsDrawerProps {
  isOpen: boolean;
  /** Remounts the editor and resets drafts when the flow/document changes. */
  contentKey?: string;
  initialTitle: string;
  initialDescription: string;
  initialVersion: string;
  captureEnvironment?: FlowCaptureEnvironment | null;
  confirmLabel?: string;
  onSave: (details: FlowDetailsInput) => void;
  onClose: () => void;
}

interface FlowDetailsDraft {
  contentKey: string;
  isOpen: boolean;
  title: string;
  description: string;
  version: string;
}

export const FlowDetailsDrawer = ({
  isOpen,
  contentKey,
  initialTitle,
  initialDescription,
  initialVersion,
  captureEnvironment: _captureEnvironment,
  confirmLabel = "Save",
  onSave,
  onClose,
}: FlowDetailsDrawerProps) => {
  const titleId = useId();
  const resolvedKey = contentKey ?? "flow";
  const [draft, setDraft] = useState<FlowDetailsDraft>(() => ({
    contentKey: resolvedKey,
    isOpen,
    title: initialTitle,
    description: initialDescription,
    version: initialVersion,
  }));
  const [error, setError] = useState<string | null>(null);

  // Reset draft during render when opening or switching docs — avoids one frame of
  // stale TipTap content from the previous flow (useEffect would be too late).
  if (isOpen) {
    const needsReset = !draft.isOpen || draft.contentKey !== resolvedKey;
    if (needsReset) {
      setDraft({
        contentKey: resolvedKey,
        isOpen: true,
        title: initialTitle,
        description: initialDescription,
        version: initialVersion,
      });
      setError(null);
    }
  } else if (draft.isOpen) {
    setDraft((prev) => ({ ...prev, isOpen: false }));
  }

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  const handleSubmit = () => {
    const trimmedTitle = draft.title.trim();
    if (!trimmedTitle) {
      setError("Flow title is required.");
      return;
    }

    const description = normalizeRichText(draft.description);
    if (richTextPlainLength(description) > FLOW_DESCRIPTION_MAX_CHARS) {
      setError(
        `Description must be ${FLOW_DESCRIPTION_MAX_CHARS.toLocaleString()} characters or fewer.`,
      );
      return;
    }

    onSave({
      title: trimmedTitle,
      description,
      version: draft.version.trim(),
    });
  };

  return (
    <AnimatePresence>
      {isOpen ? (
        <div className="fixed inset-0 z-50">
          <motion.button
            type="button"
            aria-label="Close drawer"
            className="absolute inset-0 bg-slate-900/50"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.25, ease: [0.22, 1, 0.36, 1] as const }}
          />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="absolute inset-y-0 right-0 flex w-full max-w-2xl flex-col bg-white shadow-2xl ring-1 ring-slate-900/5 mt-2 mb-2 rounded-lg mr-2"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={DRAWER_SLIDE_TRANSITION}
          >
            <header className="flex shrink-0 items-start justify-between gap-4 border-b border-slate-200 px-6 py-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-peacock-600">
                  Flow details
                </p>
                <h2
                  id={titleId}
                  className="mt-1 text-xl font-semibold text-slate-900"
                >
                  Document your flow
                </h2>
                <p className="mt-2 text-sm text-slate-600">
                  Title, description, and version appear in your library and on
                  exported document headers.
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                aria-label="Close flow details"
              >
                <X className="h-5 w-5" aria-hidden />
              </Button>
            </header>

            <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
              <div className="flex flex-col gap-4">
                <FormField label="Flow title" error={error ?? undefined}>
                  <FieldInput
                    hasError={Boolean(error)}
                    value={draft.title}
                    onChange={(event) => {
                      setDraft((prev) => ({ ...prev, title: event.target.value }));
                      setError(null);
                    }}
                    placeholder="e.g. Create a new order"
                  />
                </FormField>

                <FormField
                  label="Description"
                  hint={`Up to ${FLOW_DESCRIPTION_MAX_CHARS.toLocaleString()} characters (plain text).`}
                >
                  <MinimalRichTextEditor
                    key={resolvedKey}
                    value={draft.description}
                    onChange={(description) =>
                      setDraft((prev) => ({ ...prev, description }))
                    }
                    placeholder="What does this flow help someone accomplish?"
                    maxChars={FLOW_DESCRIPTION_MAX_CHARS}
                  />
                </FormField>

                <FormField
                  label="Version"
                  hint={`Ex: ${VERSION_HELPER_EXAMPLES}`}
                >
                  <FieldInput
                    value={draft.version}
                    onChange={(event) =>
                      setDraft((prev) => ({ ...prev, version: event.target.value }))
                    }
                    placeholder="e.g. 1.0.0"
                  />
                </FormField>
              </div>
            </div>

            <footer className="shrink-0 border-t border-slate-200 px-6 py-4">
              <ModalFooterActions
                onCancel={onClose}
                onConfirm={handleSubmit}
                confirmLabel={confirmLabel}
              />
            </footer>
          </motion.aside>
        </div>
      ) : null}
    </AnimatePresence>
  );
};
