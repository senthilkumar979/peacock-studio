import { useState } from 'react';

export function useLibraryGuidePanel(hasItems: boolean) {
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  return {
    showGuide: !hasItems || isGuideOpen,
    showGuideToggle: hasItems,
    isGuideOpen,
    toggleGuide: () => setIsGuideOpen((open) => !open),
  };
}
