import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'happy-dom',
    include: ['src/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts'],
      exclude: [
        'src/**/*.test.ts',
        'src/**/*.d.ts',
        'src/**/types.ts',
        'src/types/appMessages.ts',
        'src/types/captureEnvironment.ts',
        'src/types/consent.ts',
        'src/types/messages.ts',
        'src/types/stepResource.ts',
      ],
      reporter: ['text', 'html', 'json-summary'],
      reportsDirectory: './coverage',
    },
  },
});
