let activePublicShareToken: string | null = null;
let activePublicSharePresentation: 'embed' | 'share' | null = null;

export function setPublicShareToken(
  token: string | null,
  presentation: 'embed' | 'share' | null = null,
): void {
  activePublicShareToken = token;
  activePublicSharePresentation = token ? presentation ?? 'share' : null;
}

export function getPublicShareToken(): string | null {
  return activePublicShareToken;
}

export function getPublicSharePresentation(): 'embed' | 'share' | null {
  return activePublicSharePresentation;
}

export function isPublicShareActive(): boolean {
  return activePublicShareToken !== null;
}

export function isPublicShareEmbed(): boolean {
  return activePublicSharePresentation === 'embed';
}
