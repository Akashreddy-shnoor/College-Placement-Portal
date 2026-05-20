import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/Landing/LandingPage';
import LoginPage from './pages/Login/LoginPage';
import AdminLoginPage from './pages/Login/AdminLoginPage';
import RegisterPage from './pages/Register/RegisterPage';
import StudentDashboard from './pages/StudentDashboard/StudentDashboard';
import AdminDashboard from './pages/AdminDashboard/AdminDashboard';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Landing Page */}
        <Route path="/" element={<LandingPage />} />
        
        {/* Authentication Portal */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        
        {/* Student Portal */}
        <Route path="/student/dashboard" element={<StudentDashboard />} />
        
        {/* Admin Portal */}
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
