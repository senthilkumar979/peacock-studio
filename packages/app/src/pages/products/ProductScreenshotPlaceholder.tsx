import { ImageIcon } from 'lucide-react';

interface ProductScreenshotPlaceholderProps {
  productName: string;
}

export const ProductScreenshotPlaceholder = ({ productName }: ProductScreenshotPlaceholderProps) => (
  <div className="flex aspect-video flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 px-6 text-center">
    <span className="inline-flex rounded-2xl bg-white p-4 text-slate-400 ring-1 ring-slate-200">
      <ImageIcon className="h-8 w-8" aria-hidden />
    </span>
    <p className="mt-4 text-sm font-semibold text-slate-700">Screenshot placeholder</p>
    <p className="mt-2 max-w-md text-sm leading-relaxed text-slate-500">
      Add a product screenshot or walkthrough image for {productName} here.
    </p>
  </div>
);
