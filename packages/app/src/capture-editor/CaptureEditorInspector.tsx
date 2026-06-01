import { useCaptureEditorStore } from '@/store/captureEditorStore';

export const CaptureEditorInspector = () => {
  const settings = useCaptureEditorStore((state) => state.settings);
  const selectedId = useCaptureEditorStore((state) => state.selectedId);
  const updatePrivacyRegion = useCaptureEditorStore((state) => state.updatePrivacyRegion);
  const commitSettings = useCaptureEditorStore((state) => state.commitSettings);

  const region = settings.privacyRegions.find((item) => item.id === selectedId);

  if (!region) {
    return (
      <p className="text-xs leading-relaxed text-slate-500">
        Draw a blur or redact region on the screenshot, or use Crop to trim the image. With Select,
        drag to move a region or use the corner and edge handles to resize.
      </p>
    );
  }

  if (region.mode === 'redact') {
    return (
      <p className="text-xs leading-relaxed text-slate-500">
        Redact fills the region with solid white so underlying content is hidden.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Blur region</p>
      <label className="block text-xs text-slate-600">
        Intensity
        <input
          type="range"
          min={4}
          max={24}
          value={region.intensity}
          onChange={(event) =>
            updatePrivacyRegion(region.id, { intensity: Number(event.target.value) })
          }
          onPointerUp={() => commitSettings(useCaptureEditorStore.getState().settings)}
          className="mt-1 w-full accent-peacock-600"
        />
      </label>
    </div>
  );
};
