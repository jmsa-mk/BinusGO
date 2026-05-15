import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar.jsx';
import AdminSidebar from './components/admin/AdminSidebar.jsx';
import LandingPage from './pages/LandingPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import RoutePlanner from './pages/RoutePlanner.jsx';
import SavedLocations from './pages/SavedLocations.jsx';
import TripHistory from './pages/TripHistory.jsx';
import AdminDashboard from './pages/admin/AdminDashboard.jsx';
import CampusManagement from './pages/admin/CampusManagement.jsx';
import RouteManagement from './pages/admin/RouteManagement.jsx';
import UserManagement from './pages/admin/UserManagement.jsx';
import Reports from './pages/admin/Reports.jsx';
import SettingsPage from './pages/admin/Settings.jsx';
import ActivityLog from './pages/admin/ActivityLog.jsx';
import { useAuth } from './context/AuthContext.jsx';

function AppShell({ children, admin }) {
  return (
    <div className="flex min-h-screen bg-lightbg">
      <Sidebar />
      {admin && <AdminSidebar />}
      <main className={`flex-1 ${admin ? 'md:ml-[19rem]' : 'md:ml-20'}`}>{children}</main>
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
  const isAdmin = pathname.startsWith('/admin');

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
    <AppShell admin={isAdmin}>
      <Routes>
        <Route path="/rute" element={<RoutePlanner />} />
        <Route path="/simpan" element={<SavedLocations />} />
        <Route path="/riwayat" element={<TripHistory />} />
        <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        <Route path="/admin/kampus" element={<AdminRoute><CampusManagement /></AdminRoute>} />
        <Route path="/admin/rute" element={<AdminRoute><RouteManagement /></AdminRoute>} />
        <Route path="/admin/pengguna" element={<AdminRoute><UserManagement /></AdminRoute>} />
        <Route path="/admin/laporan" element={<AdminRoute><Reports /></AdminRoute>} />
        <Route path="/admin/pengaturan" element={<AdminRoute><SettingsPage /></AdminRoute>} />
        <Route path="/admin/log" element={<AdminRoute><ActivityLog /></AdminRoute>} />
        <Route path="*" element={<Navigate to="/rute" replace />} />
      </Routes>
    </AppShell>
  );
}
