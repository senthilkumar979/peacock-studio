import { useEffect, useState } from 'react';

const getHeroExitThreshold = () => window.innerHeight;
const getHeroEnterThreshold = () => window.innerHeight * 0.88;

export const useLandingNavVisibility = () => {
  const [pastHero, setPastHero] = useState(false);

  useEffect(() => {
    const updateVisibility = () => {
      const scrollY = window.scrollY;
      setPastHero((current) => {
        if (!current && scrollY >= getHeroExitThreshold()) return true;
        if (current && scrollY <= getHeroEnterThreshold()) return false;
        return current;
      });
    };

    updateVisibility();
    window.addEventListener('scroll', updateVisibility, { passive: true });
    window.addEventListener('resize', updateVisibility);

    return () => {
      window.removeEventListener('scroll', updateVisibility);
      window.removeEventListener('resize', updateVisibility);
    };
  }, []);

  return {
    showMainNav: !pastHero,
    showSubNav: pastHero,
  };
};
