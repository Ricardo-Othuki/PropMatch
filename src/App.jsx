import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import Landing from './pages/Landing';
import Quiz from './pages/Quiz';
import Results from './pages/Results';
import Explorer from './pages/Explorer';
import RiskSimulator from './pages/RiskSimulator';
import TradeAnalyzer from './pages/TradeAnalyzer';
import Ranking from './pages/Ranking';
import Dashboard from './pages/Dashboard';
import Plans from './pages/Plans';
import Layout from './components/Layout';

const ProtectedRoute = ({ children }) => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin, isAuthenticated } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered') return <UserNotRegisteredError />;
    if (authError.type === 'auth_required') { navigateToLogin(); return null; }
  }

  if (!isAuthenticated) return <Navigate to="/Landing" replace />;

  return children;
};

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<Navigate to="/Landing" replace />} />
              <Route path="/Landing" element={<Landing />} />
              <Route path="/Explorer" element={<Explorer />} />
              <Route path="/Ranking" element={<Ranking />} />
              <Route path="/Plans" element={<Plans />} />
              <Route path="/Quiz" element={<ProtectedRoute><Quiz /></ProtectedRoute>} />
              <Route path="/Results" element={<ProtectedRoute><Results /></ProtectedRoute>} />
              <Route path="/RiskSimulator" element={<ProtectedRoute><RiskSimulator /></ProtectedRoute>} />
              <Route path="/TradeAnalyzer" element={<ProtectedRoute><TradeAnalyzer /></ProtectedRoute>} />
              <Route path="/Dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            </Route>
            <Route path="*" element={<PageNotFound />} />
          </Routes>
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  );
}

export default App