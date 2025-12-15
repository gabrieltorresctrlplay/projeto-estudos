import { lazy, Suspense } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Toaster } from 'sonner' // Sonner Toaster

import { ProtectedRoute } from './components/auth/ProtectedRoute'
import { PublicOnlyRoute } from './components/auth/PublicOnlyRoute'
import { DashboardLayout } from './components/layout/dashboard/DashboardLayout'
import { MainLayout } from './components/layout/MainLayout'
import { LoadingSpinner } from './components/ui/loading-spinner'
import { OrganizationProvider } from './contexts/OrganizationContext'

// Lazy load pages for better performance
const Home = lazy(() => import('./pages/Home'))
const Auth = lazy(() => import('./pages/auth/Auth'))
const Onboarding = lazy(() => import('./pages/Onboarding'))
const Dashboard = lazy(() => import('./pages/dashboard/Dashboard'))
const TeamMembers = lazy(() => import('./pages/dashboard/TeamMembers'))
const Queue = lazy(() => import('./pages/dashboard/Queue'))
const Profile = lazy(() => import('./pages/dashboard/Profile'))
const UnderConstruction = lazy(() => import('./pages/dashboard/UnderConstruction'))
const ChatLabPage = lazy(() => import('./pages/dashboard/chat-lab/ChatLabPage'))
// Queue System Pages
const TotemPage = lazy(() => import('./pages/queue/TotemPage'))
const MonitorPage = lazy(() => import('./pages/queue/MonitorPage'))
const CounterPage = lazy(() => import('./pages/queue/CounterPage'))

function App() {
  return (
    <BrowserRouter>
      <OrganizationProvider>
        <Toaster
          richColors
          closeButton
          position="top-right"
        />
        <Suspense
          fallback={
            <div className="flex h-screen items-center justify-center">
              <LoadingSpinner />
            </div>
          }
        >
          <Routes>
            {/* Public Routes */}
            <Route
              path="/"
              element={
                <MainLayout>
                  <Home />
                </MainLayout>
              }
            />
            <Route element={<PublicOnlyRoute />}>
              <Route
                path="/login"
                element={<Auth />}
              />
            </Route>

            {/* Queue Public Pages - Fullscreen without auth */}
            <Route
              path="/queue/:queueId/totem"
              element={<TotemPage />}
            />
            <Route
              path="/queue/:queueId/monitor"
              element={<MonitorPage />}
            />

            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
              {/* Onboarding */}
              <Route
                path="/onboarding"
                element={<Onboarding />}
              />
              {/* Queue Counter - Requires auth */}
              <Route
                path="/queue/:queueId/counter/:counterId"
                element={<CounterPage />}
              />
              <Route element={<DashboardLayout />}>
                <Route
                  path="/dashboard/:companyIndex"
                  element={<Dashboard />}
                />
                <Route
                  path="/dashboard"
                  element={<Dashboard />}
                />
                <Route
                  path="/dashboard/:companyIndex/team"
                  element={<TeamMembers />}
                />
                <Route
                  path="/dashboard/:companyIndex/fila"
                  element={<Queue />}
                />
                <Route
                  path="/dashboard/:companyIndex/perfil"
                  element={<Profile />}
                />
                <Route
                  path="/dashboard/perfil"
                  element={<Profile />}
                />
                <Route
                  path="/dashboard/:companyIndex/estoque"
                  element={
                    <UnderConstruction
                      title="Estoque"
                      description="Gestão de estoque em desenvolvimento"
                    />
                  }
                />
                <Route
                  path="/dashboard/:companyIndex/pedidos"
                  element={
                    <UnderConstruction
                      title="Pedidos"
                      description="Gestão de pedidos em desenvolvimento"
                    />
                  }
                />
                <Route
                  path="/dashboard/:companyIndex/estatisticas"
                  element={
                    <UnderConstruction
                      title="Estatísticas"
                      description="Análise de dados em desenvolvimento"
                    />
                  }
                />
                <Route
                  path="/dashboard/chat-lab"
                  element={<ChatLabPage />}
                />
              </Route>
            </Route>
          </Routes>
        </Suspense>
      </OrganizationProvider>
    </BrowserRouter>
  )
}

export default App
