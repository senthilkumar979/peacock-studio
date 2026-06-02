import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Dashboard } from '@/pages/Dashboard';
import { CompareDocs } from '@/pages/CompareDocs';
import { Editor } from '@/pages/Editor';
import { LegacyRouteRedirect } from '@/pages/LegacyRouteRedirect';
import { NewProductTour } from '@/pages/NewProductTour';
import { Player } from '@/pages/Player';
import { ProductTourBuilder } from '@/pages/ProductTourBuilder';
import { ProductTourLearner } from '@/pages/ProductTourLearner';
import { CaptureEditor } from '@/pages/CaptureEditor';
import { CaptureEditorLegacyRedirect } from '@/pages/CaptureEditorLegacyRedirect';

export const App = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Dashboard />} />
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
      <Route path="/player" element={<Navigate to="/" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </BrowserRouter>
);
