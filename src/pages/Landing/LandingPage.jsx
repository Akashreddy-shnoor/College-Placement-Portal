import React from 'react';
import PublicHeader from '../../components/layout/PublicHeader';
import Footer from '../../components/layout/Footer';
import { 
  Sparkles, 
  ArrowRight, 
  Upload, 
  Bot, 
  Award, 
  ShieldCheck, 
  Users, 
  Building, 
  Briefcase, 
  LineChart, 
  Target,
  GraduationCap,
  Bell,
  User,
  FileText,
  Settings,
  LogOut,
  MessageSquare
} from 'lucide-react';
import './LandingPage.css';

const LandingPage = () => {
  return (
    <div className="landing-page">
      
      {/* 1. The Header at the very top */}
      <PublicHeader />

      {/* 2. Hero Section (The big main title area) */}
      <section className="hero-section" id="home">
        
        {/* Left text area */}
        <div className="hero-content">
          <div className="hero-badge">
            <Sparkles size={16} /> AI-Powered Placement Platform
          </div>
          
          <h1 className="hero-title">
            Transform Campus Placements with <span style={{ color: 'var(--primary-color)' }}>AI</span>
          </h1>
          
          <p className="hero-subtitle">
            Our intelligent platform streamlines the placement process with AI-driven ATS scoring, 
            resume ranking, and smart candidate matching for better recruitment outcomes.
          </p>
          
          <div className="hero-buttons">
            <button className="hero-btn-primary">
              Get Started <ArrowRight size={18} />
            </button>
            <button className="hero-btn-secondary">
              <Sparkles size={18} /> Explore Features
            </button>
          </div>

          <div className="hero-trust-badges">
            <div className="trust-badge">
              <div className="trust-badge-icon"><Bot size={20} /></div>
              <div className="trust-badge-text">
                <h4>AI ATS Scoring</h4>
                <p>Smart resume analysis</p>
              </div>
            </div>
            <div className="trust-badge">
              <div className="trust-badge-icon"><Award size={20} /></div>
              <div className="trust-badge-text">
                <h4>Resume Ranking</h4>
                <p>Top candidates first</p>
              </div>
            </div>
            <div className="trust-badge">
              <div className="trust-badge-icon"><ShieldCheck size={20} /></div>
              <div className="trust-badge-text">
                <h4>Secure & Reliable</h4>
                <p>Your data is protected</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Features Section (The row of boxes below the hero) */}
      <section className="features-section" id="features">
        <div className="feature-card">
          <div className="feature-icon" style={{ backgroundColor: '#e0e7ff', color: '#4f46e5' }}>
            <Upload size={24} />
          </div>
          <div className="feature-text">
            <h3>Resume Upload</h3>
            <p>Upload your resume in PDF format and let AI analyze it.</p>
          </div>
        </div>

        <div className="feature-card">
          <div className="feature-icon" style={{ backgroundColor: '#dbeafe', color: '#2563eb' }}>
            <Bot size={24} />
          </div>
          <div className="feature-text">
            <h3>AI ATS Score</h3>
            <p>Get an AI-powered ATS score with detailed feedback.</p>
          </div>
        </div>

        <div className="feature-card">
          <div className="feature-icon" style={{ backgroundColor: '#fef3c7', color: '#d97706' }}>
            <Award size={24} />
          </div>
          <div className="feature-text">
            <h3>Resume Ranking</h3>
            <p>Recruiters get AI-ranked candidates for faster hiring.</p>
          </div>
        </div>
      </section>

      {/* 4. How It Works (The timeline) */}
      <section className="how-it-works-section" id="how-it-works">
        <h2 className="how-it-works-title">How It Works</h2>
        
        <div className="timeline">
          <div className="timeline-step">
            <div className="timeline-icon"><Upload size={24} /></div>
            <h4>1. Upload Resume</h4>
            <p>Upload your resume in PDF format</p>
          </div>
          
          <ArrowRight className="timeline-arrow" size={32} />

          <div className="timeline-step">
            <div className="timeline-icon"><Bot size={24} /></div>
            <h4>2. AI Analysis</h4>
            <p>AI analyzes your resume and calculates ATS score</p>
          </div>

          <ArrowRight className="timeline-arrow" size={32} />

          <div className="timeline-step">
            <div className="timeline-icon"><LineChart size={24} /></div>
            <h4>3. Get Matched</h4>
            <p>Get matched with relevant jobs and opportunities</p>
          </div>

          <ArrowRight className="timeline-arrow" size={32} />

          <div className="timeline-step">
            <div className="timeline-icon"><Target size={24} /></div>
            <h4>4. Shortlisting</h4>
            <p>Top candidates are shortlisted for interviews</p>
          </div>
          
          <ArrowRight className="timeline-arrow" size={32} />

          <div className="timeline-step">
            <div className="timeline-icon"><Award size={24} /></div>
            <h4>5. Get Hired</h4>
            <p>Crack interviews and achieve your dream job</p>
          </div>
        </div>
      </section>

      {/* 5. Stats Banner */}
      <section className="stats-section">
        <div className="stat-item">
          <Users className="stat-icon" size={32} />
          <div className="stat-number">5000+</div>
          <div className="stat-label">Students Registered</div>
        </div>
        <div className="stat-item">
          <Building className="stat-icon" size={32} />
          <div className="stat-number">200+</div>
          <div className="stat-label">Recruiters Onboarded</div>
        </div>
        <div className="stat-item">
          <Briefcase className="stat-icon" size={32} />
          <div className="stat-number">1000+</div>
          <div className="stat-label">Jobs Posted</div>
        </div>
        <div className="stat-item">
          <LineChart className="stat-icon" size={32} />
          <div className="stat-number">95%</div>
          <div className="stat-label">Success Rate</div>
        </div>
      </section>


      {/* 7. The Footer at the very bottom */}
      <Footer />

    </div>
  );
};

export default LandingPage;
