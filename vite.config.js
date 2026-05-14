import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.js'],
    globals: false,
  },
  worker: {
    format: 'es',
  },
  optimizeDeps: {
    include: ['pdfjs-dist'],
  },
  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: {
          // Group heavy, route-specific libraries into their own chunks so the
          // initial bundle stays lean. Each chunk only loads when its consumer
          // route is visited.
          'vendor-pdf': ['pdfjs-dist'],
          'vendor-konva': ['konva', 'react-konva'],
          'vendor-charts': ['recharts'],
          'vendor-pdfgen': ['jspdf', 'jspdf-autotable', 'html2canvas'],
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
        },
      },
    },
  },
})
