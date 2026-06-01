export function getExtensionId(): string | null {
  const fromEnv = import.meta.env.VITE_EXTENSION_ID?.trim();
  return fromEnv || null;
}
