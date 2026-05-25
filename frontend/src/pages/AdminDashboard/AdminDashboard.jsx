import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, Briefcase, ClipboardList, BarChart2,
  TrendingUp, PieChart, FileText, Settings, LogOut, Bell,
  ChevronDown, GraduationCap, ShieldCheck, Menu, X, Plus, Trash2, Star, Eye, Pencil
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart as RechartsPie, Pie, Cell, Legend
} from 'recharts';
import { API_BASE_URL } from '../../config';
import './AdminDashboard.css';

const ADMIN_NAV = [
  { icon: LayoutDashboard, label: 'Dashboard', key: 'dashboard' },
  { icon: Users, label: 'Students', key: 'students' },
  { icon: Briefcase, label: 'Jobs', key: 'jobs' },
  { icon: ClipboardList, label: 'Applications', key: 'applications' },
  { icon: BarChart2, label: 'ATS Scores', key: 'ats' },
  { icon: TrendingUp, label: 'Rankings', key: 'rankings' },
  { icon: PieChart, label: 'Analytics', key: 'analytics' },
  { icon: FileText, label: 'Reports', key: 'reports' },
  { icon: Settings, label: 'Settings', key: 'settings' },
];

const SKILLS_DATA = [
  { name: 'Python', value: 35, color: '#3b82f6' },
  { name: 'Java', value: 25, color: '#6366f1' },
  { name: 'SQL', value: 15, color: '#10b981' },
  { name: 'React', value: 15, color: '#f59e0b' },
  { name: 'Others', value: 10, color: '#94a3b8' },
];

const MONTHLY_DATA = [
  { month: 'Jan', applications: 180 },
  { month: 'Feb', applications: 240 },
  { month: 'Mar', applications: 310 },
  { month: 'Apr', applications: 420 },
  { month: 'May', applications: 390 },
  { month: 'Jun', applications: 510 },
];

const StatusBadge = ({ status }) => {
  const map = {
    'Shortlisted': { cls: 'ad-badge-shortlisted', label: 'Shortlisted' },
    'Under Review': { cls: 'ad-badge-review', label: 'Under Review' },
    'Applied': { cls: 'ad-badge-applied', label: 'Applied' },
    'None': { cls: 'ad-badge-none', label: 'Not Applied' },
  };
  const { cls, label } = map[status] || map['None'];
  return <span className={`ad-status-badge ${cls}`}>{label}</span>;
};

const getJobTheme = (company) => {
  const name = company?.toLowerCase() || '';
  if (name.includes('google')) return 'google-theme';
  if (name.includes('microsoft')) return 'microsoft-theme';
  if (name.includes('shnoor')) return 'shnoor-theme';
  return 'default-theme';
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [admin, setAdmin] = useState(null);
  const [students, setStudents] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [activeNav, setActiveNav] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newJob, setNewJob] = useState({
    title: '', company: '', location: '', salary: '', requirements: '', description: '',
    minCgpa: '', allowedBranches: '', passoutYear: '2024 - 2026', deadline: '',
    jobType: 'Full-time', backlogs: 'No Backlogs'
  });
  const [editingJob, setEditingJob] = useState(null);
  const [selectedJobApplicants, setSelectedJobApplicants] = useState(null);
  const [jobMsg, setJobMsg] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem('cpp_current_user'));
    if (!currentUser || currentUser.role !== 'admin') { navigate('/login'); return; }
    setAdmin(currentUser);
    fetchData();
  }, [navigate]);

  const fetchData = async () => {
    try {
      const [studRes, jobsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/students`),
        fetch(`${API_BASE_URL}/api/jobs`)
      ]);
      if (studRes.ok) setStudents(await studRes.json());
      if (jobsRes.ok) setJobs(await jobsRes.json());
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const handleLogout = () => { localStorage.removeItem('cpp_current_user'); navigate('/'); };

  const handleShortlist = async (studentId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/students/shortlist/${studentId}`, { method: 'POST' });
      if (res.ok) {
        const updated = await res.json();
        setStudents(prev => prev.map(s => s.id === studentId ? { ...s, ...updated } : s));
        if (selectedStudent && selectedStudent.id === studentId) {
          setSelectedStudent(prev => ({ ...prev, ...updated }));
        }
      }
    } catch (e) { console.error(e); }
  };

  const handleAddJob = async (e) => {
    e.preventDefault();
    setJobMsg('');
    const isEdit = !!editingJob;
    const url = isEdit
      ? `${API_BASE_URL}/api/jobs/${editingJob.id}`
      : `${API_BASE_URL}/api/jobs`;
    const method = isEdit ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newJob)
      });
      if (res.ok) {
        const result = await res.json();
        if (isEdit) {
          setJobs(prev => prev.map(j => j.id === editingJob.id ? result : j));
          setJobMsg('✅ Job updated successfully!');
        } else {
          setJobs(prev => [...prev, result]);
          setJobMsg('✅ Job posted successfully!');
        }
        setEditingJob(null);
        setNewJob({
          title: '', company: '', location: '', salary: '', requirements: '', description: '',
          minCgpa: '', allowedBranches: '', passoutYear: '2024 - 2026', deadline: '',
          jobType: 'Full-time', backlogs: 'No Backlogs'
        });
        setTimeout(() => setJobMsg(''), 3000);
      } else {
        setJobMsg(isEdit ? '❌ Failed to update job.' : '❌ Failed to post job.');
      }
    } catch (e) {
      setJobMsg(isEdit ? '❌ Failed to update job.' : '❌ Failed to post job.');
    }
  };

  const handleStartEdit = (job) => {
    setEditingJob(job);
    setNewJob({
      title: job.title || '',
      company: job.company || '',
      location: job.location || '',
      salary: job.salary || '',
      requirements: job.requirements || '',
      description: job.description || '',
      minCgpa: job.minCgpa || job.min_cgpa || '',
      allowedBranches: job.allowedBranches || job.allowed_branches || '',
      passoutYear: job.passoutYear || job.passout_year || '2024 - 2026',
      deadline: job.deadline || '',
      jobType: job.jobType || job.job_type || 'Full-time',
      backlogs: job.backlogs || 'No Backlogs'
    });
  };

  const handleCancelEdit = () => {
    setEditingJob(null);
    setNewJob({
      title: '', company: '', location: '', salary: '', requirements: '', description: '',
      minCgpa: '', allowedBranches: '', passoutYear: '2024 - 2026', deadline: '',
      jobType: 'Full-time', backlogs: 'No Backlogs'
    });
  };

  const handleDeleteJob = async (jobId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/jobs/${jobId}`, { method: 'DELETE' });
      if (res.ok) setJobs(prev => prev.filter(j => j.id !== jobId));
    } catch (e) { console.error(e); }
  };

  const totalApplications = students.reduce((sum, s) => sum + (s.appliedJobs?.length ?? s.applied_jobs?.length ?? 0), 0);
  const shortlistedCount = students.filter(s => (s.applicationStatus ?? s.application_status) === 'Shortlisted').length;

  const filteredStudents = students.filter(s =>
    s.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="ad-loading-wrapper">
        <div className="ad-spinner"></div>
        <p>Loading admin dashboard...</p>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeNav) {
      case 'dashboard':
        return (
          <div className="ad-content-area">

            <div className="ad-stats-grid">
              <div className="ad-stat-card">
                <div className="ad-stat-icon blue"><Users size={22} /></div>
                <div><p className="ad-stat-label">Total Students</p><h3 className="ad-stat-val">{students.length.toLocaleString()}</h3></div>
              </div>
              <div className="ad-stat-card">
                <div className="ad-stat-icon purple"><Briefcase size={22} /></div>
                <div><p className="ad-stat-label">Total Jobs</p><h3 className="ad-stat-val">{jobs.length.toLocaleString()}</h3></div>
              </div>
              <div className="ad-stat-card">
                <div className="ad-stat-icon green"><ClipboardList size={22} /></div>
                <div><p className="ad-stat-label">Total Applications</p><h3 className="ad-stat-val">{totalApplications.toLocaleString()}</h3></div>
              </div>
              <div className="ad-stat-card">
                <div className="ad-stat-icon orange"><Star size={22} /></div>
                <div><p className="ad-stat-label">Shortlisted</p><h3 className="ad-stat-val">{shortlistedCount.toLocaleString()}</h3></div>
              </div>
            </div>

            <div className="ad-charts-row">
              <div className="ad-chart-panel">
                <h3 className="ad-panel-title">Applications Overview</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={MONTHLY_DATA}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94a3b8' }} />
                    <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} />
                    <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 12 }} />
                    <Line type="monotone" dataKey="applications" stroke="#3b82f6" strokeWidth={3} dot={{ fill: '#3b82f6', r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="ad-chart-panel">
                <h3 className="ad-panel-title">Top Skills in Demand</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <RechartsPie>
                    <Pie data={SKILLS_DATA} cx="45%" cy="50%" innerRadius={55} outerRadius={90} dataKey="value" paddingAngle={3}>
                      {SKILLS_DATA.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    </Pie>
                    <Legend iconType="circle" iconSize={10} wrapperStyle={{ fontSize: 12 }} />
                    <Tooltip formatter={(v) => `${v}%`} contentStyle={{ borderRadius: 10, fontSize: 12 }} />
                  </RechartsPie>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="ad-table-panel">
              <div className="ad-table-header">
                <h3 className="ad-panel-title" style={{ margin: 0 }}>Recent Applications</h3>
                <button className="ad-view-all-btn" onClick={() => setActiveNav('applications')}>View all applications →</button>
              </div>
              <div className="ad-table-wrap">
                <table className="ad-table">
                  <thead>
                    <tr>
                      <th>Student</th>
                      <th>Skills / Role</th>
                      <th>ATS Score</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.slice(0, 4).map(s => {
                      const ats = s.atsScore ?? s.ats_score ?? 0;
                      const status = s.applicationStatus ?? s.application_status ?? 'None';
                      return (
                        <tr key={s.id}>
                          <td>
                            <div className="ad-student-cell">
                              <div className="ad-student-av">{(s.name || s.username || 'S').charAt(0).toUpperCase()}</div>
                              <div>
                                <p className="ad-student-name">{s.name || s.username}</p>
                                <p className="ad-student-email">{s.email}</p>
                              </div>
                            </div>
                          </td>
                          <td><span className="ad-skills-preview">{s.skills?.split(',').slice(0, 2).join(', ') || '—'}</span></td>
                          <td>
                            <div className="ad-ats-cell">
                              <div className="ad-ats-bar-bg">
                                <div className="ad-ats-bar-fill" style={{ width: `${ats}%`, background: ats >= 80 ? '#10b981' : ats >= 60 ? '#f59e0b' : '#ef4444' }} />
                              </div>
                              <span className="ad-ats-pct">{ats}%</span>
                            </div>
                          </td>
                          <td><StatusBadge status={status} /></td>
                          <td>
                            <div className="ad-action-btns">
                              <button
                                className={`ad-shortlist-btn ${status === 'Shortlisted' ? 'ad-shortlist-active' : ''}`}
                                onClick={() => handleShortlist(s.id)}
                              >
                                <Star size={14} /> {status === 'Shortlisted' ? 'Unshortlist' : 'Shortlist'}
                              </button>
                              <button className="ad-view-profile-btn" onClick={() => setSelectedStudent(s)}>
                                <Eye size={14} /> View
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      case 'students':
        return (
          <div className="ad-content-area">
            <div className="ad-section-header">
              <h2 className="ad-page-title">Students ({students.length})</h2>
              <input
                className="ad-search-input"
                placeholder="Search students..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="ad-table-panel">
              <div className="ad-table-wrap">
                <table className="ad-table">
                  <thead>
                    <tr>
                      <th>Student</th>
                      <th>Skills</th>
                      <th>ATS Score</th>
                      <th>Resume</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.map(s => {
                      const ats = s.atsScore ?? s.ats_score ?? 0;
                      const status = s.applicationStatus ?? s.application_status ?? 'None';
                      const resume = s.resumeName ?? s.resume_name ?? '';
                      return (
                        <tr key={s.id}>
                          <td>
                            <div className="ad-student-cell">
                              <div className="ad-student-av">{(s.name || s.username || 'S').charAt(0).toUpperCase()}</div>
                              <div>
                                <p className="ad-student-name">{s.name || s.username}</p>
                                <p className="ad-student-email">{s.email}</p>
                              </div>
                            </div>
                          </td>
                          <td><span className="ad-skills-preview">{s.skills || '—'}</span></td>
                          <td>
                            <div className="ad-ats-cell">
                              <div className="ad-ats-bar-bg">
                                <div className="ad-ats-bar-fill" style={{ width: `${ats}%`, background: ats >= 80 ? '#10b981' : ats >= 60 ? '#f59e0b' : '#ef4444' }} />
                              </div>
                              <span className="ad-ats-pct">{ats}%</span>
                            </div>
                          </td>
                          <td><span className="ad-resume-name">{resume || 'Not uploaded'}</span></td>
                          <td><StatusBadge status={status} /></td>
                          <td>
                            <div className="ad-action-btns">
                              <button
                                className={`ad-shortlist-btn ${status === 'Shortlisted' ? 'ad-shortlist-active' : ''}`}
                                onClick={() => handleShortlist(s.id)}
                              >
                                <Star size={14} /> {status === 'Shortlisted' ? 'Unshortlist' : 'Shortlist'}
                              </button>
                              <button className="ad-view-profile-btn" onClick={() => setSelectedStudent(s)}>
                                <Eye size={14} /> View
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      case 'jobs':
        return (
          <div className="ad-content-area">
            <h2 className="ad-page-title">Job Management</h2>
            <div className="ad-jobs-layout">

              <div className="ad-add-job-panel">
                <h3>{editingJob ? '✏️ Edit Job Opening' : '➕ Post New Job'}</h3>
                <form className="ad-job-form" onSubmit={handleAddJob}>
                  <div className="ad-field">
                    <label>Job Title *</label>
                    <input
                      type="text"
                      placeholder="e.g. Frontend Developer"
                      value={newJob.title}
                      onChange={e => setNewJob({ ...newJob, title: e.target.value })}
                      required
                    />
                  </div>

                  <div className="ad-field">
                    <label>Company *</label>
                    <input
                      type="text"
                      placeholder="e.g. TechSolutions"
                      value={newJob.company}
                      onChange={e => setNewJob({ ...newJob, company: e.target.value })}
                      required
                    />
                  </div>

                  <div className="ad-field">
                    <label>Location</label>
                    <input
                      type="text"
                      placeholder="e.g. Hyderabad (Hybrid)"
                      value={newJob.location}
                      onChange={e => setNewJob({ ...newJob, location: e.target.value })}
                    />
                  </div>

                  <div className="ad-field">
                    <label>Salary</label>
                    <input
                      type="text"
                      placeholder="e.g. ₹12,00,000 LPA"
                      value={newJob.salary}
                      onChange={e => setNewJob({ ...newJob, salary: e.target.value })}
                    />
                  </div>

                  <div className="ad-form-row-3">
                    <div className="ad-field">
                      <label>Minimum CGPA</label>
                      <input
                        type="text"
                        placeholder="e.g. 7.0"
                        value={newJob.minCgpa}
                        onChange={e => setNewJob({ ...newJob, minCgpa: e.target.value })}
                      />
                    </div>
                    <div className="ad-field">
                      <label>Allowed Branches</label>
                      <input
                        type="text"
                        placeholder="e.g. CSE, IT"
                        value={newJob.allowedBranches}
                        onChange={e => setNewJob({ ...newJob, allowedBranches: e.target.value })}
                      />
                    </div>
                    <div className="ad-field">
                      <label>Passout Year</label>
                      <input
                        type="text"
                        placeholder="e.g. 2024 - 2026"
                        value={newJob.passoutYear}
                        onChange={e => setNewJob({ ...newJob, passoutYear: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="ad-form-row-3">
                    <div className="ad-field">
                      <label>Application Deadline</label>
                      <input
                        type="date"
                        value={newJob.deadline}
                        onChange={e => setNewJob({ ...newJob, deadline: e.target.value })}
                      />
                    </div>
                    <div className="ad-field">
                      <label>Job Type</label>
                      <select
                        value={newJob.jobType}
                        onChange={e => setNewJob({ ...newJob, jobType: e.target.value })}
                      >
                        <option value="Full-time">Full-time</option>
                        <option value="Internship">Internship</option>
                        <option value="Contract">Contract</option>
                        <option value="Part-time">Part-time</option>
                      </select>
                    </div>
                    <div className="ad-field">
                      <label>Backlogs</label>
                      <select
                        value={newJob.backlogs}
                        onChange={e => setNewJob({ ...newJob, backlogs: e.target.value })}
                      >
                        <option value="No Backlogs">No Backlogs</option>
                        <option value="1 Allowed">1 Allowed</option>
                        <option value="2 Allowed">2 Allowed</option>
                        <option value="Any">Any</option>
                      </select>
                    </div>
                  </div>

                  <div className="ad-field">
                    <label>Requirements (comma separated) *</label>
                    <input
                      type="text"
                      placeholder="e.g. React JS, Python, SQL"
                      value={newJob.requirements}
                      onChange={e => setNewJob({ ...newJob, requirements: e.target.value })}
                      required
                    />
                  </div>

                  <div className="ad-field">
                    <label>Description</label>
                    <textarea
                      placeholder="Brief job description..."
                      value={newJob.description}
                      onChange={e => setNewJob({ ...newJob, description: e.target.value })}
                      rows="3"
                      style={{
                        border: '1.5px solid #e2e8f0', borderRadius: '9px', padding: '9px 12px',
                        fontSize: '0.875rem', outline: 'none', color: '#1e293b', background: '#f8fafc',
                        fontFamily: 'inherit', resize: 'vertical'
                      }}
                    />
                  </div>

                  {jobMsg && <p className={`ad-job-msg ${jobMsg.includes('✅') ? 'success' : 'error'}`}>{jobMsg}</p>}

                  <div className="ad-form-actions" style={{ display: 'flex', gap: '10px' }}>
                    <button type="submit" className="ad-btn-primary" style={{ flex: 1 }}>
                      {editingJob ? 'Save Changes' : <><Plus size={16} /> Post Job</>}
                    </button>
                    {editingJob && (
                      <button
                        type="button"
                        className="ad-btn-secondary"
                        onClick={handleCancelEdit}
                        style={{
                          background: '#f1f5f9', border: '1px solid #cbd5e1', color: '#475569',
                          borderRadius: '10px', padding: '11px 20px', fontSize: '0.875rem',
                          fontWeight: 700, cursor: 'pointer'
                        }}
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              </div>

              <div className="ad-jobs-list-panel">
                <h3>Active Job Openings ({jobs.length})</h3>
                <div className="ad-jobs-list">
                  {jobs.map(job => {
                    const themeClass = getJobTheme(job.company);
                    const skills = job.requirements ? job.requirements.split(',').map(s => s.trim()).filter(Boolean) : [];
                    const badgeStatus = job.status || 'Open';
                    const badgeClass = badgeStatus === 'Open' ? 'badge-open' : 'badge-closing';

                    // Format Date to nice text e.g. "30 May 2026"
                    let displayDeadline = job.deadline;
                    if (job.deadline && job.deadline.includes('-')) {
                      try {
                        const parts = job.deadline.split('-');
                        const d = new Date(parts[0], parts[1] - 1, parts[2]);
                        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                        displayDeadline = `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
                      } catch (err) { }
                    }

                    return (
                      <div className={`ad-job-card-new ${themeClass}`} key={job.id}>

                        <div className="ad-job-card-header">
                          <div className="ad-job-card-icon-wrap">
                            <Briefcase size={20} />
                          </div>
                          <div className="ad-job-card-header-main">
                            <div className="ad-job-card-title-row">
                              <h4>{job.title}</h4>
                            </div>
                            <p className="ad-job-card-company">{job.company} • {job.location}</p>
                          </div>
                          <div className="ad-job-card-salary-wrap">
                            <span>{job.salary}</span>
                          </div>
                        </div>

                        {job.description && (
                          <p className="ad-job-card-desc">{job.description}</p>
                        )}

                        {skills.length > 0 && (
                          <div className="ad-job-card-skills">
                            {skills.map((skill, idx) => (
                              <span key={idx} className="ad-job-skill-tag">{skill}</span>
                            ))}
                          </div>
                        )}

                        <div className="ad-job-card-meta-grid">
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

                        <div className="ad-job-card-footer">
                          <button
                            className="ad-job-btn-view-applicants"
                            onClick={() => setSelectedJobApplicants(job)}
                          >
                            <Users size={14} /> View Applicants
                          </button>
                          <div className="ad-job-card-actions-right">
                            <button
                              className="ad-job-btn-edit"
                              onClick={() => handleStartEdit(job)}
                            >
                              <Pencil size={14} /> Edit
                            </button>
                            <button
                              className="ad-job-btn-delete"
                              onClick={() => handleDeleteJob(job.id)}
                            >
                              <Trash2 size={14} /> Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        );

      case 'applications':
        return (
          <div className="ad-content-area">
            <h2 className="ad-page-title">All Applications</h2>
            <div className="ad-table-panel">
              <div className="ad-table-wrap">
                <table className="ad-table">
                  <thead>
                    <tr>
                      <th>Student</th>
                      <th>Applied Jobs Count</th>
                      <th>ATS Score</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map(s => {
                      const ats = s.atsScore ?? s.ats_score ?? 0;
                      const status = s.applicationStatus ?? s.application_status ?? 'None';
                      const applied = s.appliedJobs?.length ?? s.applied_jobs?.length ?? 0;
                      return (
                        <tr key={s.id}>
                          <td>
                            <div className="ad-student-cell">
                              <div className="ad-student-av">{(s.name || s.username || 'S').charAt(0).toUpperCase()}</div>
                              <div>
                                <p className="ad-student-name">{s.name || s.username}</p>
                                <p className="ad-student-email">{s.email}</p>
                              </div>
                            </div>
                          </td>
                          <td><span className="ad-count-badge">{applied} job{applied !== 1 ? 's' : ''}</span></td>
                          <td>
                            <div className="ad-ats-cell">
                              <div className="ad-ats-bar-bg">
                                <div className="ad-ats-bar-fill" style={{ width: `${ats}%`, background: ats >= 80 ? '#10b981' : ats >= 60 ? '#f59e0b' : '#ef4444' }} />
                              </div>
                              <span className="ad-ats-pct">{ats}%</span>
                            </div>
                          </td>
                          <td><StatusBadge status={status} /></td>
                          <td>
                            <button
                              className={`ad-shortlist-btn ${status === 'Shortlisted' ? 'ad-shortlist-active' : ''}`}
                              onClick={() => handleShortlist(s.id)}
                            >
                              <Star size={14} /> {status === 'Shortlisted' ? 'Unshortlist' : 'Shortlist'}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      case 'ats':
        const sorted = [...students].sort((a, b) => (b.atsScore ?? b.ats_score ?? 0) - (a.atsScore ?? a.ats_score ?? 0));
        return (
          <div className="ad-content-area">
            <h2 className="ad-page-title">ATS Scores</h2>
            <div className="ad-ats-list">
              {sorted.map((s, i) => {
                const ats = s.atsScore ?? s.ats_score ?? 0;
                return (
                  <div className="ad-ats-row" key={s.id}>
                    <div className="ad-rank-num">#{i + 1}</div>
                    <div className="ad-student-av">{(s.name || s.username || 'S').charAt(0).toUpperCase()}</div>
                    <div className="ad-ats-row-info">
                      <p className="ad-student-name">{s.name || s.username}</p>
                      <p className="ad-student-email">{s.skills || '—'}</p>
                    </div>
                    <div className="ad-ats-cell" style={{ flex: 1, maxWidth: 220 }}>
                      <div className="ad-ats-bar-bg">
                        <div className="ad-ats-bar-fill" style={{ width: `${ats}%`, background: ats >= 80 ? '#10b981' : ats >= 60 ? '#f59e0b' : '#ef4444' }} />
                      </div>
                    </div>
                    <span className="ad-ats-score-badge" style={{ background: ats >= 80 ? 'rgba(16,185,129,0.1)' : ats >= 60 ? 'rgba(245,158,11,0.1)' : 'rgba(239,68,68,0.1)', color: ats >= 80 ? '#10b981' : ats >= 60 ? '#f59e0b' : '#ef4444' }}>{ats}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        );

      case 'analytics':
        return (
          <div className="ad-content-area">
            <h2 className="ad-page-title">Analytics</h2>
            <div className="ad-charts-row">
              <div className="ad-chart-panel">
                <h3 className="ad-panel-title">Monthly Application Trends</h3>
                <ResponsiveContainer width="100%" height={260}>
                  <LineChart data={MONTHLY_DATA}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94a3b8' }} />
                    <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} />
                    <Tooltip contentStyle={{ borderRadius: 10, fontSize: 12 }} />
                    <Line type="monotone" dataKey="applications" stroke="#3b82f6" strokeWidth={3} dot={{ fill: '#3b82f6', r: 5 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="ad-chart-panel">
                <h3 className="ad-panel-title">Skills Distribution</h3>
                <ResponsiveContainer width="100%" height={260}>
                  <RechartsPie>
                    <Pie data={SKILLS_DATA} cx="45%" cy="50%" innerRadius={65} outerRadius={100} dataKey="value" paddingAngle={3}>
                      {SKILLS_DATA.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    </Pie>
                    <Legend iconType="circle" iconSize={10} wrapperStyle={{ fontSize: 12 }} />
                    <Tooltip formatter={(v) => `${v}%`} contentStyle={{ borderRadius: 10, fontSize: 12 }} />
                  </RechartsPie>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="ad-content-area">
            <div className="ad-coming-soon">
              <ShieldCheck size={48} />
              <h3>Coming Soon</h3>
              <p>This admin module is under development.</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="ad-layout">

      <aside className={`ad-sidebar ${sidebarOpen ? 'ad-sidebar-open' : ''}`}>
        <div className="ad-sidebar-logo">
          <GraduationCap size={28} className="ad-logo-icon" />
          <div>
            <h2>Placement Portal</h2>
            <p>Smart Placements, Bright Futures</p>
          </div>
        </div>

        <nav className="ad-sidebar-nav">
          {ADMIN_NAV.map(({ icon: Icon, label, key }) => (
            <button
              key={key}
              className={`ad-nav-item ${activeNav === key ? 'ad-nav-active' : ''}`}
              onClick={() => { setActiveNav(key); setSidebarOpen(false); }}
            >
              <Icon size={19} />
              <span>{label}</span>
            </button>
          ))}
        </nav>

        <div className="ad-sidebar-footer">
          <button className="ad-nav-item ad-logout-btn" onClick={handleLogout}>
            <LogOut size={19} /><span>Logout</span>
          </button>
          <div className="ad-help-box">
            <p className="ad-help-title">Need Help?</p>
            <p className="ad-help-sub">Contact placement cell</p>
            <button className="ad-contact-btn">Contact Us</button>
          </div>
        </div>
      </aside>

      {sidebarOpen && <div className="ad-overlay" onClick={() => setSidebarOpen(false)} />}

      <div className="ad-main">
        <header className="ad-header">
          <div className="ad-header-left">
            <button className="ad-hamburger" onClick={() => setSidebarOpen(!sidebarOpen)}>
              {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
            <h1 className="ad-header-title">Admin Dashboard</h1>
          </div>
          <div className="ad-header-right">
            <button className="ad-icon-btn"><Bell size={20} /></button>
            <div className="ad-user-chip">
              <div className="ad-user-avatar"><ShieldCheck size={18} /></div>
              <div className="ad-user-info">
                <span className="ad-user-name">Admin</span>
                <span className="ad-user-role">Placement Cell</span>
              </div>
              <ChevronDown size={16} />
            </div>
          </div>
        </header>

        <main className="ad-page-body">
          {renderContent()}
        </main>
      </div>

      {selectedStudent && (
        <div className="ad-modal-overlay" onClick={() => setSelectedStudent(null)}>
          <div className="ad-modal-content" onClick={e => e.stopPropagation()}>
            <div className="ad-modal-header">
              <h2>Student Profile</h2>
              <button className="ad-modal-close" onClick={() => setSelectedStudent(null)}><X size={20} /></button>
            </div>

            <div className="ad-modal-body">
              <div className="ad-modal-profile-header">
                <div className="ad-modal-av">{(selectedStudent.name || selectedStudent.username || 'S').charAt(0).toUpperCase()}</div>
                <div>
                  <h3>{selectedStudent.name || selectedStudent.username}</h3>
                  <p>{selectedStudent.email} | {selectedStudent.phone_number || selectedStudent.phoneNumber || 'No phone'}</p>
                </div>
                <div className="ad-modal-ats">
                  <span>ATS Score</span>
                  <strong>{selectedStudent.atsScore ?? selectedStudent.ats_score ?? 0}%</strong>
                </div>
              </div>

              <div className="ad-modal-grid">

                <div className="ad-modal-section">
                  <h4>Academic Details</h4>
                  <div className="ad-modal-fields">
                    <div><label>Roll Number</label><p>{selectedStudent.rollNumber || selectedStudent.roll_number || '—'}</p></div>
                    <div><label>Department</label><p>{selectedStudent.department || '—'}</p></div>
                    <div><label>Passout Year</label><p>{selectedStudent.passoutYear || selectedStudent.passout_year || '—'}</p></div>
                    <div><label>Current CGPA</label><p>{selectedStudent.currentCgpa || selectedStudent.current_cgpa || '—'}</p></div>
                    <div><label>10th Score</label><p>{selectedStudent.academic10th || selectedStudent.academic_10th || '—'}</p></div>
                    <div><label>Inter Score</label><p>{selectedStudent.academicInter || selectedStudent.academic_inter || '—'}</p></div>
                    <div><label>Backlogs</label><p>{selectedStudent.backlogs || '0'}</p></div>
                  </div>
                </div>

                <div className="ad-modal-section">
                  <h4>Skills</h4>
                  <div className="ad-modal-skills">
                    {(selectedStudent.skills || 'No skills added').split(',').map((skill, i) => (
                      <span key={i} className="ad-skill-tag">{skill.trim()}</span>
                    ))}
                  </div>
                </div>

                <div className="ad-modal-section">
                  <h4>Projects</h4>
                  {(!selectedStudent.projects || selectedStudent.projects.length === 0) ? (
                    <p className="ad-modal-empty">No projects added.</p>
                  ) : (
                    <div className="ad-modal-cards">
                      {selectedStudent.projects.map((p, i) => (
                        <div key={i} className="ad-modal-card">
                          <h5>{p.name}</h5>
                          <p className="ad-card-tech">{p.tech}</p>
                          <p className="ad-card-desc">{p.desc}</p>
                          {p.link && <a href={p.link} target="_blank" rel="noreferrer" className="ad-card-link">View Project</a>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="ad-modal-section">
                  <h4>Internships</h4>
                  {(!selectedStudent.internships || selectedStudent.internships.length === 0) ? (
                    <p className="ad-modal-empty">No internships added.</p>
                  ) : (
                    <div className="ad-modal-cards">
                      {selectedStudent.internships.map((int, i) => (
                        <div key={i} className="ad-modal-card">
                          <h5>{int.role} at {int.company}</h5>
                          <p className="ad-card-tech">{int.duration}</p>
                          <p className="ad-card-desc">{int.skills}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="ad-modal-section">
                  <h4>Certifications</h4>
                  {(!selectedStudent.certifications || selectedStudent.certifications.length === 0) ? (
                    <p className="ad-modal-empty">No certifications added.</p>
                  ) : (
                    <div className="ad-modal-cards">
                      {selectedStudent.certifications.map((c, i) => (
                        <div key={i} className="ad-modal-card">
                          <h5>{c.name}</h5>
                          <p className="ad-card-desc">{c.issuer} - {c.year}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="ad-modal-section">
                  <h4>AI Resume Insights</h4>
                  {(!selectedStudent.suggestions || selectedStudent.suggestions.length === 0) ? (
                    <p className="ad-modal-empty">No insights available.</p>
                  ) : (
                    <ul className="ad-modal-suggestions">
                      {selectedStudent.suggestions.map((s, i) => (
                        <li key={i}>{s}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>

            <div className="ad-modal-footer">
              <button
                className={`ad-btn-shortlist-large ${(selectedStudent.applicationStatus ?? selectedStudent.application_status) === 'Shortlisted' ? 'active' : ''}`}
                onClick={() => {
                  handleShortlist(selectedStudent.id);
                  const newStatus = (selectedStudent.applicationStatus ?? selectedStudent.application_status) === 'Shortlisted' ? 'Under Review' : 'Shortlisted';
                  setSelectedStudent({ ...selectedStudent, applicationStatus: newStatus });
                }}
              >
                <Star size={18} />
                {(selectedStudent.applicationStatus ?? selectedStudent.application_status) === 'Shortlisted' ? 'Unshortlist Candidate' : 'Shortlist Candidate'}
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedJobApplicants && (() => {
        const applicants = students.filter(s => {
          const appliedIds = s.appliedJobs || s.applied_jobs || [];
          return appliedIds.includes(selectedJobApplicants.id);
        });
        return (
          <div className="ad-modal-overlay" onClick={() => setSelectedJobApplicants(null)}>
            <div className="ad-modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '850px', width: '90%' }}>
              <div className="ad-modal-header">
                <div>
                  <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>Applicants for {selectedJobApplicants.title}</h2>
                  <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '0.875rem', fontWeight: 500 }}>{selectedJobApplicants.company} • {applicants.length} Applicant{applicants.length !== 1 ? 's' : ''}</p>
                </div>
                <button className="ad-modal-close" onClick={() => setSelectedJobApplicants(null)}><X size={20} /></button>
              </div>

              <div className="ad-modal-body" style={{ maxHeight: '60vh', overflowY: 'auto', padding: '20px' }}>
                {applicants.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px 20px', color: '#94a3b8' }}>
                    <Users size={48} style={{ opacity: 0.5, marginBottom: '12px' }} />
                    <p>No students have applied for this job yet.</p>
                  </div>
                ) : (
                  <div className="ad-table-wrap" style={{ boxShadow: 'none', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
                    <table className="ad-table">
                      <thead>
                        <tr>
                          <th>Student</th>
                          <th>ATS Score</th>
                          <th>Skills</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {applicants.map(s => {
                          const status = s.applicationStatus ?? s.application_status ?? 'Under Review';
                          const ats = s.atsScore ?? s.ats_score ?? 0;
                          return (
                            <tr key={s.id}>
                              <td>
                                <div className="ad-student-cell">
                                  <div className="ad-student-av">{(s.name || s.username || 'S').charAt(0).toUpperCase()}</div>
                                  <div>
                                    <p className="ad-student-name">{s.name || s.username}</p>
                                    <p className="ad-student-email">{s.email}</p>
                                  </div>
                                </div>
                              </td>
                              <td>
                                <div className="ad-ats-cell">
                                  <div className="ad-ats-bar-bg">
                                    <div className="ad-ats-bar-fill" style={{ width: `${ats}%`, background: ats >= 80 ? '#10b981' : ats >= 60 ? '#f59e0b' : '#ef4444' }} />
                                  </div>
                                  <span className="ad-ats-pct">{ats}%</span>
                                </div>
                              </td>
                              <td>
                                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', maxWidth: '200px' }}>
                                  {(s.skills || '—').split(',').slice(0, 2).map((skill, idx) => (
                                    <span key={idx} className="ad-job-skill-tag" style={{ margin: 0, fontSize: '10px', padding: '2px 6px', background: '#f1f5f9', color: '#475569', borderRadius: '4px', fontWeight: 500 }}>{skill.trim()}</span>
                                  ))}
                                </div>
                              </td>
                              <td><StatusBadge status={status} /></td>
                              <td>
                                <div className="ad-action-btns">
                                  <button
                                    className={`ad-shortlist-btn ${status === 'Shortlisted' ? 'ad-shortlist-active' : ''}`}
                                    onClick={() => handleShortlist(s.id)}
                                  >
                                    <Star size={14} /> {status === 'Shortlisted' ? 'Unshortlist' : 'Shortlist'}
                                  </button>
                                  <button className="ad-view-profile-btn" onClick={() => { setSelectedStudent(s); setSelectedJobApplicants(null); }}>
                                    <Eye size={14} /> View
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })()}

    </div>
  );
};

export default AdminDashboard;

