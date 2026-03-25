import { defineConfig } from 'vitest/config'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react-swc'
import path from 'node:path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
          query: ['@tanstack/react-query', 'zustand'],
          charts: ['recharts'],
          forms: ['react-hook-form', '@hookform/resolvers', 'zod'],
          motion: ['motion'],
          icons: ['lucide-react', 'lucide-animated'],
        },
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/tests/setup.ts',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
    },
  },
})
