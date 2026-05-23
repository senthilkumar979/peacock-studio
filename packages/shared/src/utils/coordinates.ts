export function normalizePosition(
  x: number,
  y: number,
  viewport: { width: number; height: number }
): { xPercent: number; yPercent: number } {
  return {
    xPercent: viewport.width > 0 ? x / viewport.width : 0,
    yPercent: viewport.height > 0 ? y / viewport.height : 0,
  };
}

export function denormalizePosition(
  xPercent: number,
  yPercent: number,
  renderedWidth: number,
  renderedHeight: number
): { left: number; top: number } {
  return {
    left: xPercent * renderedWidth,
    top: yPercent * renderedHeight,
  };
}

export function getViewport(): {
  width: number;
  height: number;
  scrollX: number;
  scrollY: number;
  dpr: number;
} {
  return {
    width: window.innerWidth,
    height: window.innerHeight,
    scrollX: window.scrollX,
    scrollY: window.scrollY,
    dpr: window.devicePixelRatio,
  };
}
