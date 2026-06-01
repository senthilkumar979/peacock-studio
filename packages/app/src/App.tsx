import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Dashboard } from '@/pages/Dashboard';
import { CompareDocs } from '@/pages/CompareDocs';
import { Editor } from '@/pages/Editor';
import { NewRoute } from '@/pages/NewRoute';
import { Player } from '@/pages/Player';
import { RouteBuilder } from '@/pages/RouteBuilder';
import { RouteLearner } from '@/pages/RouteLearner';

export const App = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/compare" element={<CompareDocs />} />
      <Route path="/editor" element={<Editor />} />
      <Route path="/routes/new" element={<NewRoute />} />
      <Route path="/routes/:routeId/edit" element={<RouteBuilder />} />
      <Route path="/routes/:routeId" element={<RouteLearner />} />
      <Route path="/docs/:documentId" element={<Player />} />
      <Route path="/docs/:documentId/edit" element={<Editor />} />
      <Route path="/player" element={<Navigate to="/" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </BrowserRouter>
);
