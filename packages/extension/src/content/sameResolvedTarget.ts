export function isSameResolvedTarget(a: EventTarget, b: EventTarget): boolean {
  if (a === b) return true;
  if (!(a instanceof Node) || !(b instanceof Node)) return false;
  return a.contains(b) || b.contains(a);
}
