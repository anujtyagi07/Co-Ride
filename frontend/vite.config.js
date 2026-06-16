import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig(({ mode }) => {
  // Load env vars based on mode (default = .env, also .env.[mode])
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react()],

    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },

    // Allow hosting under any sub-path (default: root '/')
    base: env.VITE_BASE_PATH || '/',

    server: {
      port: 3000,
      // Proxy `/api/*` and socket paths to the backend.
      // Override the backend URL via VITE_BACKEND_URL or leave as localhost.
      proxy: {
        '/api': {
          target: env.VITE_BACKEND_URL || 'http://localhost:5001',
          changeOrigin: true,
          secure: false,
        },
        '/socket.io': {
          target: env.VITE_BACKEND_URL || 'http://localhost:5001',
          changeOrigin: true,
          ws: true,
          secure: false,
        },
      },
    },

    // Code-split the large vendor chunks for better caching
    build: {
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          manualChunks: {
            'react-vendor': ['react', 'react-dom', 'react-router-dom'],
            redux: ['@reduxjs/toolkit', 'react-redux'],
            leaflet: ['leaflet', 'leaflet/dist/leaflet.css'],
          },
        },
      },
    },
  }
})
