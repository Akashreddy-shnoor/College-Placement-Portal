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
  
  const initProfile = (u) => ({
    username: u?.username || '',
    name: u?.name || '', email: u?.email || '', skills: u?.skills || '',
    rollNumber: u?.rollNumber || u?.roll_number || '',
    phoneNumber: u?.phoneNumber || u?.phone_number || '',
    department: u?.department || '', passoutYear: u?.passoutYear || u?.passout_year || '',
    dob: u?.dob || '', cgpa: u?.cgpa || '',
    academic10th: u?.academic10th || u?.academic_10th || '',
    academicInter: u?.academicInter || u?.academic_inter || '',
    currentCgpa: u?.currentCgpa || u?.current_cgpa || '',
    backlogs: u?.backlogs || 0,
    projects: u?.projects || [], certifications: u?.certifications || [], internships: u?.internships || []
  });
  
  const [profileForm, setProfileForm] = useState(initProfile(null));
  const [profileMsg, setProfileMsg] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem('cpp_current_user'));
    if (!currentUser || currentUser.role !== 'student') { navigate('/login'); return; }
    setStudent(currentUser);
    setProfileForm(initProfile(currentUser));
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
          setProfileForm(initProfile(updated));
        }
      }
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('cpp_current_user');
    navigate('/');
  };

  const handleSaveProfile = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/students/${student.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileForm)
      });
      if (res.ok) {
        const updated = await res.json();
        const newUser = { ...student, ...updated };
        localStorage.setItem('cpp_current_user', JSON.stringify(newUser));
        setStudent(newUser);
        setProfileMsg('✅ Profile saved successfully!');
        setIsEditing(false);
      } else {
        setProfileMsg('❌ Failed to save profile.');
      }
    } catch (e) {
      setProfileMsg('❌ Server error.');
    }
    setTimeout(() => setProfileMsg(''), 3000);
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

            <div className="sd-bottom-grid">

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
          <div className="sd-content-area sd-profile-container">
            <div className="sd-profile-header-wrap">
              <h2 className="sd-page-title">My Profile</h2>
              {!isEditing ? (
                <button className="sd-btn-primary" onClick={() => setIsEditing(true)}>Edit Profile</button>
              ) : (
                <span className="sd-editing-indicator" style={{ fontSize: '0.85rem', color: '#3b82f6', fontWeight: 700, background: 'rgba(59,130,246,0.1)', padding: '6px 12px', borderRadius: '20px' }}>Editing Mode</span>
              )}
            </div>
            {profileMsg && <p className={`sd-profile-msg ${profileMsg.includes('✅') ? 'success' : 'error'}`}>{profileMsg}</p>}

            <div className="sd-profile-grid">

              <div className="sd-profile-section">
                <h3>1. Personal Information</h3>
                <div className="sd-profile-fields-grid">
                  <div className="sd-field-group">
                    <label>Full Name</label>
                    <input type="text" value={profileForm.name} onChange={e => setProfileForm({ ...profileForm, name: e.target.value })} disabled={!isEditing} />
                  </div>
                  <div className="sd-field-group">
                    <label>Email</label>
                    <input type="email" value={profileForm.email} onChange={e => setProfileForm({ ...profileForm, email: e.target.value })} disabled={!isEditing} />
                  </div>
                  <div className="sd-field-group">
                    <label>Roll Number</label>
                    <input type="text" value={profileForm.rollNumber} onChange={e => setProfileForm({ ...profileForm, rollNumber: e.target.value })} disabled={!isEditing} />
                  </div>
                  <div className="sd-field-group">
                    <label>Phone Number</label>
                    <input type="text" value={profileForm.phoneNumber} onChange={e => setProfileForm({ ...profileForm, phoneNumber: e.target.value })} disabled={!isEditing} />
                  </div>
                  <div className="sd-field-group">
                    <label>Department</label>
                    <input type="text" value={profileForm.department} onChange={e => setProfileForm({ ...profileForm, department: e.target.value })} disabled={!isEditing} />
                  </div>
                  <div className="sd-field-group">
                    <label>Passout Year</label>
                    <input type="text" value={profileForm.passoutYear} onChange={e => setProfileForm({ ...profileForm, passoutYear: e.target.value })} disabled={!isEditing} />
                  </div>
                  <div className="sd-field-group">
                    <label>Date of Birth</label>
                    <input type="date" value={profileForm.dob} onChange={e => setProfileForm({ ...profileForm, dob: e.target.value })} disabled={!isEditing} />
                  </div>
                  <div className="sd-field-group">
                    <label>CGPA</label>
                    <input type="text" value={profileForm.cgpa} onChange={e => setProfileForm({ ...profileForm, cgpa: e.target.value })} disabled={!isEditing} />
                  </div>
                </div>
              </div>

              <div className="sd-profile-section">
                <h3>2. Academic Details</h3>
                <div className="sd-profile-fields-grid">
                  <div className="sd-field-group">
                    <label>10th Percentage / CGPA</label>
                    <input type="text" value={profileForm.academic10th} onChange={e => setProfileForm({ ...profileForm, academic10th: e.target.value })} disabled={!isEditing} />
                  </div>
                  <div className="sd-field-group">
                    <label>Intermediate / Diploma</label>
                    <input type="text" value={profileForm.academicInter} onChange={e => setProfileForm({ ...profileForm, academicInter: e.target.value })} disabled={!isEditing} />
                  </div>
                  <div className="sd-field-group">
                    <label>Current B.Tech CGPA</label>
                    <input type="text" value={profileForm.currentCgpa} onChange={e => setProfileForm({ ...profileForm, currentCgpa: e.target.value })} disabled={!isEditing} />
                  </div>
                  <div className="sd-field-group">
                    <label>Active Backlogs</label>
                    <input type="number" min="0" value={profileForm.backlogs} onChange={e => setProfileForm({ ...profileForm, backlogs: parseInt(e.target.value) || 0 })} disabled={!isEditing} />
                  </div>
                </div>
              </div>

              <div className="sd-profile-section">
                <h3>3. Skills Section</h3>
                <div className="sd-field-group">
                  <label>Add your skills (comma separated)</label>
                  <input type="text" value={profileForm.skills} onChange={e => setProfileForm({ ...profileForm, skills: e.target.value })} placeholder="e.g. React, Python, SQL" disabled={!isEditing} />
                </div>
              </div>

              <div className="sd-profile-section">
                <div className="sd-section-header-flex">
                  <h3>4. Projects Section</h3>
                  {isEditing && (
                    <button className="sd-add-btn" onClick={() => setProfileForm({ ...profileForm, projects: [...profileForm.projects, { name: '', tech: '', desc: '', link: '' }] })}>+ Add Project</button>
                  )}
                </div>
                {profileForm.projects.length === 0 && <p style={{ fontSize: '0.85rem', color: '#94a3b8', fontStyle: 'italic' }}>No projects added yet.</p>}
                {profileForm.projects.map((proj, i) => (
                  <div className="sd-array-card" key={i}>
                    {isEditing && (
                      <button className="sd-remove-btn" onClick={() => setProfileForm({ ...profileForm, projects: profileForm.projects.filter((_, idx) => idx !== i) })}><X size={14} /></button>
                    )}
                    <div className="sd-field-group"><label>Project Name</label><input type="text" value={proj.name} onChange={e => { const p = [...profileForm.projects]; p[i].name = e.target.value; setProfileForm({ ...profileForm, projects: p }); }} disabled={!isEditing} /></div>
                    <div className="sd-field-group"><label>Technologies Used</label><input type="text" value={proj.tech} onChange={e => { const p = [...profileForm.projects]; p[i].tech = e.target.value; setProfileForm({ ...profileForm, projects: p }); }} disabled={!isEditing} /></div>
                    <div className="sd-field-group"><label>GitHub Link</label><input type="text" value={proj.link} onChange={e => { const p = [...profileForm.projects]; p[i].link = e.target.value; setProfileForm({ ...profileForm, projects: p }); }} disabled={!isEditing} /></div>
                    <div className="sd-field-group"><label>Description</label><textarea rows="2" value={proj.desc} onChange={e => { const p = [...profileForm.projects]; p[i].desc = e.target.value; setProfileForm({ ...profileForm, projects: p }); }} disabled={!isEditing} /></div>
                  </div>
                ))}
              </div>

              <div className="sd-profile-section">
                <div className="sd-section-header-flex">
                  <h3>5. Certifications Section</h3>
                  {isEditing && (
                    <button className="sd-add-btn" onClick={() => setProfileForm({ ...profileForm, certifications: [...profileForm.certifications, { name: '', issuer: '', year: '' }] })}>+ Add Cert</button>
                  )}
                </div>
                {profileForm.certifications.length === 0 && <p style={{ fontSize: '0.85rem', color: '#94a3b8', fontStyle: 'italic' }}>No certifications added yet.</p>}
                {profileForm.certifications.map((cert, i) => (
                  <div className="sd-array-card" key={i}>
                    {isEditing && (
                      <button className="sd-remove-btn" onClick={() => setProfileForm({ ...profileForm, certifications: profileForm.certifications.filter((_, idx) => idx !== i) })}><X size={14} /></button>
                    )}
                    <div className="sd-profile-fields-grid">
                      <div className="sd-field-group"><label>Name</label><input type="text" value={cert.name} onChange={e => { const c = [...profileForm.certifications]; c[i].name = e.target.value; setProfileForm({ ...profileForm, certifications: c }); }} disabled={!isEditing} /></div>
                      <div className="sd-field-group"><label>Issuer</label><input type="text" value={cert.issuer} onChange={e => { const c = [...profileForm.certifications]; c[i].issuer = e.target.value; setProfileForm({ ...profileForm, certifications: c }); }} disabled={!isEditing} /></div>
                      <div className="sd-field-group"><label>Year</label><input type="text" value={cert.year} onChange={e => { const c = [...profileForm.certifications]; c[i].year = e.target.value; setProfileForm({ ...profileForm, certifications: c }); }} disabled={!isEditing} /></div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="sd-profile-section">
                <div className="sd-section-header-flex">
                  <h3>6. Internship Experience</h3>
                  {isEditing && (
                    <button className="sd-add-btn" onClick={() => setProfileForm({ ...profileForm, internships: [...profileForm.internships, { company: '', role: '', duration: '', skills: '' }] })}>+ Add Internship</button>
                  )}
                </div>
                {profileForm.internships.length === 0 && <p style={{ fontSize: '0.85rem', color: '#94a3b8', fontStyle: 'italic' }}>No internships added yet.</p>}
                {profileForm.internships.map((intern, i) => (
                  <div className="sd-array-card" key={i}>
                    {isEditing && (
                      <button className="sd-remove-btn" onClick={() => setProfileForm({ ...profileForm, internships: profileForm.internships.filter((_, idx) => idx !== i) })}><X size={14} /></button>
                    )}
                    <div className="sd-profile-fields-grid">
                      <div className="sd-field-group"><label>Company Name</label><input type="text" value={intern.company} onChange={e => { const p = [...profileForm.internships]; p[i].company = e.target.value; setProfileForm({ ...profileForm, internships: p }); }} disabled={!isEditing} /></div>
                      <div className="sd-field-group"><label>Role</label><input type="text" value={intern.role} onChange={e => { const p = [...profileForm.internships]; p[i].role = e.target.value; setProfileForm({ ...profileForm, internships: p }); }} disabled={!isEditing} /></div>
                      <div className="sd-field-group"><label>Duration</label><input type="text" value={intern.duration} onChange={e => { const p = [...profileForm.internships]; p[i].duration = e.target.value; setProfileForm({ ...profileForm, internships: p }); }} disabled={!isEditing} /></div>
                      <div className="sd-field-group"><label>Skills Learned</label><input type="text" value={intern.skills} onChange={e => { const p = [...profileForm.internships]; p[i].skills = e.target.value; setProfileForm({ ...profileForm, internships: p }); }} disabled={!isEditing} /></div>
                    </div>
                  </div>
                ))}
              </div>

            </div>

            {isEditing && (
              <div className="sd-profile-actions-bottom" style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px', padding: '16px 20px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <button 
                  type="button" 
                  className="sd-btn-secondary" 
                  style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', color: '#475569', padding: '10px 20px', borderRadius: '8px', fontSize: '0.875rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
                  onClick={() => { setProfileForm(initProfile(student)); setIsEditing(false); }}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="sd-btn-primary" 
                  onClick={handleSaveProfile}
                >
                  Save Changes
                </button>
              </div>
            )}
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
                {jobs.map(job => {
                  const isGoogle = job.company?.toLowerCase().includes('google');
                  const isMicrosoft = job.company?.toLowerCase().includes('microsoft');
                  const isShnoor = job.company?.toLowerCase().includes('shnoor');
                  let themeClass = 'default-theme';
                  if (isGoogle) themeClass = 'google-theme';
                  else if (isMicrosoft) themeClass = 'microsoft-theme';
                  else if (isShnoor) themeClass = 'shnoor-theme';

                  const skills = job.requirements ? job.requirements.split(',').map(s => s.trim()).filter(Boolean) : [];
                  const badgeStatus = job.status || 'Open';
                  const badgeClass = badgeStatus === 'Open' ? 'badge-open' : 'badge-closing';

                  let displayDeadline = job.deadline;
                  if (job.deadline && job.deadline.includes('-')) {
                    try {
                      const parts = job.deadline.split('-');
                      const d = new Date(parts[0], parts[1] - 1, parts[2]);
                      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                      displayDeadline = `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
                    } catch(err){}
                  }

                  return (
                    <div className={`ad-job-card-new ${themeClass}`} key={job.id} style={{ display: 'flex', flexDirection: 'column', height: '100%', boxSizing: 'border-box' }}>

                      <div className="ad-job-card-header">
                        <div className="ad-job-card-icon-wrap">
                          <Briefcase size={20} />
                        </div>
                        <div className="ad-job-card-header-main">
                          <div className="ad-job-card-title-row">
                            <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>{job.title}</h4>
                          </div>
                          <p className="ad-job-card-company">{job.company} • {job.location}</p>
                        </div>
                        <div className="ad-job-card-salary-wrap">
                          <span>{job.salary}</span>
                        </div>
                      </div>

                      {job.description && (
                        <p className="ad-job-card-desc" style={{ flexGrow: 1 }}>{job.description}</p>
                      )}

                      {skills.length > 0 && (
                        <div className="ad-job-card-skills">
                          {skills.map((skill, idx) => (
                            <span key={idx} className="ad-job-skill-tag">{skill}</span>
                          ))}
                        </div>
                      )}

                      <div className="ad-job-card-meta-grid" style={{ marginBottom: '16px' }}>
                        <div className="ad-job-meta-item">
                          <span className="ad-job-meta-label">Min CGPA</span>
                          <span className="ad-job-meta-val">{job.minCgpa || job.min_cgpa || '—'}</span>
                        </div>
                        <div className="ad-job-meta-item">
                          <span className="ad-job-meta-label">Branches</span>
                          <span className="ad-job-meta-val">{job.allowedBranches || job.allowed_branches || '—'}</span>
                        </div>
                        <div className="ad-job-meta-item">
                          <span className="ad-job-meta-label">Passout Year</span>
                          <span className="ad-job-meta-val">{job.passoutYear || job.passout_year || '—'}</span>
                        </div>
                        <div className="ad-job-meta-item">
                          <span className="ad-job-meta-label">Deadline</span>
                          <span className="ad-job-meta-val">{displayDeadline || '—'}</span>
                        </div>
                        <div className="ad-job-meta-item">
                          <span className="ad-job-meta-label">Backlogs</span>
                          <span className="ad-job-meta-val">{job.backlogs || '—'}</span>
                        </div>
                      </div>

                      <div style={{ marginTop: 'auto', paddingTop: '12px', borderTop: '1px dashed #e2e8f0' }}>
                        {appliedJobs.includes(job.id) ? (
                          <button className="sd-applied-btn" style={{ width: '100%', cursor: 'not-allowed' }} disabled>✓ Applied</button>
                        ) : (
                          <button className="sd-btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={() => handleApplyJob(job.id)}>Apply Now →</button>
                        )}
                      </div>
                    </div>
                  );
                })}
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

      {sidebarOpen && <div className="sd-overlay" onClick={() => setSidebarOpen(false)} />}

      <div className="sd-main">

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

        <main className="sd-page-body">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default StudentDashboard;

