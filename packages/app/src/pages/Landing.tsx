import { AppFooter } from "@/components/AppFooter";
import { SkipToContent } from "@/components/a11y/SkipToContent";
import { LandingSubNav } from "@/components/site/LandingSubNav";
import { SiteNav } from "@/components/site/SiteNav";
import { useLandingNavVisibility } from "@/hooks/useLandingNavVisibility";
import { MotionConfig } from "framer-motion";
import { Suspense, lazy, type ReactNode } from "react";
import { ExampleFlowDocSection } from "./landing/ExampleFlowDocSection";
import { prefetchLandingExampleEmbed } from "./landing/exampleFlowDoc";
import { HeroSection } from "./landing/HeroSection";

prefetchLandingExampleEmbed();

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
const FAQSection = lazy(() =>
  import("./landing/FAQSection").then((m) => ({ default: m.FAQSection })),
);
const CTASection = lazy(() =>
  import("./landing/CTASection").then((m) => ({ default: m.CTASection })),
);

const BelowFoldFallback = () => <div className="min-h-[40vh]" aria-hidden />;

const LazyBlock = ({ children }: { children: ReactNode }) => (
  <Suspense fallback={<BelowFoldFallback />}>{children}</Suspense>
);

export const Landing = () => {
  const { showMainNav, showSubNav } = useLandingNavVisibility();

  return (
    <MotionConfig reducedMotion="user">
      <div className="landing-page">
        <SkipToContent />
        <SiteNav visible={showMainNav} />
        <LandingSubNav visible={showSubNav} />
        <main id="main-content">
          <HeroSection />
          <LazyBlock>
            <ProblemSection />
          </LazyBlock>
          <LazyBlock>
            <SolutionSection />
          </LazyBlock>
          <LazyBlock>
            <PreviewSection />
          </LazyBlock>
          <ExampleFlowDocSection />
          <LazyBlock>
            <FeaturesSection />
            <WorkflowSection />
            <AutomationSection />
            <ComparisonSection />
            <PlatformComparisonSection />
            <FAQSection />
            <CTASection />
          </LazyBlock>
        </main>
        <AppFooter />
      </div>
    </MotionConfig>
  );
};
