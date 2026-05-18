import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap } from 'lucide-react';
import './PublicHeader.css';

const PublicHeader = () => {
  return (
    <header className="public-header">

      {/* Left side: Logo and Portal Name */}
      <div className="public-logo">
        {/* We use a graduation cap icon as a placeholder for the logo */}
        <GraduationCap size={32} color="var(--primary-color)" />
        <div className="public-logo-text">
          <h1>Placement Portal</h1>
          <p>Smart Placements, Bright Futures</p>
        </div>
      </div>

      {/* Middle: Navigation Links */}
      <nav className="public-nav">
        <a href="#home" className="active">Home</a>
        <a href="#features">Features</a>
        <a href="#about">About Us</a>
        <a href="#how-it-works">How It Works</a>
        <a href="#contact">Contact</a>
      </nav>

      {/* Right side: Login and Register buttons */}
      <div className="public-actions">
        {/* The Link tag takes us to the dashboard (our temporary login destination) */}
        <Link to="/student/dashboard" className="btn-outline">
          Login
        </Link>
        <button className="btn-solid">
          Register
        </button>
      </div>

    </header>
  );
};

export default PublicHeader;
