import { lazy } from 'react';

/** Shared Suspense fallback while a route chunk loads. */
export const RouteChunkFallback = () => (
  <div className="flex min-h-screen items-center justify-center bg-slate-50" role="status">
    <span className="sr-only">Loading</span>
    <div className="h-8 w-8 animate-pulse rounded-full bg-peacock-500/40" aria-hidden />
  </div>
);

export const Dashboard = lazy(() =>
  import('@/pages/Dashboard').then((m) => ({ default: m.Dashboard })),
);
export const ErrorPage = lazy(() =>
  import('@/pages/ErrorPage').then((m) => ({ default: m.ErrorPage })),
);
export const FlowDocsLibraryPage = lazy(() =>
  import('@/pages/FlowDocsLibraryPage').then((m) => ({ default: m.FlowDocsLibraryPage })),
);
export const ProductToursLibraryPage = lazy(() =>
  import('@/pages/ProductToursLibraryPage').then((m) => ({
    default: m.ProductToursLibraryPage,
  })),
);
export const CompareDocs = lazy(() =>
  import('@/pages/CompareDocs').then((m) => ({ default: m.CompareDocs })),
);
export const Editor = lazy(() =>
  import('@/pages/Editor').then((m) => ({ default: m.Editor })),
);
export const ExtensionInstallPage = lazy(() =>
  import('@/pages/ExtensionInstallPage').then((m) => ({ default: m.ExtensionInstallPage })),
);
export const LegacyRouteRedirect = lazy(() =>
  import('@/pages/LegacyRouteRedirect').then((m) => ({ default: m.LegacyRouteRedirect })),
);
export const NewProductTour = lazy(() =>
  import('@/pages/NewProductTour').then((m) => ({ default: m.NewProductTour })),
);
export const Player = lazy(() =>
  import('@/pages/Player').then((m) => ({ default: m.Player })),
);
export const ProductTourBuilder = lazy(() =>
  import('@/pages/ProductTourBuilder').then((m) => ({ default: m.ProductTourBuilder })),
);
export const ProductTourLearner = lazy(() =>
  import('@/pages/ProductTourLearner').then((m) => ({ default: m.ProductTourLearner })),
);
export const CaptureEditor = lazy(() =>
  import('@/pages/CaptureEditor').then((m) => ({ default: m.CaptureEditor })),
);
export const CaptureEditorLegacyRedirect = lazy(() =>
  import('@/pages/CaptureEditorLegacyRedirect').then((m) => ({
    default: m.CaptureEditorLegacyRedirect,
  })),
);
export const Products = lazy(() =>
  import('@/pages/Products').then((m) => ({ default: m.Products })),
);
export const ProductDetail = lazy(() =>
  import('@/pages/ProductDetail').then((m) => ({ default: m.ProductDetail })),
);
export const Solutions = lazy(() =>
  import('@/pages/Solutions').then((m) => ({ default: m.Solutions })),
);
export const SolutionRole = lazy(() =>
  import('@/pages/SolutionRole').then((m) => ({ default: m.SolutionRole })),
);
export const Pricing = lazy(() =>
  import('@/pages/Pricing').then((m) => ({ default: m.Pricing })),
);
export const SignInPage = lazy(() =>
  import('@/pages/SignInPage').then((m) => ({ default: m.SignInPage })),
);
export const SignUpPage = lazy(() =>
  import('@/pages/SignUpPage').then((m) => ({ default: m.SignUpPage })),
);
export const PublicSharePage = lazy(() =>
  import('@/pages/PublicSharePage').then((m) => ({ default: m.PublicSharePage })),
);
export const PrivacyPolicy = lazy(() =>
  import('@/pages/PrivacyPolicy').then((m) => ({ default: m.PrivacyPolicy })),
);
export const TermsAndConditions = lazy(() =>
  import('@/pages/TermsAndConditions').then((m) => ({ default: m.TermsAndConditions })),
);
export const TestCasesLibraryPage = lazy(() =>
  import('@/pages/TestCasesLibraryPage').then((m) => ({ default: m.TestCasesLibraryPage })),
);
export const TestCasesDetailPage = lazy(() =>
  import('@/pages/TestCasesDetailPage').then((m) => ({ default: m.TestCasesDetailPage })),
);
export const PlaywrightTestsLibraryPage = lazy(() =>
  import('@/pages/PlaywrightTestsLibraryPage').then((m) => ({
    default: m.PlaywrightTestsLibraryPage,
  })),
);
export const PlaywrightTestsDetailPage = lazy(() =>
  import('@/pages/PlaywrightTestsDetailPage').then((m) => ({
    default: m.PlaywrightTestsDetailPage,
  })),
);
export const FlowMapsLibraryPage = lazy(() =>
  import('@/pages/FlowMapsLibraryPage').then((m) => ({ default: m.FlowMapsLibraryPage })),
);
export const FlowMapsDetailPage = lazy(() =>
  import('@/pages/FlowMapsDetailPage').then((m) => ({ default: m.FlowMapsDetailPage })),
);
export const WorkspaceChooserPage = lazy(() =>
  import('@/pages/WorkspaceChooserPage').then((m) => ({ default: m.WorkspaceChooserPage })),
);
export const AcceptInvitePage = lazy(() =>
  import('@/pages/AcceptInvitePage').then((m) => ({ default: m.AcceptInvitePage })),
);
export const OrgAdminPage = lazy(() =>
  import('@/pages/OrgAdminPage').then((m) => ({ default: m.OrgAdminPage })),
);
export const HealthCheckerPage = lazy(() =>
  import('@/pages/HealthCheckerPage').then((m) => ({ default: m.HealthCheckerPage })),
);
export const LibraryLayout = lazy(() =>
  import('@/layouts/LibraryLayout').then((m) => ({ default: m.LibraryLayout })),
);
