import { resolve } from 'path';
import react from '@vitejs/plugin-react';
import { sentryVitePlugin } from '@sentry/vite-plugin';
import { defineConfig, loadEnv } from 'vite';
import { pageTitleApiPlugin } from './vite-page-title-api';
import { seoIndexHtmlPlugin } from './vite-seo-index-html';

const DEFERRED_CHUNK = /(^|\/)(sentry|clerk|posthog|pdf|xyflow|editor|charts|swagger)(-|$)/;

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, __dirname, '');
  const sentryAuthToken = env.SENTRY_AUTH_TOKEN || process.env.SENTRY_AUTH_TOKEN;
  const release =
    env.VITE_SENTRY_RELEASE ||
    process.env.VITE_SENTRY_RELEASE ||
    process.env.VERCEL_GIT_COMMIT_SHA ||
    undefined;
  const uploadSourceMaps = Boolean(sentryAuthToken);

  return {
    plugins: [
      react(),
      seoIndexHtmlPlugin(),
      pageTitleApiPlugin(),
      uploadSourceMaps
        ? sentryVitePlugin({
            org: env.SENTRY_ORG || process.env.SENTRY_ORG || 'mentorbridge',
            project: env.SENTRY_PROJECT || process.env.SENTRY_PROJECT || 'peacock-studio',
            authToken: sentryAuthToken,
            release: release ? { name: release } : undefined,
            sourcemaps: {
              filesToDeleteAfterUpload: ['./dist/**/*.map'],
            },
          })
        : null,
    ].filter(Boolean),
    define: {
      'import.meta.env.VITE_SENTRY_RELEASE': JSON.stringify(release ?? ''),
    },
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
        '@peacock/shared': resolve(__dirname, '../shared/src'),
      },
      dedupe: ['react', 'react-dom'],
    },
    server: {
      port: 5173,
      proxy: env.VITE_SUPABASE_URL
        ? {
            '/api/resolve-share': {
              target: env.VITE_SUPABASE_URL.replace(/\/$/, ''),
              changeOrigin: true,
              rewrite: () => '/functions/v1/resolve-share',
            },
          }
        : undefined,
    },
    build: {
      // Hidden maps when uploading to Sentry; public maps otherwise for local debugging.
      sourcemap: uploadSourceMaps ? 'hidden' : true,
      // Avoid premature download of deferred/auth/heavy vendors on `/`.
      modulePreload: {
        resolveDependencies: (_filename, deps) =>
          deps.filter((dep) => !DEFERRED_CHUNK.test(dep.split('/').pop() ?? dep)),
      },
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (!id.includes('node_modules')) return;

            if (id.includes('@sentry')) return 'sentry';
            if (id.includes('posthog')) return 'posthog';
            if (id.includes('@clerk')) return 'clerk';
            if (id.includes('@react-pdf') || id.includes('@fontsource')) return 'pdf';
            if (id.includes('@xyflow')) return 'xyflow';
            if (id.includes('@tiptap') || id.includes('prosemirror')) return 'editor';
            if (id.includes('recharts')) return 'charts';
            if (id.includes('swagger-ui')) return 'swagger';
            if (id.includes('framer-motion')) return 'motion';
          },
        },
      },
    },
  };
});
