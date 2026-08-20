export function buildScrollStops(fullHeight: number, viewportHeight: number): number[] {
  const maxScroll = Math.max(0, fullHeight - viewportHeight);
  if (maxScroll === 0) return [0];

  const stops: number[] = [];
  for (let top = 0; top < maxScroll; top += viewportHeight) {
    stops.push(top);
  }
  stops.push(maxScroll);
  return [...new Set(stops)];
}
