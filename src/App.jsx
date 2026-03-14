import React, { Suspense, lazy } from 'react';
import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import Layout from './components/Layout';

const Landing = lazy(() => import('./pages/Landing'));
const RoleSelect = lazy(() => import('./pages/RoleSelect'));
const Login = lazy(() => import('./pages/Login'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Discover = lazy(() => import('./pages/Discover'));
const Grounds = lazy(() => import('./pages/Grounds'));
const Tournaments = lazy(() => import('./pages/Tournaments'));
const Players = lazy(() => import('./pages/Players'));
const Equipment = lazy(() => import('./pages/Equipment'));
const Feed = lazy(() => import('./pages/Feed'));
const Messages = lazy(() => import('./pages/Messages'));
const Notifications = lazy(() => import('./pages/Notifications'));
const Profile = lazy(() => import('./pages/Profile'));

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      navigateToLogin();
      return null;
    }
  }

  return (
    <Suspense
      fallback={
        <div className="fixed inset-0 flex items-center justify-center bg-background">
          <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin" />
        </div>
      }
    >
      <Routes>
        <Route path="/" element={<Navigate to="/Landing" replace />} />
        <Route path="/Landing" element={<Landing />} />
        <Route path="/Login" element={<Login />} />
        <Route path="/RoleSelect" element={<RoleSelect />} />
        <Route element={<Layout />}>
          <Route path="/Dashboard" element={<Dashboard />} />
          <Route path="/Discover" element={<Discover />} />
          <Route path="/Grounds" element={<Grounds />} />
          <Route path="/Tournaments" element={<Tournaments />} />
          <Route path="/Players" element={<Players />} />
          <Route path="/Equipment" element={<Equipment />} />
          <Route path="/Feed" element={<Feed />} />
          <Route path="/Messages" element={<Messages />} />
          <Route path="/Notifications" element={<Notifications />} />
          <Route path="/Profile" element={<Profile />} />
        </Route>
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </Suspense>
  );
};

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App