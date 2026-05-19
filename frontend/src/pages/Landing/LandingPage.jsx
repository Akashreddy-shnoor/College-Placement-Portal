import React from 'react';
import { Link } from 'react-router-dom';
import PublicHeader from '../../components/layout/PublicHeader';
import Footer from '../../components/layout/Footer';
import { 
  Sparkles, 
  ArrowRight, 
  Upload, 
  Bot, 
  Award, 
  BarChart3, 
  UserCheck, 
  ShieldAlert,
  Users, 
  Building, 
  Briefcase, 
  LineChart, 
  Target,
  GraduationCap,
  Database,
  Cpu,
  FileSpreadsheet
} from 'lucide-react';
import './LandingPage.css';

const LandingPage = () => {
  return (
    <div className="landing-page">
      <PublicHeader />

      {/* Decorative Glow Elements */}
      <div className="blur-glow" style={{ width: '400px', height: '400px', top: '10%', left: '5%', background: 'rgba(59, 130, 246, 0.15)' }}></div>
      <div className="blur-glow" style={{ width: '500px', height: '500px', top: '40%', right: '5%', background: 'rgba(139, 92, 246, 0.15)' }}></div>

      {/* 1. Hero Section */}
      <section className="hero-section" id="home">
        <div className="container hero-container-grid">
          
          {/* Left Text Content */}
          <div className="hero-content">
            <div className="hero-badge">
              <Sparkles className="sparkle-icon" size={14} />
              <span>AI-Powered Recruitment Suite</span>
            </div>
            
            <h1 className="hero-title">
              AI-Powered College <br />
              <span className="gradient-text">Placement Portal</span>
            </h1>
            
            <p className="hero-subtitle">
              Smart ATS scoring, resume ranking, and placement management system. 
              Accelerating campus recruitment using natural language processing and advanced candidate matchmaking.
            </p>
            
            <div className="hero-buttons">
              <Link to="/login">
                <button className="btn-primary">
                  Get Started <ArrowRight size={18} />
                </button>
              </Link>
              <a href="#features">
                <button className="btn-secondary">
                  Explore Features
                </button>
              </a>
            </div>

            {/* Quick Micro trust metrics */}
            <div className="hero-metrics">
              <div className="metric-tag">
                <span className="dot blue"></span> 95% Matching Accuracy
              </div>
              <div className="metric-tag">
                <span className="dot purple"></span> Real-time Admin Control
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Features Section */}
      <section className="features-section" id="features">
        <div className="container">
          <div className="section-header text-center">
            <h2 className="section-title">Core AI-Powered <span className="gradient-text">Features</span></h2>
            <p className="section-subtitle">A comprehensive suite engineered to streamline the end-to-end recruitment lifecycle.</p>
          </div>

          <div className="grid grid-cols-3 gap-lg">
            
            {/* Card 1: Resume Upload */}
            <div className="feature-card glass-card">
              <div className="feature-icon-box bg-blue">
                <Upload size={24} />
              </div>
              <h3>Interactive Resume Upload</h3>
              <p>Support PDF formats. Simulate parsing with visual drag-and-drop actions for students.</p>
            </div>

            {/* Card 2: AI ATS Score */}
            <div className="feature-card glass-card">
              <div className="feature-icon-box bg-purple">
                <Bot size={24} />
              </div>
              <h3>Instant AI ATS Score</h3>
              <p>Assess candidate profile strength against active job postings with comprehensive metrics.</p>
            </div>

            {/* Card 3: Resume Ranking */}
            <div className="feature-card glass-card">
              <div className="feature-icon-box bg-teal">
                <Award size={24} />
              </div>
              <h3>Automated Resume Ranking</h3>
              <p>Sort massive candidate listings intelligently. Recruiter dashboards view ranked applicants instantly.</p>
            </div>

            {/* Card 4: Placement Analytics */}
            <div className="feature-card glass-card">
              <div className="feature-icon-box bg-pink">
                <BarChart3 size={24} />
              </div>
              <h3>Interactive Placement Analytics</h3>
              <p>Real-time visual stats, charts, and metrics covering interview pipelines and recruitment rates.</p>
            </div>

            {/* Card 5: Student Dashboard */}
            <div className="feature-card glass-card">
              <div className="feature-icon-box bg-orange">
                <Users size={24} />
              </div>
              <h3>Personalized Student Dashboard</h3>
              <p>Manage submissions, analyze feedback recommendations, and view active applications timelines.</p>
            </div>

            {/* Card 6: Admin Dashboard */}
            <div className="feature-card glass-card">
              <div className="feature-icon-box bg-red">
                <UserCheck size={24} />
              </div>
              <h3>Central Admin Control Panel</h3>
              <p>Broadcast job postings, evaluate overall university metrics, and shortlist students in one click.</p>
            </div>

          </div>
        </div>
      </section>

      {/* 3. Workflow Section */}
      <section className="workflow-section" id="workflow">
        <div className="container">
          <div className="section-header text-center">
            <h2 className="section-title">The Recruitment <span className="gradient-text">Workflow</span></h2>
            <p className="section-subtitle">How our smart portal connects candidates and recruiters in a frictionless loop.</p>
          </div>

          <div className="workflow-steps">
            
            {/* Step 1 */}
            <div className="workflow-step-card glass-card">
              <div className="step-num">01</div>
              <div className="step-icon-wrapper">
                <Upload size={20} />
              </div>
              <h4>Student Uploads Resume</h4>
              <p>Candidates upload PDF resumes. The backend extracts structural fields.</p>
            </div>

            <div className="workflow-line"></div>

            {/* Step 2 */}
            <div className="workflow-step-card glass-card">
              <div className="step-num">02</div>
              <div className="step-icon-wrapper">
                <Cpu size={20} />
              </div>
              <h4>AI Analysis</h4>
              <p>NLP evaluates technical skills, projects, certifications, and formatting.</p>
            </div>

            <div className="workflow-line"></div>

            {/* Step 3 */}
            <div className="workflow-step-card glass-card">
              <div className="step-num">03</div>
              <div className="step-icon-wrapper">
                <Bot size={20} />
              </div>
              <h4>ATS Score Generation</h4>
              <p>Calculates exact benchmark scores and critical suggestions.</p>
            </div>

            <div className="workflow-line"></div>

            {/* Step 4 */}
            <div className="workflow-step-card glass-card">
              <div className="step-num">04</div>
              <div className="step-icon-wrapper">
                <Award size={20} />
              </div>
              <h4>Resume Ranking</h4>
              <p>Aggregates applicants and sorts them by compatibility with job listings.</p>
            </div>

            <div className="workflow-line"></div>

            {/* Step 5 */}
            <div className="workflow-step-card glass-card">
              <div className="step-num">05</div>
              <div className="step-icon-wrapper">
                <Target size={20} />
              </div>
              <h4>Admin Shortlisting</h4>
              <p>Recruiters invite top candidates for immediate interviews.</p>
            </div>

          </div>
        </div>
      </section>

      {/* 4. Statistics Section */}
      <section className="stats-section" id="stats">
        <div className="container">
          <div className="stats-grid">
            
            <div className="stat-card glass-card">
              <Users size={32} className="stat-card-icon" />
              <h3>5000+</h3>
              <p>Students Empowered</p>
            </div>

            <div className="stat-card glass-card">
              <Building size={32} className="stat-card-icon" />
              <h3>100+</h3>
              <p>Corporate Partners</p>
            </div>

            <div className="stat-card glass-card">
              <Award size={32} className="stat-card-icon" />
              <h3>95%</h3>
              <p>ATS Rating Accuracy</p>
            </div>

            <div className="stat-card glass-card">
              <Briefcase size={32} className="stat-card-icon" />
              <h3>1000+</h3>
              <p>Applications Placed</p>
            </div>

          </div>
        </div>
      </section>

      {/* 5. Technology Stack Grid */}
      <section className="tech-section" id="about">
        <div className="container">
          <div className="section-header text-center">
            <h2 className="section-title">Robust Enterprise <span className="gradient-text">Tech Stack</span></h2>
            <p className="section-subtitle">Leveraging state-of-the-art architectures for reliability, speed, and parsing excellence.</p>
          </div>

          <div className="tech-grid">
            <div className="tech-item glass-card">
              <div className="tech-icon-circle">⚛️</div>
              <h5>React JS</h5>
              <span className="tech-badge">Frontend</span>
            </div>
            <div className="tech-item glass-card">
              <div className="tech-icon-circle">⚡</div>
              <h5>FastAPI</h5>
              <span className="tech-badge font-fastapi">Backend</span>
            </div>
            <div className="tech-item glass-card">
              <Database size={24} className="tech-icon-svg" />
              <h5>PostgreSQL</h5>
              <span className="tech-badge">Database</span>
            </div>
            <div className="tech-item glass-card">
              <Cpu size={24} className="tech-icon-svg" />
              <h5>OpenAI API</h5>
              <span className="tech-badge font-ai">AI Models</span>
            </div>
            <div className="tech-item glass-card">
              <div className="tech-icon-circle">🪐</div>
              <h5>spaCy</h5>
              <span className="tech-badge">NLP Library</span>
            </div>
            <div className="tech-item glass-card">
              <FileSpreadsheet size={24} className="tech-icon-svg" />
              <h5>pdfplumber</h5>
              <span className="tech-badge">PDF Extraction</span>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default LandingPage;
