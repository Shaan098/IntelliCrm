import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
        // LLM inference (llama3.1:8b) can take 90–120 seconds — increase timeouts
        timeout:      180_000, // 3 min socket timeout
        proxyTimeout: 180_000, // 3 min upstream response timeout
        configure: (proxy) => {
          proxy.on('error', (err) => {
            console.error('[vite-proxy] error:', err.message);
          });
        },
      },
    },
  },
});

