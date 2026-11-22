import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Layout & Route Guards
import MainLayout from '../layout/MainLayout';
import ProtectedRoute from './ProtectedRoute';
import RoleRoute from './RoleRoute';

// Pages
import LandingPage from '../pages/landing/LandingPage';
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import DashboardPage from '../pages/dashboard/DashboardPage';
import AssistantPage from '../pages/assistant/AssistantPage';
import NavigationPage from '../pages/navigation/NavigationPage';
import CanteenPage from '../pages/canteen/CanteenPage';
import PrintingPage from '../pages/printing/PrintingPage';
import LostFoundPage from '../pages/lost-found/LostFoundPage';
import AdminPage from '../pages/admin/AdminPage';
import NotFoundPage from '../pages/NotFoundPage';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public Landing Page */}
      <Route path="/" element={<LandingPage />} />

      {/* Public Authentication Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Protected Campus Portal Shell */}
      <Route
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />

        {/* Five Core Modules */}
        <Route path="/assistant" element={<AssistantPage />} />
        <Route path="/navigation" element={<NavigationPage />} />
        <Route path="/canteen" element={<CanteenPage />} />
        <Route path="/printing" element={<PrintingPage />} />
        <Route path="/lost-found" element={<LostFoundPage />} />

        {/* Administration (Admin Role Required) */}
        <Route
          path="/admin"
          element={
            <RoleRoute allowedRoles={['admin']}>
              <AdminPage />
            </RoleRoute>
          }
        />
      </Route>

      {/* 404 Fallback */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
