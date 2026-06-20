import { motion } from 'framer-motion';
import {
  FLOW_DOCUMENT_LIFECYCLE,
  FLOW_DOCUMENT_PAGE,
  getFlowDocumentCapability,
} from './flowDocumentsData';

export const FlowDocumentLifecycle = () => (
  <section id="lifecycle" className="landing-section-muted scroll-mt-28">
    <div className="landing-section-inner">
      <motion.header
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.35 }}
        className="max-w-3xl"
      >
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-peacock-700">
          Lifecycle
        </p>
        <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          {FLOW_DOCUMENT_PAGE.lifecycleHeadline}
        </h2>
        <p className="mt-4 text-base leading-relaxed text-slate-600">
          {FLOW_DOCUMENT_PAGE.lifecycleDescription}
        </p>
      </motion.header>

      <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {FLOW_DOCUMENT_LIFECYCLE.map((stage, index) => (
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
            <ul className="mt-4 space-y-1.5">
              {stage.capabilityIds.map((id) => {
                const capability = getFlowDocumentCapability(id);
                if (!capability) return null;
                return (
                  <li key={id}>
                    <a
                      href={`#${id}`}
                      className="text-xs font-medium text-peacock-700 transition hover:text-peacock-900"
                    >
                      {capability.title}
                    </a>
                  </li>
                );
              })}
            </ul>
          </motion.article>
        ))}
      </div>
    </div>
  </section>
);
