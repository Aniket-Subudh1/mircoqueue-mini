// frontend/vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      '/dev': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
      // Add any other stages you need to proxy
      '/prod': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
  define: {
    // Make environment variables accessible in the app
    'process.env': process.env
  }
});