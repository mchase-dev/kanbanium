import { Routes, Route, Navigate } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import { AuthProvider } from './contexts/AuthContext'
import { KeyboardShortcutProvider } from './contexts/KeyboardShortcutContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { CookieConsentProvider } from './contexts/CookieConsentContext'
import { ProtectedRoute } from './components/auth/ProtectedRoute'
import ErrorBoundary from './components/common/ErrorBoundary'
import ErrorFallback from './components/common/ErrorFallback'
import KeyboardShortcutHelp from './components/common/KeyboardShortcutHelp'
import { CookieConsent } from './components/common/CookieConsent'
import LoadingSkeleton from './components/common/LoadingSkeleton'
import { handleError } from './lib/error-handler'

// Lazy load pages for better performance
const LoginPage = lazy(() => import('./pages/auth/LoginPage').then(m => ({ default: m.LoginPage })))
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage').then(m => ({ default: m.RegisterPage })))
const DashboardPage = lazy(() => import('./pages/dashboard/DashboardPage').then(m => ({ default: m.DashboardPage })))
const BoardPage = lazy(() => import('./pages/board/BoardPage').then(m => ({ default: m.BoardPage })))
const ProfilePage = lazy(() => import('./pages/profile/ProfilePage').then(m => ({ default: m.ProfilePage })))
const UsersPage = lazy(() => import('./pages/users/UsersPage').then(m => ({ default: m.UsersPage })))
const MyTasksPage = lazy(() => import('./pages/my-tasks/MyTasksPage').then(m => ({ default: m.MyTasksPage })))
const ActivityPage = lazy(() => import('./pages/activity/ActivityPage').then(m => ({ default: m.ActivityPage })))
const CookiePolicyPage = lazy(() => import('./pages/legal/CookiePolicyPage'))
const PrivacyPolicyPage = lazy(() => import('./pages/legal/PrivacyPolicyPage'))
const NotFoundPage = lazy(() => import('./pages/errors/NotFoundPage'))

function App() {
  return (
    <ErrorBoundary
      fallback={<ErrorFallback />}
      onError={(error, errorInfo) => {
        handleError(error, { componentStack: errorInfo.componentStack });
      }}
    >
      <ThemeProvider>
        <CookieConsentProvider>
          <KeyboardShortcutProvider>
            <AuthProvider>
              <Suspense fallback={<LoadingSkeleton type="page" />}>
                <Routes>
                  <Route path="/" element={<Navigate to="/login" replace />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/cookie-policy" element={<CookiePolicyPage />} />
                  <Route path="/privacy" element={<PrivacyPolicyPage />} />
                  <Route
                    path="/dashboard"
                    element={
                      <ProtectedRoute>
                        <DashboardPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/boards/:id"
                    element={
                      <ProtectedRoute>
                        <BoardPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/profile"
                    element={
                      <ProtectedRoute>
                        <ProfilePage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/users"
                    element={
                      <ProtectedRoute>
                        <UsersPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/my-tasks"
                    element={
                      <ProtectedRoute>
                        <MyTasksPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/activity"
                    element={
                      <ProtectedRoute>
                        <ActivityPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
              </Suspense>
              <KeyboardShortcutHelp />
              <CookieConsent />
            </AuthProvider>
          </KeyboardShortcutProvider>
        </CookieConsentProvider>
      </ThemeProvider>
    </ErrorBoundary>
  )
}

export default App
