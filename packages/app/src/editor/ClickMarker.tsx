import { useEffect, useState } from 'react';
import { PulseMarker } from './PulseMarker';

interface ClickMarkerProps {
  xPercent: number;
  yPercent: number;
  imageRef: React.RefObject<HTMLImageElement | null>;
}

export const ClickMarker = ({ xPercent, yPercent, imageRef }: ClickMarkerProps) => {
  const [pos, setPos] = useState({ left: 0, top: 0 });

  useEffect(() => {
    const img = imageRef.current;
    if (!img) return;

    const update = () => {
      setPos({
        left: xPercent * img.clientWidth,
        top: yPercent * img.clientHeight,
      });
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(img);
    return () => observer.disconnect();
  }, [xPercent, yPercent, imageRef]);

  return (
    <div
      className="pointer-events-none absolute"
      style={{
        left: pos.left,
        top: pos.top,
        transform: 'translate(-50%, -50%)',
      }}
    >
      <PulseMarker />
    </div>
  );
};
