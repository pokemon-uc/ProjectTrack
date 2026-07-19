import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import StudentDashboard from './pages/StudentDashboard';
import GuideDashboard from './pages/GuideDashboard';
import CoordinatorDashboard from './pages/CoordinatorDashboard';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/student" element={<StudentDashboard />} />
      <Route path="/guide" element={<GuideDashboard />} />
      <Route path="/coordinator" element={<CoordinatorDashboard />} />
    </Routes>
  );
}

export default App;
