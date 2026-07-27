import { ImageIcon } from 'lucide-react';

interface ProductScreenshotPlaceholderProps {
  productName: string;
  /** Optional path under /public, e.g. `/product-shots/flow-docs.png` */
  imageSrc?: string;
}

/**
 * Shows a real product shot when `imageSrc` is provided and loads;
 * otherwise a dashed placeholder so marketing pages never break.
 */
export const ProductScreenshotPlaceholder = ({
  productName,
  imageSrc,
}: ProductScreenshotPlaceholderProps) => {
  if (imageSrc) {
    return (
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-sm">
        <img
          src={imageSrc}
          alt={`${productName} product screenshot`}
          width={1280}
          height={720}
          className="aspect-video w-full object-cover object-top"
          loading="lazy"
        />
      </div>
    );
  }

  return (
    <div className="flex aspect-video flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 px-6 text-center">
      <span className="inline-flex rounded-2xl bg-white p-4 text-slate-400 ring-1 ring-slate-200">
        <ImageIcon className="h-8 w-8" aria-hidden />
      </span>
      <p className="mt-4 text-sm font-semibold text-slate-700">Screenshot placeholder</p>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-slate-500">
        Add a product screenshot for {productName} under{' '}
        <code className="rounded bg-slate-200/80 px-1 text-xs">public/product-shots/</code> and pass{' '}
        <code className="rounded bg-slate-200/80 px-1 text-xs">imageSrc</code>.
      </p>
    </div>
  );
};
