import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import type { SolutionRole } from "./solutionsData";
import { getExtensionGatePath } from '@/utils/extensionGate';

interface SolutionRoleDetailExtrasProps {
  role: SolutionRole;
}

export const SolutionRoleDetailExtras = ({
  role,
}: SolutionRoleDetailExtrasProps) => (
  <>
    <section id="workflows" className="landing-section-light scroll-mt-36">
      <div className="landing-section-inner">
        <motion.header
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          className="max-w-3xl"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-peacock-700">
            Typical workflows
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
            Real scenarios for {role.shortTitle.toLowerCase()}
          </h2>
        </motion.header>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {role.useCases.map((useCase, index) => (
            <motion.article
              key={useCase.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.4, delay: index * 0.06 }}
              className="group rounded-2xl border border-slate-200 bg-gradient-to-b from-white to-slate-50/80 p-6 transition hover:border-peacock-200 hover:shadow-md"
            >
              <span className="inline-flex rounded-xl bg-peacock-50 p-2.5 text-peacock-600 ring-1 ring-peacock-100">
                <Sparkles className="h-5 w-5" aria-hidden />
              </span>
              <h3 className="mt-4 text-base font-semibold text-slate-900">
                {useCase.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                {useCase.description}
              </p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>

    <section id="impact" className="landing-section-dark scroll-mt-36">
      <div className="landing-section-inner">
        <div className="lg:items-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            className="max-w-2xl mb-5"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-cyan">
              Business outcomes
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-white">
              What changes for your team
            </h2>
            <p className="mt-4 text-base leading-relaxed text-slate-300">
              Practical results teams report after replacing manual screenshots,
              ad hoc recordings, and one-off decks with Peacock.
            </p>
          </motion.div>
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:min-w-[28rem]">
            {role.businessOutcomes.map((outcome, index) => (
              <motion.div
                key={outcome.label}
                initial={{ opacity: 0, scale: 0.96 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, amount: 0.35 }}
                transition={{ duration: 0.35, delay: index * 0.08 }}
                className="rounded-2xl border border-white/10 bg-white/5 px-5 py-5 backdrop-blur-sm"
              >
                <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  {outcome.label}
                </dt>
                <dd className="mt-2 text-lg font-semibold leading-snug text-brand-cyan">
                  {outcome.value}
                </dd>
              </motion.div>
            ))}
          </dl>
        </div>
      </div>
    </section>

    <section id="get-started" className="landing-section-muted scroll-mt-36">
      <div className="landing-section-inner">
        <div
          className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${role.accentGradient} px-8 py-12 shadow-2xl sm:px-12`}
        >
          <div
            className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/15 blur-3xl"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute -bottom-20 -left-10 h-40 w-40 rounded-full bg-black/10 blur-3xl"
            aria-hidden
          />
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
              Ready to build for {role.shortTitle.toLowerCase()}?
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-white/90">
              Record your first workflow, then compose an adoption tour —
              guest preview available, no backend setup required.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to={getExtensionGatePath("/editor")}
                className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-peacock-800 shadow-lg transition hover:bg-slate-100"
              >
                Capture a flow
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
              <Link
                to={getExtensionGatePath("/tours/new")}
                className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-5 py-3 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/20"
              >
                Build a product tour
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  </>
);
