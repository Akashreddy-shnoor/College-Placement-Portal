import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { GraduationCap, Lock, User, ArrowLeft, Sparkles, AlertCircle } from 'lucide-react';
import './LoginPage.css';
import { API_BASE_URL } from '../../config';

const LoginPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Handle Google OAuth Redirect
  useEffect(() => {
    const oauthSuccess = searchParams.get('oauth_success');
    if (oauthSuccess === 'true') {
      const sessionUser = {
        role: searchParams.get('role') || 'student',
        username: searchParams.get('username'),
        name: searchParams.get('name'),
        email: searchParams.get('email'),
        skills: 'React JS, Python, SQL',
        applicationStatus: 'None'
      };

      localStorage.setItem('cpp_current_user', JSON.stringify(sessionUser));
      navigate('/student/dashboard');
    }
  }, [searchParams, navigate]);

  // Pre-fill credentials based on URL parameters (for post-registration redirects)
  useEffect(() => {
    const usernameParam = searchParams.get('username');
    if (usernameParam) {
      setUsername(usernameParam);
      setPassword('');
    }
  }, [searchParams]);

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
        
        // Block Admin Login from this page
        if (data.role === 'admin') {
          setError('Admins must log in via the Admin Portal.');
          setLoading(false);
          return;
        }

        const sessionUser = {
          role: data.role,
          ...data.userData
        };

        localStorage.setItem('cpp_current_user', JSON.stringify(sessionUser));
        setLoading(false);
        navigate('/student/dashboard');
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

  // Google Login Account Triggers
  const handleGoogleClick = () => {
    window.location.href = `${API_BASE_URL}/api/auth/google?origin=${encodeURIComponent(window.location.origin)}`;
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
            <div className="login-logo-circle">
              <GraduationCap size={28} className="logo-svg" />
            </div>
            <h2>Student <span className="gradient-text">Login</span></h2>
            <p>Enter your student credentials to enter the AI gateway</p>
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
                  placeholder="Enter your username..."
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
                  placeholder="Enter your password..."
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button type="submit" className="btn-primary login-submit" disabled={loading}>
              {loading ? (
                <div className="spinner"></div>
              ) : (
                <>
                  Login <Sparkles size={16} />
                </>
              )}
            </button>

            {/* Google Authentication Divider & Button */}
            <div className="login-divider">
              <span>or continue with</span>
            </div>

            <button
              type="button"
              className="btn-google"
              onClick={handleGoogleClick}
              disabled={loading}
            >
              <svg className="google-icon" viewBox="0 0 24 24" width="18" height="18">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              Sign in with Google
            </button>
          </form>

        </div>
      </div>

    </div>
  );
};

export default LoginPage;
