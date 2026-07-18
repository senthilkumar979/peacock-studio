let activePublicShareToken: string | null = null;

export function setPublicShareToken(token: string | null): void {
  activePublicShareToken = token;
}

export function getPublicShareToken(): string | null {
  return activePublicShareToken;
}

export function isPublicShareActive(): boolean {
  return activePublicShareToken !== null;
}
