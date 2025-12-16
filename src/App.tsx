import { lazy, Suspense } from 'react'
import { ProtectedRoute } from '@/features/auth/components/ProtectedRoute'
import { PublicOnlyRoute } from '@/features/auth/components/PublicOnlyRoute'
import { DashboardLayout } from '@/features/dashboard/components/DashboardLayout'
import { OrganizationProvider } from '@/features/organization/context/OrganizationContext'
import { MainLayout } from '@/shared/components/layout/MainLayout'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Toaster } from 'sonner' // Sonner Toaster

// Lazy load pages for better performance
const Home = lazy(() => import('@/features/home/pages/HomePage'))
const Auth = lazy(() => import('@/features/auth/pages/AuthPage'))
const Onboarding = lazy(() => import('@/features/organization/pages/OnboardingPage'))
const Dashboard = lazy(() => import('@/features/dashboard/pages/DashboardPage'))
const TeamMembers = lazy(() => import('@/features/team/pages/TeamMembersPage'))
const Queue = lazy(() => import('@/features/queue/pages/QueuePage'))
const Profile = lazy(() => import('@/features/dashboard/pages/ProfilePage'))
const UnderConstruction = lazy(() => import('@/shared/components/feedback/UnderConstruction'))
const ChatLabPage = lazy(() => import('@/features/chat-lab/pages/ChatLabPage'))
// Queue System Pages
const TotemPage = lazy(() => import('@/features/queue/pages/TotemPage'))
const MonitorPage = lazy(() => import('@/features/queue/pages/MonitorPage'))
const CounterPage = lazy(() => import('@/features/queue/pages/CounterPage'))

function App() {
  return (
    <BrowserRouter>
      <OrganizationProvider>
        <Toaster
          richColors
          closeButton
          position="top-right"
        />
        <Suspense fallback={null}>
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
