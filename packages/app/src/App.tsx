import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { AppRouteTransition } from '@/components/motion/AppRouteTransition';
import { WorkspaceOnboardingGate } from '@/components/auth/WorkspaceOnboardingGate';
import {
  ACCEPT_INVITE_PATH,
  DASHBOARD_PATH,
  ERROR_PATH,
  FLOW_DOCS_PATH,
  FLOW_MAPS_PATH,
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
import { LibraryLayout } from '@/layouts/LibraryLayout';
import { Dashboard } from '@/pages/Dashboard';
import { ErrorPage } from '@/pages/ErrorPage';
import { FlowDocsLibraryPage } from '@/pages/FlowDocsLibraryPage';
import { ProductToursLibraryPage } from '@/pages/ProductToursLibraryPage';
import { Landing } from '@/pages/Landing';
import { CompareDocs } from '@/pages/CompareDocs';
import { Editor } from '@/pages/Editor';
import { ExtensionInstallPage } from '@/pages/ExtensionInstallPage';
import { LegacyRouteRedirect } from '@/pages/LegacyRouteRedirect';
import { NewProductTour } from '@/pages/NewProductTour';
import { Player } from '@/pages/Player';
import { ProductTourBuilder } from '@/pages/ProductTourBuilder';
import { ProductTourLearner } from '@/pages/ProductTourLearner';
import { CaptureEditor } from '@/pages/CaptureEditor';
import { CaptureEditorLegacyRedirect } from '@/pages/CaptureEditorLegacyRedirect';
import { Products } from '@/pages/Products';
import { ProductDetail } from '@/pages/ProductDetail';
import { Solutions } from '@/pages/Solutions';
import { SolutionRole } from '@/pages/SolutionRole';
import { Pricing } from '@/pages/Pricing';
import { SignInPage } from '@/pages/SignInPage';
import { SignUpPage } from '@/pages/SignUpPage';
import { PublicSharePage } from '@/pages/PublicSharePage';
import { PrivacyPolicy } from '@/pages/PrivacyPolicy';
import { TermsAndConditions } from '@/pages/TermsAndConditions';
import { TestCasesLibraryPage } from '@/pages/TestCasesLibraryPage';
import { TestCasesDetailPage } from '@/pages/TestCasesDetailPage';
import { PlaywrightTestsLibraryPage } from '@/pages/PlaywrightTestsLibraryPage';
import { PlaywrightTestsDetailPage } from '@/pages/PlaywrightTestsDetailPage';
import { FlowMapsLibraryPage } from '@/pages/FlowMapsLibraryPage';
import { FlowMapsDetailPage } from '@/pages/FlowMapsDetailPage';
import { WorkspaceChooserPage } from '@/pages/WorkspaceChooserPage';
import { AcceptInvitePage } from '@/pages/AcceptInvitePage';
import { OrgAdminPage } from '@/pages/OrgAdminPage';
import { isCloudSyncEnabled, isCloudSyncFlagEnabled } from '@/cloud/config';

export const App = () => {
  const location = useLocation();

  return (
    <WorkspaceOnboardingGate>
      <AppRouteTransition>
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
              isCloudSyncEnabled() ? <AcceptInvitePage /> : <Navigate to={LANDING_PATH} replace />
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
                isCloudSyncEnabled() ? <OrgAdminPage /> : <Navigate to={DASHBOARD_PATH} replace />
              }
            />
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
      </AppRouteTransition>
    </WorkspaceOnboardingGate>
  );
};
