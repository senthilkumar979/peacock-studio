import { useEffect, useState } from 'react';
import {
  readFlowDocDefaultView,
  type FlowDocDefaultView,
} from '@/constants/flowDocViewPreferences';

export function useFlowDocDefaultView(): FlowDocDefaultView {
  const [defaultView, setDefaultView] = useState<FlowDocDefaultView>(readFlowDocDefaultView);

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key === 'peacock-flow-doc-default-view') {
        setDefaultView(readFlowDocDefaultView());
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  return defaultView;
}
