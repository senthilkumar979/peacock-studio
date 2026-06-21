import { CheckCircle2, Sparkles } from 'lucide-react';
import type { ProductDetailCapability } from './productCapabilityTypes';

interface ProductDetailCapabilityContentProps {
  capability: ProductDetailCapability;
  layoutIndex: number;
  isImageRight: boolean;
  accentClass?: string;
}

export const ProductDetailCapabilityContent = ({
  capability,
  layoutIndex,
  isImageRight,
  accentClass = 'text-peacock-700',
}: ProductDetailCapabilityContentProps) => {
  const Icon = capability.icon;
  const featureNumber = String(layoutIndex + 1).padStart(2, '0');

  return (
    <div
      className={`relative flex flex-col justify-center overflow-hidden bg-slate-50/80 p-6 sm:p-8 lg:p-10 ${
        isImageRight ? 'lg:order-1' : 'lg:order-2'
      }`}
    >
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-slate-100/70 via-slate-50/40 to-peacock-50/30"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-16 left-0 h-44 w-44 rounded-full bg-peacock-200/20 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-10 top-0 h-36 w-36 rounded-full bg-slate-200/50 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35] [background-image:radial-gradient(circle_at_1px_1px,rgb(148_163_184/0.18)_1px,transparent_0)] [background-size:20px_20px]"
        aria-hidden
      />
      <span
        className="pointer-events-none absolute -right-2 top-4 select-none text-7xl font-bold leading-none text-slate-100 sm:text-8xl"
        aria-hidden
      >
        {featureNumber}
      </span>

      <div className="relative">
        <div className="flex items-center gap-3">
          <span className="inline-flex rounded-2xl bg-gradient-to-br from-peacock-100 to-peacock-50 p-3 text-peacock-700 ring-1 ring-peacock-200/70 shadow-sm shadow-peacock-100/50">
            <Icon className="h-5 w-5" aria-hidden />
          </span>
          <p className={`text-xs font-semibold uppercase tracking-[0.18em] ${accentClass}`}>
            Capability {featureNumber}
          </p>
        </div>

        <h4 className="mt-5 text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
          {capability.title}
        </h4>

        <div className="mt-6 space-y-4">
          <div className="rounded-2xl border border-slate-200/80 bg-white/90 p-5 shadow-sm backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <Sparkles className="h-3.5 w-3.5 text-slate-400" aria-hidden />
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                What it is
              </p>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-[0.9375rem] sm:leading-7">
              {capability.whatItIs}
            </p>
          </div>

          <div className="rounded-2xl border border-peacock-200/70 bg-gradient-to-br from-peacock-50 to-white p-5 shadow-sm shadow-peacock-100/30">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-peacock-600" aria-hidden />
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-peacock-800">
                Why it matters
              </p>
            </div>
            <p className="mt-3 text-sm font-medium leading-relaxed text-peacock-950/90 sm:text-[0.9375rem] sm:leading-7">
              {capability.benefit}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
