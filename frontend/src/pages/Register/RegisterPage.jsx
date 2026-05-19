import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { GraduationCap, Lock, User, ArrowLeft, Sparkles, AlertCircle, Mail, CheckCircle, ArrowRight } from 'lucide-react';
import './RegisterPage.css';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.username.trim() || !formData.email.trim() || !formData.password.trim()) {
      setError('Please fill in all required fields.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://localhost:8000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setLoading(false);
        setIsRegistered(true);
      } else {
        const errorData = await response.json();
        if (typeof errorData.detail === 'string') {
          setError(errorData.detail);
        } else if (Array.isArray(errorData.detail)) {
          const msg = errorData.detail.map(err => `${err.loc[err.loc.length - 1]}: ${err.msg}`).join(', ');
          setError(msg || 'Registration validation failed.');
        } else {
          setError(JSON.stringify(errorData.detail) || 'Registration failed.');
        }
        setLoading(false);
      }
    } catch (apiError) {
      console.error('API Error connecting to backend:', apiError);
      setError('Backend server offline. Please make sure your FastAPI service is running.');
      setLoading(false);
    }
  };

  return (
    <div className="register-page-wrapper">
      <Link to="/" className="back-btn">
        <ArrowLeft size={18} /> Back to Home
      </Link>

      <div className="register-bg-glow" style={{ width: '450px', height: '450px', top: '15%', left: '30%', background: 'rgba(59, 130, 246, 0.15)' }}></div>
      <div className="register-bg-glow" style={{ width: '400px', height: '400px', bottom: '10%', right: '25%', background: 'rgba(139, 92, 246, 0.12)' }}></div>

      <div className="register-card-container">
        <div className="register-card glass-card">

          {isRegistered ? (
            <div className="register-success-view animate-fade">
              <div className="register-logo-circle success-circle">
                <CheckCircle size={32} className="logo-svg success-icon" style={{ color: '#10b981' }} />
              </div>
              <h2 className="success-title">Registration <span className="gradient-text">Successful!</span></h2>
              <p className="success-subtitle">Your AI developer gateway account is ready.</p>

              <div className="success-message-box">
                <p>Registration successful! Please click the button below to sign in and enter the AI portal.</p>
              </div>

              <Link to="/login" className="btn-primary signin-btn">
                Click here to Sign In <ArrowRight size={16} />
              </Link>
            </div>
          ) : (
            <>
              <div className="register-card-header">
                <div className="register-logo-circle">
                  <GraduationCap size={28} className="logo-svg" />
                </div>
                <h2>Create <span className="gradient-text">Account</span></h2>
                <p>Join the AI gateway for top placements</p>
              </div>

              <form className="register-form" onSubmit={handleSubmit}>
                {error && (
                  <div className="form-alert">
                    <AlertCircle size={16} />
                    <span>{error}</span>
                  </div>
                )}

                <div className="form-group">
                  <label htmlFor="username">Username *</label>
                  <div className="input-with-icon">
                    <User size={18} className="input-icon" />
                    <input
                      type="text"
                      id="username"
                      name="username"
                      placeholder="Choose a username..."
                      value={formData.username}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email Address *</label>
                  <div className="input-with-icon">
                    <Mail size={18} className="input-icon" />
                    <input
                      type="email"
                      id="email"
                      name="email"
                      placeholder="name@university.edu"
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="password">Password *</label>
                  <div className="input-with-icon">
                    <Lock size={18} className="input-icon" />
                    <input
                      type="password"
                      id="password"
                      name="password"
                      placeholder="Create a password..."
                      value={formData.password}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <button type="submit" className="btn-primary register-submit" disabled={loading}>
                  {loading ? (
                    <div className="spinner"></div>
                  ) : (
                    <>
                      Register <Sparkles size={16} />
                    </>
                  )}
                </button>
              </form>

              <div className="register-footer">
                <p>Already have an account? <Link to="/login" className="login-link">Sign In</Link></p>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
