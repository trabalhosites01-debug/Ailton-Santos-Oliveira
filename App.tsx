import React from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Layout } from './components/Layout';
import { Auth } from './pages/Auth';
import { Onboarding } from './pages/Onboarding';
import { Dashboard } from './pages/Dashboard';
import { PersonalTrainer } from './pages/PersonalTrainer';
import { Nutritionist } from './pages/Nutritionist';
import { Scanner } from './pages/Scanner';
import { AdminPanel } from './pages/AdminPanel';
import { AppRoute } from './types';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to={AppRoute.LOGIN} replace />;
  }

  // If user is authenticated but hasn't finished onboarding, force onboarding
  // We check if they are already ON the onboarding page to avoid loop
  if (user && !user.onboarded && location.pathname !== AppRoute.ONBOARDING) {
    return <Navigate to={AppRoute.ONBOARDING} replace />;
  }

  // If user IS onboarded but tries to access onboarding, send to dashboard
  if (user && user.onboarded && location.pathname === AppRoute.ONBOARDING) {
    return <Navigate to={AppRoute.DASHBOARD} replace />;
  }

  return <Layout>{children}</Layout>;
};

// Simplified Wrapper for Onboarding to use Layout appropriately (or no layout)
// We generally want onboarding to be full screen, so no Layout wrapper
const ProtectedOnboarding: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to={AppRoute.LOGIN} replace />;
  }

  if (user && user.onboarded) {
    return <Navigate to={AppRoute.DASHBOARD} replace />;
  }

  return <Onboarding />;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path={AppRoute.LOGIN} element={<Auth />} />
      <Route path={AppRoute.ONBOARDING} element={<ProtectedOnboarding />} />
      
      <Route path={AppRoute.DASHBOARD} element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path={AppRoute.TRAINER} element={<ProtectedRoute><PersonalTrainer /></ProtectedRoute>} />
      <Route path={AppRoute.NUTRITIONIST} element={<ProtectedRoute><Nutritionist /></ProtectedRoute>} />
      <Route path={AppRoute.BODY_SCAN} element={<ProtectedRoute><Scanner /></ProtectedRoute>} />
      <Route path={AppRoute.FOOD_SCAN} element={<ProtectedRoute><Scanner /></ProtectedRoute>} />
      
      {/* Admin Route */}
      <Route path={AppRoute.ADMIN} element={<ProtectedRoute><AdminPanel /></ProtectedRoute>} />
      
      <Route path="*" element={<Navigate to={AppRoute.DASHBOARD} replace />} />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <HashRouter>
        <AppRoutes />
      </HashRouter>
    </AuthProvider>
  );
};

export default App;