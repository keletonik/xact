import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Replit serves the dev/preview server through an HTTPS proxy on port 443.
// We:
//   - bind to 0.0.0.0 so the proxy can reach the dev server
//   - whitelist Replit's host patterns so Vite's host-header check passes
//   - tell HMR the public port is 443 (otherwise the client tries :5173 over wss
//     and the connection silently fails behind the proxy)
const REPLIT_HOSTS = ['.replit.dev', '.replit.app', '.repl.co', '.riker.replit.dev']

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: Number(process.env.PORT) || 5173,
    strictPort: false,
    allowedHosts: REPLIT_HOSTS,
    hmr: process.env.REPL_ID
      ? { clientPort: 443, protocol: 'wss' }
      : true,
  },
  preview: {
    host: '0.0.0.0',
    port: Number(process.env.PORT) || 4173,
    strictPort: false,
    allowedHosts: REPLIT_HOSTS,
  },
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
