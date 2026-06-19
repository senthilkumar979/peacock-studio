import type { CaptureEditorTool } from '@peacock/shared';
import { useCaptureEditorStore } from '@/store/captureEditorStore';

const TOOLS: { id: CaptureEditorTool; label: string }[] = [
  { id: 'select', label: 'Select' },
  { id: 'crop', label: 'Crop' },
  { id: 'blur', label: 'Blur' },
  { id: 'redact', label: 'Redact' },
];

export const CaptureEditorToolbar = () => {
  const activeTool = useCaptureEditorStore((state) => state.activeTool);
  const setActiveTool = useCaptureEditorStore((state) => state.setActiveTool);
  const removeSelected = useCaptureEditorStore((state) => state.removeSelected);
  const selectedId = useCaptureEditorStore((state) => state.selectedId);

  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 bg-white px-3 py-2">
      {TOOLS.map((tool) => (
        <button
          key={tool.id}
          type="button"
          onClick={() => setActiveTool(tool.id)}
          className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
            activeTool === tool.id
              ? 'bg-peacock-600 text-white'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          {tool.label}
        </button>
      ))}
      {activeTool === 'crop' ? (
        <p className="ml-auto text-xs text-slate-500">
          Drag to select — crop applies when you release
        </p>
      ) : (
        <button
          type="button"
          onClick={() => removeSelected()}
          disabled={!selectedId}
          className="ml-auto rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Delete
        </button>
      )}
    </div>
  );
};
