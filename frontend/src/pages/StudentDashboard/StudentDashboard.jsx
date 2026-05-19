import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, GraduationCap } from 'lucide-react';
import './StudentDashboard.css';

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);

  useEffect(() => {
    // 1. Authenticate user locally from session
    const currentUser = JSON.parse(localStorage.getItem('cpp_current_user'));
    if (!currentUser || currentUser.role !== 'student') {
      navigate('/login');
      return;
    }
    setStudent(currentUser);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('cpp_current_user');
    navigate('/');
  };

  if (!student) return null;

  const displayName = student.username || student.name || 'Student';

  return (
    <div className="simple-dashboard-wrapper">
      <div className="simple-dashboard-card glass-card">
        <div className="simple-dashboard-icon-wrapper">
          <GraduationCap className="simple-dashboard-icon" size={32} />
        </div>
        <h1 className="simple-dashboard-title">
          Welcome back, <span className="gradient-text">{displayName}</span>
        </h1>
        <p className="simple-dashboard-subtitle">
          You are securely signed in as a student candidate.
        </p>
        <button className="btn-primary simple-logout-btn" onClick={handleLogout}>
          <LogOut size={18} /> Logout
        </button>
      </div>
    </div>
  );
};

export default StudentDashboard;
