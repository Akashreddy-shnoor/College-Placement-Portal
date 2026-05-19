import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, Menu, X, Sparkles } from 'lucide-react';
import './PublicHeader.css';

const PublicHeader = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`public-header ${scrolled ? 'scrolled' : ''}`}>
      <div className="header-container">
        
        {/* Left Side: Logo */}
        <Link to="/" className="public-logo">
          <div className="logo-icon-wrapper">
            <GraduationCap className="logo-icon" size={28} />
            <Sparkles className="logo-sparkle" size={12} />
          </div>
          <div className="public-logo-text">
            <h1>Placement <span className="gradient-text-blue-purple">Portal</span></h1>
            <p>AI-Powered Campus Placements</p>
          </div>
        </Link>

        {/* Center: Navigation Links */}
        <nav className={`public-nav ${isOpen ? 'mobile-open' : ''}`}>
          <a href="#home" onClick={() => setIsOpen(false)}>Home</a>
          <a href="#features" onClick={() => setIsOpen(false)}>Features</a>
          <a href="#workflow" onClick={() => setIsOpen(false)}>Workflow</a>
          <a href="#stats" onClick={() => setIsOpen(false)}>Statistics</a>
          <a href="#about" onClick={() => setIsOpen(false)}>About Us</a>
        </nav>

        {/* Right Side: Action Buttons */}
        <div className={`public-actions ${isOpen ? 'mobile-open' : ''}`}>
          <Link to="/login" className="login-btn-link" onClick={() => setIsOpen(false)}>
            <button className="btn-outline-glow">Sign In</button>
          </Link>
          <Link to="/register" className="register-btn-link" onClick={() => setIsOpen(false)}>
            <button className="btn-primary">Register</button>
          </Link>
        </div>

        {/* Mobile Menu Icon */}
        <button 
          className="mobile-toggle" 
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle Menu"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

      </div>
    </header>
  );
};

export default PublicHeader;
