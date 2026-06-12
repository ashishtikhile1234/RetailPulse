import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute, PublicRoute } from './components/layout/ProtectedRoute';

// Auth
import LoginPage    from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// Admin
import AdminDashboard from './pages/admin/AdminDashboard';
import UserListPage   from './pages/admin/UserListPage';
import UserDetailPage from './pages/admin/UserDetailPage';
import AddUserPage    from './pages/admin/AddUserPage';
import AdminStoreList from './pages/admin/StoreListPage';
import AddStorePage   from './pages/admin/AddStorePage';

// Normal User
import UserStoreList     from './pages/user/StoreListPage';
import ChangePasswordPage from './pages/user/ChangePasswordPage';

// Store Owner
import OwnerDashboard from './pages/owner/OwnerDashboard';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3500,
            style: { fontFamily: 'Inter, sans-serif', fontSize: '0.875rem' },
            success: { iconTheme: { primary: '#22c55e', secondary: '#fff' } },
            error:   { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
          }}
        />
        <Routes>
          {/* Root redirect */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Public routes — redirect to dashboard if already logged in */}
          <Route path="/login"    element={<PublicRoute><LoginPage /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

          {/* ── Admin ────────────────────────────────────────────── */}
          <Route path="/admin/dashboard" element={
            <ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>
          } />
          <Route path="/admin/users" element={
            <ProtectedRoute allowedRoles={['admin']}><UserListPage /></ProtectedRoute>
          } />
          <Route path="/admin/users/new" element={
            <ProtectedRoute allowedRoles={['admin']}><AddUserPage /></ProtectedRoute>
          } />
          <Route path="/admin/users/:id" element={
            <ProtectedRoute allowedRoles={['admin']}><UserDetailPage /></ProtectedRoute>
          } />
          <Route path="/admin/stores" element={
            <ProtectedRoute allowedRoles={['admin']}><AdminStoreList /></ProtectedRoute>
          } />
          <Route path="/admin/stores/new" element={
            <ProtectedRoute allowedRoles={['admin']}><AddStorePage /></ProtectedRoute>
          } />

          {/* ── Normal User ──────────────────────────────────────── */}
          <Route path="/stores" element={
            <ProtectedRoute allowedRoles={['user']}><UserStoreList /></ProtectedRoute>
          } />

          {/* ── Store Owner ──────────────────────────────────────── */}
          <Route path="/owner/dashboard" element={
            <ProtectedRoute allowedRoles={['store_owner']}><OwnerDashboard /></ProtectedRoute>
          } />

          {/* ── Shared (all authenticated roles) ────────────────── */}
          <Route path="/account/password" element={
            <ProtectedRoute allowedRoles={['admin', 'user', 'store_owner']}><ChangePasswordPage /></ProtectedRoute>
          } />

          {/* 404 fallback */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
