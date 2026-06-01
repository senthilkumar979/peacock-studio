export function getGradientVector(
  angleDeg: number,
  width: number,
  height: number,
): { x0: number; y0: number; x1: number; y1: number } {
  const angleRad = ((angleDeg - 90) * Math.PI) / 180;
  const centerX = width / 2;
  const centerY = height / 2;
  const length = Math.sqrt(width * width + height * height) / 2;

  return {
    x0: centerX - Math.cos(angleRad) * length,
    y0: centerY - Math.sin(angleRad) * length,
    x1: centerX + Math.cos(angleRad) * length,
    y1: centerY + Math.sin(angleRad) * length,
  };
}
