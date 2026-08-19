'use client';
import { useEffect, useMemo, useState } from 'react';
const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4002/api').replace(/\/$/, '');
async function apiFetch(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
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

function Pill({ children, tone = 'default', ...props }) {
  return <span className={`pill ${tone}`} {...props}>{children}</span>;
}

function ProgressBar({ value = 0 }) {
  return (
    <div className="progress-track">
      <div className="progress-fill" style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
    </div>
  );
}

function Difficulty({ level = 0 }) {
  const numeric = Number(level) || 0;
  return (
    <span className="difficulty" aria-label={`Difficulty ${numeric} of 4`}>
      {[1, 2, 3, 4].map((item) => (
        <span key={item} className={item <= numeric ? 'active' : ''}>●</span>
      ))}
    </span>
  );
}

function EmptyState({ icon = '⚡', title, text, action }) {
  const [pinged, setPinged] = useState(false);
  return (
    <div className="radar-empty-state">
      <div className="radar-sweep-effect"></div>
      <div className="radar-content">
        <div className="radar-tag">[!] RADAR ACTIVE: SCANNING INSTRUCTOR NODES</div>
        <div className="empty-icon" style={{ fontSize: '28px', marginBottom: '8px' }}>{icon}</div>
        <h3 style={{ margin: '6px 0', fontSize: '15px', color: 'var(--text)' }}>{title}</h3>
        <p style={{ fontSize: '11px', color: 'var(--muted)', margin: '4px 0 14px' }}>{text}</p>
        {action || (
          <button 
            className="btn btn-primary" 
            style={{ minHeight: '36px', fontSize: '10px' }}
            onClick={() => setPinged(true)}
          >
            {pinged ? 'NODE PINGED ✓' : '[ PING INSTRUCTOR NODE ]'}
          </button>
        )}
      </div>
    </div>
  );
}

function formatDate(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' });
}

function initials(name = '') {
  return String(name).trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase() || 'GU';
}

export default function StudentCommunityPage() {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [mobileMenu, setMobileMenu] = useState(false);
  const [terminalOpen, setTerminalOpen] = useState(false);
  const [terminalInput, setTerminalInput] = useState('');
  const [terminalLines, setTerminalLines] = useState([
    'BSIE Community Terminal v2.0.0',
    'Session: checking...',
    'Type "help" to view available commands.',
  ]);

  const [utbEmail, setUtbEmail] = useState('');
  const [studentId, setStudentId] = useState(''); // الرقم التعريفي للطالب
  const [authBusy, setAuthBusy] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpResendSeconds, setOtpResendSeconds] = useState(0);
  const [otpMessage, setOtpMessage] = useState('');
  const [otpError, setOtpError] = useState('');

  const [community, setCommunity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(true);
  const [authModal, setAuthModal] = useState(false);
  const [authStep, setAuthStep] = useState(1);
  const [authRole, setAuthRole] = useState(null);
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [challengeFilter, setChallengeFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [toast, setToast] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const user = community?.user || null;
  const isGuest = !user;
  const role = String(user?.role || 'student').toLowerCase();
  const isInstructor = role === 'instructor' || role === 'admin';
  const challenges = community?.challenges || [];
  const tasks = community?.tasks || [];
  const teams = community?.teams || [];
  const projects = community?.projects || [];
  const ideas = community?.ideas || [];
  const leaderboard = community?.leaderboard || [];
  const events = community?.events || [];
  const resources = community?.resources || [];
  const badges = community?.badges || [];
  const notifications = community?.notifications || [];
  const activity = community?.activity || [];
  const deadlines = community?.deadlines || [];
  const stats = community?.stats || {};
  const dailyChallenge = community?.dailyChallenge || null;

  const xp = Number(user?.xp || 0);
  const level = Number(user?.level || 0);
  const nextLevelXP = Number(user?.nextLevelXp || 0);
  const currentLevelXP = Number(user?.currentLevelXp || 0);
  const levelProgress = nextLevelXP > currentLevelXP
    ? Math.round(((xp - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100)
    : 0;
  
  const navItems = [
    { id: 'dashboard', icon: '⌂', label: 'Dashboard' },
    { id: 'challenges', icon: '⚡', label: 'Challenges', count: challenges.length || null },
    { id: 'tasks', icon: '✓', label: 'Tasks', count: tasks.length || null },
    { id: 'teams', icon: '👥', label: 'Teams' },
    { id: 'projects', icon: '🚀', label: 'Projects' },
    { id: 'ideas', icon: '💡', label: 'Ideas' },
    { id: 'leaderboard', icon: '🏆', label: 'Leaderboard' },
    { id: 'events', icon: '◈', label: 'Events' },
    { id: 'resources', icon: '▣', label: 'Resources' },
  ];

  // Mobile navigation keeps the five most-used student destinations visible.
  const mobileNavItems = navItems.filter((item) =>
    ['dashboard', 'challenges', 'tasks', 'leaderboard', 'resources'].includes(item.id)
  );

  const filteredChallenges = useMemo(() => {
    const query = search.trim().toLowerCase();
    return challenges.filter((challenge) => {
      const matchesFilter =
        challengeFilter === 'All' ||
        challenge.type === challengeFilter ||
        challenge.category === challengeFilter;
      const text = [
        challenge.title,
        challenge.description,
        ...(challenge.skills || []),
      ].filter(Boolean).join(' ').toLowerCase();
      return matchesFilter && (!query || text.includes(query));
    });
  }, [challenges, challengeFilter, search]);

  function showToast(message) {
    setToast(message);
    window.clearTimeout(window.__bsieToast);
    window.__bsieToast = window.setTimeout(() => setToast(''), 3000);
  }

  function navigate(section) {
    setActiveSection(section);
    setMobileMenu(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

async function loadCommunity() {
    setLoading(true);
    try {
      // التحقق أولاً من وضع المطور المخزن محلياً
      const localUser = localStorage.getItem('utb_user');
      if (localUser) {
        const parsedUser = JSON.parse(localUser);
        const data = await apiFetch('/community').catch(() => ({}));
        setCommunity({ ...data, user: parsedUser });
        setLoading(false);
        return;
      }

      const data = await apiFetch('/community');
      setCommunity(data);
   const currentUser = data?.user;
if (currentUser && ['faculty', 'admin'].includes(String(currentUser.role).toLowerCase())) {
  window.location.replace('/instructor');
  return;
}
      setTerminalLines([
        'BSIE Community Terminal v2.0.0',
        currentUser ? `Connected as ${currentUser.username || currentUser.email}` : 'Session: guest',
        'Type "help" to view available commands.',
      ]);
    } catch (error) {
      const localUser = localStorage.getItem('utb_user');
      setCommunity({ 
        user: localUser ? JSON.parse(localUser) : null, 
        challenges: [], tasks: [], teams: [], projects: [], ideas: [], leaderboard: [], events: [], resources: [], badges: [], notifications: [], activity: [], deadlines: [], stats: {} 
      });
      setTerminalLines([
        'BSIE Community Terminal v2.0.0',
        localUser ? 'Developer session active.' : 'Backend connection unavailable.',
        'Type "help" for local commands.',
      ]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCommunity();
    apiFetch('/auth/session')
      .catch(() => null)
      .finally(() => setAuthLoading(false));
  }, []);

  // Refresh published instructor content every 30s while the page is visible.
  useEffect(() => {
    const refreshCommunity = () => {
      if (document.visibilityState === 'visible') loadCommunity();
    };

    const interval = window.setInterval(refreshCommunity, 30000);
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') refreshCommunity();
    };

    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      window.clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  useEffect(() => {
    if (otpResendSeconds <= 0) return undefined;
    const timer = window.setInterval(() => {
      setOtpResendSeconds((seconds) => (seconds > 0 ? seconds - 1 : 0));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [otpResendSeconds]);

async function mutate(path, method = 'POST', body) {
    setActionLoading(true);
    try {
      const response = await apiFetch(path, {
        method,
        body: body ? JSON.stringify(body) : undefined,
      });
      await loadCommunity();
      showToast('Action completed successfully.');
      return response;
    } catch (error) {
      if (error.status === 401) {
        openAuthModal();
        showToast('Please sign in first to continue.');
      } else if (error.status === 403) {
        showToast('You do not have permission for this action.');
      } else if (error.status === 429) {
        showToast('Too many requests. Please wait a moment and try again.');
      } else {
        showToast(error.message || 'Action failed.');
      }
      throw error;
    } finally {
      setActionLoading(false);
    }
  }

  function acceptChallenge(challenge) {
    if (!user) {
      openAuthModal();
      return;
    }
    mutate(`/community/challenges/${challenge.id}/accept`);
  }

  function completeTask(task) {
    if (!user) {
      openAuthModal();
      return;
    }
    mutate(`/community/tasks/${task.id}/complete`);
  }

  function joinTeam(team) {
    if (!user) {
      openAuthModal();
      return;
    }
    mutate(`/community/teams/${team.id}/join`);
  }

  function likeProject(project) {
    if (!user) {
      openAuthModal();
      return;
    }
    mutate(`/community/projects/${project.id}/like`);
  }

  function voteIdea(idea) {
    if (!user) {
      openAuthModal();
      return;
    }
    mutate(`/community/ideas/${idea.id}/vote`);
  }

  function registerEvent(event) {
    if (!user) {
      openAuthModal();
      return;
    }
    mutate(`/community/events/${event.id}/register`);
  }

  function unregisterEvent(event) {
    if (!user) return;
    mutate(`/community/events/${event.id}/unregister`);
  }

  function openAuthModal() {
    setAuthStep(1);
    setAuthRole(null);
    setUtbEmail('');
    setOtpCode('');
    setOtpResendSeconds(0);
    setOtpMessage('');
    setOtpError('');
    setAuthBusy(false);
    setAuthModal(true);
  }

  function closeAuthModal() {
    if (authBusy) return;
    setAuthModal(false);
  }

  function selectAuthRole(nextRole) {
    setAuthRole(nextRole);
    setUtbEmail('');
    setOtpCode('');
    setOtpMessage('');
    setOtpError('');
    setOtpResendSeconds(0);
    setAuthStep(2);
  }

function continueIdentityStep() {
  if (authRole === 'guest') {
    setAuthStep(2);
    return;
  }

  const email = utbEmail.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    setOtpError('Please enter a valid email address.');
    showToast('Please enter a valid email address.');
    return;
  }

  if (!studentId.trim()) {
    setOtpError('Please enter your Student ID.');
    showToast('Please enter your Student ID.');
    return;
  }

  setUtbEmail(email);
  setOtpError('');
  requestOtp(email);
}

function continueAsGuest() {
  setAuthModal(false);
  showToast('Guest session active. Sign in later to unlock student features.');
}

async function requestOtp(emailOverride = null) {
  const email = String(emailOverride || utbEmail).trim().toLowerCase();

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    setOtpError('Please enter a valid email address.');
    showToast('Please enter a valid email address.');
    setAuthStep(2);
    return;
  }

  setAuthBusy(true);
  setOtpError('');
  setOtpMessage('');

  try {
    const result = await apiFetch('/auth/request-otp', {
      method: 'POST',
      body: JSON.stringify({ email, studentId }),
    });

    setUtbEmail(email);
    setOtpCode('');
    setOtpResendSeconds(60);
    setOtpMessage(result?.message || `Verification code sent to ${email}`);
    setAuthStep(3);
  } catch (error) {
    setOtpError(error?.message || 'Unable to send verification code.');
  } finally {
    setAuthBusy(false);
  }
}

  async function verifyOtp() {
    const email = utbEmail.trim().toLowerCase();
    const otp = otpCode.trim();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setOtpError('Please enter a valid email address.');
      setAuthStep(2);
      return;
    }

    if (!/^\d{6}$/.test(otp)) {
      setOtpError('Enter the 6-digit verification code.');
      return;
    }

    setAuthBusy(true);
    setOtpError('');

    try {
      const result = await apiFetch('/auth/verify-otp', {
        method: 'POST',
        body: JSON.stringify({ email, otpCode: otp }),
      });

      if (!result?.success || !result?.token || !result?.user) {
        throw new Error(result?.message || 'Verification failed.');
      }

      localStorage.setItem('utb_token', result.token);
      localStorage.setItem('utb_user', JSON.stringify(result.user));
      setCommunity((current) => ({ ...(current || {}), user: result.user }));
      
      // إغلاق نافذة المصادقة وتحديث البيانات بدلاً من التوجيه لصفحة غير موجودة
      setAuthModal(false);
      await loadCommunity();
      showToast('Successfully authenticated! Welcome to the workspace.');

    } catch (error) {
      setOtpError(error?.message || 'Invalid or expired verification code.');
    } finally {
      setAuthBusy(false);
    }
  }

  function resendOtp() {
    if (otpResendSeconds > 0 || authBusy) return;
    requestOtp();
  }

  async function logout() {
    try {
      await apiFetch('/auth/logout', { method: 'POST' });
    } finally {
      setCommunity((current) => ({ ...(current || {}), user: null }));
      setAuthModal(false);
      showToast('Signed out.');
    }
  }

function runCommand(rawCommand) {
  const command = rawCommand.trim().toLowerCase();
  if (!command) return;
  const output = [`> ${rawCommand}`];

  if (command === 'help') {
    output.push(
      'Available commands:',
      '  student            Open student registration modal',
      '  dev on             Activate instructor mode & open Instructor Console',
      '  dev off            Reset session to guest mode',
      '  status             Show authenticated status',
      '  profile            Show your profile',
      '  challenges         Browse live challenges',
      '  tasks              View your tasks',
      '  teams              Find teams',
      '  projects           Explore projects',
      '  leaderboard        View ranking',
      '  ideas              Community ideas',
      '  events             Upcoming events',
      '  badges             Your verified badges',
      '  refresh            Reload live data',
      '  role               Show access role',
      '  clear              Clear terminal',
      '  logout             Sign out'
    );
  } else if (command === 'student') {
    setAuthRole('student');
    setAuthModal(true);
    output.push('⚡ Student registration modal opened (Student Flow Activated).');
  } else if (command === 'dev on') {
    const devUser = { name: 'Lead Developer', role: 'instructor', email: 'dev@utb.edu.bh', level: 99, xp: 9999 };
    localStorage.setItem('utb_user', JSON.stringify(devUser));
    output.push('🔓 Developer / instructor mode activated. Redirecting to Instructor Console...');
    setTerminalLines((prev) => [...prev, ...output]);
    setTimeout(() => {
      window.location.href = '/instructor';
    }, 600);
    return;
  } else if (command === 'dev off') {
    localStorage.removeItem('utb_token');
    localStorage.removeItem('utb_user');
    setCommunity((current) => ({ ...(current || {}), user: null }));
    setAuthRole('guest');
    setUtbEmail('');
    setStudentId('');
    output.push('🔒 Developer mode disabled. Redirecting to community...');
    setTerminalLines((prev) => [...prev, ...output]);
    setTimeout(() => {
      window.location.href = '/community';
    }, 600);
    return;
  } else if (command === 'logout' || command === 'signout') {
    localStorage.removeItem('utb_token');
    localStorage.removeItem('utb_user');
    setAuthRole('guest');
    setUtbEmail('');
    setStudentId('');
    output.push(
      '✓ Successfully signed out.',
      '🔄 Session switched to Guest Mode.'
    );
  } else if (command === 'status') {
    output.push(
      `session: ${user ? 'authenticated' : 'guest'}`,
      `role: ${user?.role || 'guest'}`,
      `level: ${user?.level ?? '—'}`,
      `xp: ${user?.xp ?? '—'}`,
      `streak: ${user?.streak ?? '—'}`,
      `rank: ${user?.rank ?? '—'}`
    );
  } else if (command === 'profile') {
    if (!user) output.push('No authenticated profile. Sign in with your account.');
    else output.push(
      `name: ${user.name || '—'}`,
      `email: ${user.email || '—'}`,
      `major: ${user.major || '—'}`,
      `role: ${user.role || '—'}`
    );
  } else if (command === 'role') {
    output.push(`access_role: ${user?.role || 'guest'}`);
  } else if (command === 'challenges') {
    output.push(...(challenges.length
      ? challenges.slice(0, 8).map((item) => `#${item.id} ${item.title} +${item.reward || 0} XP`)
      : ['No live challenges.']));
  } else if (command === 'tasks') {
    output.push(...(tasks.length
      ? tasks.slice(0, 8).map((item) => `${item.status === 'Completed' ? '✓' : '○'} ${item.title}`)
      : ['No tasks assigned.']));
  } else if (command === 'teams') {
    output.push(...(teams.length ? teams.slice(0, 8).map((team) => `${team.name} — ${team.members || 0}/${team.max || 0}`) : ['No teams available.']));
  } else if (command === 'projects') {
    output.push(...(projects.length ? projects.slice(0, 8).map((project) => project.title) : ['No projects published.']));
  } else if (command === 'leaderboard') {
    output.push(...(leaderboard.length ? leaderboard.slice(0, 8).map((person) => `${person.rank}. ${person.name} — ${person.xp} XP`) : ['Leaderboard is empty.']));
  } else if (command === 'ideas') {
    output.push(...(ideas.length ? ideas.slice(0, 8).map((idea) => `${idea.title} — ${idea.votes || 0} votes`) : ['No community ideas.']));
  } else if (command === 'events') {
    output.push(...(events.length ? events.slice(0, 8).map((event) => `${event.date || formatDate(event.startsAt)} — ${event.title}`) : ['No upcoming events.']));
  } else if (command === 'badges') {
    output.push(...(badges.length ? badges.slice(0, 8).map((badge) => `${badge.icon || '◇'} ${badge.name}`) : ['No verified badges yet.']));
  } else if (command === 'refresh') {
    loadCommunity();
    output.push('Refreshing live community data...');
  } else if (command === 'clear') {
    setTerminalLines([]);
    setTerminalInput('');
    return;
  } else {
    output.push(`command not found: ${rawCommand}`, 'Type "help" for available commands.');
  }

  setTerminalLines((prev) => [...prev, ...output]);
  setTerminalInput('');
}

  function handleTerminalKeyDown(event) {
    if (event.key === 'Enter') {
      console.log("Enter pressed, command:", terminalInput);
      runCommand(terminalInput);
    }
  }

  return (
    <main className="community-shell">
      <style jsx global>{`
        :root {
          --bg: #07100f;
          --bg-2: #0a1514;
          --panel: rgba(15, 28, 27, 0.84);
          --panel-2: rgba(18, 34, 32, 0.72);
          --line: rgba(147, 255, 206, 0.12);
          --line-strong: rgba(147, 255, 206, 0.23);
          --text: #eefdf7;
          --muted: #8ca9a1;
          --soft: #b7ccc6;
          --accent: #8dffca;
          --accent-2: #54e5a2;
          --orange: #ffb86b;
          --blue: #80c8ff;
          --purple: #bda7ff;
          --danger: #ff8585;
          --shadow: 0 24px 80px rgba(0, 0, 0, 0.32);
        }

        * {
          box-sizing: border-box;
        }

        html {
          scroll-behavior: smooth;
        }

        body {
          margin: 0;
          background:
            radial-gradient(
              circle at 15% 0%,
              rgba(73, 214, 151, 0.09),
              transparent 28%
            ),
            radial-gradient(
              circle at 85% 20%,
              rgba(87, 153, 255, 0.07),
              transparent 25%
            ),
            var(--bg);
          color: var(--text);
          font-family:
            Inter,
            ui-sans-serif,
            system-ui,
            -apple-system,
            BlinkMacSystemFont,
            "Segoe UI",
            sans-serif;
        }

        button,
        input {
          font: inherit;
        }

        button {
          cursor: pointer;
        }

        .community-shell {
          min-height: 100vh;
          position: relative;
          overflow-x: hidden;
        }

        .community-shell::before {
          content: "";
          position: fixed;
          inset: 0;
          pointer-events: none;
          opacity: 0.32;
          background-image:
            linear-gradient(rgba(141, 255, 202, 0.025) 1px, transparent 1px),
            linear-gradient(
              90deg,
              rgba(141, 255, 202, 0.025) 1px,
              transparent 1px
            );
          background-size: 42px 42px;
          mask-image: linear-gradient(to bottom, black, transparent 90%);
        }

        .topbar {
          height: 72px;
          position: sticky;
          top: 0;
          z-index: 50;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 24px;
          border-bottom: 1px solid var(--line);
          background: rgba(5, 14, 13, 0.82);
          backdrop-filter: blur(22px);
        }

        .brand {
          display: flex;
          align-items: center;
          gap: 12px;
          min-width: 0;
        }

        .brand-mark {
          width: 38px;
          height: 38px;
          border-radius: 11px;
          display: grid;
          place-items: center;
          color: #06120d;
          background: var(--accent);
          font-weight: 900;
          box-shadow: 0 0 30px rgba(141, 255, 202, 0.18);
        }

        .brand-copy {
          min-width: 0;
        }

        .brand-title {
          font-size: 14px;
          font-weight: 800;
          letter-spacing: 0.02em;
        }

        .brand-path {
          color: var(--muted);
          font-family: "SFMono-Regular", Consolas, monospace;
          font-size: 11px;
          margin-top: 2px;
        }

        .top-actions {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .icon-button {
          width: 40px;
          height: 40px;
          border: 1px solid var(--line);
          background: rgba(255, 255, 255, 0.025);
          color: var(--soft);
          border-radius: 12px;
          display: grid;
          place-items: center;
          transition: 0.2s ease;
        }

        .icon-button:hover {
          border-color: var(--line-strong);
          color: var(--accent);
          transform: translateY(-1px);
        }

        .auth-terminal-backdrop { position: fixed; inset: 0; z-index: 1000; display:grid; place-items:center; padding:20px; background:rgba(0,0,0,.78); backdrop-filter:blur(12px); }
  .auth-terminal-card { width:min(720px,100%); max-height:92vh; overflow:auto; border:1px solid rgba(141,255,202,.25); border-radius:22px; background:linear-gradient(180deg,rgba(8,20,18,.99),rgba(4,11,10,.99)); box-shadow:0 35px 120px rgba(0,0,0,.58),0 0 70px rgba(141,255,202,.06); }
  .auth-terminal-chrome { height:48px; display:flex; align-items:center; gap:10px; padding:0 16px; border-bottom:1px solid var(--line); background:rgba(255,255,255,.018); }
  .auth-terminal-dots { display:flex; gap:6px; }
  .auth-terminal-dots span { width:8px; height:8px; border-radius:50%; background:rgba(255,255,255,.2); }
  .auth-terminal-path { flex:1; color:var(--muted); font:10px "SFMono-Regular",Consolas,monospace; }
  .auth-close { width:34px; height:34px; border:1px solid var(--line); border-radius:10px; background:rgba(255,255,255,.02); color:var(--soft); font-size:20px; }
  .auth-terminal-body { padding:28px; }
  .auth-kicker,.auth-command { color:var(--accent); font:700 11px "SFMono-Regular",Consolas,monospace; letter-spacing:.06em; }
  .auth-title-row { display:flex; align-items:flex-start; justify-content:space-between; gap:20px; margin-top:8px; }
  .auth-title-row h2 { margin:0; font-size:clamp(24px,4vw,34px); letter-spacing:-.045em; }
  .auth-title-row p,.auth-stage-copy { color:var(--muted); line-height:1.65; font-size:12px; margin:8px 0 0; }
  .auth-status { border:1px solid rgba(141,255,202,.2); color:var(--accent); border-radius:999px; padding:6px 9px; font:700 9px "SFMono-Regular",Consolas,monospace; }
  .auth-progress { display:grid; grid-template-columns:repeat(3,1fr); gap:8px; margin:26px 0 30px; }
  .auth-progress-step { position:relative; display:flex; align-items:center; gap:8px; color:#506a63; font:700 9px "SFMono-Regular",Consolas,monospace; }
  .auth-progress-step:not(:last-child)::after { content:""; position:absolute; left:30px; right:-8px; top:13px; height:1px; background:rgba(141,255,202,.09); z-index:0; }
  .auth-progress-node { position:relative; z-index:1; width:27px; height:27px; border-radius:50%; display:grid; place-items:center; border:1px solid var(--line); background:#07110f; }
  .auth-progress-step.done { color:var(--soft); }
  .auth-progress-step.current { color:var(--accent); }
  .auth-progress-step.current .auth-progress-node,.auth-progress-step.done .auth-progress-node { border-color:rgba(141,255,202,.35); color:var(--accent); box-shadow:0 0 18px rgba(141,255,202,.08); }
  .auth-stage { border:1px solid var(--line); border-radius:17px; padding:22px; background:linear-gradient(180deg,rgba(255,255,255,.025),rgba(255,255,255,.012)); }
  .auth-stage h3 { margin:8px 0 0; font-size:19px; letter-spacing:-.025em; }
  .auth-role-grid { display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-top:20px; }
  .auth-role-card { min-height:88px; border:1px solid var(--line); border-radius:14px; background:rgba(255,255,255,.018); color:var(--text); display:grid; grid-template-columns:42px 1fr auto; align-items:center; gap:12px; padding:13px; text-align:left; transition:.2s ease; }
  .auth-role-card:hover { transform:translateY(-2px); border-color:rgba(141,255,202,.3); background:rgba(141,255,202,.045); }
  .auth-role-guest { grid-column:1/-1; }
  .auth-role-icon { width:38px; height:38px; display:grid; place-items:center; border-radius:11px; border:1px solid rgba(141,255,202,.18); color:var(--accent); background:rgba(141,255,202,.05); font:800 10px "SFMono-Regular",Consolas,monospace; }
  .auth-role-card strong,.auth-role-card small { display:block; }
  .auth-role-card strong { font-size:11px; letter-spacing:.06em; }
  .auth-role-card small { color:var(--muted); font-size:10px; margin-top:4px; }
  .auth-arrow { color:var(--accent); }
  .auth-field-label { display:block; margin-top:20px; color:var(--muted); font:700 9px "SFMono-Regular",Consolas,monospace; letter-spacing:.12em; }
  .auth-input-shell { margin-top:8px; display:flex; align-items:center; gap:10px; border:1px solid rgba(141,255,202,.2); border-radius:12px; background:#030908; padding:0 13px; box-shadow:inset 0 0 0 1px rgba(255,255,255,.01); }
  .auth-input-shell span { color:var(--accent); font-family:monospace; }
  .auth-input-shell input { flex:1; min-width:0; height:50px; border:0; outline:0; background:transparent; color:var(--text); font:14px "SFMono-Regular",Consolas,monospace; }
  .auth-input-shell input::placeholder { color:#466057; }
  .auth-derived-email { margin-top:10px; color:var(--muted); font:10px "SFMono-Regular",Consolas,monospace; }
  .auth-derived-email strong { color:var(--accent); }
  .auth-actions { display:flex; justify-content:flex-end; gap:9px; margin-top:20px; }
  .guest-permissions { display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-top:18px; color:var(--soft); font:10px "SFMono-Regular",Consolas,monospace; }
  .auth-identity-summary { display:grid; grid-template-columns:90px 1fr; gap:8px 12px; margin-top:18px; padding:14px; border:1px solid var(--line); border-radius:12px; background:#030908; font:10px "SFMono-Regular",Consolas,monospace; }
  .auth-identity-summary span { color:var(--muted); }
  .auth-identity-summary strong { color:var(--accent); overflow-wrap:anywhere; }
  .otp-input { width:100%; min-height:58px; margin-top:10px; border:1px solid rgba(141,255,202,.2); border-radius:13px; background:#030908; color:var(--accent); outline:0; padding:0 16px; text-align:center; letter-spacing:.42em; font:800 24px "SFMono-Regular",Consolas,monospace; box-shadow:inset 0 0 0 1px rgba(255,255,255,.01); }
  .otp-input:focus { border-color:rgba(141,255,202,.5); box-shadow:0 0 0 3px rgba(141,255,202,.06); }
  .otp-input::placeholder { color:#466057; letter-spacing:.3em; }
  .otp-message { margin-top:12px; padding:10px 12px; border:1px solid rgba(141,255,202,.12); border-radius:10px; color:var(--soft); background:rgba(141,255,202,.035); font:10px "SFMono-Regular",Consolas,monospace; line-height:1.5; }
  .otp-error { margin-top:12px; padding:10px 12px; border:1px solid rgba(255,133,133,.2); border-radius:10px; color:#ffabab; background:rgba(255,133,133,.045); font:10px "SFMono-Regular",Consolas,monospace; line-height:1.5; }
  .otp-resend { display:flex; align-items:center; justify-content:space-between; gap:12px; margin-top:14px; color:var(--muted); font:10px "SFMono-Regular",Consolas,monospace; }
  .otp-resend button { border:0; background:transparent; color:var(--accent); padding:0; font:inherit; font-weight:800; cursor:pointer; }
  .otp-resend button:disabled { color:#466057; cursor:not-allowed; }
  .otp-verify-button { width:100%; min-height:56px; margin-top:16px; display:flex; align-items:center; justify-content:center; gap:12px; padding:0 16px; border:1px solid rgba(141,255,202,.26); border-radius:13px; background:rgba(141,255,202,.09); color:var(--accent); font-size:12px; font-weight:850; }
  .otp-verify-button:hover:not(:disabled) { background:rgba(141,255,202,.14); transform:translateY(-1px); }
  .otp-verify-button:disabled { opacity:.6; cursor:wait; }
  .auth-terminal-footer { margin-top:18px; color:#466057; text-align:center; font:9px "SFMono-Regular",Consolas,monospace; }
  .profile-mini {
          display: flex;
          align-items: center;
          gap: 9px;
          padding-left: 8px;
        }

        .avatar {
          width: 34px;
          height: 34px;
          border-radius: 50%;
          display: grid;
          place-items: center;
          background:
            linear-gradient(135deg, rgba(141, 255, 202, 0.22), rgba(128, 200, 255, 0.2));
          border: 1px solid var(--line-strong);
          color: var(--accent);
          font-weight: 800;
          font-size: 12px;
        }

        .profile-name {
          font-size: 12px;
          font-weight: 700;
        }

        .profile-level {
          color: var(--muted);
          font-size: 10px;
          margin-top: 2px;
        }

        .mobile-menu-btn {
          display: none;
        }

        .layout {
          display: grid;
          grid-template-columns: 250px minmax(0, 1fr);
          min-height: calc(100vh - 72px);
        }

        .sidebar {
          border-right: 1px solid var(--line);
          padding: 22px 14px;
          background: rgba(5, 13, 12, 0.54);
          position: sticky;
          top: 72px;
          height: calc(100vh - 72px);
          overflow-y: auto;
        }

        .terminal-label {
          color: var(--muted);
          font-size: 10px;
          font-family: "SFMono-Regular", Consolas, monospace;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          padding: 0 12px 12px;
        }

        .nav {
          display: grid;
          gap: 4px;
        }

        .nav-item {
          width: 100%;
          border: 0;
          background: transparent;
          color: var(--muted);
          display: flex;
          align-items: center;
          gap: 11px;
          padding: 11px 12px;
          border-radius: 11px;
          text-align: left;
          transition: 0.2s ease;
        }

        .nav-item:hover {
          background: rgba(141, 255, 202, 0.05);
          color: var(--soft);
        }

        .nav-item.active {
          background: linear-gradient(
            90deg,
            rgba(141, 255, 202, 0.1),
            rgba(141, 255, 202, 0.035)
          );
          color: var(--accent);
          box-shadow: inset 2px 0 0 var(--accent);
        }

        .nav-icon {
          width: 22px;
          text-align: center;
          font-size: 14px;
        }

        .nav-label {
          flex: 1;
          font-size: 12px;
          font-weight: 650;
        }

        .nav-count {
          min-width: 21px;
          height: 20px;
          padding: 0 6px;
          border-radius: 999px;
          display: grid;
          place-items: center;
          background: rgba(141, 255, 202, 0.08);
          color: var(--accent);
          font-size: 9px;
          font-weight: 800;
        }

        .sidebar-terminal {
          margin-top: 24px;
          padding: 14px;
          border: 1px solid var(--line);
          border-radius: 14px;
          background: rgba(255, 255, 255, 0.018);
        }

        .sidebar-terminal-title {
          color: var(--accent);
          font: 700 10px "SFMono-Regular", Consolas, monospace;
        }

        .sidebar-terminal p {
          color: var(--muted);
          font: 10px/1.7 "SFMono-Regular", Consolas, monospace;
          margin: 10px 0 0;
        }

        .main {
          min-width: 0;
          padding: 28px;
          max-width: 1600px;
          width: 100%;
          margin: 0 auto;
        }

        .section-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 22px;
        }

        .eyebrow {
          color: var(--accent);
          font: 700 10px "SFMono-Regular", Consolas, monospace;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          margin-bottom: 8px;
        }

        .section-title {
          margin: 0;
          font-size: clamp(24px, 3vw, 34px);
          letter-spacing: -0.04em;
        }

        .section-description {
          color: var(--muted);
          font-size: 13px;
          margin: 7px 0 0;
          max-width: 680px;
          line-height: 1.65;
        }

        .terminal-cursor {
          display: inline-block;
          width: 7px;
          height: 18px;
          background: var(--accent);
          margin-left: 4px;
          vertical-align: -3px;
          animation: blink 1s infinite;
        }

        @keyframes blink {
          50% {
            opacity: 0;
          }
        }

        .hero {
          position: relative;
          min-height: 340px;
          overflow: hidden;
          border: 1px solid var(--line);
          border-radius: 25px;
          padding: 30px;
          background:
            radial-gradient(
              circle at 90% 15%,
              rgba(141, 255, 202, 0.12),
              transparent 30%
            ),
            radial-gradient(
              circle at 10% 100%,
              rgba(128, 200, 255, 0.08),
              transparent 32%
            ),
            rgba(12, 26, 24, 0.76);
          box-shadow: var(--shadow);
        }

        .hero-grid {
          display: grid;
          grid-template-columns: 1.2fr 0.8fr;
          gap: 25px;
          align-items: center;
          position: relative;
          z-index: 2;
        }

        .hero-kicker {
          color: var(--accent);
          font: 600 11px "SFMono-Regular", Consolas, monospace;
          margin-bottom: 16px;
        }

        .hero h1 {
          font-size: clamp(34px, 5vw, 62px);
          letter-spacing: -0.065em;
          line-height: 0.98;
          margin: 0;
          max-width: 720px;
        }

        .hero h1 span {
          color: var(--accent);
        }

        .hero-copy {
          max-width: 650px;
          color: var(--soft);
          line-height: 1.7;
          font-size: 14px;
          margin: 18px 0 0;
        }

        .hero-actions {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          margin-top: 24px;
        }

        .btn {
          min-height: 42px;
          border-radius: 11px;
          padding: 0 16px;
          border: 1px solid var(--line);
          background: rgba(255, 255, 255, 0.025);
          color: var(--soft);
          font-size: 12px;
          font-weight: 750;
          transition: 0.2s ease;
        }

        .btn:hover {
          transform: translateY(-1px);
          border-color: var(--line-strong);
        }

        .btn-primary {
          background: var(--accent);
          color: #06120d;
          border-color: var(--accent);
          box-shadow: 0 8px 30px rgba(141, 255, 202, 0.1);
        }

        .btn-primary:hover {
          background: #a9ffda;
        }

        .btn-ghost {
          color: var(--accent);
        }

        .hero-terminal {
          border: 1px solid var(--line-strong);
          border-radius: 17px;
          background: rgba(2, 9, 8, 0.66);
          overflow: hidden;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.26);
        }

        .terminal-top {
          height: 38px;
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 0 12px;
          border-bottom: 1px solid var(--line);
        }

        .dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.2);
        }

        .terminal-name {
          margin-left: 6px;
          color: var(--muted);
          font: 10px "SFMono-Regular", Consolas, monospace;
        }

        .terminal-body {
          padding: 18px;
          min-height: 210px;
          color: #b8fbd9;
          font: 11px/1.9 "SFMono-Regular", Consolas, monospace;
        }

        .terminal-line-dim {
          color: #66847b;
        }

        .terminal-line-accent {
          color: var(--accent);
        }

        .terminal-orb {
          position: absolute;
          width: 300px;
          height: 300px;
          border-radius: 50%;
          right: -100px;
          top: -120px;
          border: 1px solid rgba(141, 255, 202, 0.08);
          box-shadow:
            0 0 0 30px rgba(141, 255, 202, 0.02),
            0 0 0 60px rgba(141, 255, 202, 0.015);
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
          margin-top: 14px;
        }

        .stat-card {
          border: 1px solid var(--line);
          border-radius: 16px;
          padding: 18px;
          background: var(--panel);
        }

        .stat-label {
          color: var(--muted);
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }

        .stat-value {
          margin-top: 8px;
          font-size: 25px;
          font-weight: 850;
          letter-spacing: -0.04em;
        }

        .stat-extra {
          color: var(--accent);
          font-size: 10px;
          margin-top: 4px;
        }

        .dashboard-grid {
          display: grid;
          grid-template-columns: 1.3fr 0.7fr;
          gap: 14px;
          margin-top: 14px;
        }

        .panel {
          border: 1px solid var(--line);
          border-radius: 18px;
          background: var(--panel);
          overflow: hidden;
        }

        .panel-header {
          padding: 18px 18px 13px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }

        .panel-title {
          margin: 0;
          font-size: 14px;
          letter-spacing: -0.01em;
        }

        .panel-subtitle {
          color: var(--muted);
          font-size: 10px;
          margin-top: 4px;
        }

        .panel-body {
          padding: 0 18px 18px;
        }

        .level-box {
          padding: 18px;
          border-radius: 15px;
          background:
            linear-gradient(
              135deg,
              rgba(141, 255, 202, 0.08),
              rgba(128, 200, 255, 0.035)
            );
          border: 1px solid var(--line);
        }

        .level-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          gap: 15px;
        }

        .level-number {
          font-size: 31px;
          font-weight: 900;
        }

        .level-caption {
          color: var(--muted);
          font: 10px "SFMono-Regular", Consolas, monospace;
        }

        .level-xp {
          text-align: right;
          color: var(--soft);
          font-size: 11px;
        }

        .level-progress {
          margin-top: 15px;
        }

        .progress-wrap {
          display: flex;
          align-items: center;
          gap: 9px;
        }

        .progress-track {
          height: 7px;
          flex: 1;
          overflow: hidden;
          background: rgba(255, 255, 255, 0.06);
          border-radius: 999px;
        }

        .progress-fill {
          height: 100%;
          background: var(--accent);
          border-radius: inherit;
          box-shadow: 0 0 14px rgba(141, 255, 202, 0.3);
        }

        .progress-value {
          color: var(--muted);
          font-size: 9px;
          min-width: 30px;
          text-align: right;
        }

        .streak {
          margin-top: 13px;
          display: flex;
          align-items: center;
          gap: 9px;
          color: var(--soft);
          font-size: 11px;
        }

        .streak strong {
          color: var(--orange);
        }

        .daily-card {
          border: 1px solid rgba(255, 184, 107, 0.18);
          background: rgba(255, 184, 107, 0.035);
          border-radius: 15px;
          padding: 18px;
        }

        .daily-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 10px;
        }

        .daily-icon {
          font-size: 26px;
        }

        .daily-title {
          font-size: 16px;
          font-weight: 800;
          margin-top: 9px;
        }

        .daily-copy {
          color: var(--muted);
          font-size: 11px;
          line-height: 1.6;
          margin-top: 7px;
        }

        .daily-meta {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          margin-top: 14px;
        }

        .pill {
          display: inline-flex;
          align-items: center;
          min-height: 24px;
          padding: 0 8px;
          border-radius: 999px;
          border: 1px solid var(--line);
          background: rgba(255, 255, 255, 0.025);
          color: var(--muted);
          font-size: 9px;
          font-weight: 700;
        }

        .pill-green {
          color: var(--accent);
          border-color: rgba(141, 255, 202, 0.18);
          background: rgba(141, 255, 202, 0.06);
        }

        .pill-orange {
          color: var(--orange);
          border-color: rgba(255, 184, 107, 0.2);
          background: rgba(255, 184, 107, 0.05);
        }

        .pill-blue {
          color: var(--blue);
          border-color: rgba(128, 200, 255, 0.18);
          background: rgba(128, 200, 255, 0.05);
        }

        .pill-purple {
          color: var(--purple);
          border-color: rgba(189, 167, 255, 0.18);
          background: rgba(189, 167, 255, 0.05);
        }

        .pill-red {
          color: var(--danger);
          border-color: rgba(255, 133, 133, 0.18);
          background: rgba(255, 133, 133, 0.05);
        }

        .activity-list {
          display: grid;
        }

        .activity-item {
          display: grid;
          grid-template-columns: 34px 1fr auto;
          align-items: center;
          gap: 10px;
          padding: 13px 18px;
          border-top: 1px solid var(--line);
        }

        .activity-icon {
          width: 32px;
          height: 32px;
          display: grid;
          place-items: center;
          border-radius: 10px;
          background: rgba(141, 255, 202, 0.05);
          border: 1px solid var(--line);
          font-size: 14px;
        }

        .activity-text {
          font-size: 10px;
          color: var(--soft);
        }

        .activity-text strong {
          color: var(--text);
        }

        .activity-time {
          color: var(--muted);
          font-size: 9px;
          margin-top: 3px;
        }

        .activity-xp {
          color: var(--accent);
          font: 700 9px "SFMono-Regular", Consolas, monospace;
        }

        .section-spacer {
          margin-top: 28px;
        }

        .challenge-toolbar {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          align-items: center;
          margin-bottom: 16px;
        }

        .search {
          flex: 1;
          min-width: 200px;
          height: 42px;
          border: 1px solid var(--line);
          border-radius: 11px;
          background: rgba(255, 255, 255, 0.025);
          color: var(--text);
          outline: none;
          padding: 0 13px;
          font-size: 11px;
        }

        .search:focus {
          border-color: var(--line-strong);
          box-shadow: 0 0 0 3px rgba(141, 255, 202, 0.04);
        }

        .filter-row {
          display: flex;
          gap: 6px;
          overflow-x: auto;
          padding-bottom: 3px;
        }

        .filter {
          flex: 0 0 auto;
          height: 38px;
          padding: 0 12px;
          border-radius: 10px;
          border: 1px solid var(--line);
          background: rgba(255, 255, 255, 0.02);
          color: var(--muted);
          font-size: 10px;
          font-weight: 700;
        }

        .filter.active {
          color: #06120d;
          background: var(--accent);
          border-color: var(--accent);
        }

        .challenge-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 13px;
        }

        .challenge-card {
          position: relative;
          border: 1px solid var(--line);
          border-radius: 18px;
          background:
            linear-gradient(
              180deg,
              rgba(255, 255, 255, 0.025),
              rgba(255, 255, 255, 0.008)
            ),
            var(--panel);
          padding: 17px;
          transition: 0.22s ease;
          overflow: hidden;
        }

        .challenge-card:hover {
          transform: translateY(-3px);
          border-color: var(--line-strong);
          box-shadow: 0 18px 50px rgba(0, 0, 0, 0.2);
        }

        .challenge-card::after {
          content: "";
          position: absolute;
          width: 100px;
          height: 100px;
          border-radius: 50%;
          right: -45px;
          top: -45px;
          background: rgba(141, 255, 202, 0.035);
        }

        .challenge-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 10px;
        }

        .challenge-icon {
          width: 44px;
          height: 44px;
          border-radius: 13px;
          display: grid;
          place-items: center;
          font-size: 21px;
          background: rgba(141, 255, 202, 0.055);
          border: 1px solid var(--line);
        }

        .challenge-type {
          color: var(--muted);
          font-size: 9px;
          font-weight: 750;
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }

        .challenge-title {
          margin: 14px 0 6px;
          font-size: 16px;
          letter-spacing: -0.025em;
        }

        .challenge-description {
          color: var(--muted);
          font-size: 10px;
          line-height: 1.65;
          min-height: 50px;
        }

        .challenge-meta {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
          margin-top: 12px;
        }

        .challenge-skills {
          display: flex;
          gap: 5px;
          flex-wrap: wrap;
          margin-top: 12px;
        }

        .skill-tag {
          color: #93ada5;
          font: 9px "SFMono-Regular", Consolas, monospace;
        }

        .challenge-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          border-top: 1px solid var(--line);
          margin-top: 14px;
          padding-top: 13px;
        }

        .reward {
          color: var(--accent);
          font-size: 10px;
          font-weight: 800;
        }

        .accept-btn {
          min-height: 34px;
          padding: 0 11px;
          border-radius: 9px;
          border: 1px solid rgba(141, 255, 202, 0.2);
          background: rgba(141, 255, 202, 0.06);
          color: var(--accent);
          font-size: 9px;
          font-weight: 800;
        }

        .accepted {
          color: #06120d;
          background: var(--accent);
          border-color: var(--accent);
        }

        .two-column {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 14px;
        }

        .task-list {
          display: grid;
        }

        .task-row {
          display: grid;
          grid-template-columns: 34px 1fr auto;
          gap: 11px;
          align-items: center;
          padding: 14px 18px;
          border-top: 1px solid var(--line);
        }

        .task-check {
          width: 29px;
          height: 29px;
          border-radius: 9px;
          border: 1px solid var(--line);
          display: grid;
          place-items: center;
          color: var(--muted);
          background: rgba(255, 255, 255, 0.02);
        }

        .task-check.done {
          color: #06120d;
          background: var(--accent);
          border-color: var(--accent);
        }

        .task-name {
          font-size: 11px;
          font-weight: 750;
        }

        .task-meta {
          display: flex;
          gap: 8px;
          margin-top: 4px;
          flex-wrap: wrap;
          color: var(--muted);
          font-size: 9px;
        }

        .task-xp {
          color: var(--accent);
          font-size: 9px;
          font-weight: 800;
        }

        .team-grid,
        .project-grid,
        .idea-grid,
        .event-grid,
        .resource-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 13px;
        }

        .team-card,
        .project-card,
        .idea-card,
        .event-card,
        .resource-card {
          border: 1px solid var(--line);
          border-radius: 17px;
          background: var(--panel);
          padding: 17px;
          transition: 0.2s ease;
        }

        .team-card:hover,
        .project-card:hover,
        .idea-card:hover,
        .event-card:hover,
        .resource-card:hover {
          border-color: var(--line-strong);
          transform: translateY(-2px);
        }

        .card-icon {
          width: 45px;
          height: 45px;
          border-radius: 13px;
          display: grid;
          place-items: center;
          font-size: 22px;
          border: 1px solid var(--line);
          background: rgba(141, 255, 202, 0.045);
        }

        .card-title {
          font-size: 15px;
          margin: 14px 0 6px;
          letter-spacing: -0.02em;
        }

        .card-description {
          color: var(--muted);
          font-size: 10px;
          line-height: 1.65;
          min-height: 50px;
        }

        .card-footer {
          border-top: 1px solid var(--line);
          margin-top: 14px;
          padding-top: 13px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 10px;
        }

        .member-count {
          color: var(--soft);
          font-size: 9px;
        }

        .tag-list {
          display: flex;
          flex-wrap: wrap;
          gap: 5px;
          margin-top: 12px;
        }

        .project-stats {
          display: flex;
          gap: 12px;
          color: var(--muted);
          font-size: 9px;
        }

        .project-author {
          color: var(--accent);
          font-size: 9px;
          margin-top: 10px;
        }

        .idea-votes {
          display: flex;
          align-items: center;
          gap: 9px;
          margin-top: 15px;
        }

        .vote-button {
          width: 38px;
          height: 38px;
          border: 1px solid var(--line);
          background: rgba(255, 255, 255, 0.025);
          color: var(--accent);
          border-radius: 10px;
          font-weight: 900;
        }

        .vote-count {
          font-size: 12px;
          font-weight: 800;
        }

        .leaderboard {
          border: 1px solid var(--line);
          border-radius: 18px;
          overflow: hidden;
          background: var(--panel);
        }

        .leader-row {
          display: grid;
          grid-template-columns: 55px 1fr 100px 80px;
          gap: 10px;
          align-items: center;
          padding: 15px 18px;
          border-top: 1px solid var(--line);
        }

        .leader-row:first-child {
          border-top: 0;
        }

        .leader-row.you {
          background: rgba(141, 255, 202, 0.045);
        }

        .leader-rank {
          color: var(--muted);
          font: 700 11px "SFMono-Regular", Consolas, monospace;
        }

        .leader-person {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .leader-avatar {
          width: 34px;
          height: 34px;
          display: grid;
          place-items: center;
          border-radius: 50%;
          background: rgba(141, 255, 202, 0.07);
          border: 1px solid var(--line);
          color: var(--accent);
          font-size: 10px;
          font-weight: 800;
        }

        .leader-name {
          font-size: 11px;
          font-weight: 750;
        }

        .leader-username {
          color: var(--muted);
          font-size: 9px;
          margin-top: 2px;
        }

        .leader-level {
          color: var(--muted);
          font-size: 9px;
        }

        .leader-xp {
          color: var(--accent);
          font-size: 10px;
          font-weight: 850;
          text-align: right;
        }

        .badge-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
        }

        .badge-card {
          border: 1px solid var(--line);
          border-radius: 14px;
          padding: 14px;
          background: rgba(255, 255, 255, 0.018);
        }

        .badge-icon {
          font-size: 22px;
        }

        .badge-name {
          font-size: 11px;
          font-weight: 800;
          margin-top: 8px;
        }

        .badge-description {
          color: var(--muted);
          font-size: 9px;
          line-height: 1.5;
          margin-top: 4px;
        }

        .calendar {
          margin-top: 14px;
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 5px;
        }

        .day {
          aspect-ratio: 1;
          border-radius: 6px;
          background: rgba(255, 255, 255, 0.035);
          border: 1px solid transparent;
        }

        .day.active {
          background: rgba(141, 255, 202, 0.17);
          border-color: rgba(141, 255, 202, 0.2);
        }

        .day.strong {
          background: var(--accent);
        }

        .event-date {
          color: var(--accent);
          font: 800 10px "SFMono-Regular", Consolas, monospace;
        }

        .event-type {
          color: var(--muted);
          font-size: 9px;
          margin-top: 10px;
        }

        .event-attendees {
          color: var(--soft);
          font-size: 9px;
        }

        .terminal-modal {
          position: fixed;
          inset: 0;
          z-index: 100;
          display: grid;
          place-items: center;
          padding: 20px;
          background: rgba(0, 0, 0, 0.62);
          backdrop-filter: blur(9px);
        }

        .terminal-window {
          width: min(760px, 100%);
          max-height: 80vh;
          border: 1px solid var(--line-strong);
          border-radius: 17px;
          overflow: hidden;
          background: #030908;
          box-shadow: 0 40px 120px rgba(0, 0, 0, 0.55);
        }

        .terminal-window .terminal-body {
          max-height: 60vh;
          overflow-y: auto;
        }

        .terminal-input-row {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 18px 18px;
          color: var(--accent);
          font: 11px "SFMono-Regular", Consolas, monospace;
        }

        .terminal-input {
          flex: 1;
          border: 0;
          outline: none;
          background: transparent;
          color: #c7ffe4;
          font: inherit;
        }

        .modal-backdrop {
          position: fixed;
          inset: 0;
          z-index: 90;
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(8px);
          display: grid;
          place-items: center;
          padding: 18px;
        }

        .challenge-modal {
          width: min(720px, 100%);
          max-height: 90vh;
          overflow-y: auto;
          border: 1px solid var(--line-strong);
          border-radius: 20px;
          background: #0a1614;
          box-shadow: var(--shadow);
        }

        .modal-header {
          padding: 20px;
          display: flex;
          justify-content: space-between;
          gap: 15px;
          border-bottom: 1px solid var(--line);
        }

        .modal-content {
          padding: 20px;
        }

        .modal-close {
          width: 34px;
          height: 34px;
          border: 1px solid var(--line);
          background: transparent;
          color: var(--muted);
          border-radius: 9px;
        }

        .modal-description {
          color: var(--soft);
          line-height: 1.7;
          font-size: 12px;
        }

        .modal-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 9px;
          margin-top: 17px;
        }

        .modal-stat {
          border: 1px solid var(--line);
          border-radius: 12px;
          padding: 13px;
          background: rgba(255, 255, 255, 0.02);
        }

        .modal-stat-label {
          color: var(--muted);
          font-size: 9px;
        }

        .modal-stat-value {
          color: var(--text);
          font-size: 12px;
          font-weight: 800;
          margin-top: 5px;
        }

        .modal-actions {
          display: flex;
          gap: 8px;
          margin-top: 18px;
        }

        .notification-backdrop {
          position: fixed;
          inset: 72px 0 0;
          z-index: 44;
          border: 0;
          background: rgba(0, 0, 0, 0.18);
        }

        .notification-actions {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .notification-close {
          width: 34px;
          height: 34px;
          flex: 0 0 auto;
        }

        .community-loading-bar {
          position: fixed;
          top: 72px;
          left: 0;
          right: 0;
          height: 2px;
          z-index: 70;
          overflow: hidden;
          background: rgba(141, 255, 202, 0.04);
          pointer-events: none;
        }

        .community-loading-bar span:first-child {
          display: block;
          width: 35%;
          height: 100%;
          background: var(--accent);
          box-shadow: 0 0 14px rgba(141, 255, 202, 0.45);
          animation: communityLoading 1.1s ease-in-out infinite;
        }

        @keyframes communityLoading {
          0% { transform: translateX(-120%); }
          100% { transform: translateX(320%); }
        }

        .sr-only {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border: 0;
        }

        .mobile-nav-count {
          position: absolute;
          top: 4px;
          right: 18%;
          min-width: 14px;
          height: 14px;
          padding: 0 4px;
          border-radius: 999px;
          display: grid;
          place-items: center;
          background: var(--accent);
          color: #06120d;
          font-size: 7px;
          font-weight: 900;
        }

        .notification-panel {
          position: fixed;
          top: 62px;
          right: 20px;
          width: min(350px, calc(100vw - 30px));
          z-index: 80;
          border: 1px solid var(--line-strong);
          border-radius: 16px;
          background: rgba(8, 19, 18, 0.96);
          box-shadow: var(--shadow);
          overflow: hidden;
        }

        .notification-item {
          padding: 14px;
          border-top: 1px solid var(--line);
        }

        .notification-item:first-child {
          border-top: 0;
        }

        .notification-title {
          font-size: 11px;
          font-weight: 800;
        }

        .notification-copy {
          color: var(--muted);
          font-size: 9px;
          line-height: 1.5;
          margin-top: 4px;
        }

        .toast {
          position: fixed;
          left: 50%;
          bottom: 24px;
          z-index: 200;
          transform: translateX(-50%);
          border: 1px solid var(--line-strong);
          border-radius: 12px;
          background: rgba(6, 17, 15, 0.96);
          color: var(--soft);
          padding: 11px 15px;
          box-shadow: var(--shadow);
          font-size: 11px;
          font-weight: 700;
        }

        .floating-terminal {
          position: fixed;
          right: 22px;
          bottom: 22px;
          z-index: 70;
          width: 48px;
          height: 48px;
          border-radius: 15px;
          border: 1px solid var(--line-strong);
          background: #0b1916;
          color: var(--accent);
          font: 800 14px "SFMono-Regular", Consolas, monospace;
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.35);
          transition: 0.2s ease;
        }

        .floating-terminal:hover {
          transform: translateY(-3px);
          background: var(--accent);
          color: #06120d;
        }

        .profile-section {
          display: grid;
          grid-template-columns: 0.75fr 1.25fr;
          gap: 14px;
        }

        .profile-card {
          border: 1px solid var(--line);
          border-radius: 18px;
          padding: 22px;
          background: var(--panel);
        }

        .profile-large {
          display: flex;
          align-items: center;
          gap: 13px;
        }

        .avatar-large {
          width: 60px;
          height: 60px;
          border-radius: 18px;
          display: grid;
          place-items: center;
          color: var(--accent);
          font-weight: 900;
          border: 1px solid var(--line-strong);
          background: rgba(141, 255, 202, 0.07);
        }

        .profile-large h2 {
          margin: 0;
          font-size: 18px;
        }

        .profile-large p {
          color: var(--muted);
          margin: 4px 0 0;
          font-size: 10px;
        }

        .skill-cloud {
          display: flex;
          flex-wrap: wrap;
          gap: 7px;
          margin-top: 20px;
        }

        .skill-cloud .skill-tag {
          padding: 7px 9px;
          border: 1px solid var(--line);
          border-radius: 9px;
          background: rgba(255, 255, 255, 0.02);
        }

        .mobile-bottom-nav {
          display: none;
        }

        @media (max-width: 1200px) {
          .challenge-grid,
          .team-grid,
          .project-grid,
          .idea-grid,
          .event-grid,
          .resource-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .hero-grid {
            grid-template-columns: 1fr;
          }

          .dashboard-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 900px) {
          .layout {
            grid-template-columns: 1fr;
          }

          .sidebar {
            position: fixed;
            z-index: 60;
            left: 0;
            top: 72px;
            width: 270px;
            transform: translateX(-105%);
            transition: transform 0.25s ease;
            box-shadow: 30px 0 70px rgba(0, 0, 0, 0.35);
          }

          .sidebar.open {
            transform: translateX(0);
          }

          .mobile-menu-btn {
            display: grid;
          }

          .main {
            padding: 20px;
          }

          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .profile-mini {
            display: none;
          }
        }

        @media (max-width: 640px) {
          .topbar {
            padding: 0 13px;
            height: 64px;

           .notification-backdrop { inset: 64px 0 0; }
           .community-loading-bar { top: 64px; }
          }

          .layout {
            min-height: calc(100vh - 64px);
          }

          .sidebar {
            top: 64px;
            height: calc(100vh - 64px);
          }

          .brand-title {
            font-size: 12px;
          }

          .brand-path {
            font-size: 9px;
          }

          .main {
            padding: 14px;
            padding-bottom: 90px;
          }

          .hero {
            min-height: auto;
            padding: 21px;
            border-radius: 20px;
          }

          .hero h1 {
            font-size: 38px;
          }

          .hero-copy {
            font-size: 12px;
          }

          .hero-terminal {
            margin-top: 6px;
          }

          .stats-grid {
            gap: 8px;
          }

          .stat-card {
            padding: 14px;
          }

          .stat-value {
            font-size: 21px;
          }

          .challenge-grid,
          .team-grid,
          .project-grid,
          .idea-grid,
          .event-grid,
          .resource-grid,
          .two-column {
            grid-template-columns: 1fr;
          }

          .challenge-card {
            padding: 15px;
          }

          .section-header {
            align-items: flex-start;
            flex-direction: column;
            gap: 8px;
          }

          .section-title {
            font-size: 25px;
          }

          .leader-row {
            grid-template-columns: 38px 1fr auto;
          }

          .leader-level {
            display: none;
          }

          .leader-xp {
            text-align: right;
          }

          .badge-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .mobile-bottom-nav {
            position: fixed;
            display: grid;
            grid-template-columns: repeat(5, 1fr);
            bottom: 0;
            left: 0;
            right: 0;
            z-index: 55;
            height: 68px;
            padding: 7px 8px calc(7px + env(safe-area-inset-bottom));
            border-top: 1px solid var(--line);
            background: rgba(5, 14, 13, 0.94);
            backdrop-filter: blur(18px);
          }

          .mobile-nav-item {
             position: relative;
            border: 0;
            background: transparent;
            color: var(--muted);
            font-size: 9px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 4px;
            border-radius: 10px;
          }

          .mobile-nav-item.active {
            color: var(--accent);
            background: rgba(141, 255, 202, 0.05);
          }

          .mobile-nav-icon {
            font-size: 16px;
          }

          .floating-terminal {
            right: 15px;
            bottom: 82px;
          }

          .modal-grid {
            grid-template-columns: 1fr;
          }

          .modal-actions {
            flex-direction: column;
          }

          .modal-actions .btn {
            width: 100%;
          }
        }
      `}</style>

      <header className="topbar">
        <button className="brand" onClick={() => navigate('dashboard')} aria-label="BSIE Community home">
          <div className="brand-mark">&gt;_</div>
          <div className="brand-copy">
            <div className="brand-title">BSIE Community</div>
            <div className="brand-path">BSIE://community</div>
          </div>
        </button>

        <div className="top-actions">
          <button className="icon-button" onClick={() => setTerminalOpen(true)} aria-label="Open terminal">&gt;_</button>
          <button className="icon-button" onClick={() => setNotificationOpen((value) => !value)} aria-label="Notifications">
            ◉{notifications.some((item) => !item.read) ? <span className="notification-dot" /> : null}
          </button>

          <button
            className="profile-mini"
            onClick={() => {
              if (!user) openAuthModal();
              else if (isInstructor) window.location.href = '/instructor';
              else navigate('dashboard');
            }}
            title={user ? 'Open your profile / dashboard' : 'Sign in'}
          >
            <div className="avatar">{user?.avatarUrl ? <img src={user.avatarUrl} alt="" /> : initials(user?.name)}</div>
            <div>
              <div className="profile-name">{user?.username || user?.name || 'Guest'}</div>
              <div className="profile-level">
                {user ? `${String(user.role || 'student').toUpperCase()} · LEVEL ${level || '—'}` : 'STUDENT · SIGN IN'}
              </div>
            </div>
          </button>
        </div>
      </header>

      {notificationOpen && (
        <>
          <button className="notification-backdrop" aria-label="Close notifications" onClick={() => setNotificationOpen(false)} />
          <div className="notification-panel">
            <div className="panel-header">
              <div>
                <h3 className="panel-title">Notifications</h3>
                <div className="panel-subtitle">Live activity from your account</div>
              </div>
              <div className="notification-actions">
                {user && <button className="btn" onClick={() => mutate('/community/notifications/read-all')}>Mark all read</button>}
                <button className="icon-button notification-close" onClick={() => setNotificationOpen(false)} aria-label="Close notifications">×</button>
              </div>
            </div>
            {notifications.length ? notifications.map((item) => (
              <div className="notification-item" key={item.id}>
                <div className="notification-title">{item.title}</div>
                <div className="notification-copy">{item.message}</div>
                <div className="activity-time">{formatDate(item.createdAt)}</div>
              </div>
            )) : (
              <EmptyState icon="◉" title="No notifications" text={user ? 'You are all caught up.' : 'Sign in to receive community notifications.'} />
            )}
          </div>
        </>
      )}
      <div className="layout">
        <aside className={`sidebar ${mobileMenu ? 'open' : ''}`}>
          <div className="terminal-label">~/student/community</div>
          <nav className="nav">
            {navItems.map((item) => (
              <button key={item.id} className={`nav-item ${activeSection === item.id ? 'active' : ''}`} onClick={() => navigate(item.id)}>
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
                {item.count ? <span className="nav-count">{item.count}</span> : null}
              </button>
            ))}
            {isInstructor && (
              <button className={`nav-item ${activeSection === 'instructor' ? 'active' : ''}`} onClick={() => { window.location.href = '/instructor'; }}>
                <span className="nav-icon">⌘</span>
                <span className="nav-label">Instructor Console</span>
              </button>
            )}
          </nav>

          <div className="sidebar-terminal">
            <div className="sidebar-terminal-title">&gt; system.status()</div>
            <p>
              connection: {loading ? 'checking' : 'online'}
              <br />
              community: {community ? 'active' : 'offline'}
              <br />
              students: {stats.students ?? '—'}
              <br />
              challenges: {stats.challenges ?? challenges.length}
              <br />
              status: {loading ? 'syncing' : 'healthy'}
            </p>
          </div>
        </aside>

        <section className="main">
          {activeSection === 'dashboard' && (
            <>
              <section className="hero">
                <div className="terminal-orb" />
                <div className="hero-grid">
                  <div>
                    <div className="hero-kicker">&gt; system.boot(student_community)</div>
                    <h1>Build.<br />Learn.<br /><span>Connect.</span><span className="terminal-cursor" /></h1>
                    <p className="hero-copy">
                      Welcome to the BSIE Student Community — a live technical ecosystem for challenges, projects, teams, ideas and academic growth.
                    </p>
                    <div className="hero-actions">
                      <button className="btn btn-primary" onClick={() => user ? navigate('challenges') : openAuthModal()}>
                        {user ? 'Explore Challenges' : 'Sign in with UTB'}
                      </button>
                      <button className="btn btn-ghost" onClick={() => setTerminalOpen(true)}>Open Terminal &gt;_</button>
                    </div>
                  </div>

                  <div className="hero-terminal">
                    <div className="terminal-top"><span className="dot" /><span className="dot" /><span className="dot" /><span className="terminal-name">bsie-community — terminal</span></div>
                    <div className="terminal-body">
                      <div className="terminal-line-dim">$ whoami</div>
                      <div className="terminal-line-accent">{user?.username || user?.email || 'guest'}</div>
                      <br />
                      <div className="terminal-line-dim">$ status</div>
                      <div>role: {user?.role || 'guest'}</div>
                      <div>level: {user?.level ?? '—'}</div>
                      <div>xp: {user?.xp ?? '—'}</div>
                      <div>streak: {user?.streak != null ? `${user.streak} days` : '—'}</div>
                      <div>rank: {user?.rank ?? '—'}</div>
                      <br />
                      <div className="terminal-line-accent">{user ? 'System ready.' : 'Authentication required.'}</div>
                      <div className="terminal-line-dim">{user ? 'Type "help" for commands.' : 'Click Guest to sign in.'}</div>
                    </div>
                  </div>
                </div>
              </section>

              <div className="stats-grid">
                {[
                  ['XP', user?.xp ?? '—', user?.weeklyXp != null ? `+${user.weeklyXp} this week` : 'Live from account'],
                  ['Challenges', user?.challengesCompleted ?? '—', 'completed'],
                  ['Projects', user?.projectsCount ?? '—', 'showcased'],
                  ['Rank', user?.rank ?? '—', 'BSIE students'],
                ].map(([label, value, extra]) => (
                  <div className="stat-card" key={label}>
                    <div className="stat-label">{label}</div>
                    <div className="stat-value">{value}</div>
                    <div className="stat-extra">{extra}</div>
                  </div>
                ))}
              </div>

              <div className="dashboard-grid section-spacer">
                <div className="panel">
                  <div className="panel-header">
                    <div><h3 className="panel-title">Your Progress</h3><div className="panel-subtitle">Calculated from your real account activity</div></div>
                    <Pill tone="green">LEVEL {level || '—'}</Pill>
                  </div>
                  <div className="panel-body">
                    {user ? (
                      <div className="level-box">
                        <div className="level-row">
                          <div><div className="level-caption">CURRENT LEVEL</div><div className="level-number">{level}</div></div>
                          <div className="level-xp">{xp} / {nextLevelXP || '—'} XP</div>
                        </div>
                        <div className="level-progress"><ProgressBar value={levelProgress} /></div>
                        <div className="streak"><span>🔥</span><strong>{user.streak ?? 0} day streak</strong><span>Keep it going!</span></div>
                      </div>
                    ) : (
                      <EmptyState icon="↗" title="Sign in to track progress" text="XP, levels, streaks and rank are calculated from your real academic activity." action={<button className="btn btn-primary" onClick={openAuthModal}>Sign in</button>} />
                    )}
                  </div>
                </div>

                <div className="panel">
                  <div className="panel-header">
                    <div><h3 className="panel-title">Daily Challenge</h3><div className="panel-subtitle">Published by the academic system</div></div>
                    {dailyChallenge?.reward != null && <Pill tone="orange">+{dailyChallenge.reward} XP</Pill>}
                  </div>
                  <div className="panel-body">
                    {dailyChallenge ? (
                      <div className="daily-card">
                        <div className="daily-top">
                          <div><Pill tone="orange">{dailyChallenge.time || '—'}</Pill><div className="daily-title">{dailyChallenge.title}</div></div>
                          <div className="daily-icon">{dailyChallenge.icon || '⚡'}</div>
                        </div>
                        <div className="daily-copy">{dailyChallenge.description}</div>
                        <div className="daily-meta">{(dailyChallenge.skills || []).slice(0, 3).map((skill) => <Pill key={skill}>#{skill}</Pill>)}</div>
                        <button className="btn btn-primary" style={{ marginTop: 16, width: '100%' }} disabled={!user || actionLoading} onClick={() => acceptChallenge(dailyChallenge)}>
                          {user ? 'Start Daily Challenge' : 'Sign in to Start'}
                        </button>
                      </div>
                    ) : (
                      <EmptyState icon="⚡" title="No daily challenge" text="No challenge has been published for today." />
                    )}
                  </div>
                </div>
              </div>

              <div className="two-column section-spacer">
                <div className="panel">
                  <div className="panel-header"><div><h3 className="panel-title">Recommended for You</h3><div className="panel-subtitle">Live challenges selected by the platform</div></div><button className="btn" onClick={() => navigate('challenges')}>View all</button></div>
                  <div className="panel-body">
                    {challenges.slice(0, 3).map((challenge) => (
                      <div key={challenge.id} style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '10px 0', borderTop: '1px solid var(--line)' }}>
                        <div className="challenge-icon">{challenge.icon || '⚡'}</div>
                        <div style={{ flex: 1 }}><div style={{ fontSize: 11, fontWeight: 800 }}>{challenge.title}</div><div style={{ color: 'var(--muted)', fontSize: 9, marginTop: 3 }}>{challenge.category || '—'} · {challenge.time || '—'}</div></div>
                        <Pill tone="green">+{challenge.reward || 0}</Pill>
                      </div>
                    ))}
                    {!challenges.length && <EmptyState icon="⚡" title="No challenges yet" text="Your instructors have not published any challenges." />}
                  </div>
                </div>

                <div className="panel">
                  <div className="panel-header"><div><h3 className="panel-title">Community Activity</h3><div className="panel-subtitle">Live activity from the platform</div></div></div>
                  <div className="activity-list">
                    {activity.slice(0, 5).map((item) => (
                      <div className="activity-item" key={item.id}>
                        <div className="activity-icon">{item.icon || '•'}</div>
                        <div><div className="activity-text"><strong>{item.user || 'Member'}</strong> {item.action || ''} <strong>{item.target || ''}</strong></div><div className="activity-time">{item.time || formatDate(item.createdAt)}</div></div>
                        {item.xp != null && <div className="activity-xp">{item.xp}</div>}
                      </div>
                    ))}
                    {!activity.length && <EmptyState icon="◌" title="No activity yet" text="Community activity will appear here as members participate." />}
                  </div>
                </div>
              </div>

              <div className="two-column section-spacer">
                <div className="panel">
                  <div className="panel-header"><div><h3 className="panel-title">Upcoming Deadlines</h3><div className="panel-subtitle">Academic and community deadlines</div></div></div>
                  <div className="panel-body">
                    {deadlines.length ? deadlines.slice(0, 5).map((item) => (
                      <div key={item.id} className="task-row">
                        <div><strong>{item.title}</strong><div className="task-meta">{formatDate(item.deadline || item.dueAt)}</div></div>
                        {item.xp != null && <Pill tone="orange">+{item.xp} XP</Pill>}
                      </div>
                    )) : <EmptyState icon="◷" title="No upcoming deadlines" text="Deadlines will appear when instructors publish academic work." />}
                  </div>
                </div>

                <div className="panel">
                  <div className="panel-header"><div><h3 className="panel-title">Verified Achievements</h3><div className="panel-subtitle">Earned from real platform activity</div></div><button className="btn" onClick={() => navigate('resources')}>Explore</button></div>
                  <div className="panel-body">
                    {badges.length ? (
                      <div className="badge-grid">{badges.slice(0, 6).map((badge) => <div className={`badge-card ${badge.unlocked ? 'unlocked' : ''}`} key={badge.id}><div className="badge-icon">{badge.icon || '◇'}</div><div><strong>{badge.name}</strong><div>{badge.description || (badge.unlocked ? 'Verified achievement' : 'Locked')}</div></div></div>)}</div>
                    ) : <EmptyState icon="◇" title="No badges yet" text="Verified badges appear when you meet their real criteria." />}
                  </div>
                </div>
              </div>
            </>
          )}
{activeSection === 'challenges' && (
            <section className="page-section">
              <div className="section-command-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px', marginBottom: '24px' }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: '22px' }}>Engineering Challenges</h2>
                </div>
                <button className="btn btn-primary" onClick={openAuthModal}>
                  {user ? 'View Profile' : 'Sign in'}
                </button>
              </div>

              <div className="challenge-grid">
                {filteredChallenges.map((challenge) => (
                  <article className="challenge-card" key={challenge.id}>
                    <div className="challenge-top">
                      <div className="challenge-icon">{challenge.icon || '⚡'}</div>
                      <Pill tone={challenge.status === 'Open' ? 'green' : 'orange'}>{challenge.status || '—'}</Pill>
                    </div>
                    <div className="challenge-type">{challenge.type || challenge.category || 'Challenge'}</div>
                    <h3>{challenge.title}</h3>
                    <p>{challenge.description}</p>
                    <div className="challenge-meta">
                      <span>{challenge.time || '—'}</span>
                      <Difficulty level={challenge.difficultyLevel} />
                      <span>+{challenge.reward || 0} XP</span>
                    </div>
                    <div className="skill-row">{(challenge.skills || []).map((skill) => <Pill key={skill}>{skill}</Pill>)}</div>
                    <button className="btn btn-primary" style={{ width: '100%', marginTop: 14 }} onClick={() => setSelectedChallenge(challenge)}>VIEW CHALLENGE</button>
                  </article>
                ))}
              </div>

              {!filteredChallenges.length && (
                <EmptyState 
                  icon="⚡" 
                  title="No challenges available" 
                  text="There are no published challenges matching your filters." 
                  action={
                    <button className="btn btn-primary radar-btn" onClick={() => showToast('Challenge notification set!')}>
                      [ NOTIFY ME ON NEW CHALLENGE ]
                    </button>
                  }
                />
              )}
            </section>
          )}

          {activeSection === 'tasks' && (
            <section className="page-section">
              <div className="section-heading"><div><div className="section-kicker">&gt; tasks.queue()</div><h2>Your Tasks</h2><p>Tasks assigned by the academic system.</p></div></div>
              <div className="panel">
                <div className="panel-body">
                  {tasks.length ? tasks.map((task) => (
                    <div className="task-row" key={task.id}>
                      <div><strong>{task.title}</strong><div className="task-meta">{task.course || '—'} · {task.status || 'Pending'} · {task.deadline ? formatDate(task.deadline) : 'No deadline'}</div></div>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>{task.xp != null && <Pill tone="orange">+{task.xp} XP</Pill>}<button className="btn" disabled={!user || actionLoading || task.status === 'Completed'} onClick={() => completeTask(task)}>{task.status === 'Completed' ? 'COMPLETED ✓' : 'COMPLETE'}</button></div>
                    </div>
                  )) : <EmptyState icon="✓" title="No tasks assigned" text="Assigned tasks will appear here when an instructor publishes them." />}
                </div>
              </div>
            </section>
          )}

          {activeSection === 'teams' && (
            <section className="page-section">
              <div className="section-heading"><div><div className="section-kicker">&gt; teams.directory()</div><h2>Teams</h2><p>Join or discover teams created by the community.</p></div></div>
              <div className="resource-grid">
                {teams.map((team) => (
                  <article className="resource-card" key={team.id}>
                    <div className="card-icon">👥</div><Pill tone="blue">{team.status || 'Open'}</Pill><h3 className="card-title">{team.name}</h3><div className="project-author">{team.challenge || 'Community team'}</div><div className="skill-row">{(team.skills || []).map((skill) => <Pill key={skill}>{skill}</Pill>)}</div><div className="card-footer"><span className="project-stats">{team.members || 0}/{team.max || 0}</span><button className="accept-btn" disabled={!user || actionLoading || team.members >= team.max} onClick={() => joinTeam(team)}>{team.members >= team.max ? 'FULL' : user ? 'JOIN' : 'SIGN IN'}</button></div>
                  </article>
                ))}
              </div>
              {!teams.length && <EmptyState icon="👥" title="No teams yet" text="Teams will appear after students create or join them." />}
            </section>
          )}

          {activeSection === 'projects' && (
            <section className="page-section">
              <div className="section-heading"><div><div className="section-kicker">&gt; projects.showcase()</div><h2>Projects</h2><p>Student work published by the community.</p></div></div>
              <div className="resource-grid">
                {projects.map((project) => (
                  <article className="resource-card" key={project.id}>
                    <div className="card-icon">{project.icon || '🚀'}</div><Pill tone="blue">{project.status || 'Published'}</Pill><h3 className="card-title">{project.title}</h3><div className="project-author">{project.authorName || project.author || 'Community member'}</div><p>{project.description || ''}</p><div className="skill-row">{(project.tech || project.skills || []).map((skill) => <Pill key={skill}>{skill}</Pill>)}</div><div className="card-footer"><span className="project-stats">♡ {project.likes || 0}</span><button className="accept-btn" disabled={!user || actionLoading} onClick={() => likeProject(project)}>{user ? 'LIKE' : 'SIGN IN'}</button></div>
                  </article>
                ))}
              </div>
              {!projects.length && <EmptyState icon="🚀" title="No projects yet" text="Be the first to showcase a real BSIE project." />}
            </section>
          )}

          {activeSection === 'ideas' && (
            <section className="page-section">
              <div className="section-heading"><div><div className="section-kicker">&gt; ideas.hub()</div><h2>Community Ideas</h2><p>Ideas proposed and voted on by the community.</p></div></div>
              <div className="resource-grid">
                {ideas.map((idea) => (
                  <article className="resource-card" key={idea.id}>
                    <div className="card-icon">💡</div><Pill tone="purple">{idea.category || 'Community'}</Pill><h3 className="card-title">{idea.title}</h3><div className="project-author">{idea.authorName || idea.author || 'Community member'}</div><p>{idea.description || ''}</p><div className="card-footer"><span className="project-stats">▲ {idea.votes || 0}</span><button className="accept-btn" disabled={!user || actionLoading} onClick={() => voteIdea(idea)}>{user ? 'VOTE' : 'SIGN IN'}</button></div>
                  </article>
                ))}
              </div>
              {!ideas.length && <EmptyState icon="💡" title="No ideas yet" text="Community ideas will appear here when students submit them." />}
            </section>
          )}

          {activeSection === 'leaderboard' && (
            <section className="page-section">
              <div className="section-heading"><div><div className="section-kicker">&gt; leaderboard.rank()</div><h2>Smart Leaderboard</h2><p>Ranking calculated from verified XP.</p></div></div>
              <div className="leaderboard">
                {leaderboard.map((person) => <div className={`leader-row ${user && person.id === user.id ? 'you' : ''}`} key={person.id || person.rank}><div className="leader-rank">{person.rank || '—'}</div><div className="avatar">{initials(person.name)}</div><div style={{ flex: 1 }}><div className="leader-name">{person.name || 'Member'} {person.ambassador ? <Pill tone="green">AMBASSADOR</Pill> : null}</div><div className="leader-meta">{person.level != null ? `LEVEL ${person.level}` : ''}</div></div><strong>{person.xp ?? 0} XP</strong></div>)}
              </div>
              {!leaderboard.length && <EmptyState icon="🏆" title="Leaderboard is empty" text="Ranking will appear after students earn verified XP." />}
            </section>
          )}

          {activeSection === 'events' && (
            <section className="page-section">
              <div className="section-heading"><div><div className="section-kicker">&gt; events.schedule()</div><h2>Events</h2><p>Workshops, seminars, competitions and community events.</p></div></div>
              <div className="resource-grid">
                {events.map((event) => (
                  <article className="resource-card" key={event.id}>
                    <div className="card-icon">{event.icon || '◈'}</div><Pill tone="orange">{event.type || 'Event'}</Pill><h3 className="card-title">{event.title}</h3><div className="project-author">{formatDate(event.startsAt || event.date)}</div><p>{event.description || ''}</p><div className="card-footer"><span className="project-stats">{event.capacity ? `${event.registered || 0}/${event.capacity}` : ''}</span>{event.registeredByMe ? <button className="accept-btn" onClick={() => unregisterEvent(event)}>REGISTERED ✓</button> : <button className="accept-btn" disabled={!user || actionLoading} onClick={() => registerEvent(event)}>{user ? 'REGISTER' : 'SIGN IN'}</button>}</div>
                  </article>
                ))}
              </div>
              {!events.length && <EmptyState icon="◈" title="No upcoming events" text="Events will appear here when they are published." />}
            </section>
          )}

          {activeSection === 'resources' && (
            <section className="page-section">
              <div className="section-heading"><div><div className="section-kicker">&gt; resources.index()</div><h2>Resources & Badges</h2><p>Academic resources and verified achievements.</p></div></div>
              <div className="resource-grid">
                {resources.map((resource) => <article className="resource-card" key={resource.id}><div className="card-icon">{resource.icon || '▣'}</div><Pill tone="blue">{resource.type || 'Resource'}</Pill><h3 className="card-title">{resource.title}</h3><div className="project-author">{resource.authorName || resource.author || 'Academic resource'}</div><p>{resource.description || ''}</p><div className="card-footer"><span className="project-stats">♡ {resource.likes || 0}</span><button className="accept-btn" onClick={() => resource.url ? window.open(resource.url, '_blank', 'noopener,noreferrer') : showToast('Resource link is not available.')}>OPEN</button></div></article>)}
              </div>
              {!resources.length && <EmptyState icon="▣" title="No resources yet" text="Resources will appear when instructors publish them." />}
            </section>
          )}
        </section>
      </div>

      {loading && (
        <div className="community-loading-bar" role="status" aria-live="polite">
          <span />
          <span className="sr-only">Syncing community data…</span>
        </div>
      )}

      <nav className="mobile-bottom-nav" aria-label="Mobile community navigation">
        {mobileNavItems.map((item) => (
          <button
            key={item.id}
            className={`mobile-nav-item ${activeSection === item.id ? 'active' : ''}`}
            onClick={() => navigate(item.id)}
            aria-current={activeSection === item.id ? 'page' : undefined}
          >
            <span className="mobile-nav-icon">{item.icon}</span>
            <span>{item.label}</span>
            {item.count ? <span className="mobile-nav-count">{item.count}</span> : null}
          </button>
        ))}
      </nav>

      <button className="floating-terminal" onClick={() => setTerminalOpen(true)} aria-label="Open BSIE terminal">&gt;_</button>

      <button className="mobile-menu-button" onClick={() => setMobileMenu((value) => !value)} aria-label="Open menu">☰</button>

      {terminalOpen && (
        <div className="terminal-modal" onMouseDown={(event) => { if (event.target === event.currentTarget) setTerminalOpen(false); }}>
          <div className="terminal-window">
            <div className="terminal-top"><span className="dot" /><span className="dot" /><span className="dot" /><span className="terminal-name">BSIE Community Terminal</span><button onClick={() => setTerminalOpen(false)} style={{ marginLeft: 'auto', border: 0, background: 'transparent', color: 'var(--muted)', fontSize: 20 }}>×</button></div>
            <div className="terminal-body">
              {terminalLines.map((line, index) => <div key={`${line}-${index}`} className={line.startsWith('>') || line.includes('ready') ? 'terminal-line-accent' : ''}>{line || '\u00A0'}</div>)}
              <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                <span className="terminal-line-accent">&gt;</span>
                <input autoFocus value={terminalInput} onChange={(event) => setTerminalInput(event.target.value)} onKeyDown={handleTerminalKeyDown} placeholder="type a command..." style={{ flex: 1, background: 'transparent', border: 0, outline: 0, color: 'var(--text)', fontFamily: 'inherit' }} />
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedChallenge && (
        <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelectedChallenge(null); }}>
          <article className="modal-card">
            <div className="modal-header"><div><div className="section-kicker">&gt; challenge.inspect()</div><h2>{selectedChallenge.title}</h2></div><button className="icon-button" onClick={() => setSelectedChallenge(null)}>×</button></div>
            <p>{selectedChallenge.description}</p>
            <div className="skill-row">{(selectedChallenge.skills || []).map((skill) => <Pill key={skill}>{skill}</Pill>)}</div>
            <div className="modal-actions">
              <button className="btn btn-primary" disabled={!user || actionLoading} onClick={() => { acceptChallenge(selectedChallenge); setSelectedChallenge(null); }}>{user ? 'ACCEPT CHALLENGE' : 'SIGN IN TO ACCEPT'}</button>
              {selectedChallenge.mode === 'Team' && <button className="btn" onClick={() => { setSelectedChallenge(null); navigate('teams'); }}>FIND A TEAM</button>}
              <button className="btn" onClick={() => setSelectedChallenge(null)}>CLOSE</button>
            </div>
          </article>
        </div>
      )}

{authModal && (
        <div className="auth-terminal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) closeAuthModal(); }}>
          <article className="auth-terminal-card" role="dialog" aria-modal="true" aria-labelledby="auth-terminal-title">
            <div className="auth-terminal-chrome">
              <div className="auth-terminal-dots"><span /><span /><span /></div>
              <div className="auth-terminal-path">bsie://auth</div>
              <button className="auth-close" onClick={closeAuthModal} disabled={authBusy} aria-label="Close authentication">×</button>
            </div>

            <div className="auth-terminal-body">
              <div className="auth-kicker">&gt; auth.utb()</div>
              <div className="auth-title-row">
                <div>
                  <h2 id="auth-terminal-title">University Identity Terminal</h2>
                  <p>Authenticate with your email and student ID.</p>
                </div>
                <div className="auth-status">{authBusy ? 'CONNECTING' : 'SECURE'}</div>
              </div>

              <div className="auth-progress" aria-label={`Authentication step ${authStep} of 3`}>
                {[['01','ROLE'],['02','IDENTITY'],['03','OTP']].map(([number, label], index) => {
                  const step = index + 1;
                  return (
                    <div className={`auth-progress-step ${authStep >= step ? 'done' : ''} ${authStep === step ? 'current' : ''}`} key={label}>
                      <span className="auth-progress-node">{authStep > step ? '✓' : number}</span>
                      <span>{label}</span>
                    </div>
                  );
                })}
              </div>

              {authStep === 1 && (
                <section className="auth-stage">
                  <div className="auth-command">$ identify.user()</div>
                  <h3>Choose your access profile</h3>
                  <p className="auth-stage-copy">Your role controls which workspace and permissions are available after authentication.</p>
                  <div className="auth-role-grid">
                    <button className="auth-role-card" onClick={() => selectAuthRole('student')}>
                      <span className="auth-role-icon">ST</span>
                      <span><strong>STUDENT</strong><small>BSIE student account</small></span>
                      <span className="auth-arrow">→</span>
                    </button>
                    <button className="auth-role-card" onClick={() => selectAuthRole('instructor')}>
                      <span className="auth-role-icon">DR</span>
                      <span><strong>INSTRUCTOR</strong><small>Faculty / academic account</small></span>
                      <span className="auth-arrow">→</span>
                    </button>
                    <button className="auth-role-card auth-role-guest" onClick={() => selectAuthRole('guest')}>
                      <span className="auth-role-icon">GU</span>
                      <span><strong>GUEST</strong><small>Public community access</small></span>
                      <span className="auth-arrow">→</span>
                    </button>
                  </div>
                </section>
              )}

              {authStep === 2 && authRole !== 'guest' && (
                <section className="auth-stage">
                  <div className="auth-command">$ identify.student()</div>
                  <h3>Enter your email & student ID</h3>
                  <p className="auth-stage-copy">A 6-digit verification code will be sent to your email.</p>
                  
                  <label className="auth-field-label">EMAIL ADDRESS</label>
                  <div className="auth-input-shell">
                    <span>&gt;</span>
                    <input autoFocus type="email" value={utbEmail} onChange={(event) => { setUtbEmail(event.target.value.toLowerCase()); setOtpError(''); }} placeholder="name@domain.com" autoComplete="email" />
                  </div>

                  <label className="auth-field-label">STUDENT ID</label>
                  <div className="auth-input-shell">
                    <span>&gt;</span>
                    <input type="text" value={studentId} onChange={(event) => { setStudentId(event.target.value); setOtpError(''); }} placeholder="e.g. 20260000" />
                  </div>

                  <div className="auth-derived-email">Mode: <strong>Open Email Registration</strong></div>
                  {otpError && <div className="otp-error" role="alert">{otpError}</div>}
                  <div className="auth-actions">
                    <button className="btn" onClick={() => setAuthStep(1)} disabled={authBusy}>← BACK</button>
                    <button className="btn btn-primary" onClick={() => continueIdentityStep()} disabled={authBusy}>{authBusy ? 'SENDING...' : 'SEND VERIFICATION CODE'}</button>
                  </div>
                </section>
              )}

              {authStep === 2 && authRole === 'guest' && (
                <section className="auth-stage">
                  <div className="auth-command">$ guest.session()</div>
                  <h3>Continue with limited access</h3>
                  <p className="auth-stage-copy">Guest mode lets you explore public community content without university authentication.</p>
                  <div className="guest-permissions"><span>✓ Explore public content</span><span>✓ View events and resources</span><span>× Submit work</span><span>× Earn XP / join private teams</span></div>
                  <div className="auth-actions"><button className="btn" onClick={() => setAuthStep(1)}>← BACK</button><button className="btn btn-primary" onClick={continueAsGuest}>CONTINUE AS GUEST →</button></div>
                </section>
              )}

              {authStep === 3 && authRole !== 'guest' && (
                <section className="auth-stage">
                  <div className="auth-command">$ verify.access()</div>
                  <h3>VERIFY ACCESS CODE</h3>
                  <p className="auth-stage-copy">A 6-digit verification code was sent to <strong>{utbEmail}</strong></p>
                  {otpMessage && <div className="otp-message" role="status">{otpMessage}</div>}
                  <label className="auth-field-label" htmlFor="utb-otp">6-DIGIT CODE</label>
                  <input
                    id="utb-otp"
                    className="otp-input"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    autoFocus
                    value={otpCode}
                    onChange={(event) => {
                      setOtpCode(event.target.value.replace(/\D/g, '').slice(0, 6));
                      setOtpError('');
                    }}
                    onKeyDown={(event) => { if (event.key === 'Enter') verifyOtp(); }}
                    placeholder="______"
                    aria-label="6-digit verification code"
                  />
                  {otpError && <div className="otp-error" role="alert">{otpError}</div>}
                  <button className="otp-verify-button" onClick={verifyOtp} disabled={authBusy || otpCode.length !== 6}>
                    {authBusy ? 'VERIFYING...' : 'VERIFY CODE'}
                    <b>→</b>
                  </button>
                  <div className="otp-resend">
                    <span>Didn't receive it?</span>
                    <button type="button" onClick={resendOtp} disabled={authBusy || otpResendSeconds > 0}>
                      {otpResendSeconds > 0 ? `RESEND IN ${otpResendSeconds}s` : 'RESEND CODE'}
                    </button>
                  </div>
                  <div className="auth-actions">
                    <button className="btn" onClick={() => { setAuthStep(2); setOtpCode(''); setOtpError(''); }} disabled={authBusy}>← CHANGE EMAIL</button>
                  </div>
                </section>
              )}
              <div className="auth-terminal-footer">session:// university-auth · provider:// OTP · mode:// open-domain</div>
            </div>
          </article>
        </div>
      )}
      {toast && <div className="toast">{toast}</div>}
    
<style jsx global>{`
  .profile-mini { cursor: pointer; border: 0; background: transparent; font: inherit; text-align: left; color: inherit; display: flex; align-items: center; gap: 10px; padding: 4px 8px; border-radius: 12px; }
  .profile-mini:hover { background: rgba(141,255,202,.06); }
  .profile-mini .avatar { overflow: hidden; }
  .profile-mini .avatar img { width: 100%; height: 100%; object-fit: cover; }
  .notification-dot { display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: var(--accent); margin-left: 4px; vertical-align: top; }
  .modal-backdrop { position: fixed; inset: 0; z-index: 1000; display: grid; place-items: center; padding: 20px; background: rgba(0,0,0,.72); backdrop-filter: blur(8px); }
  .modal-card { width: min(720px, 100%); max-height: 90vh; overflow: auto; border: 1px solid var(--line-strong); border-radius: 18px; background: linear-gradient(180deg, rgba(12,25,23,.98), rgba(7,16,15,.98)); box-shadow: 0 30px 100px rgba(0,0,0,.45); padding: 22px; }
  .auth-modal-card { width: min(560px, 100%); }
  .modal-header { display:flex; align-items:flex-start; gap:16px; justify-content:space-between; margin-bottom:14px; }
  .modal-header h2 { margin: 4px 0 0; }
  .modal-actions { display:flex; gap:10px; flex-wrap:wrap; margin-top:20px; }
  .form-grid { display:grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap:12px; margin-bottom:16px; }
  textarea.search-input { resize:vertical; }
  @media (max-width: 720px) { .form-grid { grid-template-columns: 1fr; } .form-grid > * { grid-column: auto !important; } .auth-terminal-body { padding:20px; } .auth-role-grid { grid-template-columns:1fr; } .auth-role-guest { grid-column:auto; } .guest-permissions { grid-template-columns:1fr; } .auth-title-row { flex-direction:column; } .auth-progress { gap:3px; } }
`}</style>

    </main>
  );
}