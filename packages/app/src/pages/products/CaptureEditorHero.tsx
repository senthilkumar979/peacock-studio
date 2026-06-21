import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Camera, Check } from 'lucide-react';
import type { Product } from './productsData';
import { CAPTURE_EDITOR_HERO_IMAGE, CAPTURE_EDITOR_PAGE } from './captureEditorData';
import { ProductFeatureImage } from './ProductFeatureImage';

interface CaptureEditorHeroProps {
  product: Product;
}

export const CaptureEditorHero = ({ product }: CaptureEditorHeroProps) => {
  const Icon = product.icon;

  return (
    <section
      className={`relative overflow-hidden border-b border-slate-800 bg-gradient-to-br ${product.accentGradient} px-6 pb-16 pt-28 text-white sm:pb-20 sm:pt-32`}
    >
      <div
        className="pointer-events-none absolute -right-24 top-0 h-96 w-96 rounded-full bg-white/10 blur-3xl"
        aria-hidden
      />
      <div className="relative mx-auto max-w-7xl">
        <nav className="text-sm text-white/70" aria-label="Breadcrumb">
          <Link to="/products" className="transition hover:text-white">
            Products
          </Link>
          <span className="mx-2 text-white/40" aria-hidden>
            /
          </span>
          <span className="font-medium text-white/90">{product.shortName}</span>
        </nav>

        <div className="mt-10 grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex rounded-2xl bg-white/15 p-3 ring-1 ring-white/20">
                <Icon className="h-6 w-6" aria-hidden />
              </span>
              <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-white/90">
                {CAPTURE_EDITOR_PAGE.eyebrow}
              </span>
            </div>
            <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-5xl">{product.name}</h1>
            <p className="mt-4 text-lg text-white/90">{product.tagline}</p>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/80">
              {CAPTURE_EDITOR_PAGE.intro}
            </p>
            <p className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm text-white/90">
              <Camera className="h-4 w-4 text-brand-cyan" aria-hidden />
              Capture from the Peacock Chrome extension
            </p>
          </motion.div>

          <motion.aside
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-2xl border border-white/15 bg-white/10 p-6 backdrop-blur-sm"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/70">
              Capture & Editor fits when
            </p>
            <ul className="mt-4 space-y-3">
              {CAPTURE_EDITOR_PAGE.fitSignals.map((signal) => (
                <li key={signal} className="flex items-start gap-2.5 text-sm leading-relaxed text-white/90">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-cyan" aria-hidden />
                  <span>{signal}</span>
                </li>
              ))}
            </ul>
          </motion.aside>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.14 }}
            className="lg:col-span-2"
          >
            <ProductFeatureImage
              title="Capture & Editor overview"
              imageSrc={CAPTURE_EDITOR_HERO_IMAGE.src}
              suggestedPublicPath={CAPTURE_EDITOR_HERO_IMAGE.publicPath}
              variant="dark"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
};
