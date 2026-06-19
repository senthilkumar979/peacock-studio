import { useEffect, useState } from 'react';

export function useActiveSection(sectionIds: readonly string[], offsetPx = 140) {
  const [activeId, setActiveId] = useState<string>(sectionIds[0] ?? '');

  useEffect(() => {
    const updateActiveSection = () => {
      const scrollPosition = window.scrollY + offsetPx;
      let current = sectionIds[0] ?? '';

      for (const id of sectionIds) {
        const element = document.getElementById(id);
        if (element && element.offsetTop <= scrollPosition) current = id;
      }

      setActiveId(current);
    };

    updateActiveSection();
    window.addEventListener('scroll', updateActiveSection, { passive: true });
    window.addEventListener('resize', updateActiveSection);

    return () => {
      window.removeEventListener('scroll', updateActiveSection);
      window.removeEventListener('resize', updateActiveSection);
    };
  }, [sectionIds, offsetPx]);

  return activeId;
}
