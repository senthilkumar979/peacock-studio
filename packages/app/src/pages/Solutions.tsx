import { AppFooter } from "@/components/AppFooter";
import { SiteNav } from "@/components/site/SiteNav";
import { SolutionRoleCard } from "@/pages/solutions/SolutionRoleCard";
import {
  PEACOCK_CATEGORY_STATEMENT,
  SOLUTION_ROLE_GROUPS,
  SOLUTION_ROLES,
} from "@/pages/solutions/solutionsData";
import { motion } from "framer-motion";

export const Solutions = () => (
  <div className="landing-page min-h-screen">
    <SiteNav />

    <section className="relative overflow-hidden border-b border-slate-800 bg-slate-950 px-6 pb-24 pt-28 text-white sm:pb-28 sm:pt-32">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-peacock-900/80 via-slate-950 to-slate-950"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-32 top-0 h-96 w-96 rounded-full bg-brand-violet/20 blur-3xl"
        aria-hidden
      />
      <div className="relative mx-auto flex max-w-7xl flex-col items-center gap-10 lg:flex-row lg:items-center lg:justify-between lg:gap-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-3xl"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-cyan">
            Solutions by role
          </p>
          <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            {PEACOCK_CATEGORY_STATEMENT.headline}
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-slate-300">
            {PEACOCK_CATEGORY_STATEMENT.description}
          </p>
          <p className="mt-4 text-sm leading-relaxed text-slate-400">
            Select your role to see how Peacock maps to your function — through
            execution-grade Flow Documents and adoption-focused Product Tours.
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="shrink-0"
        >
          <img
            src="/peacock-logo.png"
            alt="Peacock Studio Logo"
            width={400}
            height={400}
            className="mx-auto h-28 w-28 object-contain sm:h-36 sm:w-36 lg:h-48 lg:w-48"
            decoding="async"
          />
        </motion.div>
      </div>
    </section>

    {SOLUTION_ROLE_GROUPS.map((group) => {
      const roles = group.slugs
        .map((slug) => SOLUTION_ROLES.find((role) => role.slug === slug))
        .filter((role): role is (typeof SOLUTION_ROLES)[number] =>
          Boolean(role),
        );

      return (
        <section key={group.label} className="landing-section-light">
          <div className="landing-section-inner">
            <header className="mb-10 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-peacock-700">
                  {group.label}
                </p>
                <h2 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">
                  Teams that {group.label.toLowerCase()}
                </h2>
              </div>
            </header>
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {roles.map((role, index) => (
                <SolutionRoleCard key={role.slug} role={role} index={index} />
              ))}
            </div>
          </div>
        </section>
      );
    })}

    <AppFooter />
  </div>
);
