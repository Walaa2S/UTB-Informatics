'use client';
import { useEffect, useMemo, useState } from 'react';
const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4002/api').replace(/\/$/, '');

async function apiFetch(path, options = {}) {
  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;
  const headers = { ...(options.headers || {}) };
  if (!isFormData && !headers['Content-Type']) headers['Content-Type'] = 'application/json';

  const response = await fetch(`${API_BASE}${path}`, {
    credentials: 'include',
    headers,
    ...options,
  });

  const text = await response.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = { message: text }; }

  if (!response.ok) {
    const error = new Error(data?.message || `Request failed (${response.status})`);
    error.status = response.status;
    throw error;
  }
  return data;
}

function Pill({ tone = 'green', children }) {
  return <span className={`pill pill-${tone}`}>{children}</span>;
}

function initials(name = '') {
  return String(name).trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase() || 'ST';
}

function formatDate(value) {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleString();
}

export default function StudentsPage() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('dashboard');
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [challengeAccepted, setChallengeAccepted] = useState(false);
const [submission, setSubmission] = useState({ link: '', file: null, note: '' });
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState('');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [termInput, setTermInput] = useState('');
  const [radarPinged, setRadarPinged] = useState(false);

  // حالات تسجيل الدخول والمصادقة (Auth States)
  const [authModal, setAuthModal] = useState(false);
  const [authStep, setAuthStep] = useState(1);
  const [authRole, setAuthRole] = useState(null);
  const [utbEmail, setUtbEmail] = useState('');
  const [studentId, setStudentId] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpMessage, setOtpMessage] = useState('');
  const [otpError, setOtpError] = useState('');
  const [otpResendSeconds, setOtpResendSeconds] = useState(0);
  
  const [termLogs, setTermLogs] = useState([
    'System initialized successfully.',
    'Type "help" for available commands.'
  ]);

  const user = dashboard?.user || null;
  const challenges = dashboard?.challenges || [];
  const submissions = dashboard?.submissions || [];
  const tasks = dashboard?.tasks || [];
  const projects = dashboard?.projects || [];
  const teams = dashboard?.teams || [];
  const ideas = dashboard?.ideas || [];
  const leaderboard = dashboard?.leaderboard || [];
  const events = dashboard?.events || [];
  const resources = dashboard?.resources || [];
  const stats = dashboard?.stats || {};

  const filteredChallenges = useMemo(() => {
    const q = search.trim().toLowerCase();
    return challenges.filter((challenge) => {
      const matchesFilter = filter === 'All' || challenge.category === filter || challenge.type === filter;
      const text = [challenge.title, challenge.description, challenge.category, ...(challenge.skills || [])].filter(Boolean).join(' ').toLowerCase();
      return matchesFilter && (!q || text.includes(q));
    });
  }, [challenges, filter, search]);

  function showToast(message) {
    setToast(message);
    window.clearTimeout(window.__studentToast);
    window.__studentToast = window.setTimeout(() => setToast(''), 3200);
  }

  async function handleLogout() {
    try {
      await apiFetch('/auth/logout', { method: 'POST' });
    } catch {}
    window.location.href = '/community';
  }

  async function load() {
    setLoading(true);
    try {
      const [dashData, challengesData] = await Promise.all([
        apiFetch('/students/dashboard').catch(() => ({})),
        apiFetch('/challenges').catch(() => [])
      ]);

      setDashboard({
        ...(dashData || {}),
        challenges: Array.isArray(challengesData) && challengesData.length > 0 ? challengesData : (dashData?.challenges || [])
      });
    } catch (error) {
      const fallbackChallenges = await apiFetch('/challenges').catch(() => []);
      setDashboard({
        user: null,
        challenges: fallbackChallenges,
        submissions: [],
        tasks: [],
        projects: [],
        teams: [],
        ideas: [],
        leaderboard: [],
        events: [],
        resources: [],
        stats: {},
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { 
    load(); 
    const interval = setInterval(load, 15000);
    return () => clearInterval(interval);
  }, []);

  // دوال نافذة المصادقة (Auth Modal Functions)
  function openAuthModal() {
    setAuthStep(1);
    setAuthRole(null);
    setUtbEmail('');
    setStudentId('');
    setOtpCode('');
    setOtpMessage('');
    setOtpError('');
    setAuthModal(true);
  }

  function closeAuthModal() {
    if (busy) return;
    setAuthModal(false);
  }

  function selectAuthRole(role) {
    setAuthRole(role);
    setAuthStep(2);
  }

  async function requestOtp() {
    const email = utbEmail.trim().toLowerCase();
    if (!email || !studentId) {
      setOtpError('Please enter both email and student ID.');
      return;
    }
    setBusy(true);
    setOtpError('');
    try {
      const res = await apiFetch('/auth/request-otp', {
        method: 'POST',
        body: JSON.stringify({ email, studentId }),
      });
      setOtpMessage(res?.message || 'Verification code sent.');
      setAuthStep(3);
    } catch (err) {
      setOtpError(err?.message || 'Failed to send OTP.');
    } finally {
      setBusy(false);
    }
  }

  async function verifyOtp() {
    const email = utbEmail.trim().toLowerCase();
    const otp = otpCode.trim();
    if (!otp) return;

    setBusy(true);
    setOtpError('');
    try {
      const res = await apiFetch('/auth/verify-otp', {
        method: 'POST',
        body: JSON.stringify({ email, otpCode: otp }),
      });
      if (res?.success) {
        setAuthModal(false);
        showToast('Successfully authenticated!');
        await load();
      } else {
        throw new Error(res?.message || 'Invalid code.');
      }
    } catch (err) {
      setOtpError(err?.message || 'Verification failed.');
    } finally {
      setBusy(false);
    }
  }

  function handleTerminalSubmit(e) {
    e.preventDefault();
    const cmd = termInput.trim().toLowerCase();
    if (!cmd) return;

    let responseMsg = '';
    const validTabs = ['dashboard', 'challenges', 'tasks', 'teams', 'projects', 'ideas', 'leaderboard', 'events', 'resources'];

    if (cmd === 'help') {
      responseMsg = `Commands: ${validTabs.join(', ')}, clear, logout, exit`;
    } else if (validTabs.includes(cmd)) {
      setTab(cmd);
      responseMsg = `Switched context to -> ${cmd}`;
    } else if (cmd === 'status') {
      responseMsg = `role: ${user?.role || 'student'} | level: ${user?.level || 1} | xp: ${user?.xp || 0} | streak: ${user?.streak || 0} days`;
    } else if (cmd === 'clear') {
      setTermLogs(['Terminal cleared.']);
      setTermInput('');
      return;
    } else if (cmd === 'logout' || cmd === 'exit') {
      responseMsg = 'Terminating session... Redirecting.';
      setTermLogs((prev) => [...prev, `> ${cmd}`, responseMsg]);
      setTermInput('');
      setTimeout(handleLogout, 800);
      return;
    } else {
      responseMsg = `Unknown command: "${cmd}". Type "help".`;
    }

    setTermLogs((prev) => [...prev.slice(-6), `> ${cmd}`, responseMsg]);
    setTermInput('');
  }

  async function acceptChallenge(challenge) {
    if (!user) {
      setSelectedChallenge(null);
      openAuthModal();
      return;
    }
    const challengeId = challenge.id || challenge._id;
    if (!challengeId) return;
    setBusy(true);
    try {
      await apiFetch(`/challenges/${challengeId}/accept`, { method: 'POST' });
      setChallengeAccepted(true);
      showToast('⚡ Challenge accepted! Submission portal unlocked.');
      await load();
    } catch (error) {
      showToast(error?.message || 'Failed to accept challenge.');
    } finally {
      setBusy(false);
    }
  }

  async function submitSolution(event) {
    event.preventDefault();
    const challengeId = selectedChallenge?.id || selectedChallenge?._id;
    if (!challengeId) return;

    const fd = new FormData();
    fd.append('challengeId', String(challengeId));
    if (submission.link) fd.append('link', submission.link);
    if (submission.note) fd.append('note', submission.note);
    if (submission.file) fd.append('file', submission.file);

    setBusy(true);
    try {
      await apiFetch(`/students/challenges/${challengeId}/submissions`, {
        method: 'POST',
        body: fd,
      });
      await load();
      setSelectedChallenge(null);
      setChallengeAccepted(false);
      setSubmission({ link: '', file: null, note: '' });
      showToast('🚀 Solution submitted successfully to instructor!');
    } catch (error) {
      if (error?.status === 401) {
        openAuthModal();
      } else {
        showToast(error?.message || 'Submission failed.');
      }
    } finally {
      setBusy(false);
    }
  }

  const tabs = [
    ['dashboard', 'Dashboard', '⌂'],
    ['challenges', 'Challenges', '⚡'],
    ['tasks', 'Tasks', '✓'],
    ['teams', 'Teams', '👥'],
    ['projects', 'Projects', '🚀'],
    ['ideas', 'Ideas', '💡'],
    ['leaderboard', 'Leaderboard', '🏆'],
    ['events', 'Events', '❖'],
    ['resources', 'Resources', '◻'],
  ];

  return (
    <main className="community-shell">
      {toast && <div className="toast">{toast}</div>}

      <header className="topbar">
        <button className="brand" onClick={() => { window.location.href = '/community'; }}>
          <div className="brand-mark">&gt;_</div>
          <div className="brand-copy">
            <div className="brand-title">BSIE Student Hub</div>
            <div className="brand-path">BSIE://students</div>
          </div>
        </button>

        <div className="top-actions">
          {!user ? (
            <button className="btn btn-primary" onClick={openAuthModal}>Sign In</button>
          ) : (
            <button className="btn btn-danger-outline" onClick={handleLogout}>Logout</button>
          )}
          <div className="profile-mini">
            <div className="avatar">{initials(user?.name)}</div>
            <div>
              <div className="profile-name">{user?.name || 'Guest'}</div>
              <div className="profile-level">{user ? `STUDENT · LEVEL ${user?.level ?? '1'}` : 'SIGN IN REQUIRED'}</div>
            </div>
          </div>
        </div>
      </header>

      <div className="layout">
        <aside className="sidebar open">
          <div className="terminal-label">~/student/community</div>
          <nav className="nav">
            {tabs.map(([id, label, icon]) => (
              <button key={id} className={`nav-item ${tab === id ? 'active' : ''}`} onClick={() => setTab(id)}>
                <span className="nav-icon">{icon}</span>
                <span className="nav-label">{label}</span>
              </button>
            ))}
          </nav>

          <div className="sidebar-terminal">
            <div className="sidebar-terminal-title">&gt; terminal.cli()</div>
            <div className="terminal-logs">
              {termLogs.map((log, i) => (
                <div key={i} className="terminal-log-line">{log}</div>
              ))}
            </div>
            <form onSubmit={handleTerminalSubmit} className="terminal-form">
              <span className="term-prompt">&gt;</span>
              <input 
                className="term-input" 
                value={termInput} 
                onChange={(e) => setTermInput(e.target.value)} 
                placeholder="type command..." 
              />
            </form>
          </div>
        </aside>

        <section className="main">
          {tab === 'dashboard' && (
            <>
              <section className="hero">
                <div className="terminal-orb" />
                <div>
                  <div className="hero-kicker">&gt; student.boot()</div>
                  <h1>Learn.<br />Submit.<br /><span>Level Up.</span></h1>
                  <p className="hero-copy">Your protected student workspace for instructor challenges, submissions, academic tasks and project progress.</p>
                  
                  <div className="readiness-meter-box">
                    <div className="meter-header">
                      <span>COMMAND READINESS: OPTIMAL (100%)</span>
                      <span className="pulse-dot"></span>
                    </div>
                    <div className="progress-bar-track">
                      <div className="progress-bar-fill"></div>
                    </div>
                    <div className="ticker-text">
                      &gt; System: Synchronized live with faculty node. {challenges.length} active challenge(s) online.
                    </div>
                  </div>

                  <div className="hero-actions">
                    <button className="btn btn-primary" onClick={() => setTab('challenges')}>EXPLORE CHALLENGES</button>
                    {!user && <button className="btn" onClick={openAuthModal}>SIGN IN TO SYSTEM</button>}
                  </div>
                </div>
              </section>

              <div className="stats-grid">
                {[
                  ['XP', user?.xp ?? '0', 'verified'],
                  ['Level', user?.level ?? '1', 'current'],
                  ['Challenges', stats.challengesCompleted ?? user?.challengesCompleted ?? '0', 'completed'],
                  ['Streak', `${user?.streak ?? 0} days`, 'active streak'],
                ].map(([label, value, extra]) => (
                  <div className="stat-card" key={label}>
                    <div className="stat-label">{label}</div>
                    <div className="stat-value">{value}</div>
                    <div className="stat-extra">{extra}</div>
                  </div>
                ))}
              </div>

              <div className="two-column section-spacer">
                <div className="panel">
                  <div className="panel-header">
                    <div><h3 className="panel-title">Active Challenges</h3><div className="panel-subtitle">Published by instructors</div></div>
                    <button className="btn" onClick={() => setTab('challenges')}>View all</button>
                  </div>
                  <div className="panel-body">
                    {challenges.slice(0, 4).map((challenge) => (
                      <div className="task-row" key={challenge.id || challenge._id}>
                        <div><strong>{challenge.title}</strong><div className="task-meta">{challenge.category || challenge.type || 'Challenge'} · +{challenge.reward || 0} XP</div></div>
                        <button className="btn btn-primary" onClick={() => { setSelectedChallenge(challenge); setChallengeAccepted(false); }}>VIEW</button>
                      </div>
                    ))}
                    {!challenges.length && (
                      <div className="radar-empty-state">
                        <div className="radar-sweep-effect"></div>
                        <div className="radar-content">
                          <div className="radar-tag">[!] RADAR ACTIVE: SCANNING INSTRUCTOR NODES</div>
                          <h4>Waiting for Faculty Transmission</h4>
                          <p>⏳ Next Instructor Sync in: <strong>04:12:30</strong></p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="panel">
                  <div className="panel-header">
                    <div><h3 className="panel-title">Recent Submissions</h3><div className="panel-subtitle">Your academic work</div></div>
                    <button className="btn" onClick={() => setTab('tasks')}>View all</button>
                  </div>
                  <div className="panel-body">
                    {submissions.slice(0, 4).map((item) => (
                      <div className="task-row" key={item.id}>
                        <div><strong>{item.challengeTitle || item.challenge?.title || 'Submission'}</strong><div className="task-meta">{item.status || 'Pending'} · {formatDate(item.submittedAt || item.createdAt)}</div></div>
                        <Pill tone={item.status === 'approved' ? 'green' : 'orange'}>{item.status || 'Pending'}</Pill>
                      </div>
                    ))}
                    {!submissions.length && (
                      <div className="classified-box">
                        <div className="classified-header">[STATUS: NO SUBMISSIONS YET]</div>
                        <p>Accept a challenge and submit your solution to track progress here.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}

          {tab === 'challenges' && (
            <section className="page-section">
              <div className="section-heading">
                <div><div className="section-kicker">&gt; challenges.available()</div><h2>Engineering Challenges</h2><p>Live challenges published by instructors. Inspect, accept, and submit solutions.</p></div>
              </div>

              <div className="toolbar">
                <div className="filter-row">
                  {['All', ...Array.from(new Set(challenges.map((x) => x.category || x.type).filter(Boolean)))].map((item) => (
                    <button key={item} className={`filter ${filter === item ? 'active' : ''}`} onClick={() => setFilter(item)}>{item}</button>
                  ))}
                </div>
                <input className="search-input" placeholder="Search challenges..." value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>

              <div className="resource-grid section-spacer">
                {filteredChallenges.map((challenge) => (
                  <article className="resource-card" key={challenge.id || challenge._id}>
                    <div className="card-top">
                      <div className="card-icon">{challenge.icon || '⚡'}</div>
                      <Pill tone="green">OPEN</Pill>
                    </div>
                    <div className="challenge-type">{challenge.category || challenge.difficulty || 'Challenge'}</div>
                    <h3 className="card-title">{challenge.title}</h3>
                    <p className="card-description">{challenge.description || ''}</p>
                    <div className="project-author">+{challenge.reward || 0} XP · {challenge.difficulty || 'Intermediate'}</div>
                    <div className="date-box">📅 Start: {formatDate(challenge.startDate)}<br />⏳ Deadline: {formatDate(challenge.deadline)}</div>
                    <div className="card-footer">
                      <span className="project-stats">Ready for engagement</span>
                      <button className="btn btn-primary" onClick={() => { setSelectedChallenge(challenge); setChallengeAccepted(false); }}>VIEW CHALLENGE</button>
                    </div>
                  </article>
                ))}
              </div>

              {!filteredChallenges.length && (
                <div className="radar-empty-state section-spacer" style={{ padding: '40px' }}>
                  <div className="radar-sweep-effect"></div>
                  <div className="radar-content">
                    <div className="radar-tag">[!] RADAR ACTIVE: SCANNING CHALLENGE NODES</div>
                    <h4>No active challenges published yet</h4>
                    <p>Instructor is preparing new engineering challenges.</p>
                  </div>
                </div>
              )}
            </section>
          )}

          {tab === 'tasks' && (
            <section className="page-section">
              <div className="section-heading"><div><div className="section-kicker">&gt; tasks.queue()</div><h2>Academic Tasks & Submissions</h2><p>Instructor assigned tasks and your submitted solutions.</p></div></div>
              <div className="panel">
                <div className="panel-body">
                  {tasks.map((task) => (
                    <div className="task-row" key={task.id}>
                      <div><strong>{task.title}</strong><div className="task-meta">{task.course || '—'} · {task.status || 'Pending'} · {formatDate(task.deadline)}</div></div>
                      {task.xp != null && <Pill tone="orange">+{task.xp} XP</Pill>}
                    </div>
                  ))}
                  {!tasks.length && (
                    <div className="classified-box" style={{ padding: '30px' }}>
                      <div className="classified-header">[STATUS: TASK QUEUE READY]</div>
                      <p>No academic tasks assigned by faculty at this moment.</p>
                    </div>
                  )}
                </div>
              </div>
            </section>
          )}

          {tab === 'teams' && (
            <section className="page-section">
              <div className="section-heading"><div><div className="section-kicker">&gt; teams.collaborate()</div><h2>Student Teams</h2><p>Collaborative project groups assigned by faculty.</p></div></div>
              <div className="resource-grid">
                {teams.map((team) => (
                  <article className="resource-card squad-card" key={team.id || team.name}>
                    <div className="card-icon squad-icon">👥</div>
                    <h3 className="card-title">{team.name}</h3>
                    <p className="card-description">{team.description || 'Assigned project team workspace.'}</p>
                    <div className="squad-members-box">
                      <span className="squad-label">SQUAD MEMBERS</span>
                      <div className="squad-list">{(team.members || []).join(' • ') || 'Active Team'}</div>
                    </div>
                  </article>
                ))}
                {!teams.length && (
                  <div className="radar-empty-state" style={{ gridColumn: '1 / -1', padding: '40px' }}>
                    <div className="radar-sweep-effect"></div>
                    <div className="radar-content">
                      <div className="radar-tag">[!] SQUAD RADAR ACTIVE</div>
                      <h4>Awaiting Team Formation</h4>
                      <p>Faculty will assign collaborative squads soon.</p>
                    </div>
                  </div>
                )}
              </div>
            </section>
          )}

          {tab === 'projects' && (
            <section className="page-section">
              <div className="section-heading"><div><div className="section-kicker">&gt; projects.mine()</div><h2>My Projects</h2><p>Your published or submitted academic projects.</p></div></div>
              <div className="resource-grid">
                {projects.map((project) => (
                  <article className="resource-card project-box" key={project.id}>
                    <div className="card-top">
                      <div className="card-icon">{project.icon || '🚀'}</div>
                      <Pill tone="blue">{project.status || 'Published'}</Pill>
                    </div>
                    <h3 className="card-title">{project.title}</h3>
                    <p className="card-description">{project.description || ''}</p>
                  </article>
                ))}
                {!projects.length && (
                  <div className="classified-box" style={{ gridColumn: '1 / -1', padding: '30px' }}>
                    <div className="classified-header">[PROJECT REPOSITORY READY]</div>
                    <p>No custom projects deployed yet. Submit solutions or initialize workspace.</p>
                  </div>
                )}
              </div>
            </section>
          )}

          {tab === 'ideas' && (
            <section className="page-section">
              <div className="section-heading"><div><div className="section-kicker">&gt; ideas.repository()</div><h2>Ideas & Proposals</h2><p>Innovative student concepts and project proposals.</p></div></div>
              <div className="resource-grid">
                {ideas.map((idea) => (
                  <article className="resource-card idea-card" key={idea.id || idea.title}>
                    <div className="card-icon">💡</div>
                    <h3 className="card-title">{idea.title}</h3>
                    <p className="card-description">{idea.description || ''}</p>
                    <div className="idea-author">Author: <span>{idea.author || 'Student'}</span></div>
                  </article>
                ))}
                {!ideas.length && (
                  <div className="radar-empty-state" style={{ gridColumn: '1 / -1', padding: '40px' }}>
                    <div className="radar-sweep-effect"></div>
                    <div className="radar-content">
                      <div className="radar-tag">[!] IDEAS FEED SCANNING</div>
                      <h4>No Proposals Submitted Yet</h4>
                      <p>Share innovative concepts to inspire the command center.</p>
                    </div>
                  </div>
                )}
              </div>
            </section>
          )}

          {tab === 'leaderboard' && (
            <section className="page-section">
              <div className="section-heading"><div><div className="section-kicker">&gt; leaderboard.rankings()</div><h2>Leaderboard Matrix</h2><p>Top performing students based on XP and achievements.</p></div></div>
              <div className="matrix-panel">
                {leaderboard.map((entry, index) => (
                  <div className={`matrix-row ${index === 0 ? 'rank-gold' : index === 1 ? 'rank-silver' : index === 2 ? 'rank-bronze' : ''}`} key={entry.id || index}>
                    <div className="matrix-rank">#{index + 1}</div>
                    <div className="matrix-user-info">
                      <strong>{entry.name}</strong>
                      <span>Level {entry.level || 1} Student</span>
                    </div>
                    <div className="matrix-xp-badge">
                      <Pill tone="green">{entry.xp || 0} XP</Pill>
                    </div>
                  </div>
                ))}
                {!leaderboard.length && (
                  <div style={{ padding: '40px', textAlign: 'center', color: 'var(--muted)' }}>
                    <h4>Leaderboard Matrix Initializing...</h4>
                    <p>Rankings will update as verified XP is distributed.</p>
                  </div>
                )}
              </div>
            </section>
          )}

          {tab === 'events' && (
            <section className="page-section">
              <div className="section-heading"><div><div className="section-kicker">&gt; events.schedule()</div><h2>Events & Expos</h2><p>Upcoming academic events, workshops, and exhibitions.</p></div></div>
              <div className="resource-grid">
                {events.map((event) => (
                  <article className="resource-card event-card" key={event.id || event.title}>
                    <div className="card-top">
                      <div className="card-icon">❖</div>
                      <span className="event-badge">LIVE OP</span>
                    </div>
                    <h3 className="card-title">{event.title}</h3>
                    <p className="card-description">{event.description || ''}</p>
                    <div className="event-details-box">
                      <div>📅 {formatDate(event.date)}</div>
                      <div>📍 {event.location || 'University Campus'}</div>
                    </div>
                  </article>
                ))}
                {!events.length && (
                  <div className="radar-empty-state" style={{ gridColumn: '1 / -1', padding: '40px' }}>
                    <div className="radar-sweep-effect"></div>
                    <div className="radar-content">
                      <div className="radar-tag">[!] EVENTS RADAR STANDBY</div>
                      <h4>No Live Expos Scheduled</h4>
                      <p>Exhibitions and faculty events will appear here upon announcement.</p>
                    </div>
                  </div>
                )}
              </div>
            </section>
          )}

          {tab === 'resources' && (
            <section className="page-section">
              <div className="section-heading"><div><div className="section-kicker">&gt; resources.library()</div><h2>Resources & Materials</h2><p>Instructor shared files, references, and documentation.</p></div></div>
              <div className="resource-grid">
                {resources.map((res) => (
                  <article className="resource-card resource-file-card" key={res.id || res.title}>
                    <div className="card-top">
                      <div className="card-icon">📁</div>
                      <span className="file-ext">DOC</span>
                    </div>
                    <h3 className="card-title">{res.title}</h3>
                    <p className="card-description">{res.description || 'Shared academic resource document.'}</p>
                    {res.link && (
                      <div className="card-footer" style={{ marginTop: 14 }}>
                        <button className="btn btn-primary" onClick={() => window.open(res.link, '_blank', 'noopener,noreferrer')}>ACCESS FILE</button>
                      </div>
                    )}
                  </article>
                ))}
                {!resources.length && (
                  <div className="classified-box" style={{ gridColumn: '1 / -1', padding: '30px' }}>
                    <div className="classified-header">[LIBRARY VAULT SECURE]</div>
                    <p>Instructor documentation and reference files are currently uploading.</p>
                  </div>
                )}
              </div>
            </section>
          )}
        </section>
      </div>

{selectedChallenge && (
        <div className="modal-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) setSelectedChallenge(null); }}>
          <article className="terminal-modal-card" style={{ maxWidth: '750px', width: '100%' }}>
            <div className="auth-terminal-chrome" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 18px', borderBottom: '1px solid var(--line)', background: 'rgba(0,0,0,0.4)' }}>
              <div style={{ display: 'flex', gap: '6px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ff5f56', display: 'inline-block' }}></span>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ffbd2e', display: 'inline-block' }}></span>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#27c93f', display: 'inline-block' }}></span>
                <span style={{ marginLeft: '10px', font: '11px monospace', color: 'var(--muted)' }}>bsie://challenge.inspect({selectedChallenge.title})</span>
              </div>
              <button className="icon-button" onClick={() => setSelectedChallenge(null)} style={{ width: '28px', height: '28px', fontSize: '14px' }}>×</button>
            </div>

            <div style={{ padding: '24px', maxHeight: '80vh', overflowY: 'auto', fontFamily: 'monospace' }}>
              <div style={{ color: 'var(--accent)', fontSize: '11px', marginBottom: '8px' }}>&gt; challenge.details()</div>
              <h2 style={{ margin: '0 0 16px', fontSize: '20px', color: 'var(--text)', fontFamily: 'Inter' }}>{selectedChallenge.title}</h2>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginBottom: '16px' }}>
                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '10px', border: '1px solid var(--line)' }}>
                  <span style={{ fontSize: '9px', color: 'var(--muted)' }}>REWARD XP</span>
                  <div style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--accent)' }}>+{selectedChallenge.reward || 0} XP</div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '10px', border: '1px solid var(--line)' }}>
                  <span style={{ fontSize: '9px', color: 'var(--muted)' }}>DIFFICULTY</span>
                  <div style={{ fontSize: '14px', fontWeight: 'bold' }}>{selectedChallenge.difficulty || 'Intermediate'}</div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '10px', border: '1px solid var(--line)' }}>
                  <span style={{ fontSize: '9px', color: 'var(--muted)' }}>START DATE</span>
                  <div style={{ fontSize: '11px' }}>{formatDate ? formatDate(selectedChallenge.startDate) : selectedChallenge.startDate}</div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '10px', border: '1px solid var(--line)' }}>
                  <span style={{ fontSize: '9px', color: 'var(--muted)' }}>DEADLINE</span>
                  <div style={{ fontSize: '11px', color: 'var(--orange)' }}>{formatDate ? formatDate(selectedChallenge.deadline) : selectedChallenge.deadline}</div>
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <span style={{ fontSize: '9px', color: 'var(--muted)', display: 'block', marginBottom: '6px' }}>INSTRUCTIONS & DESCRIPTION</span>
                <div style={{ background: 'rgba(0,0,0,0.4)', padding: '16px', borderRadius: '12px', border: '1px solid var(--line)', color: 'var(--soft)', fontSize: '12px', lineHeight: '1.6', fontFamily: 'Inter', whiteSpace: 'pre-wrap' }}>
                  {selectedChallenge.description || 'No instructions provided.'}
                </div>
              </div>

              {/* قسم عرض المرفقات والروابط في حال وجودها */}
              {(selectedChallenge.resourceLink || selectedChallenge.file || selectedChallenge.imageUrl) && (
                <div style={{ marginBottom: '20px', padding: '12px', background: 'rgba(141,255,202,.04)', borderLeft: '3px solid var(--accent)', borderRadius: '0 8px 8px 0' }}>
                  <span style={{ fontSize: '10px', color: 'var(--muted)', display: 'block', marginBottom: '6px' }}>ATTACHMENTS & RESOURCES:</span>
                  
                  {selectedChallenge.resourceLink && (
                    <div style={{ marginBottom: '6px' }}>
                      <a href={selectedChallenge.resourceLink} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)', fontSize: '11px', textDecoration: 'underline' }}>
                        🔗 Reference Link ↗
                      </a>
                    </div>
                  )}

                  {(selectedChallenge.file || selectedChallenge.imageUrl) && (
                    <div>
                      <a href={selectedChallenge.file || selectedChallenge.imageUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--blue)', fontSize: '11px', textDecoration: 'underline' }}>
                        📎 Download Attachment / File ↗
                      </a>
                    </div>
                  )}
                </div>
              )}

              {/* زر قبول التحدي ونموذج التسليم */}
              {!challengeAccepted ? (
                <div style={{ marginTop: '20px' }}>
                  <button 
                    className="btn btn-primary" 
                    style={{ width: '100%', fontFamily: 'Inter' }} 
                    disabled={busy} 
                    onClick={() => {
                      if (!user) {
                        setSelectedChallenge(null);
                        openAuthModal();
                      } else {
                        acceptChallenge(selectedChallenge);
                      }
                    }}
                  >
                    {busy ? 'PROCESSING...' : (user ? '⚡ ACCEPT CHALLENGE & UNLOCK PORTAL' : '🔑 SIGN IN TO ACCEPT')}
                  </button>
                </div>
              ) : (
                /* هنا يوضع فورم التسليم (Submission Form) */
                <div style={{ borderTop: '1px solid var(--line)', paddingTop: '16px', marginTop: '16px' }}>
                  <span style={{ color: 'var(--accent)', fontSize: '11px', display: 'block', marginBottom: '10px' }}>&gt; submission.portal()</span>
                  {/* بقية حقول إدخال الحل */}
                </div>
              )}
            </div>
          </article>
        </div>
      )}

{!challengeAccepted ? (
                <div style={{ marginTop: '20px' }}>
                  <button 
                    className="btn btn-primary" 
                    style={{ width: '100%', fontFamily: 'Inter' }} 
                    disabled={busy} 
                    onClick={() => {
                      if (!user) {
                        setSelectedChallenge(null);
                        openAuthModal(); // فتح نافذة تسجيل الدخول إذا لم يكن مسجلاً
                      } else {
                        acceptChallenge(selectedChallenge); // قبول التحدي وفتح فورم التسليم إذا كان مسجلاً
                      }
                    }}
                  >
                    {busy ? 'PROCESSING...' : (user ? '⚡ ACCEPT CHALLENGE & UNLOCK PORTAL' : '🔑 SIGN IN TO ACCEPT')}
                  </button>
                </div>
              ) : (
                // هنا يظهر فورم التسليم (رابط الجيت هاب، رفع الملف، إدخال الآيدي، وملاحظات الدكتور)
                <form onSubmit={submitSolution} style={{ borderTop: '1px solid var(--line)', paddingTop: '20px', marginTop: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                    <span style={{ color: 'var(--accent)', fontSize: '11px' }}>&gt; submission.portal()</span>
                    <Pill tone="green">ACCEPTED ✓</Pill>
                  </div>
                  
                  <label className="field-label" style={{ fontFamily: 'Inter' }}>GITHUB / PROJECT LINK</label>
                  <input className="search-input" value={submission.link} onChange={(e) => setSubmission({ ...submission, link: e.target.value })} placeholder="https://github.com/..." style={{ fontFamily: 'Inter' }} />

                  <label className="field-label" style={{ fontFamily: 'Inter' }}>ATTACH SOLUTION FILE (PDF/ZIP/IMG)</label>
                  <input className="search-input file-input" type="file" onChange={(e) => setSubmission({ ...submission, file: e.target.files?.[0] || null })} />

                  <label className="field-label" style={{ fontFamily: 'Inter' }}>NOTE TO INSTRUCTOR</label>
                  <textarea className="search-input" style={{ minHeight: 90, padding: 12, fontFamily: 'Inter' }} value={submission.note} onChange={(e) => setSubmission({ ...submission, note: e.target.value })} placeholder="Write your notes or summary for the instructor..." />

                  <div className="modal-actions" style={{ fontFamily: 'Inter' }}>
                    <button type="submit" className="btn btn-primary" disabled={busy}>{busy ? 'SUBMITTING...' : 'SUBMIT SOLUTION TO INSTRUCTOR'}</button>
                    <button type="button" className="btn" onClick={() => setSelectedChallenge(null)}>CLOSE</button>
                  </div>
                </form>
              )}
            </div>
          </article>
        </div>
      )}

      {/* نافذة تسجيل الدخول (Auth Modal) */}
      {authModal && (
        <div className="modal-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) closeAuthModal(); }}>
          <article className="terminal-modal-card" style={{ maxWidth: '520px' }}>
            <div className="auth-terminal-chrome" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 18px', borderBottom: '1px solid var(--line)', background: 'rgba(0,0,0,0.4)' }}>
              <div style={{ display: 'flex', gap: '6px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ff5f56', display: 'inline-block' }}></span>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ffbd2e', display: 'inline-block' }}></span>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#27c93f', display: 'inline-block' }}></span>
                <span style={{ marginLeft: '10px', font: '11px monospace', color: 'var(--muted)' }}>bsie://auth.utb()</span>
              </div>
              <button className="icon-button" onClick={closeAuthModal} disabled={busy} style={{ width: '28px', height: '28px', fontSize: '14px' }}>×</button>
            </div>

            <div style={{ padding: '24px', fontFamily: 'monospace' }}>
              <div style={{ color: 'var(--accent)', fontSize: '11px', marginBottom: '8px' }}>&gt; auth.session()</div>
              <h2 style={{ margin: '0 0 16px', fontSize: '20px', color: 'var(--text)', fontFamily: 'Inter' }}>University Identity Terminal</h2>

              {authStep === 1 && (
                <div>
                  <p style={{ color: 'var(--muted)', fontSize: '12px', marginBottom: '20px', fontFamily: 'Inter' }}>Select your access role to proceed:</p>
                  <div style={{ display: 'grid', gap: '10px' }}>
                    <button className="btn" style={{ justifyContent: 'flex-start', fontFamily: 'Inter' }} onClick={() => selectAuthRole('student')}>
                      ⚡ STUDENT WORKSPACE
                    </button>
                  </div>
                </div>
              )}

              {authStep === 2 && (
                <div>
                  <p style={{ color: 'var(--muted)', fontSize: '12px', marginBottom: '16px', fontFamily: 'Inter' }}>Enter your university credentials to receive a verification code.</p>
                  
                  <label className="field-label" style={{ fontFamily: 'Inter' }}>UNIVERSITY EMAIL</label>
                  <input className="search-input" type="email" value={utbEmail} onChange={(e) => setUtbEmail(e.target.value)} placeholder="student@utb.edu.bh" style={{ fontFamily: 'Inter', marginBottom: '12px' }} />

                  <label className="field-label" style={{ fontFamily: 'Inter' }}>STUDENT ID</label>
                  <input className="search-input" value={studentId} onChange={(e) => setStudentId(e.target.value)} placeholder="e.g. 20260000" style={{ fontFamily: 'Inter', marginBottom: '16px' }} />

                  {otpError && <div style={{ color: 'var(--danger)', fontSize: '11px', marginBottom: '12px' }}>{otpError}</div>}

                  <div className="modal-actions" style={{ fontFamily: 'Inter' }}>
                    <button className="btn btn-primary" disabled={busy} onClick={requestOtp}>{busy ? 'SENDING...' : 'SEND OTP CODE →'}</button>
                    <button className="btn" onClick={() => setAuthStep(1)}>BACK</button>
                  </div>
                </div>
              )}

              {authStep === 3 && (
                <div>
                  <p style={{ color: 'var(--muted)', fontSize: '12px', marginBottom: '16px', fontFamily: 'Inter' }}>Enter the 6-digit verification code sent to <strong>{utbEmail}</strong>.</p>
                  {otpMessage && <div style={{ color: 'var(--accent)', fontSize: '11px', marginBottom: '12px' }}>{otpMessage}</div>}

                  <label className="field-label" style={{ fontFamily: 'Inter' }}>6-DIGIT CODE</label>
                  <input className="search-input" maxLength={6} value={otpCode} onChange={(e) => setOtpCode(e.target.value)} placeholder="______" style={{ textAlign: 'center', letterSpacing: '6px', fontSize: '18px', fontFamily: 'monospace', marginBottom: '16px' }} />

                  {otpError && <div style={{ color: 'var(--danger)', fontSize: '11px', marginBottom: '12px' }}>{otpError}</div>}

                  <div className="modal-actions" style={{ fontFamily: 'Inter' }}>
                    <button className="btn btn-primary" disabled={busy || otpCode.length !== 6} onClick={verifyOtp}>{busy ? 'VERIFYING...' : 'VERIFY & SIGN IN'}</button>
                    <button className="btn" onClick={() => setAuthStep(2)}>CHANGE EMAIL</button>
                  </div>
                </div>
              )}
            </div>
          </article>
        </div>
      )}

      <style jsx global>{`
        :root{--bg:#050d0c;--panel:rgba(12,25,24,.88);--line:rgba(147,255,202,.15);--line-strong:rgba(147,255,202,.3);--text:#eefdf7;--muted:#8ca9a1;--soft:#b7ccc6;--accent:#8dffca;--accent-2:#54e5a2;--orange:#ffb86b;--blue:#80c8ff;--danger:#ff8585;--shadow:0 24px 80px rgba(0,0,0,.4)}
        *{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--text);font-family:Inter,ui-sans-serif,system-ui,sans-serif}button,input,textarea,select{font:inherit}
        .community-shell{min-height:100vh;position:relative;overflow-x:hidden}.topbar{height:72px;position:sticky;top:0;z-index:50;display:flex;align-items:center;justify-content:space-between;padding:0 24px;border-bottom:1px solid var(--line);background:rgba(5,14,13,.9);backdrop-filter:blur(24px)}
        .brand{display:flex;align-items:center;gap:12px;background:none;border:0;color:inherit;cursor:pointer}.brand-mark{width:38px;height:38px;border-radius:11px;display:grid;place-items:center;color:#06120d;background:var(--accent);font-weight:900}.brand-copy{text-align:left}.brand-title{font-size:14px;font-weight:800}.brand-path{color:var(--muted);font-size:11px}.top-actions{display:flex;align-items:center;gap:10px}.profile-mini{display:flex;align-items:center;gap:10px;padding:4px 8px}.avatar{width:34px;height:34px;border-radius:50%;display:grid;place-items:center;background:rgba(141,255,202,.22);color:var(--accent);font-weight:800;font-size:12px}.profile-name{font-size:12px;font-weight:700}.profile-level{color:var(--muted);font-size:10px}
        .layout{display:grid;grid-template-columns:250px minmax(0,1fr);min-height:calc(100vh - 72px)}.sidebar{border-right:1px solid var(--line);padding:22px 14px;background:rgba(4,11,10,.65);position:sticky;top:72px;height:calc(100vh - 72px);overflow-y:auto}.terminal-label{color:var(--muted);font-size:10px;text-transform:uppercase;padding:0 12px 12px;letter-spacing:.08em}.nav{display:grid;gap:6px}.nav-item{width:100%;border:0;background:transparent;color:var(--muted);display:flex;align-items:center;gap:11px;padding:12px 14px;border-radius:12px;text-align:left;cursor:pointer;transition:all .2s ease}.nav-item:hover{background:rgba(141,255,202,.05);color:var(--text)}.nav-item.active{background:rgba(141,255,202,.12);color:var(--accent);box-shadow:inset 3px 0 0 var(--accent);font-weight:700}.nav-label{flex:1;font-size:12px}.nav-icon{width:22px;text-align:center;font-size:14px}
        
        .sidebar-terminal{margin-top:28px;padding:14px;border:1px solid var(--line);border-radius:14px;background:rgba(0,0,0,.4)}
        .sidebar-terminal-title{color:var(--accent);font-size:10px;font-weight:700;margin-bottom:8px}
        .terminal-logs{max-height:110px;overflow-y:auto;font-family:monospace;font-size:9.5px;color:var(--muted);line-height:1.5;margin-bottom:8px}
        .terminal-log-line{word-break:break-all}
        .terminal-form{display:flex;align-items:center;gap:6px;border-top:1px solid var(--line);padding-top:8px}
        .term-prompt{color:var(--accent);font-size:11px;font-weight:900}
        .term-input{background:transparent;border:0;color:var(--text);font-size:10px;outline:none;font-family:monospace;width:100%}

        .radar-empty-state{position:relative;border:1px solid var(--line);border-radius:18px;background:rgba(8,20,18,.9);padding:30px;text-align:center;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,.3)}
        .radar-sweep-effect{position:absolute;inset:0;background:radial-gradient(circle at center,rgba(141,255,202,.08) 0%,transparent 70%);animation:radarPulse 3s infinite ease-in-out;pointer-events:none}
        @keyframes radarPulse{0%{transform:scale(0.8);opacity:0.4}50%{transform:scale(1.2);opacity:0.8}100%{transform:scale(0.8);opacity:0.4}}
        .radar-content{position:relative;z-index:2}
        .radar-tag{font-size:9px;color:var(--accent);font-weight:800;letter-spacing:.15em;margin-bottom:8px}
        .radar-content h4{margin:6px 0;font-size:16px;color:var(--text)}
        .radar-content p{font-size:11px;color:var(--muted);margin-bottom:16px}

        .classified-box{border:1px solid var(--line);border-radius:16px;background:rgba(15,28,26,.85);padding:22px;text-align:center}
        .classified-header{font-size:9px;color:var(--orange);font-weight:800;letter-spacing:.15em;margin-bottom:8px}
        .classified-box p{font-size:11px;color:var(--muted);line-height:1.6;margin-bottom:14px}

        .readiness-meter-box{margin-top:20px;padding:14px 18px;border:1px solid var(--line);border-radius:14px;background:rgba(0,0,0,.35)}
        .meter-header{display:flex;justify-content:space-between;align-items:center;font-size:9.5px;color:var(--accent);font-weight:800;letter-spacing:.1em;margin-bottom:8px}
        .pulse-dot{width:8px;height:8px;border-radius:50%;background:var(--accent);box-shadow:0 0 10px var(--accent);animation:blink 1.5s infinite}
        @keyframes blink{0%{opacity:1}50%{opacity:0.3}100%{opacity:1}}
        .progress-bar-track{width:100%;height:6px;border-radius:99px;background:rgba(255,255,255,.05);overflow:hidden;margin-bottom:8px}
        .progress-bar-fill{width:100%;height:100%;background:linear-gradient(90deg,var(--accent-2),var(--accent));box-shadow:0 0 10px rgba(141,255,202,.5)}
        .ticker-text{font-size:10px;color:var(--muted);font-family:monospace}

        .main{min-width:0;padding:36px;max-width:1600px;width:100%;margin:0 auto}.hero{position:relative;min-height:340px;border:1px solid var(--line);border-radius:24px;padding:36px;background:linear-gradient(135deg,rgba(12,28,26,.85),rgba(6,16,15,.95));overflow:hidden;box-shadow:var(--shadow)}.hero-kicker,.section-kicker{color:var(--accent);font-size:10px;text-transform:uppercase;letter-spacing:.1em;margin-bottom:8px;font-weight:700}.hero h1{font-size:42px;margin:0;letter-spacing:-.02em}.hero h1 span{color:var(--accent)}.hero-copy{color:var(--soft);font-size:14px;line-height:1.7;max-width:700px;margin-top:12px}.hero-actions{display:flex;gap:12px;flex-wrap:wrap;margin-top:20px}.terminal-orb{position:absolute;width:320px;height:320px;border-radius:50%;right:-80px;top:-100px;border:1px solid rgba(141,255,202,.12);background:radial-gradient(circle,rgba(141,255,202,.05) 0%,transparent 70%)}
        .stats-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-top:20px}.stat-card{border:1px solid var(--line);border-radius:18px;padding:22px;background:var(--panel);box-shadow:0 10px 30px rgba(0,0,0,.2)}.stat-label{color:var(--muted);font-size:10px;text-transform:uppercase;letter-spacing:.08em}.stat-value{margin-top:10px;font-size:28px;font-weight:900;color:var(--text)}.stat-extra{color:var(--accent);font-size:10px;margin-top:6px;font-weight:600}.two-column{display:grid;grid-template-columns:1fr 1fr;gap:20px}.section-spacer{margin-top:28px}
        .panel{border:1px solid var(--line);border-radius:20px;background:var(--panel);overflow:hidden;box-shadow:0 15px 40px rgba(0,0,0,.25)}.panel-header{padding:22px;display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid var(--line)}.panel-title{margin:0;font-size:15px;font-weight:750}.panel-subtitle{color:var(--muted);font-size:10px;margin-top:4px}.panel-body{padding:22px}.section-heading{margin-bottom:24px}.section-heading h2{margin:0;font-size:30px;font-weight:800;letter-spacing:-.02em}.section-heading p{color:var(--muted);font-size:12px;margin-top:6px}
        .toolbar{display:flex;gap:14px;align-items:center;flex-wrap:wrap}.filter-row{display:flex;gap:8px;overflow-x:auto}.filter{height:40px;padding:0 16px;border-radius:12px;border:1px solid var(--line);background:rgba(255,255,255,.02);color:var(--muted);font-size:11px;font-weight:700;white-space:nowrap;cursor:pointer;transition:all .2s}.filter:hover{border-color:var(--accent);color:var(--text)}.filter.active{color:#06120d;background:var(--accent);border-color:var(--accent)}
        .search-input{width:100%;height:44px;border:1px solid var(--line);border-radius:13px;background:rgba(255,255,255,.03);color:var(--text);padding:0 16px;font-size:12px;outline:none;transition:border-color .2s}.toolbar>.search-input{max-width:380px}.search-input:focus{border-color:var(--accent);box-shadow:0 0 0 3px rgba(141,255,202,.1)}textarea.search-input{height:auto;resize:vertical}.field-label{display:block;margin:18px 0 8px;color:var(--muted);font-size:10px;letter-spacing:.1em;font-weight:700}.file-input{color:var(--muted)}
        .resource-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:18px}.resource-card{border:1px solid var(--line);border-radius:20px;background:var(--panel);padding:22px;box-shadow:0 10px 30px rgba(0,0,0,.25);transition:transform .2s,border-color .2s}.resource-card:hover{transform:translateY(-3px);border-color:var(--line-strong)}.card-top,.card-footer{display:flex;justify-content:space-between;align-items:center;gap:10px}.card-icon{width:50px;height:50px;border-radius:15px;display:grid;place-items:center;font-size:22px;border:1px solid var(--line);background:rgba(141,255,202,.05)}.challenge-type{color:var(--muted);font-size:10px;text-transform:uppercase;margin-top:14px;letter-spacing:.08em;font-weight:700}.card-title{font-size:16px;margin:12px 0 8px;font-weight:800}.card-description{color:var(--muted);font-size:11px;line-height:1.7;min-height:54px}.project-author{color:var(--accent);font-size:10px;margin-top:12px;font-weight:600}.date-box{margin:14px 0;padding:12px;border-left:3px solid var(--accent);color:var(--soft);font-size:10px;line-height:1.7;background:rgba(141,255,202,.03);border-radius:0 10px 10px 0}.tag-list{display:flex;flex-wrap:wrap;gap:6px;margin-top:14px}.project-stats{color:var(--muted);font-size:10px}
        
        .squad-card{background:linear-gradient(135deg,rgba(15,32,30,.9),rgba(8,18,17,.95))}
        .squad-members-box{margin-top:16px;padding:12px;border-radius:12px;background:rgba(0,0,0,.3);border:1px solid var(--line)}
        .squad-label{font-size:9px;color:var(--muted);text-transform:uppercase;letter-spacing:.1em;display:block;margin-bottom:4px}
        .squad-list{font-size:11px;color:var(--accent);font-weight:600}
        
        .project-box{border-top:3px solid var(--blue)}
        .tech-stack-tags{display:flex;flex-wrap:wrap;gap:6px;margin-top:16px}
        .tech-tag{font-size:9px;padding:4px 10px;border-radius:6px;background:rgba(128,200,255,.08);color:var(--blue);font-weight:700}
        
        .idea-card{border-top:3px solid var(--orange)}
        .idea-author{margin-top:16px;font-size:10px;color:var(--muted)}
        .idea-author span{color:var(--orange);font-weight:700}

        .matrix-panel{border:1px solid var(--line);border-radius:20px;background:var(--panel);overflow:hidden;box-shadow:0 15px 40px rgba(0,0,0,.25)}
        .matrix-row{display:grid;grid-template-columns:60px 1fr auto;gap:16px;align-items:center;padding:18px 24px;border-top:1px solid var(--line);transition:background .2s}
        .matrix-row:first-child{border-top:0}
        .matrix-row:hover{background:rgba(141,255,202,.03)}
        .matrix-rank{font-size:16px;font-weight:900;color:var(--muted)}
        .matrix-user-info strong{display:block;font-size:14px;color:var(--text)}
        .matrix-user-info span{font-size:11px;color:var(--muted);margin-top:2px;display:block}
        .rank-gold{background:rgba(255,215,0,.04);border-left:4px solid #ffd700}.rank-gold .matrix-rank{color:#ffd700}
        .rank-silver{background:rgba(192,192,192,.04);border-left:4px solid #c0c0c0}.rank-silver .matrix-rank{color:#c0c0c0}
        .rank-bronze{background:rgba(205,127,50,.04);border-left:4px solid #cd7f32}.rank-bronze .matrix-rank{color:#cd7f32}

        .event-card{border-top:3px solid var(--accent)}
        .event-badge{font-size:9px;padding:4px 8px;border-radius:6px;background:rgba(141,255,202,.1);color:var(--accent);font-weight:800}
        .event-details-box{margin-top:16px;display:grid;gap:6px;font-size:11px;color:var(--soft)}

        .resource-file-card{border-top:3px solid var(--soft)}
        .file-ext{font-size:9px;padding:4px 8px;border-radius:6px;background:rgba(183,204,198,.1);color:var(--soft);font-weight:800}

        .btn{min-height:44px;border-radius:13px;padding:0 20px;border:1px solid var(--line);background:rgba(255,255,255,.025);color:var(--soft);font-size:12px;font-weight:750;cursor:pointer;transition:all .2s}.btn:hover{background:rgba(141,255,202,.08);color:var(--accent);border-color:var(--line-strong)}.btn-primary{background:var(--accent);color:#06120d;border-color:var(--accent)}.btn-danger-outline{border-color:rgba(255,133,133,.3);color:var(--danger)}.btn-danger-outline:hover{background:rgba(255,133,133,.1);color:var(--danger);border-color:var(--danger)}
        .task-row{display:grid;grid-template-columns:1fr auto;gap:14px;align-items:center;padding:16px 0;border-top:1px solid var(--line)}.task-row:first-child{border-top:0}.task-meta{color:var(--muted);font-size:10px;margin-top:4px}
        .pill{display:inline-flex;align-items:center;min-height:26px;padding:0 10px;border-radius:999px;border:1px solid var(--line);font-size:10px;font-weight:750}.pill-green{color:var(--accent);background:rgba(141,255,202,.08)}.pill-orange{color:var(--orange);background:rgba(255,184,107,.08)}.pill-blue{color:var(--blue);background:rgba(128,200,255,.08)}.pill-red{color:var(--danger);background:rgba(255,133,133,.08)}
        .toast{position:fixed;left:50%;bottom:24px;transform:translateX(-50%);z-index:200;border:1px solid var(--line-strong);border-radius:14px;background:rgba(6,17,15,.96);color:var(--soft);padding:12px 20px;font-size:12px;font-weight:700;box-shadow:0 10px 30px rgba(0,0,0,.5)}
        
        .modal-backdrop{position:fixed;inset:0;z-index:1000;display:grid;place-items:center;padding:20px;background:rgba(0,0,0,.78);backdrop-filter:blur(12px)}
        .terminal-modal-card{width:min(760px,100%);max-height:92vh;overflow:auto;border:1px solid rgba(141,255,202,.3);border-radius:22px;background:linear-gradient(180deg,rgba(8,20,18,.99),rgba(4,11,10,.99));box-shadow:0 35px 120px rgba(0,0,0,.6),0 0 70px rgba(141,255,202,.08)}
        
        .modal-actions{display:flex;gap:10px;flex-wrap:wrap;margin-top:24px}.icon-button{width:36px|;height:36px;border:1px solid var(--line);background:rgba(255,255,255,.025);color:var(--soft);border-radius:10px;cursor:pointer;display:grid;place-items:center}.link-button{border:0;background:none;color:var(--accent);cursor:pointer;font-size:10px;font-weight:700}
        @media(max-width:1200px){.resource-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.two-column{grid-template-columns:1fr}}@media(max-width:900px){.layout{grid-template-columns:1fr}.sidebar{position:fixed;z-index:60;left:0;top:72px;width:270px;transform:translateX(-105%)}.sidebar.open{transform:translateX(0)}.main{padding:20px}.stats-grid{grid-template-columns:repeat(2,1fr)}.profile-mini{display:none}}@media(max-width:640px){.topbar{padding:0 13px;height:64px}.sidebar{top:64px;height:calc(100vh - 64px)}.main{padding:14px;padding-bottom:80px}.hero{padding:21px}.hero h1{font-size:38px}.stats-grid,.resource-grid{grid-template-columns:1fr}.toolbar>.search-input{max-width:none}.modal-actions{flex-direction:column}.modal-actions .btn{width:100%}}
      `}</style>
    </main>
  );
}