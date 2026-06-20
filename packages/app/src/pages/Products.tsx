import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { AppFooter } from '@/components/AppFooter';
import { SiteNav } from '@/components/site/SiteNav';
import { PRODUCTS } from '@/pages/products/productsData';

export const Products = () => (
  <div className="landing-page min-h-screen">
    <SiteNav />

    <section className="border-b border-slate-800 bg-slate-950 px-6 pb-20 pt-28 text-white sm:pb-24 sm:pt-32">
      <div className="mx-auto max-w-7xl">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-cyan">Products</p>
          <h1 className="mt-4 max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl">
            Three ways Peacock turns usage into reusable assets
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-300">
            Flow Documents for execution, Product Tours for adoption, and Capture & Editor for
            polished screenshots — one local-first library.
          </p>
        </motion.div>
      </div>
    </section>

    <section className="landing-section-light">
      <div className="landing-section-inner grid gap-6 lg:grid-cols-3">
        {PRODUCTS.map((product, index) => {
          const Icon = product.icon;
          return (
            <motion.article
              key={product.slug}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.06 }}
            >
              <Link
                to={`/products/${product.slug}`}
                className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:border-peacock-200 hover:shadow-lg"
              >
                <div className={`bg-gradient-to-br ${product.accentGradient} px-6 py-5`}>
                  <span className="inline-flex rounded-xl bg-white/20 p-2.5 text-white">
                    <Icon className="h-5 w-5" aria-hidden />
                  </span>
                  <h2 className="mt-4 text-xl font-bold text-white">{product.name}</h2>
                  <p className="mt-2 text-sm text-white/85">{product.tagline}</p>
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <p className="text-sm leading-relaxed text-slate-600">{product.summary}</p>
                  <p className="mt-4 inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-peacock-700">
                    Learn more
                    <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" aria-hidden />
                  </p>
                </div>
              </Link>
            </motion.article>
          );
        })}
      </div>
    </section>

    <AppFooter />
  </div>
);
