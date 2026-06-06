import { Quote } from 'lucide-react';
import { LandingSectionShell } from './LandingSectionShell';

const PLACEHOLDER_SLOTS = [
  { role: 'Head of Sales Enablement', company: 'Your company here' },
  { role: 'Director of Customer Success', company: 'Your company here' },
  { role: 'Product Marketing Lead', company: 'Your company here' },
];

export const TestimonialsSection = () => (
  <LandingSectionShell
    tone="muted"
    eyebrow="Social proof"
    title="What teams are saying"
    description="Testimonial slots ready for your first customers. No fabricated quotes — add real stories as you launch."
  >
    <div className="grid gap-5 md:grid-cols-3">
      {PLACEHOLDER_SLOTS.map((slot) => (
        <article
          key={slot.role}
          className="flex flex-col rounded-2xl border border-dashed border-white/20 bg-white/5 p-6"
        >
          <Quote className="h-5 w-5 text-brand-cyan/60" aria-hidden />
          <p className="mt-4 flex-1 text-sm italic leading-relaxed text-slate-400">
            &ldquo;Add a customer quote about how Peacock Studio improved demo consistency or onboarding
            speed.&rdquo;
          </p>
          <div className="mt-6 border-t border-white/10 pt-4">
            <p className="text-sm font-semibold text-white">Customer name</p>
            <p className="text-xs text-slate-400">
              {slot.role} · {slot.company}
            </p>
          </div>
        </article>
      ))}
    </div>
  </LandingSectionShell>
);
