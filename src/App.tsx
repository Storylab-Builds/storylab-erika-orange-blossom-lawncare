import { Suspense, lazy } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ErrorBoundary from './components/ErrorBoundary';
import AppLayout from './layouts/AppLayout';
import LoadingSpinner from './components/LoadingSpinner';

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

const queryClient = new QueryClient();

export default function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <HashRouter>
          <Suspense fallback={<LoadingSpinner fullPage size="lg" label="Loading..." />}>
            <Routes>
              <Route element={<AppLayout />}>
                <Route index element={<Dashboard />} />
                <Route path="/customers" element={<Customers />} />
                <Route path="/customers/:id" element={<CustomerDetail />} />
                <Route path="/schedule" element={<Schedule />} />
                <Route path="/crews" element={<Crews />} />
                <Route path="/field" element={<FieldOps />} />
                <Route path="/weather" element={<Weather />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/communications" element={<Communications />} />
                <Route path="/settings" element={<Settings />} />
              </Route>
            </Routes>
          </Suspense>
        </HashRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
