import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, User, Upload, BarChart2, Briefcase, ClipboardList,
  Star, FileText, MessageSquare, Settings, LogOut, Bell, ChevronDown,
  ArrowRight, CheckCircle, TrendingUp, Users, GraduationCap, Sparkles, Menu, X
} from 'lucide-react';
import { API_BASE_URL } from '../../config';
import './StudentDashboard.css';

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: 'Dashboard', key: 'dashboard' },
  { icon: User, label: 'Profile', key: 'profile' },
  { icon: Upload, label: 'Upload Resume', key: 'upload' },
  { icon: BarChart2, label: 'ATS Score', key: 'ats' },
  { icon: Briefcase, label: 'Job Openings', key: 'jobs' },
  { icon: ClipboardList, label: 'Applied Jobs', key: 'applied' },
  { icon: Star, label: 'Shortlisted', key: 'shortlisted' },
  { icon: FileText, label: 'Resume Tips', key: 'tips' },
  { icon: MessageSquare, label: 'Messages', key: 'messages' },
  { icon: Settings, label: 'Settings', key: 'settings' },
];

const CircularProgress = ({ value, size = 80, color = '#3b82f6' }) => {
  const radius = (size - 10) / 2;
  const circ = 2 * Math.PI * radius;
  const offset = circ - (value / 100) * circ;
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#e2e8f0" strokeWidth={8} />
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color}
        strokeWidth={8} strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1s ease' }} />
    </svg>
  );
};

const StatusBadge = ({ status }) => {
  const map = {
    'Shortlisted': { cls: 'badge-shortlisted', label: 'Shortlisted' },
    'Under Review': { cls: 'badge-review', label: 'Under Review' },
    'Applied': { cls: 'badge-applied', label: 'Applied' },
    'None': { cls: 'badge-none', label: 'Not Applied' },
  };
  const { cls, label } = map[status] || map['None'];
  return <span className={`status-badge ${cls}`}>{label}</span>;
};

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [allStudents, setAllStudents] = useState([]);
  const [activeNav, setActiveNav] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState('');
  const [profileForm, setProfileForm] = useState({ name: '', email: '', skills: '' });
  const [profileMsg, setProfileMsg] = useState('');

  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem('cpp_current_user'));
    if (!currentUser || currentUser.role !== 'student') { navigate('/login'); return; }
    setStudent(currentUser);
    setProfileForm({ name: currentUser.name || '', email: currentUser.email || '', skills: currentUser.skills || '' });
    fetchData(currentUser.id);
  }, [navigate]);

  const fetchData = async (studentId) => {
    try {
      const [jobsRes, studentsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/jobs`),
        fetch(`${API_BASE_URL}/api/students`)
      ]);
      if (jobsRes.ok) setJobs(await jobsRes.json());
      if (studentsRes.ok) {
        const studs = await studentsRes.json();
        setAllStudents(studs);
        const me = studs.find(s => s.id === studentId);
        if (me) {
          const updated = { ...JSON.parse(localStorage.getItem('cpp_current_user')), ...me };
          localStorage.setItem('cpp_current_user', JSON.stringify(updated));
          setStudent(updated);
          setProfileForm({ name: updated.name || '', email: updated.email || '', skills: updated.skills || '' });
        }
      }
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('cpp_current_user');
    navigate('/');
  };

  const handleApplyJob = async (jobId) => {
    if (!student?.id) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/applications/apply?student_id=${student.id}&job_id=${jobId}`, { method: 'POST' });
      if (res.ok) {
        const updated = await res.json();
        const newUser = { ...student, ...updated };
        localStorage.setItem('cpp_current_user', JSON.stringify(newUser));
        setStudent(newUser);
      }
    } catch (e) { console.error(e); }
  };

  const handleResumeUpload = async (e) => {
    e.preventDefault();
    if (!uploadFile || !student?.id) return;
    setUploading(true); setUploadMsg('');
    const formData = new FormData();
    formData.append('file', uploadFile);
    try {
      const res = await fetch(`${API_BASE_URL}/api/students/${student.id}/resume`, { method: 'POST', body: formData });
      if (res.ok) {
        const updated = await res.json();
        const newUser = { ...student, ...updated };
        localStorage.setItem('cpp_current_user', JSON.stringify(newUser));
        setStudent(newUser);
        setUploadMsg('✅ Resume uploaded and analyzed successfully!');
        setUploadFile(null);
      } else { setUploadMsg('❌ Upload failed. Please try again.'); }
    } catch (e) { setUploadMsg('❌ Server error. Please check your connection.'); }
    setUploading(false);
  };

  const displayName = student?.name || student?.username || 'Student';
  const atsScore = student?.atsScore ?? student?.ats_score ?? 0;
  const appliedJobs = student?.appliedJobs ?? student?.applied_jobs ?? [];
  const appStatus = student?.applicationStatus ?? student?.application_status ?? 'None';
  const suggestions = student?.suggestions ?? [];
  const resumeName = student?.resumeName ?? student?.resume_name ?? '';
  const profileCompletion = Math.min(100, [student?.name, student?.email, student?.skills, resumeName].filter(Boolean).length * 25);

  if (loading) {
    return (
      <div className="sd-loading-wrapper">
        <div className="sd-spinner"></div>
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  const recentApps = jobs.filter(j => appliedJobs.includes(j.id)).slice(0, 3);
  const recommendedJobs = jobs.filter(j => !appliedJobs.includes(j.id)).slice(0, 3);
  const shortlistedCount = appStatus === 'Shortlisted' ? 1 : 0;

  const renderContent = () => {
    switch (activeNav) {
      case 'dashboard':
        return (
          <div className="sd-content-area">
            <div className="sd-welcome-bar">
              <div>
                <h2 className="sd-welcome-title">Welcome back, {displayName}! 👋</h2>
                <p className="sd-welcome-sub">Here's your placement overview</p>
              </div>
            </div>

            {/* Stat Cards */}
            <div className="sd-stats-grid">
              <div className="sd-stat-card">
                <div className="sd-stat-top">
                  <div>
                    <p className="sd-stat-label">ATS Score</p>
                    <h3 className="sd-stat-value">{atsScore}%</h3>
                    <span className={`sd-stat-tag ${atsScore >= 80 ? 'tag-excellent' : atsScore >= 60 ? 'tag-good' : 'tag-poor'}`}>
                      {atsScore >= 80 ? 'Excellent' : atsScore >= 60 ? 'Good' : 'Needs Work'}
                    </span>
                  </div>
                  <div className="sd-stat-circle-wrap">
                    <CircularProgress value={atsScore} color="#3b82f6" />
                    <span className="sd-circle-label">{atsScore}%</span>
                  </div>
                </div>
              </div>

              <div className="sd-stat-card">
                <div className="sd-stat-top">
                  <div>
                    <p className="sd-stat-label">Applied Jobs</p>
                    <h3 className="sd-stat-value">{appliedJobs.length}</h3>
                    <button className="sd-view-link" onClick={() => setActiveNav('applied')}>View all</button>
                  </div>
                  <div className="sd-stat-icon-box blue"><Briefcase size={28} /></div>
                </div>
              </div>

              <div className="sd-stat-card">
                <div className="sd-stat-top">
                  <div>
                    <p className="sd-stat-label">Shortlisted</p>
                    <h3 className="sd-stat-value">{shortlistedCount}</h3>
                    <button className="sd-view-link" onClick={() => setActiveNav('shortlisted')}>View all</button>
                  </div>
                  <div className="sd-stat-icon-box green"><Star size={28} /></div>
                </div>
              </div>

              <div className="sd-stat-card">
                <div className="sd-stat-top">
                  <div>
                    <p className="sd-stat-label">Profile Completeness</p>
                    <h3 className="sd-stat-value">{profileCompletion}%</h3>
                    <span className={`sd-stat-tag ${profileCompletion >= 100 ? 'tag-excellent' : 'tag-good'}`}>
                      {profileCompletion >= 100 ? 'Complete' : 'Incomplete'}
                    </span>
                  </div>
                  <div className="sd-stat-circle-wrap">
                    <CircularProgress value={profileCompletion} color="#10b981" />
                    <span className="sd-circle-label">{profileCompletion}%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom 3-col grid */}
            <div className="sd-bottom-grid">
              {/* Recent Applications */}
              <div className="sd-panel">
                <div className="sd-panel-header">
                  <h3>Recent Applications</h3>
                  <button className="sd-view-link" onClick={() => setActiveNav('applied')}>View all applications →</button>
                </div>
                {recentApps.length === 0 ? (
                  <div className="sd-empty-state">
                    <Briefcase size={32} />
                    <p>No applications yet. Browse job openings!</p>
                    <button className="sd-btn-primary" onClick={() => setActiveNav('jobs')}>Browse Jobs</button>
                  </div>
                ) : (
                  <div className="sd-app-list">
                    {recentApps.map(job => (
                      <div className="sd-app-item" key={job.id}>
                        <div className="sd-app-icon">
                          <Briefcase size={18} />
                        </div>
                        <div className="sd-app-info">
                          <p className="sd-app-title">{job.title}</p>
                          <p className="sd-app-company">{job.company}</p>
                        </div>
                        <StatusBadge status={appStatus} />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Recommended Jobs */}
              <div className="sd-panel">
                <div className="sd-panel-header">
                  <h3>Recommended Jobs</h3>
                  <button className="sd-view-link" onClick={() => setActiveNav('jobs')}>View all jobs →</button>
                </div>
                {recommendedJobs.length === 0 ? (
                  <div className="sd-empty-state"><p>All jobs applied! Check back later.</p></div>
                ) : (
                  <div className="sd-app-list">
                    {recommendedJobs.map(job => (
                      <div className="sd-app-item" key={job.id}>
                        <div className="sd-app-icon purple"><TrendingUp size={18} /></div>
                        <div className="sd-app-info">
                          <p className="sd-app-title">{job.title}</p>
                          <p className="sd-app-company">{job.company} · {job.salary}</p>
                        </div>
                        <button className="sd-apply-btn" onClick={() => handleApplyJob(job.id)}>Apply Now</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* AI Suggestions */}
              <div className="sd-panel sd-ai-panel">
                <div className="sd-panel-header">
                  <h3><Sparkles size={16} style={{ color: '#f59e0b' }} /> AI Suggestions</h3>
                </div>
                {suggestions.length === 0 ? (
                  <div className="sd-empty-state"><p>Upload your resume to get AI-powered suggestions.</p></div>
                ) : (
                  <ul className="sd-suggestions-list">
                    {suggestions.slice(0, 4).map((s, i) => (
                      <li key={i} className="sd-suggestion-item">
                        <CheckCircle size={15} className="sd-check-icon" />
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                )}
                <button className="sd-btn-primary sd-improve-btn" onClick={() => setActiveNav('upload')}>
                  <Upload size={15} /> Improve Resume
                </button>
              </div>
            </div>
          </div>
        );

      case 'profile':
        return (
          <div className="sd-content-area">
            <h2 className="sd-page-title">My Profile</h2>
            <div className="sd-profile-card">
              <div className="sd-profile-avatar">{displayName.charAt(0).toUpperCase()}</div>
              <div className="sd-profile-fields">
                <div className="sd-field-group">
                  <label>Full Name</label>
                  <input type="text" value={profileForm.name} onChange={e => setProfileForm({ ...profileForm, name: e.target.value })} placeholder="Your full name" />
                </div>
                <div className="sd-field-group">
                  <label>Email Address</label>
                  <input type="email" value={profileForm.email} onChange={e => setProfileForm({ ...profileForm, email: e.target.value })} placeholder="your@email.com" />
                </div>
                <div className="sd-field-group">
                  <label>Skills (comma separated)</label>
                  <input type="text" value={profileForm.skills} onChange={e => setProfileForm({ ...profileForm, skills: e.target.value })} placeholder="React, Python, SQL..." />
                </div>
                <div className="sd-field-group">
                  <label>Username</label>
                  <input type="text" value={student?.username || ''} readOnly className="sd-input-readonly" />
                </div>
                {profileMsg && <p className="sd-profile-msg">{profileMsg}</p>}
                <button className="sd-btn-primary" onClick={() => {
                  const updated = { ...student, name: profileForm.name, email: profileForm.email, skills: profileForm.skills };
                  localStorage.setItem('cpp_current_user', JSON.stringify(updated));
                  setStudent(updated);
                  setProfileMsg('✅ Profile updated locally!');
                  setTimeout(() => setProfileMsg(''), 3000);
                }}>Save Changes</button>
              </div>
              <div className="sd-profile-info-cards">
                <div className="sd-info-card blue"><p className="sd-info-label">ATS Score</p><h3>{atsScore}%</h3></div>
                <div className="sd-info-card green"><p className="sd-info-label">Applied</p><h3>{appliedJobs.length}</h3></div>
                <div className="sd-info-card purple"><p className="sd-info-label">Status</p><h3 style={{ fontSize: '1rem' }}>{appStatus}</h3></div>
                <div className="sd-info-card orange"><p className="sd-info-label">Resume</p><h3 style={{ fontSize: '0.85rem' }}>{resumeName || 'Not uploaded'}</h3></div>
              </div>
            </div>
          </div>
        );

      case 'upload':
        return (
          <div className="sd-content-area">
            <h2 className="sd-page-title">Upload Resume</h2>
            <div className="sd-upload-card">
              <div className="sd-upload-icon-area">
                <Upload size={48} className="sd-upload-big-icon" />
                <h3>Upload Your Resume</h3>
                <p>PDF format only. Our AI will parse and score your resume against active job listings.</p>
              </div>
              <form className="sd-upload-form" onSubmit={handleResumeUpload}>
                <label className="sd-file-drop" htmlFor="resume-file">
                  {uploadFile ? (
                    <span className="sd-file-name">📄 {uploadFile.name}</span>
                  ) : (
                    <span>Click to select PDF resume or drag & drop</span>
                  )}
                  <input
                    id="resume-file"
                    type="file"
                    accept=".pdf"
                    style={{ display: 'none' }}
                    onChange={e => { setUploadFile(e.target.files[0]); setUploadMsg(''); }}
                  />
                </label>
                {uploadMsg && <p className={`sd-upload-msg ${uploadMsg.includes('✅') ? 'success' : 'error'}`}>{uploadMsg}</p>}
                <button type="submit" className="sd-btn-primary" disabled={!uploadFile || uploading}>
                  {uploading ? <><div className="sd-btn-spinner"></div> Analyzing...</> : <><Upload size={16} /> Upload & Analyze</>}
                </button>
              </form>
              {resumeName && (
                <div className="sd-current-resume">
                  <FileText size={18} />
                  <span>Current resume: <strong>{resumeName}</strong></span>
                </div>
              )}
            </div>
          </div>
        );

      case 'ats':
        return (
          <div className="sd-content-area">
            <h2 className="sd-page-title">ATS Score</h2>
            <div className="sd-ats-card">
              <div className="sd-ats-score-display">
                <div className="sd-ats-circle-big">
                  <CircularProgress value={atsScore} size={160} color={atsScore >= 80 ? '#10b981' : atsScore >= 60 ? '#f59e0b' : '#ef4444'} />
                  <div className="sd-ats-circle-inner">
                    <span className="sd-ats-number">{atsScore}</span>
                    <span className="sd-ats-pct">%</span>
                  </div>
                </div>
                <div className="sd-ats-rating">
                  <h3>{atsScore >= 80 ? '🌟 Excellent Profile' : atsScore >= 60 ? '👍 Good Profile' : '⚠️ Needs Improvement'}</h3>
                  <p>Your resume score against current job requirements</p>
                </div>
              </div>
              <div className="sd-ats-suggestions">
                <h3><Sparkles size={18} /> AI Improvement Suggestions</h3>
                {suggestions.length === 0 ? (
                  <p>Upload your resume to get AI-powered feedback.</p>
                ) : (
                  <ul className="sd-suggestions-list">
                    {suggestions.map((s, i) => (
                      <li key={i} className="sd-suggestion-item">
                        <CheckCircle size={15} className="sd-check-icon" />
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        );

      case 'jobs':
        return (
          <div className="sd-content-area">
            <h2 className="sd-page-title">Job Openings</h2>
            {jobs.length === 0 ? (
              <div className="sd-empty-state"><Briefcase size={48} /><p>No job openings at the moment.</p></div>
            ) : (
              <div className="sd-jobs-grid">
                {jobs.map(job => (
                  <div className="sd-job-card" key={job.id}>
                    <div className="sd-job-card-top">
                      <div className="sd-job-icon"><Briefcase size={22} /></div>
                      <div>
                        <h4 className="sd-job-title">{job.title}</h4>
                        <p className="sd-job-company">{job.company}</p>
                      </div>
                    </div>
                    <div className="sd-job-details">
                      <span>📍 {job.location}</span>
                      <span>💰 {job.salary}</span>
                    </div>
                    <p className="sd-job-desc">{job.description}</p>
                    <div className="sd-job-tags">
                      {job.requirements?.split(',').slice(0, 3).map((r, i) => (
                        <span key={i} className="sd-job-tag">{r.trim()}</span>
                      ))}
                    </div>
                    {appliedJobs.includes(job.id) ? (
                      <button className="sd-applied-btn" disabled>✓ Applied</button>
                    ) : (
                      <button className="sd-btn-primary" onClick={() => handleApplyJob(job.id)}>Apply Now →</button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 'applied':
        return (
          <div className="sd-content-area">
            <h2 className="sd-page-title">Applied Jobs</h2>
            {recentApps.length === 0 ? (
              <div className="sd-empty-state"><ClipboardList size={48} /><p>You haven't applied to any jobs yet.</p>
                <button className="sd-btn-primary" onClick={() => setActiveNav('jobs')}>Browse Jobs</button></div>
            ) : (
              <div className="sd-applied-list">
                {jobs.filter(j => appliedJobs.includes(j.id)).map(job => (
                  <div className="sd-applied-card" key={job.id}>
                    <div className="sd-applied-icon"><Briefcase size={20} /></div>
                    <div className="sd-applied-info">
                      <h4>{job.title}</h4>
                      <p>{job.company} · {job.location}</p>
                      <p className="sd-applied-req">{job.requirements}</p>
                    </div>
                    <StatusBadge status={appStatus} />
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 'shortlisted':
        return (
          <div className="sd-content-area">
            <h2 className="sd-page-title">Shortlisted</h2>
            {appStatus !== 'Shortlisted' ? (
              <div className="sd-empty-state"><Star size={48} /><p>You haven't been shortlisted yet. Keep applying!</p></div>
            ) : (
              <div className="sd-shortlist-card">
                <Star size={32} className="sd-shortlist-star" />
                <h3>Congratulations! 🎉</h3>
                <p>You have been shortlisted. The recruiter will contact you soon.</p>
              </div>
            )}
          </div>
        );

      case 'tips':
        const tips = [
          { title: 'Use Action Verbs', desc: 'Start bullet points with strong verbs like "developed", "led", "improved".' },
          { title: 'Quantify Achievements', desc: 'Add numbers: "Improved app performance by 40%" instead of "improved performance".' },
          { title: 'Match Keywords', desc: 'Use keywords from job descriptions to improve ATS score.' },
          { title: 'Keep It Concise', desc: 'One page for fresh graduates. Two pages max for 5+ years of experience.' },
          { title: 'Add a Summary', desc: 'A 2-3 line professional summary at the top boosts readability.' },
          { title: 'Proofread Carefully', desc: 'Typos and grammatical errors can immediately disqualify your resume.' },
        ];
        return (
          <div className="sd-content-area">
            <h2 className="sd-page-title">Resume Tips</h2>
            <div className="sd-tips-grid">
              {tips.map((tip, i) => (
                <div className="sd-tip-card" key={i}>
                  <div className="sd-tip-num">{String(i + 1).padStart(2, '0')}</div>
                  <h4>{tip.title}</h4>
                  <p>{tip.desc}</p>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return (
          <div className="sd-content-area">
            <div className="sd-coming-soon">
              <Sparkles size={48} />
              <h3>Coming Soon</h3>
              <p>This feature is under development.</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="sd-layout">
      {/* Sidebar */}
      <aside className={`sd-sidebar ${sidebarOpen ? 'sd-sidebar-open' : ''}`}>
        <div className="sd-sidebar-logo">
          <GraduationCap size={28} className="sd-logo-icon" />
          <div>
            <h2>Placement Portal</h2>
            <p>Smart Placements, Bright Futures</p>
          </div>
        </div>

        <nav className="sd-sidebar-nav">
          {NAV_ITEMS.map(({ icon: Icon, label, key }) => (
            <button
              key={key}
              className={`sd-nav-item ${activeNav === key ? 'sd-nav-active' : ''}`}
              onClick={() => { setActiveNav(key); setSidebarOpen(false); }}
            >
              <Icon size={19} />
              <span>{label}</span>
            </button>
          ))}
        </nav>

        <div className="sd-sidebar-footer">
          <button className="sd-nav-item sd-logout-btn" onClick={handleLogout}>
            <LogOut size={19} />
            <span>Logout</span>
          </button>
          <div className="sd-help-box">
            <p className="sd-help-title">Need Help?</p>
            <p className="sd-help-sub">Contact placement cell</p>
            <button className="sd-contact-btn">Contact Us</button>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && <div className="sd-overlay" onClick={() => setSidebarOpen(false)} />}

      {/* Main */}
      <div className="sd-main">
        {/* Top Header */}
        <header className="sd-header">
          <div className="sd-header-left">
            <button className="sd-hamburger" onClick={() => setSidebarOpen(!sidebarOpen)}>
              {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
            <h1 className="sd-header-title">Student Dashboard</h1>
          </div>
          <div className="sd-header-right">
            <button className="sd-icon-btn"><Bell size={20} /></button>
            <div className="sd-user-chip">
              <div className="sd-user-avatar">{displayName.charAt(0).toUpperCase()}</div>
              <div className="sd-user-info">
                <span className="sd-user-name">{displayName}</span>
                <span className="sd-user-role">B.Tech Student</span>
              </div>
              <ChevronDown size={16} />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="sd-page-body">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default StudentDashboard;
