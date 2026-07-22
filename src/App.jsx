import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ScrollToTop from './components/ScrollToTop';
import Layout from '@/components/Layout';
import Sanctuary from '@/pages/Sanctuary';
import BisonChat from '@/pages/BisonChat';
import CheckIn from '@/pages/CheckIn';
import Journal from '@/pages/Journal';
import Reflect from '@/pages/Reflect';
import Archives from '@/pages/Archives';
import Insights from '@/pages/Insights';
import Community from '@/pages/Community';
import Settings from '@/pages/Settings';
import DeveloperControlPlane from '@/pages/DeveloperControlPlane';
import TrustDashboard from '@/pages/TrustDashboard';
import VoiceStudio from '@/pages/VoiceStudio';
import Garden from '@/pages/Garden';
import DecisionLab from '@/pages/DecisionLab';
// Add page imports here

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // Redirect to login automatically
      navigateToLogin();
      return null;
    }
  }

  // Render the main app
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Sanctuary />} />
        <Route path="/bison" element={<BisonChat />} />
        <Route path="/checkin" element={<CheckIn />} />
        <Route path="/journal" element={<Journal />} />
        <Route path="/reflect" element={<Reflect />} />
        <Route path="/archives" element={<Archives />} />
        <Route path="/insights" element={<Insights />} />
        <Route path="/community" element={<Community />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/developer" element={<DeveloperControlPlane />} />
        <Route path="/trust" element={<TrustDashboard />} />
        <Route path="/voice" element={<VoiceStudio />} />
        <Route path="/garden" element={<Garden />} />
        <Route path="/decisions" element={<DecisionLab />} />
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
          <ScrollToTop />
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App