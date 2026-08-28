import {
  CAPTURE_BACKGROUND_PRESETS,
  getPresetSwatchCss,
} from '@peacock/shared';
import { FieldInput, FieldTextarea, FormField } from '@/components/ui';
import { useCaptureEditorStore } from '@/store/captureEditorStore';
import { CaptureEditorInspector } from './CaptureEditorInspector';

interface CaptureEditorSidebarProps {
  showBackgroundPresets?: boolean;
}

export const CaptureEditorSidebar = ({
  showBackgroundPresets = true,
}: CaptureEditorSidebarProps) => {
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

  const commitOnBlur = () =>
    commitSettings(useCaptureEditorStore.getState().settings);

  return (
    <aside className="flex w-72 shrink-0 flex-col gap-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="space-y-3 border-b border-slate-100 p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
          Caption
        </p>
        <FormField label="Title" className="px-1">
          <FieldInput
            type="text"
            value={settings.title}
            onChange={(event) => setTitle(event.target.value)}
            onBlur={commitOnBlur}
            placeholder="Add a title"
          />
        </FormField>
        <FormField label="Description" className="px-1">
          <FieldTextarea
            value={settings.description}
            onChange={(event) => setDescription(event.target.value)}
            onBlur={commitOnBlur}
            placeholder="Add a short description"
            rows={3}
            className="resize-y"
          />
        </FormField>
      </div>

      {showBackgroundPresets ? (
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
                        ? 'border-peacock-500 ring-2 ring-peacock-100'
                        : 'border-slate-200 hover:border-slate-300'
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
      ) : null}

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
