import { useCallback, useEffect, useState } from 'react';

export function usePlayerStepDetailsVisibility(stepId: string) {
  const [isDetailsVisible, setIsDetailsVisible] = useState(true);

  useEffect(() => {
    setIsDetailsVisible(true);
  }, [stepId]);

  const toggleDetails = useCallback(() => {
    setIsDetailsVisible((visible) => !visible);
  }, []);

  return { isDetailsVisible, toggleDetails };
}
