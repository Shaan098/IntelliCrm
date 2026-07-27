import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { queryClient } from '@/lib/query-client';
import { ProtectedRoute, AdminRoute, GuestRoute } from '@/routes/guards';
import DashboardLayout from '@/layouts/DashboardLayout';
import { Skeleton } from '@/components/shared/Skeleton';

// Lazy-loaded pages (code splitting)
const LoginPage       = lazy(() => import('@/pages/auth/LoginPage'));
const RegisterPage    = lazy(() => import('@/pages/auth/RegisterPage'));
const DashboardPage   = lazy(() => import('@/pages/dashboard/DashboardPage'));
const CustomersPage   = lazy(() => import('@/pages/customers/CustomersPage'));
const TicketDetailPage = lazy(() => import('@/pages/tickets/TicketDetailPage'));
const DocumentsPage   = lazy(() => import('@/pages/documents/DocumentsPage'));
const AskPage         = lazy(() => import('@/pages/ask/AskPage'));
const NotFoundPage = lazy(() => import('@/pages/errors/ErrorPages').then(m => ({ default: m.NotFoundPage })));
const UnauthorizedPage = lazy(() => import('@/pages/errors/ErrorPages').then(m => ({ default: m.UnauthorizedPage })));

function PageLoader() {
  return (
    <div className="flex items-center justify-center h-full min-h-[40vh]">
      <div className="flex gap-1.5">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-2 h-2 rounded-full bg-brand-500 thinking-dot"
            style={{ animationDelay: `${i * 0.16}s` }}
          />
        ))}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Root redirect */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            {/* Auth (guest only) */}
            <Route path="/login"    element={<GuestRoute><LoginPage /></GuestRoute>} />
            <Route path="/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />

            {/* Error pages (no auth needed) */}
            <Route path="/unauthorized" element={<UnauthorizedPage />} />

            {/* Protected dashboard */}
            <Route
              path="/"
              element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}
            >
              <Route path="dashboard"      element={<DashboardPage />} />
              <Route path="customers"      element={<CustomersPage />} />
              <Route path="tickets/:id"    element={<TicketDetailPage />} />
              <Route path="ask"            element={<AskPage />} />
              <Route path="documents"      element={<AdminRoute><DocumentsPage /></AdminRoute>} />
            </Route>

            {/* 404 */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </BrowserRouter>

      {/* Toast notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#1a1a24',
            border: '1px solid #2a2a3a',
            color: '#f0f0ff',
            fontSize: '13px',
          },
        }}
      />
    </QueryClientProvider>
  );
}
