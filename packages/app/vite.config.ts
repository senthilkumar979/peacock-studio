import { resolve } from 'path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const DEFERRED_CHUNK = /(^|\/)(sentry|clerk|posthog|pdf|xyflow|editor|charts|swagger)(-|$)/;

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@peacock/shared': resolve(__dirname, '../shared/src'),
    },
    dedupe: ['react', 'react-dom'],
  },
  server: {
    port: 5173,
  },
  build: {
    // Public source maps for Lighthouse BP + readable production stack traces.
    // No @sentry/vite-plugin yet — use `true` (not `hidden`) so maps are referenced.
    sourcemap: true,
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
});
