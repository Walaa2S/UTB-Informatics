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

function EmptyState({ icon = '⌘', title, text, action }) {
  return <div className="empty-state"><div className="empty-icon">{icon}</div><h3>{title}</h3><p>{text}</p>{action}</div>;
}

function Pill({ tone = 'green', children }) {
  return <span className={`pill pill-${tone}`}>{children}</span>;
}

function initials(name = '') {
  return String(name).trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase() || 'IN';
}

const emptyForm = {
  title: '',
  description: '',
  category: '',
  reward: '',
  startDate: '',
  deadline: '',
  difficulty: 'Intermediate',
  submissionType: 'Code / GitHub Link',
  resourceLink: '',
  file: null,
  type: 'Technical',
};

export default function InstructorDashboardPage() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('overview');
  const [toast, setToast] = useState('');
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editingChallenge, setEditingChallenge] = useState(null);
  const [editForm, setEditForm] = useState(emptyForm);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [reviewNote, setReviewNote] = useState('');
  const [search, setSearch] = useState('');

  // حالات خاصة بنافذة التأكيد المخصصة للحذف بدل window.confirm
  const [deleteTarget, setDeleteTarget] = useState(null);

  const role = String(dashboard?.user?.role || '').toLowerCase();
  const stats = dashboard?.stats || {};
  const challenges = dashboard?.challenges || [];
  const submissions = dashboard?.submissions || [];
  const students = dashboard?.students || [];
  const events = dashboard?.events || [];
  const resources = dashboard?.resources || [];
  const reports = dashboard?.reports || [];

  const visibleChallenges = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return challenges;
    return challenges.filter((item) =>
      [item.title, item.category, item.description, item.type]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(q)
    );
  }, [challenges, search]);

  function showToast(message) {
    setToast(message);
    window.clearTimeout(window.__instructorToast);
    window.__instructorToast = window.setTimeout(() => setToast(''), 3200);
  }

  async function load() {
    setLoading(true);
    try {
      const data = await apiFetch('/instructor/dashboard').catch(() => ({}));
      const challengesData = await apiFetch('/challenges').catch(() => []);

      const userRole = String(data?.user?.role || '').toLowerCase();
      // حراسة الصلاحيات: إذا لم يكن المستخدم مسجلاً أو لم يكن معلماً
      if (data?.user && userRole !== 'instructor' && userRole !== 'admin') {
        showToast('Access restricted: Instructor role required.');
        setTimeout(() => { window.location.href = '/community'; }, 1500);
        return;
      }
      
      setDashboard({
        ...(data || {}),
        challenges: Array.isArray(challengesData) ? challengesData : (data?.challenges || [])
      });
    } catch (error) {
      showToast(error?.message || 'Could not load instructor dashboard.');
      const fallbackChallenges = await apiFetch('/challenges').catch(() => []);
      setDashboard({
        user: null,
        stats: {},
        challenges: fallbackChallenges,
        submissions: [],
        students: [],
        events: [],
        resources: [],
        reports: [],
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function mutate(path, method = 'POST', body) {
    setBusy(true);
    try {
      const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;
      await apiFetch(path, {
        method,
        body: isFormData ? body : (body == null ? undefined : JSON.stringify(body)),
      });
      await load();
      showToast('Saved successfully.');
      return true;
    } catch (error) {
      showToast(error?.message || 'Action failed.');
      return false;
    } finally {
      setBusy(false);
    }
  }

  function makeFormData(values) {
    const fd = new FormData();
    Object.entries(values).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') fd.append(key, value);
    });
    return fd;
  }

async function createChallenge(event) {
    event.preventDefault();
    if (!form.title.trim() || !form.category.trim()) {
      showToast('Please fill in required fields.');
      return;
    }

    const challengeData = {
      ...form,
      startDate: form.startDate || new Date().toISOString().slice(0, 16),
      reward: form.reward ? Number(form.reward) : 100, // قيمة افتراضية للنقاط إن لم تُحدد
    };

    const ok = await mutate('/challenges', 'POST', makeFormData(challengeData));
    if (ok) {
      setForm(emptyForm);
      showToast('🚀 Challenge published successfully to students!');
    }
  }

  function startEdit(challenge) {
    setEditingChallenge(challenge);
    setEditForm({
      title: challenge.title || '',
      description: challenge.description || '',
      category: challenge.category || '',
      reward: challenge.reward ?? '',
      startDate: challenge.startDate ? new Date(challenge.startDate).toISOString().slice(0, 16) : '',
      deadline: challenge.deadline ? new Date(challenge.deadline).toISOString().slice(0, 16) : '',
      difficulty: challenge.difficulty || 'Intermediate',
      submissionType: challenge.submissionType || 'Code / GitHub Link',
      resourceLink: challenge.resourceLink || '',
      file: null,
      type: challenge.type || 'Technical',
    });
  }

  async function saveEdit(event) {
    event.preventDefault();
    const challengeId = editingChallenge?._id || editingChallenge?.id;
    if (!challengeId) return;

    const ok = await mutate(
      `/instructor/challenges/${challengeId}`,
      'PUT',
      makeFormData(editForm)
    );
    if (ok) {
      setEditingChallenge(null);
      setEditForm(emptyForm);
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    const id = typeof deleteTarget === 'object' ? (deleteTarget._id || deleteTarget.id) : deleteTarget;
    setDeleteTarget(null);

    if (!id) {
      showToast('Error: Challenge ID is undefined.');
      return;
    }

    await mutate(`/challenges/${id}`, 'DELETE');
  }

  async function reviewSubmission(id, status) {
    const body = { status, note: reviewNote.trim() || undefined };
    const ok = await mutate(`/instructor/submissions/${id}/review`, 'POST', body);
    if (ok) {
      setSelectedSubmission(null);
      setReviewNote('');
    }
  }

  async function moderateReport(id, status) {
    if (!id) return;
    await mutate(`/instructor/reports/${id}`, 'PATCH', { status });
  }

  const tabs = [
    ['overview', 'Overview'],
    ['challenges', 'Challenges'],
    ['submissions', 'Submissions'],
    ['students', 'Students'],
    ['events', 'Events'],
    ['resources', 'Resources'],
    ['moderation', 'Moderation'],
  ];

  return (
    <main className="community-shell">
      {toast && <div className="toast">{toast}</div>}

      <header className="topbar">
        <button className="brand" onClick={() => { window.location.href = '/'; }}>
          <div className="brand-mark">&gt;_</div>
          <div className="brand-copy">
            <div className="brand-title">BSIE Instructor Console</div>
            <div className="brand-path">BSIE://instructor</div>
          </div>
        </button>

        <div className="top-actions">
          <button className="btn" onClick={() => { window.location.href = '/'; }}>← Home</button>
          <div className="profile-mini">
            <div className="avatar">{initials(dashboard?.user?.name)}</div>
            <div>
              <div className="profile-name">{dashboard?.user?.name || 'Instructor'}</div>
              <div className="profile-level">{role ? role.toUpperCase() : 'INSTRUCTOR'}</div>
            </div>
          </div>
        </div>
      </header>

      <div className="layout">
        <aside className="sidebar open">
          <div className="terminal-label">~/instructor/community</div>
          <nav className="nav">
            {tabs.map(([id, label]) => (
              <button key={id} className={`nav-item ${tab === id ? 'active' : ''}`} onClick={() => setTab(id)}>
                <span className="nav-icon">
                  {id === 'overview' ? '⌂' : id === 'challenges' ? '⚡' : id === 'submissions' ? '✓' : id === 'students' ? '👥' : id === 'events' ? '◈' : id === 'resources' ? '▣' : '⚑'}
                </span>
                <span className="nav-label">{label}</span>
              </button>
            ))}
          </nav>

          <div className="sidebar-terminal">
            <div className="sidebar-terminal-title">&gt; instructor.status()</div>
            <p>
              connection: {loading ? 'checking' : 'online'}<br />
              role: {role || 'instructor'}<br />
              pending_reviews: {stats.pendingReviews ?? submissions.length}<br />
              active_students: {stats.activeStudents ?? students.length}<br />
              status: {loading ? 'syncing' : 'healthy'}
            </p>
          </div>
        </aside>

        <section className="main">
          {tab === 'overview' && (
            <>
              <section className="hero">
                <div className="terminal-orb" />
                <div className="hero-grid">
                  <div>
                    <div className="hero-kicker">&gt; instructor.boot()</div>
                    <h1>Manage.<br />Review.<br /><span>Empower.</span></h1>
                    <p className="hero-copy">A protected academic control center for publishing challenges, reviewing submissions, and tracking student progress.</p>
                  </div>
                </div>
              </section>

              <div className="stats-grid">
                {[
                  ['Active Students', stats.activeStudents ?? students.length, 'live'],
                  ['Open Challenges', stats.openChallenges ?? challenges.length, 'published'],
                  ['Pending Reviews', stats.pendingReviews ?? submissions.length, 'awaiting action'],
                  ['Community Reports', stats.openReports ?? reports.length, 'moderation queue'],
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
                    <div><h3 className="panel-title">Recent Submissions</h3><div className="panel-subtitle">Student work awaiting academic review</div></div>
                    <button className="btn" onClick={() => setTab('submissions')}>View all</button>
                  </div>
                  <div className="panel-body">
                    {submissions.slice(0, 5).map((item) => (
                      <div className="task-row" key={item._id || item.id}>
                        <div>
                          <strong>{item.studentName || item.student?.name || 'Student'}</strong>
                          <div className="task-meta">{item.challengeTitle || item.challenge?.title || 'Submission'} · {item.status || 'Pending'}</div>
                        </div>
                        <button className="btn btn-primary" onClick={() => { setSelectedSubmission(item); setReviewNote(''); }}>REVIEW</button>
                      </div>
                    ))}
                    {!submissions.length && <EmptyState icon="✓" title="No submissions waiting" text="New student submissions will appear here." />}
                  </div>
                </div>

                <div className="panel">
                  <div className="panel-header">
                    <div><h3 className="panel-title">System Snapshot</h3><div className="panel-subtitle">Current academic workspace</div></div>
                  </div>
                  <div className="panel-body">
                    <div className="level-box">
                      <div className="level-caption">PUBLISHED CHALLENGES</div>
                      <div className="level-number">{challenges.length}</div>
                      <div className="streak"><span>●</span><strong>{submissions.length}</strong><span>submissions in queue</span></div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {tab === 'challenges' && (
  <section className="page-section">
    <div className="section-heading">
      <div>
        <div className="section-kicker">&gt; instructor.challenges()</div>
        <h2>Challenge Management</h2>
        <p>Create, edit, publish and remove engineering challenges.</p>
      </div>
    </div>

    <form
      className="panel"
      onSubmit={createChallenge}
      style={{
        padding: '24px',
        background: 'rgba(15, 28, 27, 0.95)',
        border: '1px solid rgba(141, 255, 202, 0.2)',
      }}
    >
      <h3
        style={{
          margin: '0 0 16px 0',
          fontSize: '15px',
          color: 'var(--accent)',
        }}
      >
        + Create New Challenge
      </h3>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '14px',
          marginBottom: '14px',
        }}
      >
        <input
          className="search-input"
          placeholder="Challenge title"
          value={form.title}
          onChange={(e) =>
            setForm({
              ...form,
              title: e.target.value,
            })
          }
          required
        />

        <input
          className="search-input"
          placeholder="Category / Code"
          value={form.category}
          onChange={(e) =>
            setForm({
              ...form,
              category: e.target.value,
            })
          }
          required
        />

        <input
          className="search-input"
          placeholder="Reward XP"
          type="number"
          min="0"
          value={form.reward}
          onChange={(e) =>
            setForm({
              ...form,
              reward: e.target.value,
            })
          }
        />

        <select
          className="search-input custom-select"
          value={form.difficulty}
          onChange={(e) =>
            setForm({
              ...form,
              difficulty: e.target.value,
            })
          }
        >
          <option value="Beginner">Beginner</option>
          <option value="Intermediate">Intermediate</option>
          <option value="Advanced">Advanced</option>
        </select>

        <div>
          <label className="field-label">
            START DATE
          </label>

          <input
            className="search-input"
            type="datetime-local"
            value={form.startDate}
            onChange={(e) =>
              setForm({
                ...form,
                startDate: e.target.value,
              })
            }
          />
        </div>

        <div>
          <label className="field-label">
            DEADLINE
          </label>

          <input
            className="search-input"
            type="datetime-local"
            value={form.deadline}
            onChange={(e) =>
              setForm({
                ...form,
                deadline: e.target.value,
              })
            }
          />
        </div>

        <input
          className="search-input"
          placeholder="Reference / Resource Link"
          value={form.resourceLink}
          onChange={(e) =>
            setForm({
              ...form,
              resourceLink: e.target.value,
            })
          }
          style={{
            gridColumn: '1 / -1',
          }}
        />

        <div
          style={{
            gridColumn: '1 / -1',
          }}
        >
          <label className="field-label accent-label">
            📎 Attachment / Document / Image
          </label>

          <input
            className="search-input file-input"
            type="file"
            onChange={(e) =>
              setForm({
                ...form,
                file: e.target.files?.[0] || null,
              })
            }
          />
        </div>

        <textarea
          className="search-input"
          style={{
            minHeight: 110,
            gridColumn: '1 / -1',
            height: 'auto',
            padding: '12px',
          }}
          placeholder="Challenge description & instructions"
          value={form.description}
          onChange={(e) =>
            setForm({
              ...form,
              description: e.target.value,
            })
          }
          required
        />
      </div>

      <button
        className="btn btn-primary"
        disabled={busy}
        type="submit"
        style={{
          width: '100%',
          height: '44px',
          fontWeight: '800',
        }}
      >
        {busy
          ? 'PUBLISHING...'
          : '🚀 PUBLISH CHALLENGE TO STUDENTS'}
      </button>
    </form>

    <div className="toolbar section-spacer">
      <input
        className="search-input"
        placeholder="Search published challenges..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
    </div>

              <div className="resource-grid section-spacer">
                {visibleChallenges.map((item) => (
                  <article className="resource-card" key={item._id || item.id}>
                    <div className="card-top">
                      <Pill tone="green">{item.status || 'Open'}</Pill>
                      {item.difficulty && <span className="difficulty-tag">{item.difficulty}</span>}
                    </div>
                    <h3 className="card-title">{item.title}</h3>
                    <p className="card-description">{item.description || ''}</p>

                    {(item.startDate || item.deadline) && (
                      <div className="date-box">
                        {item.startDate && <>📅 From: {new Date(item.startDate).toLocaleString()}<br /></>}
                        {item.deadline && <>⏳ To: {new Date(item.deadline).toLocaleString()}</>}
                      </div>
                    )}

                    <div className="project-author">{item.category || '—'} · +{item.reward || 0} XP</div>
                    <div className="card-footer">
                      <button className="btn" onClick={() => startEdit(item)}>EDIT</button>
                      <button className="btn danger-btn" onClick={() => setDeleteTarget(item)}>DELETE</button>
                    </div>
                  </article>
                ))}
              </div>

              {!visibleChallenges.length && <EmptyState icon="⚡" title="No challenges published" text="Create the first challenge above." />}
            </section>
          )}

          {tab === 'submissions' && (
            <section className="page-section">
              <div className="section-heading"><div><div className="section-kicker">&gt; submissions.review()</div><h2>Submission Review</h2><p>Review, approve or reject student work with an optional note.</p></div></div>
              <div className="panel">
                <div className="panel-body">
                  {submissions.map((item) => (
                    <div className="task-row" key={item._id || item.id}>
                      <div>
                        <strong>{item.studentName || item.student?.name || 'Student'}</strong>
                        <div className="task-meta">{item.challengeTitle || item.challenge?.title || 'Submission'} · {item.status || 'Pending'}</div>
                      </div>
                      <button className="btn btn-primary" onClick={() => { setSelectedSubmission(item); setReviewNote(''); }}>OPEN REVIEW</button>
                    </div>
                  ))}
                  {!submissions.length && <EmptyState icon="✓" title="No submissions waiting" text="Nothing to review." />}
                </div>
              </div>
            </section>
          )}

          {tab === 'students' && (
            <section className="page-section">
              <div className="section-heading"><div><div className="section-kicker">&gt; students.directory()</div><h2>Students</h2><p>Read-only academic overview of students visible to this instructor.</p></div></div>
              <div className="resource-grid">
                {students.map((student) => (
                  <article className="resource-card" key={student._id || student.id}>
                    <div className="card-icon">👤</div>
                    <Pill tone="blue">LEVEL {student.level ?? '—'}</Pill>
                    <h3 className="card-title">{student.name || student.username || 'Student'}</h3>
                    <p className="card-description">{student.email || '—'}<br />XP: {student.xp ?? 0}</p>
                    <div className="project-author">{student.major || student.program || 'BSIE student'}</div>
                  </article>
                ))}
              </div>
              {!students.length && <EmptyState icon="👥" title="No students available" text="Student records will appear when the backend exposes instructor-visible students." />}
            </section>
          )}

          {tab === 'events' && (
            <section className="page-section">
              <div className="section-heading"><div><div className="section-kicker">&gt; events.schedule()</div><h2>Events</h2><p>Academic events currently visible to the instructor workspace.</p></div></div>
              <div className="resource-grid">
                {events.map((event) => (
                  <article className="resource-card" key={event._id || event.id}>
                    <div className="card-icon">{event.icon || '◈'}</div>
                    <Pill tone="orange">{event.type || 'Event'}</Pill>
                    <h3 className="card-title">{event.title}</h3>
                    <p className="card-description">{event.description || ''}</p>
                    <div className="project-author">{event.startsAt || event.date || '—'}</div>
                  </article>
                ))}
              </div>
              {!events.length && <EmptyState icon="◈" title="No events" text="Events will appear when they are published." />}
            </section>
          )}

          {tab === 'resources' && (
            <section className="page-section">
              <div className="section-heading"><div><div className="section-kicker">&gt; resources.index()</div><h2>Resources</h2><p>Academic resources available to the instructor workspace.</p></div></div>
              <div className="resource-grid">
                {resources.map((resource) => (
                  <article className="resource-card" key={resource._id || resource.id}>
                    <div className="card-icon">{resource.icon || '▣'}</div>
                    <Pill tone="blue">{resource.type || 'Resource'}</Pill>
                    <h3 className="card-title">{resource.title}</h3>
                    <p className="card-description">{resource.description || ''}</p>
                    <div className="card-footer">
                      <span className="project-stats">{resource.authorName || resource.author || ''}</span>
                      <button className="btn" onClick={() => resource.url && window.open(resource.url, '_blank', 'noopener,noreferrer')}>OPEN</button>
                    </div>
                  </article>
                ))}
              </div>
              {!resources.length && <EmptyState icon="▣" title="No resources" text="Resources will appear when they are published." />}
            </section>
          )}

          {tab === 'moderation' && (
            <section className="page-section">
              <div className="section-heading"><div><div className="section-kicker">&gt; moderation.queue()</div><h2>Moderation</h2><p>Handle reports without exposing moderation controls to students.</p></div></div>
              <div className="panel">
                <div className="panel-body">
                  {reports.map((report) => (
                    <div className="task-row" key={report._id || report.id}>
                      <div>
                        <strong>{report.title || report.reason || 'Community report'}</strong>
                        <div className="task-meta">{report.description || report.message || 'No additional details'} · {report.status || 'Open'}</div>
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button className="btn btn-primary" onClick={() => moderateReport(report._id || report.id, 'resolved')}>RESOLVE</button>
                        <button className="btn" onClick={() => moderateReport(report._id || report.id, 'dismissed')}>DISMISS</button>
                      </div>
                    </div>
                  ))}
                  {!reports.length && <EmptyState icon="⚑" title="Moderation queue is clear" text="No open reports are currently available." />}
                </div>
              </div>
            </section>
          )}
        </section>
      </div>

      {/* نافذة تأكيد الحذف المخصصة (Custom Delete Modal) */}
      {deleteTarget && (
        <div className="modal-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) setDeleteTarget(null); }}>
          <article className="modal-card" style={{ maxWidth: '420px' }}>
            <div className="modal-header">
              <div>
                <div className="section-kicker">&gt; challenge.delete()</div>
                <h2>Confirm Deletion</h2>
              </div>
              <button className="icon-button" onClick={() => setDeleteTarget(null)}>×</button>
            </div>
            <p className="modal-description">Are you sure you want to delete <strong>{deleteTarget.title}</strong>? This action cannot be undone.</p>
            <div className="modal-actions">
              <button className="btn danger-btn" disabled={busy} onClick={confirmDelete}>YES, DELETE</button>
              <button className="btn" onClick={() => setDeleteTarget(null)}>CANCEL</button>
            </div>
          </article>
        </div>
      )}

      {editingChallenge && (
        <div className="modal-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) setEditingChallenge(null); }}>
          <article className="modal-card">
            <div className="modal-header">
              <div><div className="section-kicker">&gt; challenge.edit()</div><h2>Edit Challenge</h2></div>
              <button className="icon-button" onClick={() => setEditingChallenge(null)}>×</button>
            </div>
            <form onSubmit={saveEdit}>
              <div className="form-grid">
                <input className="search-input" required placeholder="Challenge title" value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} />
                <input className="search-input" required placeholder="Category" value={editForm.category} onChange={(e) => setEditForm({ ...editForm, category: e.target.value })} />
                <input className="search-input" type="number" min="0" placeholder="Reward XP" value={editForm.reward} onChange={(e) => setEditForm({ ...editForm, reward: e.target.value })} />
                <select className="search-input" value={editForm.difficulty} onChange={(e) => setEditForm({ ...editForm, difficulty: e.target.value })}>
                  <option>Beginner</option><option>Intermediate</option><option>Advanced</option>
                </select>
                <input className="search-input" type="datetime-local" value={editForm.startDate} onChange={(e) => setEditForm({ ...editForm, startDate: e.target.value })} />
                <input className="search-input" type="datetime-local" value={editForm.deadline} onChange={(e) => setEditForm({ ...editForm, deadline: e.target.value })} />
                <input className="search-input" placeholder="Resource link" value={editForm.resourceLink} onChange={(e) => setEditForm({ ...editForm, resourceLink: e.target.value })} style={{ gridColumn: '1 / -1' }} />
                <textarea className="search-input" required style={{ minHeight: 140, gridColumn: '1 / -1', padding: 12 }} placeholder="Description" value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn" onClick={() => setEditingChallenge(null)}>CANCEL</button>
                <button type="submit" className="btn btn-primary" disabled={busy}>SAVE CHANGES</button>
              </div>
            </form>
          </article>
        </div>
      )}

      {selectedSubmission && (
        <div className="modal-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) setSelectedSubmission(null); }}>
          <article className="modal-card">
            <div className="modal-header">
              <div>
                <div className="section-kicker">&gt; submission.inspect()</div>
                <h2>{selectedSubmission.studentName || selectedSubmission.student?.name || 'Student Submission'}</h2>
              </div>
              <button className="icon-button" onClick={() => setSelectedSubmission(null)}>×</button>
            </div>
            <p className="modal-description">{selectedSubmission.challengeTitle || selectedSubmission.challenge?.title || 'Submission'}</p>
            <div className="date-box">{selectedSubmission.content || selectedSubmission.link || selectedSubmission.url || 'No submission content provided.'}</div>
            <textarea className="search-input" style={{ minHeight: 110, marginTop: 14, padding: 12 }} placeholder="Optional review note" value={reviewNote} onChange={(e) => setReviewNote(e.target.value)} />
            <div className="modal-actions">
              <button className="btn btn-primary" disabled={busy} onClick={() => reviewSubmission(selectedSubmission._id || selectedSubmission.id, 'approved')}>APPROVE</button>
              <button className="btn danger-btn" disabled={busy} onClick={() => reviewSubmission(selectedSubmission._id || selectedSubmission.id, 'rejected')}>REJECT</button>
              <button className="btn" onClick={() => setSelectedSubmission(null)}>CLOSE</button>
            </div>
          </article>
        </div>
      )}

      <style jsx global>{`
        :root {
          --bg:#07100f;--bg-2:#0a1514;--panel:rgba(15,28,27,.84);--panel-2:rgba(18,34,32,.72);
          --line:rgba(147,255,206,.12);--line-strong:rgba(147,255,202,.23);--text:#eefdf7;--muted:#8ca9a1;
          --soft:#b7ccc6;--accent:#8dffca;--accent-2:#54e5a2;--orange:#ffb86b;--blue:#80c8ff;--purple:#bda7ff;
          --danger:#ff8585;--shadow:0 24px 80px rgba(0,0,0,.32)
        }
        *{box-sizing:border-box} body{margin:0;background:var(--bg);color:var(--text);font-family:Inter,ui-sans-serif,system-ui,sans-serif}
        button,input,textarea,select{font:inherit}.community-shell{min-height:100vh;position:relative;overflow-x:hidden}
        .topbar{height:72px;position:sticky;top:0;z-index:50;display:flex;align-items:center;justify-content:space-between;padding:0 24px;border-bottom:1px solid var(--line);background:rgba(5,14,13,.82);backdrop-filter:blur(22px)}
        .brand{display:flex;align-items:center;gap:12px;background:none;border:0;color:inherit;cursor:pointer}.brand-mark{width:38px;height:38px;border-radius:11px;display:grid;place-items:center;color:#06120d;background:var(--accent);font-weight:900}.brand-copy{text-align:left}.brand-title{font-size:14px;font-weight:800}.brand-path{color:var(--muted);font-size:11px}
        .top-actions{display:flex;align-items:center;gap:10px}.profile-mini{display:flex;align-items:center;gap:10px;padding:4px 8px;border-radius:12px}.avatar{width:34px;height:34px;border-radius:50%;display:grid;place-items:center;background:rgba(141,255,202,.22);color:var(--accent);font-weight:800;font-size:12px}
        .profile-name{font-size:12px;font-weight:700}.profile-level{color:var(--muted);font-size:10px;margin-top:2px}
        .layout{display:grid;grid-template-columns:250px minmax(0,1fr);min-height:calc(100vh - 72px)}.sidebar{border-right:1px solid var(--line);padding:22px 14px;background:rgba(5,13,12,.54);position:sticky;top:72px;height:calc(100vh - 72px);overflow-y:auto}
        .terminal-label{color:var(--muted);font-size:10px;text-transform:uppercase;padding:0 12px 12px}.nav{display:grid;gap:4px}.nav-item{width:100%;border:0;background:transparent;color:var(--muted);display:flex;align-items:center;gap:11px;padding:11px 12px;border-radius:11px;text-align:left;cursor:pointer}.nav-item.active{background:rgba(141,255,202,.1);color:var(--accent);box-shadow:inset 2px 0 0 var(--accent)}.nav-label{flex:1;font-size:12px;font-weight:650}
        .nav-icon{width:22px;text-align:center}.sidebar-terminal{margin-top:24px;padding:14px;border:1px solid var(--line);border-radius:14px}.sidebar-terminal-title{color:var(--accent);font-size:10px;font-weight:700}.sidebar-terminal p{color:var(--muted);font-size:10px;line-height:1.7;margin:10px 0 0}
        .main{min-width:0;padding:28px;max-width:1600px;width:100%;margin:0 auto}.hero{position:relative;min-height:340px;border:1px solid var(--line);border-radius:25px;padding:30px;background:rgba(12,26,24,.76);margin-bottom:20px;overflow:hidden}.hero-kicker,.section-kicker{color:var(--accent);font-size:10px;text-transform:uppercase;margin-bottom:8px}.hero h1{font-size:42px;margin:0}.hero h1 span{color:var(--accent)}.hero-copy{color:var(--soft);font-size:14px;margin-top:18px;max-width:650px;line-height:1.7}.terminal-orb{position:absolute;width:300px;height:300px;border-radius:50%;right:-100px;top:-120px;border:1px solid rgba(141,255,202,.08);box-shadow:0 0 0 30px rgba(141,255,202,.02),0 0 0 60px rgba(141,255,202,.015)}
        .stats-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px}.stat-card{border:1px solid var(--line);border-radius:16px;padding:18px;background:var(--panel)}.stat-label{color:var(--muted);font-size:10px;text-transform:uppercase}.stat-value{margin-top:8px;font-size:25px;font-weight:850}.stat-extra{color:var(--accent);font-size:10px;margin-top:4px}
        .section-heading{margin-bottom:20px}.section-heading h2{margin:0;font-size:28px}.section-heading p{color:var(--muted);font-size:12px}.panel{border:1px solid var(--line);border-radius:18px;background:var(--panel);overflow:hidden}.panel-body{padding:18px}.panel-header{padding:18px;display:flex;justify-content:space-between;gap:12px}.panel-title{margin:0;font-size:14px}.panel-subtitle{color:var(--muted);font-size:10px;margin-top:4px}
        .two-column{display:grid;grid-template-columns:1fr 1fr;gap:14px}.section-spacer{margin-top:24px}.level-box{padding:18px;border-radius:15px;background:linear-gradient(135deg,rgba(141,255,202,.08),rgba(128,200,255,.035));border:1px solid var(--line)}.level-caption{color:var(--muted);font-size:10px}.level-number{font-size:31px;font-weight:900}.streak{margin-top:13px;display:flex;gap:9px;color:var(--soft);font-size:11px}.streak strong{color:var(--accent)}
        .search-input{width:100%;height:42px;border:1px solid var(--line);border-radius:11px;background:rgba(255,255,255,.03);color:var(--text);padding:0 13px;font-size:12px;outline:none}.search-input:focus{border-color:var(--accent)}textarea.search-input{height:auto;resize:vertical}.field-label{font-size:9px;color:var(--muted);display:block;margin-bottom:4px}.accent-label{color:var(--accent)}
        .btn{min-height:42px;border-radius:11px;padding:0 16px;border:1px solid var(--line);background:rgba(255,255,255,.025);color:var(--soft);font-size:12px;font-weight:750;cursor:pointer}.btn:hover{background:rgba(141,255,202,.08);color:var(--accent)}.btn-primary{background:var(--accent);color:#06120d;border-color:var(--accent)}.danger-btn{color:var(--danger);border-color:rgba(255,133,133,.3)}
        .resource-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:13px}.resource-card{border:1px solid var(--line);border-radius:17px;background:var(--panel);padding:17px}.card-top,.card-footer{display:flex;justify-content:space-between;align-items:center;gap:10px}.card-title{font-size:15px;margin:14px 0 6px}.card-description{color:var(--muted);font-size:10px;line-height:1.65;min-height:45px}.project-author{color:var(--accent);font-size:9px;margin-top:10px}.date-box{margin:10px 0;padding:9px;border-left:2px solid var(--accent);color:var(--soft);font-size:9px;line-height:1.7;background:rgba(141,255,202,.025)}.card-footer{border-top:1px solid var(--line);margin-top:14px;padding-top:13px}.toolbar{display:flex;gap:10px}
        .pill{display:inline-flex;align-items:center;min-height:24px;padding:0 8px;border-radius:999px;border:1px solid var(--line);font-size:9px;font-weight:700}.pill-green{color:var(--accent);border-color:rgba(141,255,202,.18);background:rgba(141,255,202,.06)}.pill-blue{color:var(--blue);border-color:rgba(128,200,255,.18);background:rgba(128,200,255,.05)}.pill-orange{color:var(--orange);border-color:rgba(255,184,107,.2);background:rgba(255,184,107,.05)}
        .task-row{display:grid;grid-template-columns:1fr auto;gap:11px;align-items:center;padding:14px 0;border-top:1px solid var(--line)}.task-row:first-child{border-top:0}.task-meta{color:var(--muted);font-size:9px;margin-top:4px}.empty-state{text-align:center;padding:35px 15px;color:var(--muted)}.empty-icon{font-size:24px;color:var(--accent)}.empty-state h3{color:var(--text);font-size:14px}.empty-state p{font-size:10px}
        .card-icon{width:45px;height:45px;border-radius:13px;display:grid;place-items:center;font-size:22px;border:1px solid var(--line);background:rgba(141,255,202,.045);margin-bottom:10px}.difficulty-tag{font-size:9px;color:var(--accent);background:rgba(141,255,202,.1);padding:2px 6px;border-radius:6px}
        .modal-backdrop{position:fixed;inset:0;z-index:1000;display:grid;place-items:center;padding:20px;background:rgba(0,0,0,.72);backdrop-filter:blur(8px)}.modal-card{width:min(720px,100%);max-height:90vh;overflow:auto;border:1px solid var(--line-strong);border-radius:18px;background:linear-gradient(180deg,rgba(12,25,23,.98),rgba(7,16,15,.98));box-shadow:0 30px 100px rgba(0,0,0,.45);padding:22px}.modal-header{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;margin-bottom:14px}.modal-header h2{margin:4px 0 0}.modal-description{color:var(--soft);font-size:12px;line-height:1.7}.modal-actions{display:flex;gap:10px;flex-wrap:wrap;margin-top:20px}.form-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.icon-button{width:40px;height:40px;border:1px solid var(--line);background:rgba(255,255,255,.025);color:var(--soft);border-radius:12px}
        .toast{position:fixed;left:50%;bottom:24px;transform:translateX(-50%);border:1px solid var(--line-strong);border-radius:12px;background:rgba(6,17,15,.96);color:var(--soft);padding:11px 15px;font-size:11px;font-weight:700;z-index:200}
        @media(max-width:1200px){.resource-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.two-column{grid-template-columns:1fr}}
        @media(max-width:900px){.layout{grid-template-columns:1fr}.sidebar{position:fixed;z-index:60;left:0;top:72px;width:270px;transform:translateX(-105%);transition:transform .25s ease}.sidebar.open{transform:translateX(0)}.main{padding:20px}.stats-grid{grid-template-columns:repeat(2,1fr)}.profile-mini{display:none}}
        @media(max-width:640px){.topbar{padding:0 13px;height:64px}.sidebar{top:64px;height:calc(100vh - 64px)}.main{padding:14px;padding-bottom:80px}.hero{min-height:auto;padding:21px;border-radius:20px}.hero h1{font-size:38px}.stats-grid,.resource-grid,.form-grid{grid-template-columns:1fr}.section-heading h2{font-size:25px}.modal-actions{flex-direction:column}.modal-actions .btn{width:100%}}
      `}</style>
    </main>
  );
}