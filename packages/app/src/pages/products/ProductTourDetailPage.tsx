import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Route } from 'lucide-react';
import { AppFooter } from '@/components/AppFooter';
import { SiteNav } from '@/components/site/SiteNav';
import type { Product } from './productsData';
import { ProductTourAdvantages } from './ProductTourAdvantages';
import { ProductTourAudienceGrid } from './ProductTourAudienceGrid';
import { ProductTourHero } from './ProductTourHero';
import { ProductTourPersonaBenefits } from './ProductTourPersonaBenefits';
import { ProductTourStructureExample } from './ProductTourStructureExample';
import { ProductTourTraditionalGap } from './ProductTourTraditionalGap';
import { getExtensionGatePath } from '@/utils/extensionGate';

interface ProductTourDetailPageProps {
  product: Product;
}

export const ProductTourDetailPage = ({ product }: ProductTourDetailPageProps) => (
  <div className="landing-page min-h-screen">
    <SiteNav />
    <ProductTourHero product={product} />
    <ProductTourTraditionalGap />
    <ProductTourAdvantages />
    <ProductTourStructureExample />
    <ProductTourPersonaBenefits />
    <ProductTourAudienceGrid />

    <section className="landing-section-light">
      <div className="landing-section-inner">
        <div
          className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${product.accentGradient} px-8 py-12 shadow-2xl sm:px-12`}
        >
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            className="relative max-w-2xl"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/80">
              Get started
            </p>
            <h2 className="mt-3 text-2xl font-bold text-white sm:text-3xl">
              Compose your first product tour
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-white/90">
              Capture flow documents for each scenario, then group them into features and anchor the
              tour to a persona — ready for sales, onboarding, or support playback.
            </p>
            <Link
              to={getExtensionGatePath("/tours/new")}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-brand-violet shadow-lg transition hover:bg-slate-100"
            >
              <Route className="h-4 w-4" aria-hidden />
              Create a product tour
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </motion.div>
        </div>
      </div>
    </section>

    <AppFooter />
  </div>
);
