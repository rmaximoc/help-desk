import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/Layout';

// Auth pages
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';

// Admin pages
import { AdminDashboard } from './pages/admin/Dashboard';
import { TechniciansPage } from './pages/admin/TechniciansPage';
import { ClientsPage } from './pages/admin/ClientsPage';
import { ServicesPage } from './pages/admin/ServicesPage';
import { AdminTicketsPage } from './pages/admin/TicketsPage';

// Technician pages
import { TechnicianDashboard } from './pages/technician/Dashboard';
import { TechnicianTicketsPage } from './pages/technician/TicketsPage';
import { TechnicianProfilePage } from './pages/technician/ProfilePage';

// Client pages
import { ClientDashboard } from './pages/client/Dashboard';
import { ClientTicketsPage } from './pages/client/TicketsPage';
import { NewTicketPage } from './pages/client/NewTicketPage';
import { ClientProfilePage } from './pages/client/ProfilePage';

function AppRoutes() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const getDefaultRoute = () => {
    if (!user) return '/login';
    switch (user.role) {
      case 'ADMIN':
        return '/admin';
      case 'TECHNICIAN':
        return '/tecnico';
      case 'CLIENT':
        return '/dashboard';
      default:
        return '/login';
    }
  };

  return (
    <Routes>
      {/* Public routes */}
      <Route
        path="/login"
        element={user ? <Navigate to={getDefaultRoute()} replace /> : <LoginPage />}
      />
      <Route
        path="/register"
        element={user ? <Navigate to={getDefaultRoute()} replace /> : <RegisterPage />}
      />

      {/* Admin routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <Layout>
              <AdminDashboard />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/tecnicos"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <Layout>
              <TechniciansPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/clientes"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <Layout>
              <ClientsPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/servicos"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <Layout>
              <ServicesPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/chamados"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <Layout>
              <AdminTicketsPage />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Technician routes */}
      <Route
        path="/tecnico"
        element={
          <ProtectedRoute allowedRoles={['TECHNICIAN']}>
            <Layout>
              <TechnicianDashboard />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/tecnico/chamados"
        element={
          <ProtectedRoute allowedRoles={['TECHNICIAN']}>
            <Layout>
              <TechnicianTicketsPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/tecnico/perfil"
        element={
          <ProtectedRoute allowedRoles={['TECHNICIAN']}>
            <Layout>
              <TechnicianProfilePage />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Client routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute allowedRoles={['CLIENT']}>
            <Layout>
              <ClientDashboard />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/chamados"
        element={
          <ProtectedRoute allowedRoles={['CLIENT']}>
            <Layout>
              <ClientTicketsPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/chamados/novo"
        element={
          <ProtectedRoute allowedRoles={['CLIENT']}>
            <Layout>
              <NewTicketPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/perfil"
        element={
          <ProtectedRoute allowedRoles={['CLIENT']}>
            <Layout>
              <ClientProfilePage />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Redirect root */}
      <Route path="/" element={<Navigate to={getDefaultRoute()} replace />} />

      {/* 404 */}
      <Route
        path="*"
        element={
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-6xl font-bold text-gray-300">404</h1>
              <p className="text-gray-600 mt-2">Página não encontrada</p>
              <a href="/" className="btn-primary mt-4 inline-block">
                Voltar ao início
              </a>
            </div>
          </div>
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <Toaster position="top-right" />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
