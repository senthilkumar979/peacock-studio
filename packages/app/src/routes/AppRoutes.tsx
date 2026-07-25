import { Suspense } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { AppRouteTransition } from '@/components/motion/AppRouteTransition';
import { WorkspaceOnboardingGate } from '@/components/auth/WorkspaceOnboardingGate';
import { RouteDocumentMeta } from '@/seo/RouteDocumentMeta';
import {
  ACCEPT_INVITE_PATH,
  DASHBOARD_PATH,
  ERROR_PATH,
  FLOW_DOCS_PATH,
  FLOW_MAPS_PATH,
  HEALTH_CHECKER_PATH,
  LANDING_PATH,
  EXTENSION_INSTALL_PATH,
  ORG_ADMIN_PATH,
  PLAYWRIGHT_TESTS_PATH,
  PRICING_PATH,
  PRIVACY_PATH,
  PRODUCT_TOURS_PATH,
  TERMS_PATH,
  TEST_CASES_PATH,
  WORKSPACE_ONBOARDING_PATH,
} from '@/constants/routes';
import { Landing } from '@/pages/Landing';
import { isCloudSyncEnabled, isCloudSyncFlagEnabled } from '@/cloud/config';
import {
  AcceptInvitePage,
  CaptureEditor,
  CaptureEditorLegacyRedirect,
  CompareDocs,
  Dashboard,
  Editor,
  ErrorPage,
  ExtensionInstallPage,
  FlowDocsLibraryPage,
  FlowMapsDetailPage,
  FlowMapsLibraryPage,
  HealthCheckerPage,
  LegacyRouteRedirect,
  LibraryLayout,
  NewProductTour,
  OrgAdminPage,
  Player,
  PlaywrightTestsDetailPage,
  PlaywrightTestsLibraryPage,
  Pricing,
  PrivacyPolicy,
  ProductDetail,
  ProductTourBuilder,
  ProductTourLearner,
  ProductToursLibraryPage,
  Products,
  PublicSharePage,
  RouteChunkFallback,
  SignInPage,
  SignUpPage,
  SolutionRole,
  Solutions,
  TermsAndConditions,
  TestCasesDetailPage,
  TestCasesLibraryPage,
  WorkspaceChooserPage,
} from '@/routes/lazyPages';

export const App = () => {
  const location = useLocation();

  return (
    <WorkspaceOnboardingGate>
      <RouteDocumentMeta />
      <AppRouteTransition>
        <Suspense fallback={<RouteChunkFallback />}>
          <Routes location={location}>
            <Route path={LANDING_PATH} element={<Landing />} />
            <Route path="/landing" element={<Navigate to={LANDING_PATH} replace />} />
            <Route
              path="/sign-in/*"
              element={
                isCloudSyncFlagEnabled() ? <SignInPage /> : <Navigate to={LANDING_PATH} replace />
              }
            />
            <Route
              path="/sign-up/*"
              element={
                isCloudSyncFlagEnabled() ? <SignUpPage /> : <Navigate to={LANDING_PATH} replace />
              }
            />
            <Route
              path={WORKSPACE_ONBOARDING_PATH}
              element={
                isCloudSyncEnabled() ? (
                  <WorkspaceChooserPage />
                ) : (
                  <Navigate to={LANDING_PATH} replace />
                )
              }
            />
            <Route
              path={ACCEPT_INVITE_PATH}
              element={
                isCloudSyncEnabled() ? (
                  <AcceptInvitePage />
                ) : (
                  <Navigate to={LANDING_PATH} replace />
                )
              }
            />
            <Route path={ERROR_PATH} element={<ErrorPage />} />
            <Route path="/products" element={<Products />} />
            <Route path="/products/:productSlug" element={<ProductDetail />} />
            <Route path="/solutions" element={<Solutions />} />
            <Route path="/solutions/:roleSlug" element={<SolutionRole />} />
            <Route path={PRICING_PATH} element={<Pricing />} />
            <Route path={EXTENSION_INSTALL_PATH} element={<ExtensionInstallPage />} />
            <Route path={PRIVACY_PATH} element={<PrivacyPolicy />} />
            <Route path={TERMS_PATH} element={<TermsAndConditions />} />
            <Route path={`${TEST_CASES_PATH}/:documentId`} element={<TestCasesDetailPage />} />
            <Route
              path={`${PLAYWRIGHT_TESTS_PATH}/:documentId`}
              element={<PlaywrightTestsDetailPage />}
            />
            <Route path={`${FLOW_MAPS_PATH}/:documentId`} element={<FlowMapsDetailPage />} />
            <Route path="/s/:token/embed" element={<PublicSharePage mode="embed" />} />
            <Route path="/s/:token/edit" element={<PublicSharePage mode="edit" />} />
            <Route path="/s/:token" element={<PublicSharePage mode="view" />} />
            <Route element={<LibraryLayout />}>
              <Route path={DASHBOARD_PATH} element={<Dashboard />} />
              <Route path={FLOW_DOCS_PATH} element={<FlowDocsLibraryPage />} />
              <Route path={PRODUCT_TOURS_PATH} element={<ProductToursLibraryPage />} />
              <Route path={TEST_CASES_PATH} element={<TestCasesLibraryPage />} />
              <Route path={PLAYWRIGHT_TESTS_PATH} element={<PlaywrightTestsLibraryPage />} />
              <Route path={FLOW_MAPS_PATH} element={<FlowMapsLibraryPage />} />
              <Route
                path={ORG_ADMIN_PATH}
                element={
                  isCloudSyncEnabled() ? (
                    <OrgAdminPage />
                  ) : (
                    <Navigate to={DASHBOARD_PATH} replace />
                  )
                }
              />
              <Route path={HEALTH_CHECKER_PATH} element={<HealthCheckerPage />} />
            </Route>
            <Route path="/compare" element={<CompareDocs />} />
            <Route path="/editor" element={<Editor />} />
            <Route path="/tours/new" element={<NewProductTour />} />
            <Route path="/tours/:tourId/edit" element={<ProductTourBuilder />} />
            <Route path="/tours/:tourId" element={<ProductTourLearner />} />
            <Route path="/routes/new" element={<LegacyRouteRedirect mode="new" />} />
            <Route path="/routes/:routeId/edit" element={<LegacyRouteRedirect mode="edit" />} />
            <Route path="/routes/:routeId" element={<LegacyRouteRedirect mode="view" />} />
            <Route path="/docs/:documentId" element={<Player />} />
            <Route path="/docs/:documentId/edit" element={<Editor />} />
            <Route path="/capture/:captureId/edit" element={<CaptureEditor />} />
            <Route
              path="/editor/capture/:captureId/edit"
              element={<CaptureEditorLegacyRedirect />}
            />
            <Route path="/player" element={<Navigate to={DASHBOARD_PATH} replace />} />
            <Route path="*" element={<Navigate to={LANDING_PATH} replace />} />
          </Routes>
        </Suspense>
      </AppRouteTransition>
    </WorkspaceOnboardingGate>
  );
};
