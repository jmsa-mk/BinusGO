import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar.jsx';
import LandingPage from './pages/LandingPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import RoutePlanner from './pages/RoutePlanner.jsx';
import SavedLocations from './pages/SavedLocations.jsx';
import TripHistory from './pages/TripHistory.jsx';
import AdminDashboard from './pages/admin/AdminDashboard.jsx';
import { useAuth } from './context/AuthContext.jsx';

function AppShell({ children }) {
  return (
    <div className="flex min-h-screen bg-lightbg">
      <Sidebar />
      <main className="flex-1 ml-0 md:ml-20">{children}</main>
    </div>
  );
}

function AdminRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'Admin') return <Navigate to="/rute" replace />;
  return children;
}

export default function App() {
  const { pathname } = useLocation();
  const bare = pathname === '/' || pathname === '/login' || pathname === '/register';

  if (bare) {
    return (
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Routes>
    );
  }

  return (
    <AppShell>
      <Routes>
        <Route path="/rute" element={<RoutePlanner />} />
        <Route path="/simpan" element={<SavedLocations />} />
        <Route path="/riwayat" element={<TripHistory />} />
        <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        <Route path="*" element={<Navigate to="/rute" replace />} />
      </Routes>
    </AppShell>
  );
}
