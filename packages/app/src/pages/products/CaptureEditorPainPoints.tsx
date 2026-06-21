import { motion } from 'framer-motion';
import { MANUAL_SCREENSHOT_PAIN_POINTS } from './captureEditorData';

export const CaptureEditorPainPoints = () => (
  <section id="manual-pain" className="landing-section-muted scroll-mt-28">
    <div className="landing-section-inner">
      <motion.header
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.35 }}
        className="max-w-3xl"
      >
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-600">
          The problem
        </p>
        <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          Manual screenshots are boring — and hard to clean up
        </h2>
        <p className="mt-4 text-base leading-relaxed text-slate-600">
          Snipping tools get you a PNG. Everything after that — cropping, blurring, captioning,
          finding the file again — is on you.
        </p>
      </motion.header>

      <div className="mt-10 grid gap-5 md:grid-cols-3">
        {MANUAL_SCREENSHOT_PAIN_POINTS.map((point, index) => {
          const Icon = point.icon;
          return (
            <motion.article
              key={point.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ delay: index * 0.06 }}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <span className="inline-flex rounded-xl bg-slate-100 p-2.5 text-slate-600 ring-1 ring-slate-200">
                <Icon className="h-5 w-5" aria-hidden />
              </span>
              <h3 className="mt-4 text-lg font-semibold text-slate-900">{point.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{point.description}</p>
            </motion.article>
          );
        })}
      </div>
    </div>
  </section>
);
