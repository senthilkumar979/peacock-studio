const COUNTDOWN_SECONDS = [3, 2, 1] as const;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

export interface StartRecordingCountdownUi {
  setCountdownVisible: (visible: boolean) => void;
  setCountdownValue: (value: number) => void;
  setStatusBadgeCountdown: (value: number) => void;
}

export async function runStartRecordingCountdown(
  ui: StartRecordingCountdownUi,
  startRecording: () => Promise<void>,
): Promise<void> {
  ui.setCountdownVisible(true);

  for (const value of COUNTDOWN_SECONDS) {
    ui.setCountdownValue(value);
    ui.setStatusBadgeCountdown(value);
    await delay(1000);
  }

  await startRecording();
}
