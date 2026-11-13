import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true,
    open: false,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-dom/client',
      'react-router-dom',
      'pdf-lib',
      'lucide-react',
      'zustand',
      'canvas-confetti',
      'pdfjs-dist',
      'docx',
      'xlsx',
      'pptxgenjs',
      'jszip',
    ],
  },
});
