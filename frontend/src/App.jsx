import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import StudentDashboard from './pages/StudentDashboard';
import GuideDashboard from './pages/GuideDashboard';
import CoordinatorDashboard from './pages/CoordinatorDashboard';
import ProjectDetail from './pages/ProjectDetail';
import NotificationsPage from './pages/Notifications';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import ForgotPassword from "./pages/ForgotPassword";
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password"element={<ForgotPassword />}/>
      <Route path="/student" element={<ProtectedRoute allow={['student']}><StudentDashboard /></ProtectedRoute>} />
      <Route path="/guide" element={<ProtectedRoute allow={['guide']}><GuideDashboard /></ProtectedRoute>} />
      <Route path="/coordinator" element={<ProtectedRoute allow={['coordinator']}><CoordinatorDashboard /></ProtectedRoute>} />
      <Route path="/projects/:id" element={<ProtectedRoute><ProjectDetail /></ProtectedRoute>} />
      <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
      <Route path="/analytics" element={<ProtectedRoute allow={['coordinator']}><Analytics /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}