import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    allowedHosts: [
      'admin-panel-production-2fd0.up.railway.app',
      '.up.railway.app',
      'all',
    ],
    proxy: {
      '/api': {
        target: 'http://localhost:5001',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://localhost:5001',
        changeOrigin: true,
      },
      '/socket.io': {
        target: 'http://localhost:5001',
        ws: true,
      },
    },
  },
  preview: {
    allowedHosts: [
      'admin-panel-production-2fd0.up.railway.app',
      '.up.railway.app',
      'all',
    ],
  },
});
