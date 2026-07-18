import { ProductToursLibraryPanel } from '@/components/library/ProductToursLibraryPanel';
import { LibraryLayout } from '@/layouts/LibraryLayout';

export const ProductToursLibraryPage = () => (
  <LibraryLayout>
    <div className="mx-auto w-full max-w-8xl px-4 py-8 sm:px-6 lg:px-8">
      <ProductToursLibraryPanel />
    </div>
  </LibraryLayout>
);
