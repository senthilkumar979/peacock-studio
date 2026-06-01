import { useCallback, useEffect, useRef, useState } from 'react';
import type { NormalizedRect } from '@peacock/shared';
import { useCaptureEditorStore } from '@/store/captureEditorStore';
import {
  canvasPointToCroppedNormalized,
  canvasPointToSourceNormalized,
  computeCaptureLayout,
  normalizeRectFromPoints,
  normalizedToCanvasRect,
} from './computeCaptureLayout';
import { drawCaptureOverlay } from './drawCaptureOverlay';
import { hitTestCaptureSelection } from './captureHitTest';
import { paintCaptureComposite } from './paintCaptureComposite';
import {
  getPrivacyRegionHandleCursor,
  hitTestPrivacyRegionHandle,
  resizeNormalizedRect,
  type PrivacyRegionHandle,
} from './privacyRegionHandles';

interface CaptureEditorCanvasProps {
  imageDataUrl: string;
  naturalWidth: number;
  naturalHeight: number;
}

const PREVIEW_MAX_EDGE = 1200;

type RegionDragState =
  | { kind: 'move'; startX: number; startY: number; origin: NormalizedRect }
  | { kind: 'resize'; handle: PrivacyRegionHandle; origin: NormalizedRect };

export const CaptureEditorCanvas = ({
  imageDataUrl,
  naturalWidth,
  naturalHeight,
}: CaptureEditorCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const layoutRef = useRef<ReturnType<typeof computeCaptureLayout> | null>(null);
  const scaleRef = useRef(1);
  const draftRef = useRef<NormalizedRect | null>(null);
  const dragRef = useRef<RegionDragState | { startX: number; startY: number; origin: NormalizedRect } | null>(
    null,
  );

  const settings = useCaptureEditorStore((state) => state.settings);
  const activeTool = useCaptureEditorStore((state) => state.activeTool);
  const selectedId = useCaptureEditorStore((state) => state.selectedId);
  const [draftRect, setDraftRect] = useState<NormalizedRect | null>(null);

  const isCropPreview = activeTool === 'crop';

  const redraw = useCallback(async () => {
    const canvas = canvasRef.current;
    const image = imageRef.current;
    if (!canvas || !image) return;

    const layout = computeCaptureLayout(naturalWidth, naturalHeight, settings, {
      cropPreview: isCropPreview,
    });
    layoutRef.current = layout;
    const scale = Math.min(1, PREVIEW_MAX_EDGE / Math.max(layout.canvasWidth, layout.canvasHeight));
    scaleRef.current = scale;

    canvas.width = Math.max(1, Math.round(layout.canvasWidth * scale));
    canvas.height = Math.max(1, Math.round(layout.canvasHeight * scale));

    const context = canvas.getContext('2d');
    if (!context) return;

    context.setTransform(scale, 0, 0, scale, 0, 0);
    await paintCaptureComposite(context, {
      image,
      naturalWidth,
      naturalHeight,
      settings,
      cropPreview: isCropPreview,
    });
    drawCaptureOverlay(context, layout, settings, selectedId, draftRef.current, activeTool);
    context.setTransform(1, 0, 0, 1, 0, 0);
  }, [activeTool, isCropPreview, naturalHeight, naturalWidth, selectedId, settings]);

  useEffect(() => {
    const image = new Image();
    image.onload = () => {
      imageRef.current = image;
      void redraw();
    };
    image.src = imageDataUrl;
  }, [imageDataUrl, redraw]);

  useEffect(() => {
    void redraw();
  }, [redraw, draftRect]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Enter') return;
      if (useCaptureEditorStore.getState().activeTool !== 'crop') return;

      const target = event.target as HTMLElement | null;
      if (target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA') return;

      event.preventDefault();
      useCaptureEditorStore.getState().finalizeCrop();
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const toCanvasCoords = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * canvas.width;
    const y = ((event.clientY - rect.top) / rect.height) * canvas.height;
    return { x: x / scaleRef.current, y: y / scaleRef.current };
  };

  const getNormalizedPoint = (point: { x: number; y: number }, layout: ReturnType<typeof computeCaptureLayout>) => {
    if (activeTool === 'crop') {
      return canvasPointToSourceNormalized(point.x, point.y, layout);
    }
    return canvasPointToCroppedNormalized(point.x, point.y, layout);
  };

  const updateSelectCursor = (
    point: { x: number; y: number },
    layout: ReturnType<typeof computeCaptureLayout>,
    canvas: HTMLCanvasElement,
  ) => {
    if (activeTool === 'blur' || activeTool === 'redact' || activeTool === 'crop') {
      canvas.style.cursor = 'crosshair';
      return;
    }

    if (activeTool !== 'select') {
      canvas.style.cursor = 'default';
      return;
    }

    const selected = settings.privacyRegions.find((item) => item.id === selectedId);
    if (selected) {
      const canvasRect = normalizedToCanvasRect(selected.rect, layout);
      const handle = hitTestPrivacyRegionHandle(point.x, point.y, canvasRect);
      if (handle) {
        canvas.style.cursor = getPrivacyRegionHandleCursor(handle);
        return;
      }
    }

    const normalized = canvasPointToCroppedNormalized(point.x, point.y, layout);
    if (normalized && hitTestCaptureSelection(normalized.x, normalized.y, settings)) {
      canvas.style.cursor = 'move';
      return;
    }

    canvas.style.cursor = 'default';
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const layout = layoutRef.current;
    const point = toCanvasCoords(event);
    if (!layout || !point) return;

    const normalized = getNormalizedPoint(point, layout);
    if (!normalized) return;

    event.currentTarget.setPointerCapture(event.pointerId);

    if (activeTool === 'select') {
      const store = useCaptureEditorStore.getState();

      if (selectedId) {
        const selected = settings.privacyRegions.find((item) => item.id === selectedId);
        if (selected) {
          const handle = hitTestPrivacyRegionHandle(
            point.x,
            point.y,
            normalizedToCanvasRect(selected.rect, layout),
          );
          if (handle) {
            dragRef.current = { kind: 'resize', handle, origin: selected.rect };
            return;
          }
        }
      }

      const hit = hitTestCaptureSelection(normalized.x, normalized.y, settings);
      store.setSelectedId(hit);
      if (hit) {
        const region = settings.privacyRegions.find((item) => item.id === hit);
        if (region) {
          dragRef.current = {
            kind: 'move',
            startX: normalized.x,
            startY: normalized.y,
            origin: region.rect,
          };
        }
      }
      return;
    }

    if (activeTool === 'crop') {
      dragRef.current = { startX: normalized.x, startY: normalized.y, origin: settings.crop };
      return;
    }

    dragRef.current = {
      startX: normalized.x,
      startY: normalized.y,
      origin: { x: normalized.x, y: normalized.y, width: 0, height: 0 },
    };
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const layout = layoutRef.current;
    const drag = dragRef.current;
    const point = toCanvasCoords(event);
    const canvas = canvasRef.current;
    if (!layout || !point) return;

    if (!drag && canvas) {
      updateSelectCursor(point, layout, canvas);
      return;
    }

    if (!drag) return;

    const normalized = getNormalizedPoint(point, layout);
    if (!normalized) return;

    if (activeTool === 'select' && useCaptureEditorStore.getState().selectedId) {
      const id = useCaptureEditorStore.getState().selectedId!;

      if ('kind' in drag && drag.kind === 'resize') {
        const next = resizeNormalizedRect(drag.origin, drag.handle, normalized.x, normalized.y);
        useCaptureEditorStore.getState().updatePrivacyRegion(id, { rect: next });
        return;
      }

      if ('kind' in drag && drag.kind === 'move') {
        const dx = normalized.x - drag.startX;
        const dy = normalized.y - drag.startY;
        const next = {
          x: Math.max(0, Math.min(1 - drag.origin.width, drag.origin.x + dx)),
          y: Math.max(0, Math.min(1 - drag.origin.height, drag.origin.y + dy)),
          width: drag.origin.width,
          height: drag.origin.height,
        };
        useCaptureEditorStore.getState().updatePrivacyRegion(id, { rect: next });
      }
      return;
    }

    if (activeTool === 'crop' && 'origin' in drag && !('kind' in drag)) {
      const crop = normalizeRectFromPoints(drag.startX, drag.startY, normalized.x, normalized.y);
      useCaptureEditorStore.getState().setCrop(crop, false);
      return;
    }

    if ('startX' in drag && !('kind' in drag)) {
      const draft = normalizeRectFromPoints(drag.startX, drag.startY, normalized.x, normalized.y);
      draftRef.current = draft;
      setDraftRect(draft);
    }
  };

  const handlePointerUp = () => {
    const drag = dragRef.current;
    dragRef.current = null;

    if (!drag) return;

    if (activeTool === 'crop') {
      return;
    }

    if (activeTool === 'select') {
      useCaptureEditorStore.getState().commitSettings(useCaptureEditorStore.getState().settings);
      return;
    }

    const draft = draftRef.current;
    draftRef.current = null;
    setDraftRect(null);
    if (!draft) return;

    const store = useCaptureEditorStore.getState();
    if (activeTool === 'blur') {
      store.addPrivacyRegion({ rect: draft, mode: 'blur', intensity: 12 });
      return;
    }
    if (activeTool === 'redact') {
      store.addPrivacyRegion({ rect: draft, mode: 'redact', intensity: 0 });
    }
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-slate-100/80">
      <canvas
        ref={canvasRef}
        tabIndex={0}
        className="mx-auto max-h-full w-full touch-none outline-none focus-visible:ring-2 focus-visible:ring-peacock-500 focus-visible:ring-offset-2"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        aria-label="Screenshot editor canvas"
      />
    </div>
  );
};
