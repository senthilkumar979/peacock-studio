import { useEffect, useRef } from 'react';
import { SwaggerUIBundle } from 'swagger-ui-dist';
import 'swagger-ui-dist/swagger-ui.css';

const OPENAPI_URL = '/openapi.yaml';

/** OpenAPI catalog panel for the Super Admin shell. */
export const SuperAdminApiTab = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const ui = SwaggerUIBundle({
      url: OPENAPI_URL,
      domNode: el,
      deepLinking: true,
      docExpansion: 'list',
      defaultModelsExpandDepth: -1,
      tryItOutEnabled: false,
      supportedSubmitMethods: [],
      presets: [SwaggerUIBundle.presets.apis],
    });

    return () => {
      ui?.getSystem?.()?.specActions?.updateSpec?.('{}');
      el.innerHTML = '';
    };
  }, []);

  return (
    <div className="space-y-4">
      <p className="max-w-2xl text-sm text-slate-600">
        OpenAPI catalog of Edge Functions, PostgREST tables/RPCs, Storage, and external
        integrations. Try-it-out is disabled — calls need Clerk JWTs and often Turnstile.
      </p>
      <div
        ref={containerRef}
        className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm [&_.swagger-ui]:text-sm"
      />
    </div>
  );
};
