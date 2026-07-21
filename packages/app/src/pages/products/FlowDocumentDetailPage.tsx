import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { AppFooter } from '@/components/AppFooter';
import { SiteNav } from '@/components/site/SiteNav';
import type { Product } from './productsData';
import { FLOW_DOCUMENT_CAPABILITY_GROUPS, FLOW_DOCUMENT_IMAGE_BASE } from './flowDocumentsData';
import { FlowDocumentHero } from './FlowDocumentHero';
import { FlowDocumentLifecycle } from './FlowDocumentLifecycle';
import { ProductCapabilityGroupSection } from './ProductCapabilityGroupSection';
import { getExtensionGatePath } from '@/utils/extensionGate';

interface FlowDocumentDetailPageProps {
  product: Product;
}

export const FlowDocumentDetailPage = ({ product }: FlowDocumentDetailPageProps) => (
  <div className="landing-page min-h-screen">
    <SiteNav />
    <FlowDocumentHero product={product} />
    <FlowDocumentLifecycle />

    <section id="capabilities" className="landing-section-light scroll-mt-28">
      <div className="landing-section-inner">
        <motion.header
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          className="landing-section-header max-w-3xl"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-peacock-700">
            Capabilities
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Every building block, explained
          </h2>
          <p className="mt-4 text-base leading-relaxed text-slate-600">
            Product-level detail on how each feature works inside Flow Documents — written for
            builders, not a repeat of the landing overview or role-specific solution pages. Each
            block includes a screenshot slot; add PNG or WebP files under{' '}
            <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm text-peacock-800">
              packages/app/public/products/flow-documents/
            </code>{' '}
            using the filename shown in the placeholder.
          </p>
        </motion.header>

        <div className="mt-10 space-y-8">
          {FLOW_DOCUMENT_CAPABILITY_GROUPS.map((group, index) => {
            const capabilityStartIndex = FLOW_DOCUMENT_CAPABILITY_GROUPS.slice(0, index).reduce(
              (total, previousGroup) => total + previousGroup.capabilities.length,
              0,
            );

            return (
              <ProductCapabilityGroupSection
                key={group.id}
                group={group}
                groupIndex={index}
                capabilityStartIndex={capabilityStartIndex}
                imageBase={FLOW_DOCUMENT_IMAGE_BASE}
              />
            );
          })}
        </div>
      </div>
    </section>

    <section className="landing-section-muted">
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
              Record your first flow document
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-white/90">
              Install the extension, capture a workflow, then refine steps and structure in the
              editor before opening doc view or player.
            </p>
            <Link
              to={getExtensionGatePath("/editor")}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-peacock-800 shadow-lg transition hover:bg-slate-100"
            >
              Open flow editor
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </motion.div>
        </div>
      </div>
    </section>

    <AppFooter />
  </div>
);
