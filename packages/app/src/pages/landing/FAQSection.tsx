import { motion } from 'framer-motion';
import { CircleHelp } from 'lucide-react';
import { LandingSectionShell } from './LandingSectionShell';
import { LANDING_FAQS } from './landingData';

export const FAQSection = () => (
  <LandingSectionShell
    id="faq"
    tone="muted"
    eyebrow="FAQ"
    title="Questions teams ask before they start"
    description="Answers based on what Peacock Studio actually ships today."
  >
    <div className="mx-auto max-w-3xl space-y-3">
      {LANDING_FAQS.map((faq, index) => (
        <motion.details
          key={faq.question}
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: index * 0.04 }}
          className="group rounded-2xl border border-slate-200 bg-slate-50/80 open:bg-white open:shadow-sm"
        >
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-sm font-semibold text-slate-900">
            <span>{faq.question}</span>
            <CircleHelp className="h-4 w-4 shrink-0 text-peacock-600 transition group-open:rotate-12" aria-hidden />
          </summary>
          <p className="border-t border-slate-100 px-5 pb-4 pt-3 text-sm leading-relaxed text-slate-600">
            {faq.answer}
          </p>
        </motion.details>
      ))}
    </div>
  </LandingSectionShell>
);
