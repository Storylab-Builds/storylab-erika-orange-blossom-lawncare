import { Suspense, lazy } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ErrorBoundary from './components/ErrorBoundary';
import AppLayout from './layouts/AppLayout';
import LoadingSpinner from './components/LoadingSpinner';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

const Landing = lazy(() => import('./pages/Landing'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const NotFound = lazy(() => import('./pages/NotFound'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Customers = lazy(() => import('./pages/Customers'));
const CustomerDetail = lazy(() => import('./pages/CustomerDetail'));
const Schedule = lazy(() => import('./pages/Schedule'));
const Crews = lazy(() => import('./pages/Crews'));
const FieldOps = lazy(() => import('./pages/FieldOps'));
const Weather = lazy(() => import('./pages/Weather'));
const Reports = lazy(() => import('./pages/Reports'));
const Communications = lazy(() => import('./pages/Communications'));
const Settings = lazy(() => import('./pages/Settings'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, refetchOnWindowFocus: false },
  },
});

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
          <HashRouter>
            <Suspense fallback={<LoadingSpinner fullPage size="lg" label="Loading…" />}>
              <Routes>
                {/* Public */}
                <Route index element={<Landing />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Authenticated console */}
                <Route element={<ProtectedRoute />}>
                  <Route element={<AppLayout />}>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/customers" element={<Customers />} />
                    <Route path="/customers/:id" element={<CustomerDetail />} />
                    <Route path="/schedule" element={<Schedule />} />
                    <Route path="/crews" element={<Crews />} />
                    <Route path="/field" element={<FieldOps />} />
                    <Route path="/weather" element={<Weather />} />
                    <Route path="/reports" element={<Reports />} />
                    <Route path="/communications" element={<Communications />} />
                    {/* Owner/Admin only */}
                    <Route element={<ProtectedRoute roles={['OWNER', 'ADMIN']} />}>
                      <Route path="/settings" element={<Settings />} />
                    </Route>
                  </Route>
                </Route>

                {/* Catch-all */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </HashRouter>
          </AuthProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
