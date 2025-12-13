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
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('firebase')) {
              return 'vendor-firebase'
            }
            if (
              id.includes('react') ||
              id.includes('react-dom') ||
              id.includes('react-router-dom')
            ) {
              return 'vendor-react'
            }
            if (
              id.includes('framer-motion') ||
              id.includes('lucide-react') ||
              id.includes('@radix-ui')
            ) {
              return 'vendor-ui'
            }

            // Other small dependencies can stay in a general vendor chunk
            // or be bundled with the entry point if small enough.
            // Let's put remaining large ones in a separate vendor chunk.
            return 'vendor'
          }
        },
      },
    },
  },
})
