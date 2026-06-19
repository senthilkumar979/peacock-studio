import { resolve } from 'path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

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
});
