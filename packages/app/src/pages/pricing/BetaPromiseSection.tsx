import { motion } from 'framer-motion';
import { MessageSquare } from 'lucide-react';
import { openSupportChat } from '@/utils/support';
import { FREE_PROMISES } from './pricingData';

export const FreePromiseSection = () => (
  <section className="bg-slate-950 px-6 py-20 text-white">
    <div className="mx-auto max-w-6xl">
      <div className="text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-cyan">
          Our free-product promise
        </p>
        <h2 className="mt-3 text-3xl font-bold tracking-tight">
          Build useful documentation, not a bigger bill.
        </h2>
      </div>

      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {FREE_PROMISES.map((promise, index) => {
          const Icon = promise.icon;
          return (
            <motion.article
              key={promise.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.06 }}
              className="rounded-2xl border border-white/10 bg-white/5 p-5"
            >
              <span className="inline-flex rounded-xl bg-brand-cyan/20 p-2.5 text-brand-cyan">
                <Icon className="h-5 w-5" aria-hidden />
              </span>
              <h3 className="mt-4 text-base font-semibold text-white">{promise.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-300">
                {promise.description}
              </p>
            </motion.article>
          );
        })}
      </div>

      <div className="mx-auto mt-12 max-w-xl text-center">
        <p className="text-sm leading-relaxed text-slate-300">
          Peacock is still evolving. Your feedback helps us decide what to improve next.
        </p>
        <button
          type="button"
          onClick={openSupportChat}
          className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-brand-cyan transition hover:text-cyan-300"
        >
          <MessageSquare className="h-4 w-4" aria-hidden />
          Share product feedback
        </button>
      </div>
    </div>
  </section>
);
