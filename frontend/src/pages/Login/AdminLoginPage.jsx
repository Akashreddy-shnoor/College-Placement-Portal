import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { GraduationCap, Lock, User, ArrowLeft, Sparkles, AlertCircle } from 'lucide-react';
import './LoginPage.css';
import { API_BASE_URL } from '../../config';

const AdminLoginPage = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('college');
  const [password, setPassword] = useState('cpp');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password.trim()) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      if (response.ok) {
        const data = await response.json();
        
        // Block Student Login from this page
        if (data.role !== 'admin') {
          setError('Access Denied: Only Admins can log in here.');
          setLoading(false);
          return;
        }

        const sessionUser = {
          role: data.role,
          username: 'college', 
          name: data.userData.name, 
          email: data.userData.email
        };

        localStorage.setItem('cpp_current_user', JSON.stringify(sessionUser));
        setLoading(false);
        navigate('/admin/dashboard');
        return;
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Authentication failed. Incorrect username or password.');
        setLoading(false);
        return;
      }
    } catch (apiError) {
      console.error('API Error connecting to backend:', apiError);
      setError('Backend server offline. Please make sure your FastAPI service is running.');
      setLoading(false);
    }
  };

  return (
    <div className="login-page-wrapper">
      {/* Back button */}
      <Link to="/" className="back-btn">
        <ArrowLeft size={18} /> Back to Home
      </Link>

      <div className="login-bg-glow" style={{ width: '450px', height: '450px', top: '15%', left: '30%', background: 'rgba(59, 130, 246, 0.15)' }}></div>
      <div className="login-bg-glow" style={{ width: '400px', height: '400px', bottom: '10%', right: '25%', background: 'rgba(139, 92, 246, 0.12)' }}></div>

      <div className="login-card-container">
        <div className="login-card glass-card">

          <div className="login-card-header">
            <div className="login-logo-circle" style={{ background: 'linear-gradient(135deg, #8b5cf6, #ec4899)' }}>
              <GraduationCap size={28} className="logo-svg" />
            </div>
            <h2>Admin <span className="gradient-text" style={{ background: 'linear-gradient(to right, #a78bfa, #f472b6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Portal</span></h2>
            <p>Authorized administrator secure gateway</p>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            {error && (
              <div className="form-alert">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="username">Username</label>
              <div className="input-with-icon">
                <User size={18} className="input-icon" />
                <input
                  type="text"
                  id="username"
                  placeholder="Enter admin username..."
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="input-with-icon">
                <Lock size={18} className="input-icon" />
                <input
                  type="password"
                  id="password"
                  placeholder="Enter admin password..."
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button type="submit" className="btn-primary login-submit" style={{ background: 'linear-gradient(135deg, #8b5cf6, #ec4899)', border: 'none' }} disabled={loading}>
              {loading ? (
                <div className="spinner"></div>
              ) : (
                <>
                  Admin Login <Sparkles size={16} />
                </>
              )}
            </button>
          </form>

        </div>
      </div>

    </div>
  );
};

export default AdminLoginPage;
