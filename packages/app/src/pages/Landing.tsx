import { AppFooter } from "@/components/AppFooter";
import { LandingSubNav } from "@/components/site/LandingSubNav";
import { SiteNav } from "@/components/site/SiteNav";
import { useLandingNavVisibility } from "@/hooks/useLandingNavVisibility";
import { Suspense, lazy } from "react";
import { HeroSection } from "./landing/HeroSection";

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
const TrustArchitectureSection = lazy(() =>
  import("./landing/TrustArchitectureSection").then((m) => ({
    default: m.TrustArchitectureSection,
  })),
);
const ComparisonSection = lazy(() =>
  import("./landing/ComparisonSection").then((m) => ({
    default: m.ComparisonSection,
  })),
);
const PlatformComparisonSection = lazy(() =>
  import("./landing/PlatformComparisonSection").then((m) => ({
    default: m.PlatformComparisonSection,
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
  const { showMainNav, showSubNav } = useLandingNavVisibility();

  return (
    <div className="landing-page">
      <SiteNav visible={showMainNav} />
      <LandingSubNav visible={showSubNav} />
      <main>
        <HeroSection />
        <Suspense fallback={<BelowFoldFallback />}>
          <ProblemSection />
          <SolutionSection />
          <PreviewSection />
          <FeaturesSection />
          <WorkflowSection />
          <AutomationSection />
          <ComparisonSection />
          <PlatformComparisonSection />
          {/* <TestimonialsSection /> */}
          <FAQSection />
          <CTASection />
        </Suspense>
      </main>
      <AppFooter />
    </div>
  );
};
