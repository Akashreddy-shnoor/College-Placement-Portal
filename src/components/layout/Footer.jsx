import React from 'react';
import { GraduationCap } from 'lucide-react';
import '../../pages/Landing/LandingPage.css'; // Reusing styles from LandingPage

const Footer = () => {
  return (
    <footer className="footer">

      {/* Top half of the footer with columns */}
      <div className="footer-content">

        {/* Logo and Name column */}
        <div style={{ maxWidth: '250px' }}>
          <div className="public-logo" style={{ marginBottom: '16px' }}>
            <GraduationCap size={32} color="var(--primary-color)" />
            <div className="public-logo-text">
              <h1>Placement Portal</h1>
              <p>Smart Placements, Bright Futures</p>
            </div>
          </div>
        </div>

        {/* Links Column 1 */}
        <div className="footer-column">
          <h3>Quick Links</h3>
          <ul>
            <li><a href="#home">Home</a></li>
            <li><a href="#features">Features</a></li>
            <li><a href="#about">About Us</a></li>
            <li><a href="#contact">Contact</a></li>
          </ul>
        </div>

        {/* Links Column 2 */}
        <div className="footer-column">
          <h3>For Students</h3>
          <ul>
            <li><a href="#browse">Browse Jobs</a></li>
            <li><a href="#upload">Upload Resume</a></li>
            <li><a href="#ats">ATS Score</a></li>
            <li><a href="#applications">Applications</a></li>
          </ul>
        </div>

        {/* Links Column 3 */}
        <div className="footer-column">
          <h3>For Recruiters</h3>
          <ul>
            <li><a href="#post">Post a Job</a></li>
            <li><a href="#view">View Candidates</a></li>
            <li><a href="#login">Recruiter Login</a></li>
            <li><a href="#pricing">Pricing</a></li>
          </ul>
        </div>

        {/* Links Column 4 & Social */}
        <div className="footer-column">
          <h3>Support</h3>
          <ul>
            <li><a href="#help">Help Center</a></li>
            <li><a href="#privacy">Privacy Policy</a></li>
            <li><a href="#terms">Terms & Conditions</a></li>
            <li><a href="#contact-us">Contact Us</a></li>
          </ul>

          <div style={{ marginTop: '24px' }}>
            <h3 style={{ fontSize: '0.875rem' }}>Stay Connected</h3>
            <div className="social-icons">
              <div className="social-icon">
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z" />
                </svg>
              </div>
              <div className="social-icon">
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </div>
              <div className="social-icon">
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
              </div>
              <div className="social-icon">
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Bottom copyright text */}
      <div className="footer-bottom">
        &copy; 2026 Placement Portal. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
