import { useEffect, useId, useState } from 'react';
import { useLocation } from 'react-router-dom';
import type { ConsentCategoryId } from '@peacock/shared';
import { isEmbedPresentation } from '@/constants/routes';
import { CONSENT_CATEGORIES } from '@/constants/consent';
import { useConsentStore } from '@/store/consentStore';
import { CookieCategoryToggle } from './CookieCategoryToggle';

export const CookiePreferencesModal = () => {
  const { pathname, search } = useLocation();
  const isOpen = useConsentStore((state) => state.isPreferencesOpen);
  const record = useConsentStore((state) => state.record);
  const savePreferences = useConsentStore((state) => state.savePreferences);
  const closePreferences = useConsentStore((state) => state.closePreferences);
  const titleId = useId();
  const [analyticsEnabled, setAnalyticsEnabled] = useState(false);

  useEffect(() => {
    if (isOpen) setAnalyticsEnabled(Boolean(record?.analytics));
  }, [isOpen, record]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closePreferences();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, closePreferences]);

  if (isEmbedPresentation(pathname, search) || !isOpen) return null;

  const isCategoryEnabled = (id: ConsentCategoryId) =>
    id === 'analytics' ? analyticsEnabled : true;

  const handleToggle = (id: ConsentCategoryId, value: boolean) => {
    if (id === 'analytics') setAnalyticsEnabled(value);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close cookie preferences"
        className="absolute inset-0 bg-slate-900/50"
        onClick={closePreferences}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative w-full max-w-lg rounded-xl bg-white p-6 shadow-xl"
      >
        <h2 id={titleId} className="text-lg font-semibold text-slate-900">
          Cookie preferences
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Choose which optional storage Peacock can use. Strictly necessary
          items are always on.
        </p>
        <div className="mt-4 space-y-3">
          {CONSENT_CATEGORIES.map((category) => (
            <CookieCategoryToggle
              key={category.id}
              category={category}
              enabled={isCategoryEnabled(category.id)}
              onChange={handleToggle}
            />
          ))}
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={closePreferences}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => savePreferences(analyticsEnabled)}
            className="btn-peacock btn-peacock--sm"
          >
            Save preferences
          </button>
        </div>
      </div>
    </div>
  );
};
