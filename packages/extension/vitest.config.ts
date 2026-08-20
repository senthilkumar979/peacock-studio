import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'happy-dom',
    include: ['src/**/*.test.ts'],
    setupFiles: ['src/test/setupTests.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts'],
      exclude: [
        'src/**/*.test.ts',
        'src/**/*.d.ts',
        'src/**/types.ts',
        'src/test/**',
        // Entrypoint orchestrators — covered by integration/manual extension testing
        'src/background/index.ts',
        'src/content/index.ts',
        'src/bridge/index.ts',
        'src/capture-tool/index.ts',
      ],
      reporter: ['text', 'html', 'json-summary'],
      reportsDirectory: './coverage',
    },
  },
});
