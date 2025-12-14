import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import svgr from 'vite-plugin-svgr'

export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
    svgr({
      include: '**/*.svg?react',
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        // manualChunks removed to fix "Cannot read properties of undefined (reading 'useLayoutEffect')"
        // letting Vite/Rollup handle splitting automatically is safer for React 19 + Radix
      },
    },
  },
})
