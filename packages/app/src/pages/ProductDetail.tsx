import { Link, Navigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { useEffect } from 'react';
import { AppFooter } from '@/components/AppFooter';
import { SiteNav } from '@/components/site/SiteNav';
import { CaptureEditorDetailPage } from '@/pages/products/CaptureEditorDetailPage';
import { FlowDocumentDetailPage } from '@/pages/products/FlowDocumentDetailPage';
import { ProductTourDetailPage } from '@/pages/products/ProductTourDetailPage';
import { ProductScreenshotPlaceholder } from '@/pages/products/ProductScreenshotPlaceholder';
import { getProductBySlug } from '@/pages/products/productsData';

export const ProductDetail = () => {
  const { productSlug } = useParams<{ productSlug: string }>();
  const product = getProductBySlug(productSlug);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [productSlug]);

  if (!product) return <Navigate to="/products" replace />;

  if (product.slug === 'flow-documents') {
    return <FlowDocumentDetailPage product={product} />;
  }

  if (product.slug === 'product-tours') {
    return <ProductTourDetailPage product={product} />;
  }

  if (product.slug === 'capture-screenshot-editor') {
    return <CaptureEditorDetailPage product={product} />;
  }

  const Icon = product.icon;

  return (
    <div className="landing-page min-h-screen">
      <SiteNav />

      <section className={`relative overflow-hidden border-b border-slate-800 bg-gradient-to-br ${product.accentGradient} px-6 pb-16 pt-28 text-white sm:pb-20 sm:pt-32`}>
        <div className="relative mx-auto max-w-7xl">
          <Link to="/products" className="text-sm text-white/70 transition hover:text-white">
            ← All products
          </Link>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 max-w-3xl"
          >
            <span className="inline-flex rounded-2xl bg-white/15 p-3 ring-1 ring-white/20">
              <Icon className="h-6 w-6" aria-hidden />
            </span>
            <h1 className="mt-5 text-4xl font-bold tracking-tight sm:text-5xl">{product.name}</h1>
            <p className="mt-3 text-lg text-white/90">{product.tagline}</p>
            <p className="mt-4 text-base leading-relaxed text-white/80">{product.summary}</p>
          </motion.div>
        </div>
      </section>

      <section className="landing-section-light">
        <div className="landing-section-inner grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Overview</h2>
            <p className="mt-4 text-base leading-relaxed text-slate-600">{product.overview}</p>

            <h3 className="mt-10 text-lg font-semibold text-slate-900">Key capabilities</h3>
            <ul className="mt-4 space-y-4">
              {product.highlights.map((highlight) => (
                <li key={highlight.title} className="rounded-xl border border-slate-200 bg-white p-4">
                  <p className="font-semibold text-slate-900">{highlight.title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-slate-600">{highlight.description}</p>
                </li>
              ))}
            </ul>

            <h3 className="mt-10 text-lg font-semibold text-slate-900">Ideal for</h3>
            <ul className="mt-4 flex flex-wrap gap-2">
              {product.idealFor.map((item) => (
                <li
                  key={item}
                  className="inline-flex items-center gap-1.5 rounded-full border border-peacock-200 bg-peacock-50 px-3 py-1.5 text-sm font-medium text-peacock-800"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <ProductScreenshotPlaceholder productName={product.name} />
        </div>
      </section>

      <section className="landing-section-muted">
        <div className="landing-section-inner flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-slate-900">Ready to try {product.shortName}?</p>
            <p className="mt-1 text-sm text-slate-600">Open the app and start from your first capture.</p>
          </div>
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-xl bg-peacock-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-peacock-800"
          >
            Open App
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
      </section>

      <AppFooter />
    </div>
  );
};
