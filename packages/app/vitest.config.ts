import { resolve } from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@peacock/shared': resolve(__dirname, '../shared/src'),
    },
  },
  test: {
    environment: 'happy-dom',
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx', 'api/**/*.test.ts'],
    setupFiles: ['src/test/setupTests.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.test.ts',
        'src/**/*.test.tsx',
        'src/**/*.d.ts',
        'src/main.tsx',
        'src/vite-env.d.ts',
      ],
      reporter: ['text', 'html', 'json-summary'],
      reportsDirectory: './coverage',
    },
  },
});
