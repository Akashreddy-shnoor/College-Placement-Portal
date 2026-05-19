import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, GraduationCap } from 'lucide-react';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [admin, setAdmin] = useState(null);

  useEffect(() => {
    // 1. Authenticate admin user locally from session
    const currentUser = JSON.parse(localStorage.getItem('cpp_current_user'));
    if (!currentUser || currentUser.role !== 'admin') {
      navigate('/login');
      return;
    }
    setAdmin(currentUser);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('cpp_current_user');
    navigate('/');
  };

  if (!admin) return null;

  const displayName = admin.username || admin.name || 'Admin';

  return (
    <div className="simple-dashboard-wrapper">
      <div className="simple-dashboard-card glass-card">
        <div className="simple-dashboard-icon-wrapper purple">
          <GraduationCap className="simple-dashboard-icon" size={32} />
        </div>
        <h1 className="simple-dashboard-title">
          Welcome back, <span className="gradient-text-purple">{displayName}</span>
        </h1>
        <p className="simple-dashboard-subtitle">
          You are securely signed in as a system administrator.
        </p>
        <button className="btn-primary simple-logout-btn purple-btn" onClick={handleLogout}>
          <LogOut size={18} /> Logout
        </button>
      </div>
    </div>
  );
};

export default AdminDashboard;
