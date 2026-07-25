import { useEffect, useRef } from 'react';
import { BookOpen } from 'lucide-react';
import { SwaggerUIBundle } from 'swagger-ui-dist';
import 'swagger-ui-dist/swagger-ui.css';

const OPENAPI_URL = '/openapi.yaml';

export const ApiDocsPage = () => {
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
    <div className="mx-auto w-full max-w-6xl space-y-6 px-4 py-8 sm:px-6">
      <div>
        <p className="text-sm font-medium text-peacock-700">Developer</p>
        <h1 className="mt-1 flex items-center gap-2 text-2xl font-semibold tracking-tight text-slate-900">
          <BookOpen className="h-6 w-6 shrink-0 text-peacock-600" aria-hidden />
          API catalog
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-600">
          OpenAPI catalog of Edge Functions, PostgREST tables/RPCs, Storage, and
          external integrations the app uses. Try-it-out is disabled — calls need
          Clerk JWTs and often Turnstile.
        </p>
      </div>

      <div
        ref={containerRef}
        className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm [&_.swagger-ui]:text-sm"
      />
    </div>
  );
};
