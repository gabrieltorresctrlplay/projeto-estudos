import { lazy, Suspense } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'

import { ProtectedRoute } from './components/auth/ProtectedRoute'
import { PublicOnlyRoute } from './components/auth/PublicOnlyRoute'
import { DashboardLayout } from './components/layout/dashboard/DashboardLayout'
import { MainLayout } from './components/layout/MainLayout'
import { LoadingSpinner } from './components/ui/loading-spinner'
import { OrganizationProvider } from './contexts/OrganizationContext'

// Lazy load pages for better performance
const Home = lazy(() => import('./pages/Home'))
const Login = lazy(() => import('./pages/auth/Login'))
const Register = lazy(() => import('./pages/auth/Register'))
const Onboarding = lazy(() => import('./pages/Onboarding'))
const AcceptInvite = lazy(() => import('./pages/AcceptInvite'))
const Dashboard = lazy(() => import('./pages/dashboard/Dashboard'))
const TeamMembers = lazy(() => import('./pages/dashboard/TeamMembers'))
const Queue = lazy(() => import('./pages/dashboard/Queue'))
const UnderConstruction = lazy(() => import('./pages/dashboard/UnderConstruction'))

function App() {
  return (
    <BrowserRouter>
      <OrganizationProvider>
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
                element={<Login />}
              />
              <Route
                path="/register"
                element={<Register />}
              />
            </Route>

            {/* Accept Invite - Public but checks auth */}
            <Route
              path="/accept-invite"
              element={<AcceptInvite />}
            />

            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
              {/* Onboarding */}
              <Route
                path="/onboarding"
                element={<Onboarding />}
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
                  path="/dashboard/:companyIndex/perfil"
                  element={
                    <UnderConstruction
                      title="Perfil"
                      description="Gestão de perfil em desenvolvimento"
                    />
                  }
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
