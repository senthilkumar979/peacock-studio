import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { defineConfig, loadEnv } from 'vite';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import { patchManifestFileContents } from './src/build/patchManifest';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, __dirname, '');
  const appUrl = env.VITE_APP_URL;

  return {
    resolve: {
      alias: {
        '@peacock/shared': resolve(__dirname, '../shared/src'),
      },
    },
    build: {
      outDir: 'dist',
      emptyOutDir: true,
      rollupOptions: {
        input: {
          background: resolve(__dirname, 'src/background/index.ts'),
          popup: resolve(__dirname, 'popup/index.html'),
          screenshot: resolve(__dirname, 'screenshot/index.html'),
        },
        output: {
          entryFileNames: (chunkInfo) => {
            if (chunkInfo.name === 'background') return 'background/index.js';
            return 'assets/[name]-[hash].js';
          },
          chunkFileNames: 'assets/[name]-[hash].js',
          assetFileNames: 'assets/[name]-[hash][extname]',
        },
      },
    },
    plugins: [
      viteStaticCopy({
        targets: [
          {
            src: 'manifest.json',
            dest: '.',
            transform: () =>
              patchManifestFileContents(
                readFileSync(resolve(__dirname, 'manifest.json'), 'utf-8'),
                appUrl
              ),
          },
          { src: 'logo.png', dest: '.' },
        ],
      }),
    ],
  };
});
