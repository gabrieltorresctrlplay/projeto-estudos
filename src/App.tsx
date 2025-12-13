import { lazy, Suspense } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'

import { MainLayout } from './components/layout/MainLayout'
import { LoadingSpinner } from './components/ui/loading-spinner'

// Lazy load pages for better performance
const Home = lazy(() => import('./pages/Home'))

function App() {
  return (
    <BrowserRouter>
      <MainLayout>
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            <Route
              path="/"
              element={<Home />}
            />
          </Routes>
        </Suspense>
      </MainLayout>
    </BrowserRouter>
  )
}

export default App
