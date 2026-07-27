import { ImageIcon } from "lucide-react";
import { useState } from "react";

interface ProductFeatureImageProps {
  title: string;
  imageSrc: string;
  imageAlt?: string;
  suggestedPublicPath: string;
  variant?: "light" | "dark";
  /** Tall/portrait screenshots (e.g. tour builder structure). */
  isFullHeight?: boolean;
  /** Above-the-fold images (heroes) — skip lazy loading. */
  priority?: boolean;
}

export const ProductFeatureImage = ({
  title,
  imageSrc,
  imageAlt,
  suggestedPublicPath,
  variant = "light",
  isFullHeight = false,
  priority = false,
}: ProductFeatureImageProps) => {
  const [hasLoadError, setHasLoadError] = useState(false);
  const isDark = variant === "dark";

  if (!hasLoadError) {
    return (
      <div
        className={`overflow-hidden rounded-xl ring-1 ${
          isFullHeight || isDark
            ? "bg-white ring-white/20"
            : "bg-slate-100 ring-slate-200"
        }`}
      >
        <img
          src={imageSrc}
          alt={imageAlt ?? `${title} screenshot`}
          width={isFullHeight ? 782 : 1280}
          height={isFullHeight ? 1584 : 720}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          fetchPriority={priority ? "high" : "auto"}
          className={
            isFullHeight
              ? "mx-auto h-auto max-h-[min(70vh,40rem)] w-full max-w-md object-contain object-top"
              : "aspect-video h-auto w-full object-cover object-top"
          }
          onError={() => setHasLoadError(true)}
        />
      </div>
    );
  }

  return (
    <div
      className={`flex w-full flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 py-6 text-center ${
        isFullHeight ? "aspect-[9/16] max-h-[min(70vh,40rem)] max-w-md mx-auto" : "aspect-video"
      } ${
        isDark
          ? "border-white/35 bg-white/5 text-white"
          : "border-slate-300 bg-slate-50 text-slate-700"
      }`}
    >
      <span
        className={`inline-flex rounded-2xl p-3 ring-1 ${
          isDark
            ? "bg-white/10 text-white/70 ring-white/20"
            : "bg-white text-slate-400 ring-slate-200"
        }`}
      >
        <ImageIcon className="h-7 w-7" aria-hidden />
      </span>
      <p
        className={`mt-4 text-sm font-semibold ${isDark ? "text-white" : "text-slate-800"}`}
      >
        Screenshot: {title}
      </p>
      <p
        className={`mt-2 max-w-xs text-xs leading-relaxed ${isDark ? "text-white/70" : "text-slate-500"}`}
      >
        Drop your image at
      </p>
      <code
        className={`mt-2 break-all rounded-lg px-3 py-2 text-[11px] font-medium ${
          isDark
            ? "bg-black/20 text-brand-cyan"
            : "bg-white text-peacock-800 ring-1 ring-slate-200"
        }`}
      >
        packages/app/public{suggestedPublicPath}
      </code>
    </div>
  );
};
