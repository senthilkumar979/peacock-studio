export interface ImeCompositionState {
  isComposing: boolean;
}

export function createImeCompositionState(): ImeCompositionState {
  return { isComposing: false };
}

export function shouldIgnoreInputWhileComposing(
  state: ImeCompositionState,
  event: Event,
): boolean {
  if (state.isComposing) return true;
  if ('isComposing' in event && event.isComposing) return true;
  return false;
}
