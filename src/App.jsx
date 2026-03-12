import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';

import Layout from './components/Layout';
import Landing from './pages/Landing';
import RoleSelect from './pages/RoleSelect';
import Dashboard from './pages/Dashboard';
import Discover from './pages/Discover';
import Grounds from './pages/Grounds';
import Tournaments from './pages/Tournaments';
import Players from './pages/Players';
import Equipment from './pages/Equipment';
import Feed from './pages/Feed';
import Messages from './pages/Messages';
import Notifications from './pages/Notifications';
import Profile from './pages/Profile';

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
    <Routes>
      <Route path="/" element={<Navigate to="/Landing" replace />} />
      <Route path="/Landing" element={<Landing />} />
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