type ClassValue = string | false | null | undefined;

/** Join truthy class name fragments (no external deps). */
export function cn(...values: ClassValue[]): string {
  return values.filter(Boolean).join(' ');
}
