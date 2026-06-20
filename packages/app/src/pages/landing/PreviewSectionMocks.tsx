import { motion } from "framer-motion";
import { BookMarked, GitBranch, GripVertical } from "lucide-react";
import { PreviewBrowserChrome } from "./PreviewCard";

export const FlowEditorPreviewMock = () => (
  <div className="space-y-2 p-4">
    <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
      Outline
    </p>
    {[
      {
        type: "step" as const,
        label: "Sign in to the application",
        active: false,
        step: 1,
      },
      { type: "section" as const, label: "Apply for a Home Loan journey" },
      {
        type: "step" as const,
        label: "Enter loan amount",
        active: true,
        step: 2,
      },
      {
        type: "step" as const,
        label: "Select loan purpose",
        active: false,
        step: 3,
      },
      {
        type: "step" as const,
        label: "Submit application",
        active: false,
        step: 4,
      },
    ].map((item) =>
      item.type === "section" ? (
        <div
          key={item.label}
          className="flex items-center gap-2 rounded-lg border border-brand-violet/30 bg-brand-violet/5 px-3 py-2"
        >
          <BookMarked
            className="h-3.5 w-3.5 shrink-0 text-brand-violet"
            aria-hidden
          />
          <div className="min-w-0">
            <p className="text-[9px] font-semibold uppercase tracking-wide text-brand-violet">
              Section
            </p>
            <p className="text-xs font-medium text-slate-800">{item.label}</p>
          </div>
        </div>
      ) : (
        <div
          key={item.label}
          className={
            item.active
              ? "flex items-center gap-2 rounded-lg border border-peacock-300 bg-peacock-50 px-3 py-2 text-xs text-peacock-800"
              : "flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600"
          }
        >
          <GripVertical
            className="h-3 w-3 shrink-0 text-slate-300"
            aria-hidden
          />
          <span className="font-mono text-[10px] text-slate-400">
            {item.step}
          </span>
          {item.label}
        </div>
      ),
    )}
    <div className="flex items-center gap-2 rounded-lg border border-brand-violet/30 bg-brand-violet/5 px-3 py-2 text-xs text-brand-violet">
      <GitBranch className="h-3.5 w-3.5 shrink-0" aria-hidden />
      Success Scenario vs Error Scenario
    </div>
  </div>
);

export const TourBuilderPreviewMock = () => (
  <div className="p-4">
    <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-peacock-50 to-brand-violet/5 p-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-peacock-700">
            <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500 mr-1">
              Persona:
            </span>
            Senthil Kumar
          </p>
          <p className="mt-1 text-sm font-semibold text-slate-900">
            Senior Software Engineer
          </p>
        </div>
        <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold text-brand-violet ring-1 ring-brand-violet/20">
          3 features
        </span>
      </div>
      <p className="mt-3 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
        Features
      </p>
      <div className="mt-2 space-y-1.5">
        {[
          { name: "Apply for a Home Loan", demos: 3 },
          { name: "View Loan Status", demos: 2 },
          { name: "Manage Loan Documents", demos: 3 },
        ].map((feature) => (
          <div
            key={feature.name}
            className="flex items-center justify-between rounded-md bg-white px-2 py-1.5 ring-1 ring-slate-200"
          >
            <span className="text-xs text-slate-700">{feature.name}</span>
            <span className="text-[10px] font-medium text-slate-400">
              {feature.demos} demos
            </span>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export const PlayerPreviewMock = () => (
  <div className="p-4">
    <div className="overflow-hidden rounded-lg ring-1 ring-slate-200">
      <PreviewBrowserChrome url="app.example.com/docs/onboarding?view=player" />
      <div className="aspect-video bg-slate-100">
        <div className="relative flex h-full flex-col justify-between p-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex flex-1 gap-1">
              <span className="h-1.5 flex-1 rounded-full bg-peacock-500" />
              <span className="h-1.5 flex-1 rounded-full bg-peacock-500" />
              <span className="h-1.5 flex-1 rounded-full bg-slate-200" />
              <span className="h-1.5 flex-1 rounded-full bg-slate-200" />
            </div>
            <span className="shrink-0 text-[10px] font-medium text-slate-500">
              2 / 8
            </span>
          </div>
          <motion.span
            aria-hidden
            className="absolute left-[42%] top-[38%] h-5 w-5 rounded-full border-2 border-brand-cyan bg-brand-cyan/20"
            animate={{ scale: [1, 1.15, 1], opacity: [0.75, 1, 0.75] }}
            transition={{ duration: 2.2, repeat: Infinity }}
          />
          <div className="rounded-lg bg-white/95 p-2.5 shadow-sm ring-1 ring-slate-200/80">
            <p className="text-[10px] text-slate-700">
              Step 2: Click <strong>Home Loan Application</strong> in the
              sidebar
            </p>
            <p className="mt-1.5 text-[9px] font-medium text-slate-400">
              Press → or Enter for next step
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
);
