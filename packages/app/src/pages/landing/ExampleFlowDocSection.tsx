import { ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { EMBED_IFRAME_HEIGHT, EMBED_IFRAME_WIDTH } from "@/utils/shareLink";
import { LandingSectionShell } from "./LandingSectionShell";
import {
  getLandingExampleEmbedPath,
  getLandingExampleSharePath,
  LANDING_EXAMPLE_FLOW_DESCRIPTION,
  LANDING_EXAMPLE_FLOW_TITLE,
  prefetchLandingExampleEmbed,
} from "./exampleFlowDoc";

prefetchLandingExampleEmbed();

export const ExampleFlowDocSection = () => {
  const embedPath = getLandingExampleEmbedPath();
  const fullPath = getLandingExampleSharePath();
  const hasExample = Boolean(embedPath && fullPath);

  return (
    <LandingSectionShell
      id="example-flow"
      tone="dark"
      eyebrow="Live example"
      title={""}
      description={LANDING_EXAMPLE_FLOW_DESCRIPTION}
    >
      {hasExample && embedPath && fullPath && (
        <div className="space-y-4">
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg shadow-slate-200/60">
            <iframe
              title={LANDING_EXAMPLE_FLOW_TITLE}
              src={embedPath}
              width={EMBED_IFRAME_WIDTH}
              height={EMBED_IFRAME_HEIGHT}
              loading="eager"
              allowFullScreen
              className="aspect-video h-auto w-full max-w-full border-0"
            />
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              to={fullPath}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-peacock-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-peacock-800"
            >
              Open full screen
              <ExternalLink className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        </div>
      )}
    </LandingSectionShell>
  );
};
