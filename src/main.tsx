import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import './index.css'

import { ThemeProvider } from '@/shared/theme/theme-provider'

import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider
      defaultTheme="system"
      storageKey="vite-ui-theme"
    >
      <App />
    </ThemeProvider>
  </StrictMode>,
)
