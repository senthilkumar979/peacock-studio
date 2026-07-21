import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Camera } from 'lucide-react';
import { AppFooter } from '@/components/AppFooter';
import { SiteNav } from '@/components/site/SiteNav';
import type { Product } from './productsData';
import { DASHBOARD_PATH } from '@/constants/routes';
import { CaptureEditorHero } from './CaptureEditorHero';
import { CaptureEditorPainPoints } from './CaptureEditorPainPoints';
import { CaptureEditorWorkflow } from './CaptureEditorWorkflow';
import {
  CAPTURE_EDITOR_CAPABILITY_GROUPS,
  CAPTURE_EDITOR_IMAGE_BASE,
} from './captureEditorData';
import { ProductCapabilityGroupSection } from './ProductCapabilityGroupSection';
import { getExtensionGatePath } from '@/utils/extensionGate';

interface CaptureEditorDetailPageProps {
  product: Product;
}

export const CaptureEditorDetailPage = ({ product }: CaptureEditorDetailPageProps) => (
  <div className="landing-page min-h-screen">
    <SiteNav />
    <CaptureEditorHero product={product} />
    <CaptureEditorPainPoints />
    <CaptureEditorWorkflow />

    <section id="capabilities" className="landing-section-muted scroll-mt-28">
      <div className="landing-section-inner">
        <motion.header
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          className="landing-section-header max-w-3xl"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-700">
            Capabilities
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Capture, edit, share — without the clutter
          </h2>
          <p className="mt-4 text-base leading-relaxed text-slate-600">
            Product-level detail on Capture & Editor. Add screenshots under{' '}
            <code className="rounded bg-white px-1.5 py-0.5 text-sm text-peacock-800 ring-1 ring-slate-200">
              packages/app/public/products/capture-screenshot-editor/
            </code>{' '}
            using the filename shown in each placeholder.
          </p>
        </motion.header>

        <div className="mt-10 space-y-8">
          {CAPTURE_EDITOR_CAPABILITY_GROUPS.map((group, index) => {
            const capabilityStartIndex = CAPTURE_EDITOR_CAPABILITY_GROUPS.slice(0, index).reduce(
              (total, previousGroup) => total + previousGroup.capabilities.length,
              0,
            );

            return (
              <ProductCapabilityGroupSection
                key={group.id}
                group={group}
                groupIndex={index}
                capabilityStartIndex={capabilityStartIndex}
                imageBase={CAPTURE_EDITOR_IMAGE_BASE}
                accentClass="text-slate-700"
              />
            );
          })}
        </div>
      </div>
    </section>

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
              Capture your next screenshot
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-white/90">
              Open the Peacock extension, choose a capture mode, then share from the preview page or
              polish in the editor before pasting into Teams, Slack, or Confluence.
            </p>
            <Link
              to={getExtensionGatePath(DASHBOARD_PATH)}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-800 shadow-lg transition hover:bg-slate-100"
            >
              <Camera className="h-4 w-4" aria-hidden />
              Open Peacock
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </motion.div>
        </div>
      </div>
    </section>

    <AppFooter />
  </div>
);
