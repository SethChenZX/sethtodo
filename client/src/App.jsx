import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SubscriptionProvider } from './context/SubscriptionContext';
import Login from './pages/Login';
import SelectRole from './pages/SelectRole';
import Dashboard from './pages/Dashboard';
import Admin from './pages/Admin';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Pricing from './pages/Pricing';
import Subscription from './pages/Subscription';

const LoadingFallback = () => {
  const [showRetry, setShowRetry] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setShowRetry(true), 5000);
    return () => clearTimeout(timer);
  }, []);
  return (
    <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
      <div>Loading...</div>
      {showRetry && (
        <div style={{ marginTop: '20px' }}>
          <p style={{ color: '#d32f2f', fontSize: '14px' }}>
            読み込みに時間がかかっています。
          </p>
          <button
            className="btn btn-primary"
            onClick={() => window.location.reload()}
            style={{ marginTop: '10px' }}
          >
            ページを再読み込み
          </button>
        </div>
      )}
    </div>
  );
};

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingFallback />;
  if (!user) return <Navigate to="/login" />;
  if (!user.role) return <Navigate to="/select-role" />;
  if (user.role === 'super') return <Navigate to="/admin" />;
  return children;
};

const SuperUserRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingFallback />;
  if (!user) return <Navigate to="/login" />;
  if (!user.role) return <Navigate to="/select-role" />;
  if (user.role !== 'super') return <Navigate to="/" />;
  return children;
};

const SelectRoleRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingFallback />;
  if (!user) return <Navigate to="/login" />;
  if (user.role) return <Navigate to="/" />;
  return children;
};

function App() {
  return (
    <AuthProvider>
      <SubscriptionProvider>
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/select-role" element={<SelectRoleRoute><SelectRole /></SelectRoleRoute>} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/subscription" element={<Subscription />} />
            <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/admin" element={<SuperUserRoute><Admin /></SuperUserRoute>} />
          </Routes>
        </BrowserRouter>
      </SubscriptionProvider>
    </AuthProvider>
  );
}

export default App;
