import { FlowDocsLibraryPanel } from '@/components/library/FlowDocsLibraryPanel';
import { LibraryLayout } from '@/layouts/LibraryLayout';

export const FlowDocsLibraryPage = () => (
  <LibraryLayout>
    <div className="mx-auto w-full max-w-8xl px-4 py-8 sm:px-6 lg:px-8">
      <FlowDocsLibraryPanel />
    </div>
  </LibraryLayout>
);
