import { motion } from 'framer-motion';
import { CAPTURE_EDITOR_WORKFLOW } from './captureEditorData';

export const CaptureEditorWorkflow = () => (
  <section id="workflow" className="landing-section-light scroll-mt-28">
    <div className="landing-section-inner">
      <motion.header
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.35 }}
        className="max-w-3xl"
      >
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-peacock-700">
          Workflow
        </p>
        <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          From capture to clipboard in four steps
        </h2>
      </motion.header>

      <div className="mt-10 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {CAPTURE_EDITOR_WORKFLOW.map((stage, index) => (
          <motion.article
            key={stage.step}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ delay: index * 0.06 }}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-peacock-600">
              {stage.step}
            </span>
            <h3 className="mt-2 text-lg font-semibold text-slate-900">{stage.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">{stage.description}</p>
          </motion.article>
        ))}
      </div>
    </div>
  </section>
);
