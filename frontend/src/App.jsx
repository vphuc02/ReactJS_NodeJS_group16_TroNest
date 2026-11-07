import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/common/ProtectedRoute';

// Layouts
import { ClientLayout } from './components/layout/ClientLayout';
import { LandlordLayout } from './components/layout/LandlordLayout';
import { AdminLayout } from './components/layout/AdminLayout';

// Client Pages
import { HomePage } from './pages/client/HomePage';
import { RoomListPage } from './pages/client/RoomListPage';
import { RoomDetailPage } from './pages/client/RoomDetailPage';
import { LoginPage } from './pages/client/LoginPage';
import { RegisterPage } from './pages/client/RegisterPage';
import { ForgotPasswordPage } from './pages/client/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/client/ResetPasswordPage';
import { FavoritesPage } from './pages/client/FavoritesPage';
import { ProfilePage } from './pages/client/ProfilePage';
import { LandlordPublicDetailPage } from './pages/client/LandlordPublicDetailPage';

// Landlord Pages
import { LandlordDashboardPage } from './pages/landlord/LandlordDashboardPage';
import { LandlordRoomListPage } from './pages/landlord/LandlordRoomListPage';
import { LandlordRoomFormPage } from './pages/landlord/LandlordRoomFormPage';
import { LandlordProfilePage } from './pages/landlord/LandlordProfilePage';

// Admin Pages
import { AdminLoginPage } from './pages/admin/AdminLoginPage';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminRoomListPage } from './pages/admin/AdminRoomListPage';
import { AdminLandlordListPage } from './pages/admin/AdminLandlordListPage';
import { AdminUserListPage } from './pages/admin/AdminUserListPage';
import { AdminCategoryListPage } from './pages/admin/AdminCategoryListPage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3500,
            style: {
              background: '#1C1B19',
              color: '#FAF7F2',
              fontSize: '13px',
              borderRadius: '16px',
              padding: '12px 18px',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            },
            success: {
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff'
              }
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff'
              }
            }
          }}
        />

        <Routes>
          {/* CLIENT PORTAL ROUTES */}
          <Route element={<ClientLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/rooms" element={<RoomListPage />} />
            <Route path="/rooms/detail/:id" element={<RoomDetailPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/landlords/:id" element={<LandlordPublicDetailPage />} />
            <Route path="/chu-tro/:id" element={<LandlordPublicDetailPage />} />
            <Route
              path="/favorites"
              element={
                <ProtectedRoute>
                  <FavoritesPage />
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
          </Route>

          {/* LANDLORD PORTAL ROUTES */}
          <Route
            path="/landlord"
            element={
              <ProtectedRoute allowedRoles={['LANDLORD']}>
                <LandlordLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/landlord/dashboard" replace />} />
            <Route path="dashboard" element={<LandlordDashboardPage />} />
            <Route path="rooms" element={<LandlordRoomListPage />} />
            <Route path="rooms/create" element={<LandlordRoomFormPage />} />
            <Route path="rooms/edit/:id" element={<LandlordRoomFormPage />} />
            <Route path="profile" element={<LandlordProfilePage />} />
          </Route>

          {/* ADMIN LOGIN */}
          <Route path="/admin/login" element={<AdminLoginPage />} />

          {/* ADMIN PORTAL ROUTES */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboardPage />} />
            <Route path="rooms" element={<AdminRoomListPage />} />
            <Route path="landlords" element={<AdminLandlordListPage />} />
            <Route path="users" element={<AdminUserListPage />} />
            <Route path="categories" element={<AdminCategoryListPage />} />
          </Route>

          {/* CATCH ALL: 404 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
