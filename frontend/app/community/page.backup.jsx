'use client';

import { useMemo, useState } from 'react';

/* =========================================================
   BSIE STUDENT COMMUNITY
   Developer / Terminal Inspired Student Platform
   Next.js + React
   No external dependencies
========================================================= */

/* =========================================================
   DATA
========================================================= */

const CHALLENGES = [
  {
    id: 101,
    type: 'Quick Win',
    icon: '⚡',
    title: 'Clean Code Challenge',
    description:
      'Refactor a messy JavaScript module and improve readability, structure, and maintainability.',
    category: 'Programming',
    difficulty: 'Beginner',
    difficultyLevel: 1,
    time: '45 min',
    reward: 120,
    participants: 18,
    maxParticipants: 30,
    mode: 'Solo',
    skills: ['JavaScript', 'Clean Code', 'Debugging'],
    badge: '🐛 Bug Hunter',
    status: 'Open',
    progress: 0,
  },
  {
    id: 102,
    type: 'Technical',
    icon: '🌐',
    title: 'Network Architect',
    description:
      'Design a university network connecting three campus branches using VLANs, routing, and proper IP addressing.',
    category: 'Networking',
    difficulty: 'Advanced',
    difficultyLevel: 3,
    time: '3–4 hours',
    reward: 400,
    participants: 24,
    maxParticipants: 40,
    mode: 'Team',
    skills: ['Cisco', 'Networking', 'VLAN', 'Routing'],
    badge: '🌐 Network Builder',
    status: 'Open',
    progress: 0,
  },
  {
    id: 103,
    type: 'Technical',
    icon: '🤖',
    title: 'AI Mini Challenge',
    description:
      'Build a small machine-learning model that predicts a simple outcome from a provided dataset.',
    category: 'AI',
    difficulty: 'Intermediate',
    difficultyLevel: 2,
    time: '2 hours',
    reward: 300,
    participants: 16,
    maxParticipants: 30,
    mode: 'Solo',
    skills: ['Python', 'AI', 'Data Science'],
    badge: '🤖 AI Explorer',
    status: 'Open',
    progress: 0,
  },
  {
    id: 104,
    type: 'Collaborative Sprint',
    icon: '🎨',
    title: 'BSIE Portal UX Sprint',
    description:
      'Work as a team to redesign a student portal experience with a clean mobile-first user flow.',
    category: 'UI/UX',
    difficulty: 'Intermediate',
    difficultyLevel: 2,
    time: '7 days',
    reward: 500,
    participants: 21,
    maxParticipants: 30,
    mode: 'Team',
    skills: ['Figma', 'UX', 'UI Design', 'Research'],
    badge: '🎨 UX Builder',
    status: 'Open',
    progress: 35,
  },
  {
    id: 105,
    type: 'Hardcore',
    icon: '🚀',
    title: 'Smart IoT Dashboard',
    description:
      'Create a dashboard that receives IoT sensor data and visualizes the system status in real time.',
    category: 'IoT',
    difficulty: 'Expert',
    difficultyLevel: 4,
    time: '5–7 hours',
    reward: 700,
    participants: 12,
    maxParticipants: 20,
    mode: 'Team',
    skills: ['IoT', 'Flutter', 'Firebase', 'UI/UX'],
    badge: '🚀 IoT Builder',
    status: 'Open',
    progress: 15,
  },
  {
    id: 106,
    type: 'Quick Win',
    icon: '🐍',
    title: 'Python Debugging',
    description:
      'Find and fix five bugs inside a small Python application before the timer runs out.',
    category: 'Programming',
    difficulty: 'Beginner',
    difficultyLevel: 1,
    time: '30 min',
    reward: 80,
    participants: 42,
    maxParticipants: 60,
    mode: 'Solo',
    skills: ['Python', 'Debugging'],
    badge: '🐛 Debugger',
    status: 'Open',
    progress: 0,
  },
  {
    id: 107,
    type: 'Technical',
    icon: '📊',
    title: 'Data Miner',
    description:
      'Analyze a student performance dataset and extract meaningful patterns and visualizations.',
    category: 'Data Science',
    difficulty: 'Intermediate',
    difficultyLevel: 2,
    time: '2–3 hours',
    reward: 320,
    participants: 14,
    maxParticipants: 25,
    mode: 'Solo',
    skills: ['Python', 'Pandas', 'Data Science'],
    badge: '📊 Data Explorer',
    status: 'Open',
    progress: 0,
  },
  {
    id: 108,
    type: 'Security',
    icon: '🔐',
    title: 'Security Auditor',
    description:
      'Inspect a safe intentionally vulnerable code sample and identify common security weaknesses.',
    category: 'Cyber Security',
    difficulty: 'Advanced',
    difficultyLevel: 3,
    time: '2 hours',
    reward: 450,
    participants: 9,
    maxParticipants: 20,
    mode: 'Solo',
    skills: ['Security', 'Code Review', 'Web'],
    badge: '🔐 Security Scout',
    status: 'Open',
    progress: 0,
  },
];

const TASKS = [
  {
    id: 1,
    title: 'Create a GitHub Repository',
    category: 'Development',
    skill: 'Git',
    time: '15 min',
    difficulty: 'Beginner',
    xp: 50,
    status: 'Completed',
  },
  {
    id: 2,
    title: 'Design a User Flow',
    category: 'UI/UX',
    skill: 'Figma',
    time: '30 min',
    difficulty: 'Beginner',
    xp: 70,
    status: 'In Progress',
  },
  {
    id: 3,
    title: 'Configure a VLAN',
    category: 'Networking',
    skill: 'Cisco',
    time: '45 min',
    difficulty: 'Intermediate',
    xp: 100,
    status: 'Available',
  },
  {
    id: 4,
    title: 'Analyze Dataset',
    category: 'Data Science',
    skill: 'Python',
    time: '60 min',
    difficulty: 'Intermediate',
    xp: 120,
    status: 'Available',
  },
  {
    id: 5,
    title: 'Write Project Documentation',
    category: 'Documentation',
    skill: 'Technical Writing',
    time: '30 min',
    difficulty: 'Beginner',
    xp: 60,
    status: 'Available',
  },
];

const PROJECTS = [
  {
    id: 1,
    icon: '🚗',
    title: 'Smart Campus Parking',
    description:
      'IoT-based parking system that detects available spaces and displays live status.',
    tech: ['ESP32', 'Flutter', 'Firebase'],
    author: '@ahmed',
    likes: 42,
    comments: 8,
    status: 'Completed',
  },
  {
    id: 2,
    icon: '🤖',
    title: 'AI Attendance System',
    description:
      'Experimental attendance platform using computer vision and student identification.',
    tech: ['Python', 'AI', 'OpenCV'],
    author: '@sara',
    likes: 38,
    comments: 11,
    status: 'Prototype',
  },
  {
    id: 3,
    icon: '🌐',
    title: 'Network Monitoring Tool',
    description:
      'Dashboard for monitoring network devices and basic connectivity status.',
    tech: ['Python', 'Networking', 'Dashboard'],
    author: '@ali',
    likes: 27,
    comments: 5,
    status: 'Completed',
  },
];

const IDEAS = [
  {
    id: 1,
    title: 'Smart University Navigation',
    description:
      'An interactive campus navigation system for finding classrooms, labs, and facilities.',
    author: '@noor',
    votes: 42,
    interested: 18,
    category: 'Smart Campus',
  },
  {
    id: 2,
    title: 'Student Skill Exchange',
    description:
      'Students teach each other technical skills through short peer-to-peer sessions.',
    author: '@mohammed',
    votes: 31,
    interested: 14,
    category: 'Community',
  },
  {
    id: 3,
    title: 'AI Study Assistant',
    description:
      'A study assistant that recommends resources and practice questions based on courses.',
    author: '@fatima',
    votes: 27,
    interested: 11,
    category: 'AI',
  },
];

const TEAMS = [
  {
    id: 1,
    name: 'IoT Mavericks',
    challenge: 'Smart IoT Dashboard',
    members: 4,
    max: 5,
    skills: ['IoT', 'Flutter', 'Firebase'],
    status: 'Looking for 1 member',
  },
  {
    id: 2,
    name: 'UX Engineers',
    challenge: 'BSIE Portal UX Sprint',
    members: 3,
    max: 5,
    skills: ['Figma', 'UX', 'Research'],
    status: 'Looking for 2 members',
  },
  {
    id: 3,
    name: 'Network Warriors',
    challenge: 'Network Architect',
    members: 5,
    max: 5,
    skills: ['Cisco', 'Routing', 'VLAN'],
    status: 'Full',
  },
];

const LEADERBOARD = [
  { rank: 1, name: 'Ahmed', username: '@ahmed', xp: 2480, level: 7 },
  { rank: 2, name: 'Sara', username: '@sara', xp: 2310, level: 7 },
  { rank: 3, name: 'Walaa', username: '@walaa', xp: 2180, level: 6 },
  { rank: 4, name: 'Ali', username: '@ali', xp: 1940, level: 6 },
  { rank: 5, name: 'Noor', username: '@noor', xp: 1810, level: 5 },
  { rank: 6, name: 'Fatima', username: '@fatima', xp: 1670, level: 5 },
];

const EVENTS = [
  {
    id: 1,
    icon: '🎤',
    title: 'Huawei Technical Workshop',
    date: 'SEP 18',
    type: 'Workshop',
    attendees: 42,
  },
  {
    id: 2,
    icon: '💻',
    title: 'BSIE Coding Night',
    date: 'SEP 24',
    type: 'Competition',
    attendees: 31,
  },
  {
    id: 3,
    icon: '🚀',
    title: 'IoT Innovation Sprint',
    date: 'OCT 02',
    type: 'Hackathon',
    attendees: 58,
  },
];

const RESOURCES = [
  {
    id: 1,
    icon: '📘',
    title: 'Cisco VLAN Cheat Sheet',
    type: 'Cheat Sheet',
    author: '@student01',
    likes: 32,
  },
  {
    id: 2,
    icon: '🐍',
    title: 'Python Data Science Starter',
    type: 'Guide',
    author: '@sara',
    likes: 28,
  },
  {
    id: 3,
    icon: '🎨',
    title: 'Figma UX Resources',
    type: 'Resource Pack',
    author: '@noor',
    likes: 21,
  },
];

const BADGES = [
  { icon: '⚡', name: 'Quick Starter', description: 'Complete your first task.' },
  { icon: '🐛', name: 'Bug Hunter', description: 'Solve 5 debugging challenges.' },
  { icon: '🌐', name: 'Network Builder', description: 'Complete networking challenges.' },
  { icon: '🎨', name: 'UX Builder', description: 'Complete a UX challenge.' },
  { icon: '🤖', name: 'AI Explorer', description: 'Complete an AI challenge.' },
  { icon: '👥', name: 'Team Player', description: 'Join 5 team challenges.' },
];

const ACTIVITY = [
  {
    icon: '🏆',
    user: '@ahmed',
    action: 'completed',
    target: 'Network Architect',
    time: '4 min ago',
    xp: '+400 XP',
  },
  {
    icon: '🚀',
    user: '@sara',
    action: 'published',
    target: 'AI Attendance System',
    time: '18 min ago',
    xp: '',
  },
  {
    icon: '👥',
    user: '@ali',
    action: 'joined',
    target: 'Network Warriors',
    time: '32 min ago',
    xp: '',
  },
  {
    icon: '💡',
    user: '@noor',
    action: 'created',
    target: 'Smart University Navigation',
    time: '1 hour ago',
    xp: '',
  },
  {
    icon: '🤝',
    user: '@fatima',
    action: 'helped',
    target: '3 students',
    time: '2 hours ago',
    xp: '+90 XP',
  },
];

/* =========================================================
   SMALL COMPONENTS
========================================================= */

function Icon({ children, className = '' }) {
  return <span className={`icon ${className}`}>{children}</span>;
}

function Pill({ children, tone = 'default' }) {
  return <span className={`pill pill-${tone}`}>{children}</span>;
}

function ProgressBar({ value, label = true }) {
  return (
    <div className="progress-wrap">
      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${value}%` }} />
      </div>
      {label && <span className="progress-value">{value}%</span>}
    </div>
  );
}

function Difficulty({ level }) {
  return (
    <span className="difficulty" aria-label={`Difficulty ${level} of 4`}>
      {Array.from({ length: 4 }).map((_, index) => (
        <span key={index} className={index < level ? 'active' : ''}>
          ●
        </span>
      ))}
    </span>
  );
}

function EmptyState({ icon = '⌘', title, text }) {
  return (
    <div className="empty-state">
      <div className="empty-icon">{icon}</div>
      <h3>{title}</h3>
      <p>{text}</p>
    </div>
  );
}

/* =========================================================
   MAIN PAGE
========================================================= */

export default function StudentCommunityPage() {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [mobileMenu, setMobileMenu] = useState(false);
  const [terminalOpen, setTerminalOpen] = useState(false);
  const [terminalInput, setTerminalInput] = useState('');
  const [terminalLines, setTerminalLines] = useState([
    'BSIE Community Terminal v1.0.0',
    'Connected as @walaa',
    'Type "help" to view available commands.',
  ]);

  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [challengeState, setChallengeState] = useState({});
  const [taskState, setTaskState] = useState(
    Object.fromEntries(TASKS.map((task) => [task.id, task.status]))
  );

  const [challengeFilter, setChallengeFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [toast, setToast] = useState('');

  const userXP = 2180;
  const level = 6;
  const nextLevelXP = 2500;
  const currentLevelXP = 2000;
  const levelProgress = Math.round(
    ((userXP - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100
  );

  const navItems = [
    { id: 'dashboard', icon: '⌂', label: 'Dashboard' },
    { id: 'challenges', icon: '⚡', label: 'Challenges', count: 8 },
    { id: 'tasks', icon: '✓', label: 'Tasks', count: 5 },
    { id: 'teams', icon: '👥', label: 'Teams' },
    { id: 'projects', icon: '🚀', label: 'Projects' },
    { id: 'ideas', icon: '💡', label: 'Ideas' },
    { id: 'leaderboard', icon: '🏆', label: 'Leaderboard' },
    { id: 'events', icon: '◈', label: 'Events' },
    { id: 'resources', icon: '▣', label: 'Resources' },
  ];

  const filteredChallenges = useMemo(() => {
    return CHALLENGES.filter((challenge) => {
      const matchesFilter =
        challengeFilter === 'All' ||
        challenge.type === challengeFilter ||
        challenge.category === challengeFilter;

      const query = search.toLowerCase();

      const matchesSearch =
        !query ||
        challenge.title.toLowerCase().includes(query) ||
        challenge.description.toLowerCase().includes(query) ||
        challenge.skills.some((skill) => skill.toLowerCase().includes(query));

      return matchesFilter && matchesSearch;
    });
  }, [challengeFilter, search]);

  function showToast(message) {
    setToast(message);
    window.clearTimeout(window.__bsieToast);
    window.__bsieToast = window.setTimeout(() => setToast(''), 2600);
  }

  function navigate(section) {
    setActiveSection(section);
    setMobileMenu(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function acceptChallenge(challenge) {
    setChallengeState((prev) => ({
      ...prev,
      [challenge.id]: 'accepted',
    }));

    showToast(`Challenge accepted: ${challenge.title}`);
  }

  function joinTeam(team) {
    if (team.members >= team.max) {
      showToast('This team is already full.');
      return;
    }

    showToast(`Request sent to join ${team.name}.`);
  }

  function updateTask(task) {
    setTaskState((prev) => ({
      ...prev,
      [task.id]: 'Completed',
    }));

    showToast(`Task completed. +${task.xp} XP`);
  }

  function runCommand(rawCommand) {
    const command = rawCommand.trim().toLowerCase();

    if (!command) return;

    const output = [`> ${rawCommand}`];

    if (command === 'help') {
      output.push(
        'Available commands:',
        '  challenges       Browse challenges',
        '  tasks            View your tasks',
        '  status           Show student status',
        '  profile          Show profile',
        '  teams            Find teams',
        '  projects         Explore projects',
        '  leaderboard      View ranking',
        '  ideas            Community ideas',
        '  events           Upcoming events',
        '  badges           Your badges',
        '  clear            Clear terminal',
        '  sudo coffee      ☕'
      );
    } else if (command === 'status') {
      output.push(
        'student: @walaa',
        `level: ${level}`,
        `xp: ${userXP}`,
        'streak: 7 days',
        'challenges_completed: 14',
        'projects: 6',
        'badges: 4'
      );
    } else if (command === 'profile') {
      output.push(
        '@walaa',
        'major: Informatics Engineering',
        'role: student',
        'rank: #3',
        'skills: UI/UX, IoT, Flutter, Networking'
      );
    } else if (command === 'challenges' || command === 'challenge list') {
      output.push(
        'Open challenges:',
        ...CHALLENGES.slice(0, 5).map(
          (item) => `#${item.id}  ${item.title}  +${item.reward} XP`
        )
      );
    } else if (command === 'tasks') {
      output.push(
        'Tasks:',
        ...TASKS.map(
          (item) => `${item.status === 'Completed' ? '✓' : '○'} ${item.title}`
        )
      );
    } else if (command === 'teams') {
      output.push(
        'Available teams:',
        ...TEAMS.map(
          (team) => `${team.name} — ${team.members}/${team.max} members`
        )
      );
    } else if (command === 'projects') {
      output.push(
        'Featured projects:',
        ...PROJECTS.map((project) => `${project.title} by ${project.author}`)
      );
    } else if (command === 'leaderboard') {
      output.push(
        ...LEADERBOARD.slice(0, 5).map(
          (person) => `${person.rank}. ${person.name} — ${person.xp} XP`
        )
      );
    } else if (command === 'ideas') {
      output.push(
        ...IDEAS.map((idea) => `${idea.title} — ${idea.votes} votes`)
      );
    } else if (command === 'events') {
      output.push(...EVENTS.map((event) => `${event.date} — ${event.title}`));
    } else if (command === 'badges') {
      output.push(...BADGES.map((badge) => `${badge.icon} ${badge.name}`));
    } else if (command === 'sudo coffee') {
      output.push(
        '☕ Permission granted.',
        'Productivity increased by 12%.',
        'Remember to drink water too.'
      );
    } else if (command === 'clear') {
      setTerminalLines([]);
      setTerminalInput('');
      return;
    } else {
      output.push(
        `command not found: ${rawCommand}`,
        'Type "help" for available commands.'
      );
    }

    setTerminalLines((prev) => [...prev, ...output]);
    setTerminalInput('');
  }

  function handleTerminalKeyDown(event) {
    if (event.key === 'Enter') {
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

      {/* =====================================================
          TOP BAR
      ===================================================== */}

      <header className="topbar">
        <div className="brand">
          <button
            className="icon-button mobile-menu-btn"
            onClick={() => setMobileMenu((value) => !value)}
            aria-label="Open menu"
          >
            ☰
          </button>

          <div className="brand-mark">&gt;_</div>

          <div className="brand-copy">
            <div className="brand-title">BSIE Community</div>
            <div className="brand-path">BSIE://community</div>
          </div>
        </div>

        <div className="top-actions">
          <button
            className="icon-button"
            onClick={() => setTerminalOpen(true)}
            aria-label="Open terminal"
          >
            &gt;_
          </button>

          <button
            className="icon-button"
            onClick={() => setNotificationOpen((value) => !value)}
            aria-label="Notifications"
          >
            ◉
          </button>

          <div className="profile-mini">
            <div className="avatar">WA</div>
            <div>
              <div className="profile-name">@walaa</div>
              <div className="profile-level">LEVEL {level} · #3</div>
            </div>
          </div>
        </div>
      </header>

      {notificationOpen && (
        <div className="notification-panel">
          <div className="panel-header">
            <div>
              <h3 className="panel-title">Notifications</h3>
              <div className="panel-subtitle">Your latest community activity</div>
            </div>
          </div>

          <div className="notification-item">
            <div className="notification-title">Challenge approved ✓</div>
            <div className="notification-copy">
              Your submission for Clean Code Challenge has been approved.
            </div>
          </div>

          <div className="notification-item">
            <div className="notification-title">Team invitation</div>
            <div className="notification-copy">
              @ahmed invited you to join the IoT Mavericks team.
            </div>
          </div>

          <div className="notification-item">
            <div className="notification-title">New achievement</div>
            <div className="notification-copy">
              You are only 320 XP away from Level 7.
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          LAYOUT
      ===================================================== */}

      <div className="layout">
        <aside className={`sidebar ${mobileMenu ? 'open' : ''}`}>
          <div className="terminal-label">~/student/community</div>

          <nav className="nav">
            {navItems.map((item) => (
              <button
                key={item.id}
                className={`nav-item ${
                  activeSection === item.id ? 'active' : ''
                }`}
                onClick={() => navigate(item.id)}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>

                {item.count && <span className="nav-count">{item.count}</span>}
              </button>
            ))}
          </nav>

          <div className="sidebar-terminal">
            <div className="sidebar-terminal-title">
              &gt; system.status()
            </div>

            <p>
              connection: online
              <br />
              community: active
              <br />
              students: 428
              <br />
              challenges: 24
              <br />
              status: healthy
            </p>
          </div>
        </aside>

        <section className="main">
          {/* =================================================
              DASHBOARD
          ================================================= */}

          {activeSection === 'dashboard' && (
            <>
              <section className="hero">
                <div className="terminal-orb" />

                <div className="hero-grid">
                  <div>
                    <div className="hero-kicker">
                      &gt; system.boot(student_community)
                    </div>

                    <h1>
                      Build.
                      <br />
                      Learn.
                      <br />
                      <span>Connect.</span>
                      <span className="terminal-cursor" />
                    </h1>

                    <p className="hero-copy">
                      Welcome to the BSIE Student Community — a technical
                      ecosystem where students can solve challenges, build
                      projects, join teams, share ideas, and grow together.
                    </p>

                    <div className="hero-actions">
                      <button
                        className="btn btn-primary"
                        onClick={() => navigate('challenges')}
                      >
                        Explore Challenges
                      </button>

                      <button
                        className="btn btn-ghost"
                        onClick={() => setTerminalOpen(true)}
                      >
                        Open Terminal &gt;_
                      </button>
                    </div>
                  </div>

                  <div className="hero-terminal">
                    <div className="terminal-top">
                      <span className="dot" />
                      <span className="dot" />
                      <span className="dot" />
                      <span className="terminal-name">
                        bsie-community — terminal
                      </span>
                    </div>

                    <div className="terminal-body">
                      <div className="terminal-line-dim">
                        $ whoami
                      </div>
                      <div className="terminal-line-accent">
                        student_01
                      </div>

                      <br />

                      <div className="terminal-line-dim">
                        $ status
                      </div>
                      <div>level: 06</div>
                      <div>xp: 2180</div>
                      <div>streak: 7 days 🔥</div>
                      <div>rank: #3</div>

                      <br />

                      <div className="terminal-line-accent">
                        System ready.
                      </div>

                      <div className="terminal-line-dim">
                        Type "help" for commands.
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-label">XP</div>
                  <div className="stat-value">2,180</div>
                  <div className="stat-extra">+180 this week</div>
                </div>

                <div className="stat-card">
                  <div className="stat-label">Challenges</div>
                  <div className="stat-value">14</div>
                  <div className="stat-extra">completed</div>
                </div>

                <div className="stat-card">
                  <div className="stat-label">Projects</div>
                  <div className="stat-value">06</div>
                  <div className="stat-extra">showcased</div>
                </div>

                <div className="stat-card">
                  <div className="stat-label">Rank</div>
                  <div className="stat-value">#03</div>
                  <div className="stat-extra">BSIE students</div>
                </div>
              </div>

              <div className="dashboard-grid section-spacer">
                <div className="panel">
                  <div className="panel-header">
                    <div>
                      <h3 className="panel-title">Your Progress</h3>
                      <div className="panel-subtitle">
                        Keep building your technical profile
                      </div>
                    </div>

                    <Pill tone="green">LEVEL {level}</Pill>
                  </div>

                  <div className="panel-body">
                    <div className="level-box">
                      <div className="level-row">
                        <div>
                          <div className="level-caption">CURRENT LEVEL</div>
                          <div className="level-number">{level}</div>
                        </div>

                        <div className="level-xp">
                          {userXP} / {nextLevelXP} XP
                        </div>
                      </div>

                      <div className="level-progress">
                        <ProgressBar value={levelProgress} />
                      </div>

                      <div className="streak">
                        <span>🔥</span>
                        <strong>7 day streak</strong>
                        <span>Keep it going!</span>
                      </div>

                      <div className="calendar">
                        {Array.from({ length: 35 }).map((_, index) => (
                          <span
                            key={index}
                            className={`day ${
                              index % 3 === 0 || index > 28 ? 'active' : ''
                            } ${index > 30 ? 'strong' : ''}`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="panel">
                  <div className="panel-header">
                    <div>
                      <h3 className="panel-title">Daily Challenge</h3>
                      <div className="panel-subtitle">
                        Small task. Real progress.
                      </div>
                    </div>

                    <Pill tone="orange">+75 XP</Pill>
                  </div>

                  <div className="panel-body">
                    <div className="daily-card">
                      <div className="daily-top">
                        <div>
                          <Pill tone="orange">15 MIN</Pill>
                          <div className="daily-title">
                            Fix the Bug 🐛
                          </div>
                        </div>

                        <div className="daily-icon">🐛</div>
                      </div>

                      <div className="daily-copy">
                        Find the hidden logic error in a small Python function
                        and submit the corrected version.
                      </div>

                      <div className="daily-meta">
                        <Pill>#Python</Pill>
                        <Pill>#Debugging</Pill>
                        <Pill>Beginner</Pill>
                      </div>

                      <button
                        className="btn btn-primary"
                        style={{ marginTop: 16, width: '100%' }}
                        onClick={() => {
                          setSelectedChallenge(CHALLENGES[5]);
                        }}
                      >
                        Start Daily Challenge
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="two-column section-spacer">
                <div className="panel">
                  <div className="panel-header">
                    <div>
                      <h3 className="panel-title">Recommended for You</h3>
                      <div className="panel-subtitle">
                        Based on your activity
                      </div>
                    </div>

                    <button
                      className="btn"
                      onClick={() => navigate('challenges')}
                    >
                      View all
                    </button>
                  </div>

                  <div className="panel-body">
                    {CHALLENGES.slice(0, 3).map((challenge) => (
                      <div
                        key={challenge.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 11,
                          padding: '10px 0',
                          borderTop: '1px solid var(--line)',
                        }}
                      >
                        <div className="challenge-icon">
                          {challenge.icon}
                        </div>

                        <div style={{ flex: 1 }}>
                          <div
                            style={{
                              fontSize: 11,
                              fontWeight: 800,
                            }}
                          >
                            {challenge.title}
                          </div>

                          <div
                            style={{
                              color: 'var(--muted)',
                              fontSize: 9,
                              marginTop: 3,
                            }}
                          >
                            {challenge.category} · {challenge.time}
                          </div>
                        </div>

                        <Pill tone="green">
                          +{challenge.reward}
                        </Pill>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="panel">
                  <div className="panel-header">
                    <div>
                      <h3 className="panel-title">Community Activity</h3>
                      <div className="panel-subtitle">
                        What students are building
                      </div>
                    </div>
                  </div>

                  <div className="activity-list">
                    {ACTIVITY.slice(0, 4).map((activity, index) => (
                      <div className="activity-item" key={index}>
                        <div className="activity-icon">
                          {activity.icon}
                        </div>

                        <div>
                          <div className="activity-text">
                            <strong>{activity.user}</strong>{' '}
                            {activity.action}{' '}
                            <strong>{activity.target}</strong>
                          </div>

                          <div className="activity-time">
                            {activity.time}
                          </div>
                        </div>

                        <div className="activity-xp">{activity.xp}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* =================================================
              CHALLENGES
          ================================================= */}

          {activeSection === 'challenges' && (
            <>
              <div className="section-header">
                <div>
                  <div className="eyebrow">&gt; challenges.list()</div>
                  <h1 className="section-title">Challenges</h1>
                  <p className="section-description">
                    Pick a challenge, build a skill, earn XP, and prove what
                    you can do.
                  </p>
                </div>

                <button
                  className="btn btn-primary"
                  onClick={() =>
                    showToast('Challenge creation will be available soon.')
                  }
                >
                  + Create Challenge
                </button>
              </div>

              <div className="challenge-toolbar">
                <input
                  className="search"
                  placeholder="Search challenges, skills, technologies..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </div>

              <div className="filter-row">
                {[
                  'All',
                  'Quick Win',
                  'Technical',
                  'Hardcore',
                  'Collaborative Sprint',
                  'Security',
                  'Programming',
                  'Networking',
                  'AI',
                  'IoT',
                  'UI/UX',
                ].map((filter) => (
                  <button
                    key={filter}
                    className={`filter ${
                      challengeFilter === filter ? 'active' : ''
                    }`}
                    onClick={() => setChallengeFilter(filter)}
                  >
                    {filter}
                  </button>
                ))}
              </div>

              <div className="challenge-grid section-spacer">
                {filteredChallenges.map((challenge) => {
                  const accepted =
                    challengeState[challenge.id] === 'accepted';

                  return (
                    <article className="challenge-card" key={challenge.id}>
                      <div className="challenge-top">
                        <div className="challenge-icon">
                          {challenge.icon}
                        </div>

                        <div style={{ textAlign: 'right' }}>
                          <div className="challenge-type">
                            {challenge.type}
                          </div>

                          <div style={{ marginTop: 7 }}>
                            <Difficulty
                              level={challenge.difficultyLevel}
                            />
                          </div>
                        </div>
                      </div>

                      <h3 className="challenge-title">
                        {challenge.title}
                      </h3>

                      <p className="challenge-description">
                        {challenge.description}
                      </p>

                      <div className="challenge-meta">
                        <Pill tone="green">
                          {challenge.difficulty}
                        </Pill>

                        <Pill>⏱ {challenge.time}</Pill>

                        <Pill tone="blue">{challenge.mode}</Pill>
                      </div>

                      <div className="challenge-skills">
                        {challenge.skills.map((skill) => (
                          <span className="skill-tag" key={skill}>
                            #{skill.replaceAll(' ', '')}
                          </span>
                        ))}
                      </div>

                      {challenge.progress > 0 && (
                        <div style={{ marginTop: 14 }}>
                          <ProgressBar value={challenge.progress} />
                        </div>
                      )}

                      <div className="challenge-footer">
                        <div>
                          <div className="reward">
                            +{challenge.reward} XP
                          </div>

                          <div
                            style={{
                              color: 'var(--muted)',
                              fontSize: 8,
                              marginTop: 4,
                            }}
                          >
                            👥 {challenge.participants}/
                            {challenge.maxParticipants}
                          </div>
                        </div>

                        <button
                          className={`accept-btn ${
                            accepted ? 'accepted' : ''
                          }`}
                          onClick={() => {
                            if (accepted) {
                              setSelectedChallenge(challenge);
                            } else {
                              acceptChallenge(challenge);
                            }
                          }}
                        >
                          {accepted ? 'VIEW CHALLENGE' : 'ACCEPT'}
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>

              {filteredChallenges.length === 0 && (
                <EmptyState
                  icon="⌕"
                  title="No challenges found"
                  text="Try another search or remove the current filters."
                />
              )}
            </>
          )}

          {/* =================================================
              TASKS
          ================================================= */}

          {activeSection === 'tasks' && (
            <>
              <div className="section-header">
                <div>
                  <div className="eyebrow">&gt; tasks.status()</div>
                  <h1 className="section-title">Tasks</h1>
                  <p className="section-description">
                    Small actionable missions that move your skills forward.
                  </p>
                </div>
              </div>

              <div className="two-column">
                <div className="panel">
                  <div className="panel-header">
                    <div>
                      <h3 className="panel-title">My Tasks</h3>
                      <div className="panel-subtitle">
                        {TASKS.filter(
                          (task) => taskState[task.id] === 'Completed'
                        ).length}{' '}
                        completed
                      </div>
                    </div>

                    <Pill tone="green">5 TASKS</Pill>
                  </div>

                  <div className="task-list">
                    {TASKS.map((task) => {
                      const completed =
                        taskState[task.id] === 'Completed';

                      return (
                        <div className="task-row" key={task.id}>
                          <div
                            className={`task-check ${
                              completed ? 'done' : ''
                            }`}
                          >
                            {completed ? '✓' : '○'}
                          </div>

                          <div>
                            <div className="task-name">
                              {task.title}
                            </div>

                            <div className="task-meta">
                              <span>{task.category}</span>
                              <span>•</span>
                              <span>{task.skill}</span>
                              <span>•</span>
                              <span>{task.time}</span>
                            </div>
                          </div>

                          <div>
                            <div className="task-xp">+{task.xp} XP</div>

                            {!completed && (
                              <button
                                className="accept-btn"
                                style={{ marginTop: 6 }}
                                onClick={() => updateTask(task)}
                              >
                                COMPLETE
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="panel">
                  <div className="panel-header">
                    <div>
                      <h3 className="panel-title">Mission Structure</h3>
                      <div className="panel-subtitle">
                        How tasks connect to challenges
                      </div>
                    </div>
                  </div>

                  <div className="panel-body">
                    <div className="level-box">
                      <div
                        style={{
                          fontFamily:
                            '"SFMono-Regular", Consolas, monospace',
                          color: 'var(--accent)',
                          fontSize: 11,
                        }}
                      >
                        challenge://104
                      </div>

                      <div
                        style={{
                          marginTop: 14,
                          display: 'grid',
                          gap: 8,
                        }}
                      >
                        {[
                          ['✓', 'Research existing portal', true],
                          ['✓', 'Create user flow', true],
                          ['○', 'Build wireframe', false],
                          ['○', 'Create prototype', false],
                          ['○', 'Present solution', false],
                        ].map(([icon, name, done]) => (
                          <div
                            key={name}
                            style={{
                              display: 'flex',
                              gap: 9,
                              alignItems: 'center',
                              padding: '8px 0',
                              borderTop: '1px solid var(--line)',
                            }}
                          >
                            <span
                              style={{
                                color: done
                                  ? 'var(--accent)'
                                  : 'var(--muted)',
                              }}
                            >
                              {icon}
                            </span>

                            <span
                              style={{
                                fontSize: 10,
                                color: done
                                  ? 'var(--soft)'
                                  : 'var(--muted)',
                              }}
                            >
                              {name}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* =================================================
              TEAMS
          ================================================= */}

          {activeSection === 'teams' && (
            <>
              <div className="section-header">
                <div>
                  <div className="eyebrow">&gt; teams.find()</div>
                  <h1 className="section-title">Teams</h1>
                  <p className="section-description">
                    Find people with complementary skills and build something
                    together.
                  </p>
                </div>

                <button
                  className="btn btn-primary"
                  onClick={() =>
                    showToast('Team creation flow will open soon.')
                  }
                >
                  + Create Team
                </button>
              </div>

              <div className="team-grid">
                {TEAMS.map((team) => (
                  <article className="team-card" key={team.id}>
                    <div className="card-icon">👥</div>

                    <h3 className="card-title">{team.name}</h3>

                    <p className="card-description">
                      Challenge:{' '}
                      <strong style={{ color: 'var(--text)' }}>
                        {team.challenge}
                      </strong>
                      <br />
                      {team.status}
                    </p>

                    <div className="tag-list">
                      {team.skills.map((skill) => (
                        <Pill key={skill}>{skill}</Pill>
                      ))}
                    </div>

                    <div className="card-footer">
                      <span className="member-count">
                        {team.members}/{team.max} members
                      </span>

                      <button
                        className={`accept-btn ${
                          team.members >= team.max ? '' : 'accepted'
                        }`}
                        disabled={team.members >= team.max}
                        onClick={() => joinTeam(team)}
                      >
                        {team.members >= team.max
                          ? 'FULL'
                          : 'JOIN TEAM'}
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </>
          )}

          {/* =================================================
              PROJECTS
          ================================================= */}

          {activeSection === 'projects' && (
            <>
              <div className="section-header">
                <div>
                  <div className="eyebrow">&gt; projects.explore()</div>
                  <h1 className="section-title">Student Builds</h1>
                  <p className="section-description">
                    Showcase what you built. Discover what other students are
                    creating.
                  </p>
                </div>

                <button
                  className="btn btn-primary"
                  onClick={() =>
                    showToast('Project publishing flow will open soon.')
                  }
                >
                  + Publish Project
                </button>
              </div>

              <div className="project-grid">
                {PROJECTS.map((project) => (
                  <article className="project-card" key={project.id}>
                    <div className="card-icon">{project.icon}</div>

                    <h3 className="card-title">{project.title}</h3>

                    <p className="card-description">
                      {project.description}
                    </p>

                    <div className="tag-list">
                      {project.tech.map((tech) => (
                        <Pill tone="blue" key={tech}>
                          {tech}
                        </Pill>
                      ))}
                    </div>

                    <div className="project-author">
                      built by {project.author}
                    </div>

                    <div className="card-footer">
                      <div className="project-stats">
                        <span>♡ {project.likes}</span>
                        <span>◌ {project.comments}</span>
                      </div>

                      <Pill tone="green">{project.status}</Pill>
                    </div>
                  </article>
                ))}
              </div>
            </>
          )}

          {/* =================================================
              IDEAS
          ================================================= */}

          {activeSection === 'ideas' && (
            <>
              <div className="section-header">
                <div>
                  <div className="eyebrow">&gt; ideas.community()</div>
                  <h1 className="section-title">Ideas</h1>
                  <p className="section-description">
                    Turn student ideas into real projects and future
                    challenges.
                  </p>
                </div>

                <button
                  className="btn btn-primary"
                  onClick={() =>
                    showToast('Idea submission flow will open soon.')
                  }
                >
                  + Submit Idea
                </button>
              </div>

              <div className="idea-grid">
                {IDEAS.map((idea) => (
                  <article className="idea-card" key={idea.id}>
                    <Pill tone="purple">{idea.category}</Pill>

                    <h3 className="card-title">{idea.title}</h3>

                    <p className="card-description">
                      {idea.description}
                    </p>

                    <div className="project-author">
                      proposed by {idea.author}
                    </div>

                    <div className="idea-votes">
                      <button
                        className="vote-button"
                        onClick={() =>
                          showToast(`Upvoted "${idea.title}"`)
                        }
                      >
                        ▲
                      </button>

                      <span className="vote-count">{idea.votes}</span>

                      <span
                        style={{
                          color: 'var(--muted)',
                          fontSize: 9,
                        }}
                      >
                        {idea.interested} interested
                      </span>
                    </div>

                    <div className="card-footer">
                      <span className="member-count">
                        Idea → Challenge
                      </span>

                      <button
                        className="accept-btn"
                        onClick={() =>
                          showToast(
                            `You joined "${idea.title}".`
                          )
                        }
                      >
                        JOIN IDEA
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </>
          )}

          {/* =================================================
              LEADERBOARD
          ================================================= */}

          {activeSection === 'leaderboard' && (
            <>
              <div className="section-header">
                <div>
                  <div className="eyebrow">&gt; leaderboard.show()</div>
                  <h1 className="section-title">Leaderboard</h1>
                  <p className="section-description">
                    Competition is optional. Progress is personal.
                  </p>
                </div>
              </div>

              <div className="filter-row" style={{ marginBottom: 14 }}>
                <button className="filter active">GLOBAL</button>
                <button className="filter">MY MAJOR</button>
                <button className="filter">MY YEAR</button>
                <button className="filter">MY TEAM</button>
              </div>

              <div className="leaderboard">
                {LEADERBOARD.map((person) => (
                  <div
                    className={`leader-row ${
                      person.username === '@walaa' ? 'you' : ''
                    }`}
                    key={person.rank}
                  >
                    <div className="leader-rank">
                      {person.rank === 1
                        ? '🥇'
                        : person.rank === 2
                        ? '🥈'
                        : person.rank === 3
                        ? '🥉'
                        : `#${person.rank}`}
                    </div>

                    <div className="leader-person">
                      <div className="leader-avatar">
                        {person.name.slice(0, 2).toUpperCase()}
                      </div>

                      <div>
                        <div className="leader-name">
                          {person.name}
                          {person.username === '@walaa' && (
                            <span
                              style={{
                                color: 'var(--accent)',
                                marginLeft: 7,
                                fontSize: 8,
                              }}
                            >
                              YOU
                            </span>
                          )}
                        </div>

                        <div className="leader-username">
                          {person.username}
                        </div>
                      </div>
                    </div>

                    <div className="leader-level">
                      LEVEL {person.level}
                    </div>

                    <div className="leader-xp">
                      {person.xp.toLocaleString()} XP
                    </div>
                  </div>
                ))}
              </div>

              <div className="two-column section-spacer">
                <div className="panel">
                  <div className="panel-header">
                    <div>
                      <h3 className="panel-title">Your Reputation</h3>
                      <div className="panel-subtitle">
                        Quality of your community contribution
                      </div>
                    </div>
                  </div>

                  <div className="panel-body">
                    <div className="stat-value">780</div>

                    <div style={{ marginTop: 7 }}>
                      <ProgressBar value={78} />
                    </div>

                    <p
                      style={{
                        color: 'var(--muted)',
                        fontSize: 10,
                        lineHeight: 1.6,
                      }}
                    >
                      Reputation comes from helping students, reviewing
                      projects, contributing resources, and creating useful
                      ideas.
                    </p>
                  </div>
                </div>

                <div className="panel">
                  <div className="panel-header">
                    <div>
                      <h3 className="panel-title">Your Badges</h3>
                      <div className="panel-subtitle">
                        4 / 6 featured badges
                      </div>
                    </div>
                  </div>

                  <div className="panel-body">
                    <div className="badge-grid">
                      {BADGES.map((badge, index) => (
                        <div className="badge-card" key={badge.name}>
                          <div className="badge-icon">{badge.icon}</div>

                          <div className="badge-name">
                            {badge.name}
                          </div>

                          <div className="badge-description">
                            {badge.description}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* =================================================
              EVENTS
          ================================================= */}

          {activeSection === 'events' && (
            <>
              <div className="section-header">
                <div>
                  <div className="eyebrow">&gt; events.upcoming()</div>
                  <h1 className="section-title">Events</h1>
                  <p className="section-description">
                    Workshops, competitions, hackathons, and technical
                    community activities.
                  </p>
                </div>
              </div>

              <div className="event-grid">
                {EVENTS.map((event) => (
                  <article className="event-card" key={event.id}>
                    <div className="card-icon">{event.icon}</div>

                    <div className="event-date" style={{ marginTop: 15 }}>
                      {event.date}
                    </div>

                    <h3 className="card-title">{event.title}</h3>

                    <div className="event-type">{event.type}</div>

                    <div className="card-footer">
                      <span className="event-attendees">
                        👥 {event.attendees} attending
                      </span>

                      <button
                        className="accept-btn accepted"
                        onClick={() =>
                          showToast(
                            `Registered for ${event.title}.`
                          )
                        }
                      >
                        REGISTER
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </>
          )}

          {/* =================================================
              RESOURCES
          ================================================= */}

          {activeSection === 'resources' && (
            <>
              <div className="section-header">
                <div>
                  <div className="eyebrow">&gt; resources.search()</div>
                  <h1 className="section-title">Resources</h1>
                  <p className="section-description">
                    Cheat sheets, guides, references, tools, and student-made
                    learning material.
                  </p>
                </div>

                <button
                  className="btn btn-primary"
                  onClick={() =>
                    showToast('Resource upload will be available soon.')
                  }
                >
                  + Share Resource
                </button>
              </div>

              <div className="resource-grid">
                {RESOURCES.map((resource) => (
                  <article className="resource-card" key={resource.id}>
                    <div className="card-icon">{resource.icon}</div>

                    <Pill tone="blue" style={{ marginTop: 14 }}>
                      {resource.type}
                    </Pill>

                    <h3 className="card-title">{resource.title}</h3>

                    <div className="project-author">
                      shared by {resource.author}
                    </div>

                    <div className="card-footer">
                      <span className="project-stats">
                        ♡ {resource.likes}
                      </span>

                      <button
                        className="accept-btn"
                        onClick={() =>
                          showToast(
                            `Opening ${resource.title}...`
                          )
                        }
                      >
                        OPEN
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </>
          )}
        </section>
      </div>

      {/* =====================================================
          MOBILE NAVIGATION
      ===================================================== */}

      <nav className="mobile-bottom-nav">
        {[
          ['dashboard', '⌂', 'Home'],
          ['challenges', '⚡', 'Challenges'],
          ['tasks', '✓', 'Tasks'],
          ['projects', '🚀', 'Projects'],
          ['leaderboard', '🏆', 'Rank'],
        ].map(([id, icon, label]) => (
          <button
            key={id}
            className={`mobile-nav-item ${
              activeSection === id ? 'active' : ''
            }`}
            onClick={() => navigate(id)}
          >
            <span className="mobile-nav-icon">{icon}</span>
            {label}
          </button>
        ))}
      </nav>

      {/* =====================================================
          FLOATING TERMINAL
      ===================================================== */}

      <button
        className="floating-terminal"
        onClick={() => setTerminalOpen(true)}
        aria-label="Open BSIE terminal"
      >
        &gt;_
      </button>

      {/* =====================================================
          TERMINAL MODAL
      ===================================================== */}

      {terminalOpen && (
        <div
          className="terminal-modal"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setTerminalOpen(false);
            }
          }}
        >
          <div className="terminal-window">
            <div className="terminal-top">
              <span className="dot" />
              <span className="dot" />
              <span className="dot" />

              <span className="terminal-name">
                BSIE Community Terminal
              </span>

              <button
                onClick={() => setTerminalOpen(false)}
                style={{
                  marginLeft: 'auto',
                  border: 0,
                  background: 'transparent',
                  color: 'var(--muted)',
                }}
              >
                ×
              </button>
            </div>

            <div className="terminal-body">
              {terminalLines.map((line, index) => (
                <div
                  key={`${line}-${index}`}
                  className={
                    line.startsWith('>') ||
                    line.includes('ready') ||
                    line.includes('student_01')
                      ? 'terminal-line-accent'
                      : ''
                  }
                >
                  {line || '\u00A0'}
                </div>
              ))}
            </div>

            <div className="terminal-input-row">
              <span>&gt;</span>

              <input
                autoFocus
                className="terminal-input"
                value={terminalInput}
                onChange={(event) =>
                  setTerminalInput(event.target.value)
                }
                onKeyDown={handleTerminalKeyDown}
                placeholder='type "help"...'
              />

              <span className="terminal-cursor" />
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          CHALLENGE MODAL
      ===================================================== */}

      {selectedChallenge && (
        <div
          className="modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedChallenge(null);
            }
          }}
        >
          <article className="challenge-modal">
            <div className="modal-header">
              <div>
                <div className="eyebrow">
                  challenge://{selectedChallenge.id}
                </div>

                <h2
                  style={{
                    margin: 0,
                    fontSize: 25,
                    letterSpacing: '-0.04em',
                  }}
                >
                  {selectedChallenge.icon}{' '}
                  {selectedChallenge.title}
                </h2>
              </div>

              <button
                className="modal-close"
                onClick={() => setSelectedChallenge(null)}
              >
                ×
              </button>
            </div>

            <div className="modal-content">
              <p className="modal-description">
                {selectedChallenge.description}
              </p>

              <div className="modal-grid">
                <div className="modal-stat">
                  <div className="modal-stat-label">DIFFICULTY</div>
                  <div className="modal-stat-value">
                    {selectedChallenge.difficulty}
                  </div>
                </div>

                <div className="modal-stat">
                  <div className="modal-stat-label">TIME</div>
                  <div className="modal-stat-value">
                    {selectedChallenge.time}
                  </div>
                </div>

                <div className="modal-stat">
                  <div className="modal-stat-label">MODE</div>
                  <div className="modal-stat-value">
                    {selectedChallenge.mode}
                  </div>
                </div>

                <div className="modal-stat">
                  <div className="modal-stat-label">REWARD</div>
                  <div className="modal-stat-value">
                    +{selectedChallenge.reward} XP
                  </div>
                </div>
              </div>

              <div style={{ marginTop: 18 }}>
                <div
                  style={{
                    color: 'var(--muted)',
                    fontSize: 9,
                    textTransform: 'uppercase',
                  }}
                >
                  Required Skills
                </div>

                <div className="tag-list">
                  {selectedChallenge.skills.map((skill) => (
                    <Pill tone="green" key={skill}>
                      #{skill}
                    </Pill>
                  ))}
                </div>
              </div>

              <div style={{ marginTop: 20 }}>
                <div
                  style={{
                    color: 'var(--muted)',
                    fontSize: 9,
                    textTransform: 'uppercase',
                  }}
                >
                  Mission Flow
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns:
                      'repeat(5, minmax(0, 1fr))',
                    gap: 6,
                    marginTop: 9,
                  }}
                >
                  {[
                    'Brief',
                    'Tasks',
                    'Build',
                    'Submit',
                    'Reward',
                  ].map((step, index) => (
                    <div
                      key={step}
                      style={{
                        textAlign: 'center',
                        padding: '10px 5px',
                        border: '1px solid var(--line)',
                        borderRadius: 9,
                        background:
                          index === 0
                            ? 'rgba(141,255,202,.07)'
                            : 'rgba(255,255,255,.015)',
                        color:
                          index === 0
                            ? 'var(--accent)'
                            : 'var(--muted)',
                        fontSize: 8,
                        fontWeight: 700,
                      }}
                    >
                      {index + 1}. {step}
                    </div>
                  ))}
                </div>
              </div>

              <div className="modal-actions">
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    acceptChallenge(selectedChallenge);
                    setSelectedChallenge(null);
                  }}
                >
                  ACCEPT CHALLENGE
                </button>

                {selectedChallenge.mode === 'Team' && (
                  <button
                    className="btn"
                    onClick={() => {
                      setSelectedChallenge(null);
                      navigate('teams');
                    }}
                  >
                    FIND A TEAM
                  </button>
                )}

                <button
                  className="btn"
                  onClick={() => setSelectedChallenge(null)}
                >
                  CLOSE
                </button>
              </div>
            </div>
          </article>
        </div>
      )}

      {/* =====================================================
          TOAST
      ===================================================== */}

      {toast && <div className="toast">{toast}</div>}
    </main>
  );
}