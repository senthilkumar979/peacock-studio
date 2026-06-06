import { AppFooter } from "@/components/AppFooter";
import { Suspense, lazy } from "react";
import { HeroSection } from "./landing/HeroSection";
import { LandingNav } from "./landing/LandingNav";
import { useLandingSeo } from "./landing/useLandingSeo";

const ProblemSection = lazy(() =>
  import("./landing/ProblemSection").then((m) => ({
    default: m.ProblemSection,
  })),
);
const SolutionSection = lazy(() =>
  import("./landing/SolutionSection").then((m) => ({
    default: m.SolutionSection,
  })),
);
const FeaturesSection = lazy(() =>
  import("./landing/FeaturesSection").then((m) => ({
    default: m.FeaturesSection,
  })),
);
const WorkflowSection = lazy(() =>
  import("./landing/WorkflowSection").then((m) => ({
    default: m.WorkflowSection,
  })),
);
const AutomationSection = lazy(() =>
  import("./landing/AutomationSection").then((m) => ({
    default: m.AutomationSection,
  })),
);
const ComparisonSection = lazy(() =>
  import("./landing/ComparisonSection").then((m) => ({
    default: m.ComparisonSection,
  })),
);
const PreviewSection = lazy(() =>
  import("./landing/PreviewSection").then((m) => ({
    default: m.PreviewSection,
  })),
);
const TestimonialsSection = lazy(() =>
  import("./landing/TestimonialsSection").then((m) => ({
    default: m.TestimonialsSection,
  })),
);
const FAQSection = lazy(() =>
  import("./landing/FAQSection").then((m) => ({ default: m.FAQSection })),
);
const CTASection = lazy(() =>
  import("./landing/CTASection").then((m) => ({ default: m.CTASection })),
);

const BelowFoldFallback = () => <div className="min-h-[40vh]" aria-hidden />;

export const Landing = () => {
  useLandingSeo();

  return (
    <div className="landing-page">
      <LandingNav />
      <main>
        <HeroSection />
        <Suspense fallback={<BelowFoldFallback />}>
          <ProblemSection />
          <SolutionSection />
          <FeaturesSection />
          <WorkflowSection />
          <AutomationSection />
          <ComparisonSection />
          <PreviewSection />
          {/* <TestimonialsSection /> */}
          <FAQSection />
          <CTASection />
        </Suspense>
      </main>
      <AppFooter />
    </div>
  );
};
