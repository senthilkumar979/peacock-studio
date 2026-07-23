import {
  CAPTURE_BACKGROUND_PRESETS,
  getPresetSwatchCss,
} from "@peacock/shared";
import { useCaptureEditorStore } from "@/store/captureEditorStore";
import { CaptureEditorInspector } from "./CaptureEditorInspector";

export const CaptureEditorSidebar = () => {
  const settings = useCaptureEditorStore((state) => state.settings);
  const setBackgroundPresetId = useCaptureEditorStore(
    (state) => state.setBackgroundPresetId,
  );
  const setPadding = useCaptureEditorStore((state) => state.setPadding);
  const setCornerRadius = useCaptureEditorStore(
    (state) => state.setCornerRadius,
  );
  const setFrameCornerRadius = useCaptureEditorStore(
    (state) => state.setFrameCornerRadius,
  );
  const setTitle = useCaptureEditorStore((state) => state.setTitle);
  const setDescription = useCaptureEditorStore((state) => state.setDescription);
  const commitSettings = useCaptureEditorStore((state) => state.commitSettings);

  return (
    <aside className="flex w-72 shrink-0 flex-col gap-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="space-y-3 border-b border-slate-100 p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
          Caption
        </p>
        <label className="block text-xs text-slate-600 px-1">
          Title
          <input
            type="text"
            value={settings.title}
            onChange={(event) => setTitle(event.target.value)}
            onBlur={() =>
              commitSettings(useCaptureEditorStore.getState().settings)
            }
            placeholder="Add a title"
            className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm text-slate-900"
          />
        </label>
        <label className="block text-xs text-slate-600 px-1">
          Description
          <textarea
            value={settings.description}
            onChange={(event) => setDescription(event.target.value)}
            onBlur={() =>
              commitSettings(useCaptureEditorStore.getState().settings)
            }
            placeholder="Add a short description"
            rows={3}
            className="mt-1 w-full resize-y rounded-lg border border-slate-200 px-2 py-1.5 text-sm text-slate-900"
          />
        </label>
      </div>

      <div className="flex min-h-0 flex-col gap-3 p-4 py-1">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
          Backgrounds
        </p>
        <div className="max-h-52 overflow-y-auto pr-1">
          <div className="grid grid-cols-2 gap-2">
            {CAPTURE_BACKGROUND_PRESETS.map((preset) => {
              const isActive = settings.backgroundPresetId === preset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => setBackgroundPresetId(preset.id)}
                  className={`rounded-xl border p-2 text-left transition ${
                    isActive
                      ? "border-peacock-500 ring-2 ring-peacock-100"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <span
                    className="mb-2 block h-10 w-full rounded-lg border border-slate-200/80"
                    style={{ background: getPresetSwatchCss(preset) }}
                    aria-hidden
                  />
                  <span className="text-xs font-medium text-slate-700">
                    {preset.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="space-y-4 border-t border-slate-100 px-4 py-4">
        <label className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
          <span>Padding</span>
          <span className="tabular-nums text-slate-700">
            {settings.padding}px
          </span>
        </label>
        <input
          type="range"
          min={0}
          max={200}
          step={4}
          value={settings.padding}
          onChange={(event) => setPadding(Number(event.target.value))}
          className="w-full accent-peacock-600"
        />

        <label className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
          <span>Image corner radius</span>
          <span className="tabular-nums text-slate-700">
            {settings.cornerRadius}px
          </span>
        </label>
        <input
          type="range"
          min={0}
          max={48}
          step={2}
          value={settings.cornerRadius}
          onChange={(event) => setCornerRadius(Number(event.target.value))}
          className="w-full accent-peacock-600"
        />

        <label className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
          <span>Frame corner radius</span>
          <span className="tabular-nums text-slate-700">
            {settings.frameCornerRadius}px
          </span>
        </label>
        <input
          type="range"
          min={0}
          max={96}
          step={2}
          value={settings.frameCornerRadius}
          onChange={(event) => setFrameCornerRadius(Number(event.target.value))}
          className="w-full accent-peacock-600"
        />
      </div>

      <div className="border-t border-slate-100 px-4 py-4">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
          Selection
        </p>
        <CaptureEditorInspector />
      </div>
    </aside>
  );
};
