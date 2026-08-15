'use client';

import { useEffect, useMemo, useState } from 'react';

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api').replace(/\/$/, '');

async function apiFetch(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
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

function EmptyState({ icon = '⌘', title, text }) {
  return <div className="empty-state"><div className="empty-icon">{icon}</div><h3>{title}</h3><p>{text}</p></div>;
}

function formatDate(value) {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function InstructorDashboardPage() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('overview');
  const [toast, setToast] = useState('');
  const [form, setForm] = useState({ title: '', description: '', category: '', reward: '', deadline: '', type: 'Technical' });
  const [eventForm, setEventForm] = useState({ title: '', description: '', startsAt: '', capacity: '' });
  const [resourceForm, setResourceForm] = useState({ title: '', description: '', url: '', type: 'Resource' });
  const [busy, setBusy] = useState(false);

  const role = String(dashboard?.user?.role || '').toLowerCase();
const allowed = role === 'faculty' || role === 'admin';

  const stats = dashboard?.stats || {};
  const challenges = dashboard?.challenges || [];
  const submissions = dashboard?.submissions || [];
  const students = dashboard?.students || [];
  const events = dashboard?.events || [];
  const resources = dashboard?.resources || [];
  const reports = dashboard?.reports || [];

  function showToast(message) {
    setToast(message);
    window.clearTimeout(window.__instructorToast);
    window.__instructorToast = window.setTimeout(() => setToast(''), 3000);
  }

  async function load() {
    setLoading(true);
    try {
      const data = await apiFetch('/instructor/dashboard');
      setDashboard(data);
    } catch (error) {
      setDashboard(null);
      showToast(error.status === 401 ? 'Please sign in with your UTB account.' : error.status === 403 ? 'Instructor access is required.' : 'Instructor API is not reachable.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function mutate(path, method = 'POST', body) {
    setBusy(true);
    try {
      await apiFetch(path, { method, body: body ? JSON.stringify(body) : undefined });
      await load();
      showToast('Saved successfully.');
    } catch (error) {
      showToast(error.message || 'Action failed.');
    } finally {
      setBusy(false);
    }
  }

  async function createChallenge(event) {
    event.preventDefault();
    await mutate('/instructor/challenges', 'POST', {
      ...form,
      reward: form.reward === '' ? null : Number(form.reward),
    });
    setForm({ title: '', description: '', category: '', reward: '', deadline: '', type: 'Technical' });
  }

  async function createEvent(event) {
    event.preventDefault();
    await mutate('/instructor/events', 'POST', {
      ...eventForm,
      capacity: eventForm.capacity === '' ? null : Number(eventForm.capacity),
    });
    setEventForm({ title: '', description: '', startsAt: '', capacity: '' });
  }

  async function createResource(event) {
    event.preventDefault();
    await mutate('/instructor/resources', 'POST', resourceForm);
    setResourceForm({ title: '', description: '', url: '', type: 'Resource' });
  }

  async function reviewSubmission(id, status) {
    await mutate(`/instructor/submissions/${id}/review`, 'POST', { status });
  }

  async function removeReport(id) {
    await mutate(`/instructor/reports/${id}/resolve`, 'POST');
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

      <header className="topbar">
        <button className="brand" onClick={() => { window.location.href = '/community'; }}>
          <div className="brand-mark">&gt;_</div>
          <div className="brand-copy"><div className="brand-title">BSIE Instructor Console</div><div className="brand-path">BSIE://instructor</div></div>
        </button>
        <div className="top-actions">
          <button className="btn" onClick={() => { window.location.href = '/community'; }}>← Community</button>
          <div className="profile-mini">
            <div className="avatar">DR</div>
            <div><div className="profile-name">{dashboard?.user?.name || 'Instructor'}</div><div className="profile-level">{role ? role.toUpperCase() : 'ACCESS CHECK'}</div></div>
          </div>
        </div>
      </header>

      {!loading && !allowed ? (
        <div style={{ maxWidth: 980, margin: '80px auto', padding: 24 }}>
          <EmptyState icon="⛔" title="Instructor access required" text="This console is protected by the backend role. Sign in with an authorized UTB instructor account." />
        </div>
      ) : (
        <div className="layout">
          <aside className="sidebar open">
            <div className="terminal-label">~/instructor/community</div>
            <nav className="nav">
              {tabs.map(([id, label]) => <button key={id} className={`nav-item ${tab === id ? 'active' : ''}`} onClick={() => setTab(id)}><span className="nav-icon">{id === 'overview' ? '⌂' : id === 'challenges' ? '⚡' : id === 'submissions' ? '✓' : id === 'students' ? '👥' : id === 'events' ? '◈' : id === 'resources' ? '▣' : '⚑'}</span><span className="nav-label">{label}</span></button>)}
            </nav>
            <div className="sidebar-terminal">
              <div className="sidebar-terminal-title">&gt; instructor.status()</div>
              <p>connection: {loading ? 'checking' : 'online'}<br />role: {role || 'unknown'}<br />pending_reviews: {stats.pendingReviews ?? submissions.length}<br />active_students: {stats.activeStudents ?? '—'}<br />status: {loading ? 'syncing' : 'healthy'}</p>
            </div>
          </aside>

          <section className="main">
            {tab === 'overview' && (
              <>
                <section className="hero">
                  <div className="terminal-orb" />
                  <div className="hero-grid">
                    <div><div className="hero-kicker">&gt; instructor.boot()</div><h1>Manage.<br />Review.<br /><span>Empower.</span></h1><p className="hero-copy">A protected academic control center for publishing challenges, reviewing submissions, tracking student progress, managing events and moderating community content.</p></div>
                    <div className="hero-terminal"><div className="terminal-top"><span className="dot" /><span className="dot" /><span className="dot" /><span className="terminal-name">instructor-console</span></div><div className="terminal-body"><div className="terminal-line-dim">$ role</div><div className="terminal-line-accent">{role || 'checking'}</div><br /><div className="terminal-line-dim">$ pending_reviews</div><div>{stats.pendingReviews ?? submissions.length}</div><br /><div className="terminal-line-accent">Access controlled by backend RBAC.</div></div></div>
                  </div>
                </section>
                <div className="stats-grid">
                  {[
                    ['Active Students', stats.activeStudents ?? '—', 'live'],
                    ['Open Challenges', stats.openChallenges ?? challenges.filter((x) => x.status === 'Open').length, 'published'],
                    ['Pending Reviews', stats.pendingReviews ?? submissions.length, 'awaiting action'],
                    ['Community Reports', stats.openReports ?? reports.length, 'moderation queue'],
                  ].map(([label, value, extra]) => <div className="stat-card" key={label}><div className="stat-label">{label}</div><div className="stat-value">{value}</div><div className="stat-extra">{extra}</div></div>)}
                </div>
                <div className="two-column section-spacer">
                  <div className="panel"><div className="panel-header"><div><h3 className="panel-title">Submission Review</h3><div className="panel-subtitle">Latest student work awaiting review</div></div><button className="btn" onClick={() => setTab('submissions')}>View queue</button></div><div className="panel-body">{submissions.slice(0, 5).map((item) => <div className="task-row" key={item.id}><div><strong>{item.studentName || 'Student'}</strong><div className="task-meta">{item.challengeTitle || 'Submission'} · {formatDate(item.submittedAt)}</div></div><Pill tone="orange">{item.status || 'Pending'}</Pill></div>)}{!submissions.length && <EmptyState icon="✓" title="No pending submissions" text="The review queue is empty." />}</div></div>
                  <div className="panel"><div className="panel-header"><div><h3 className="panel-title">Community Health</h3><div className="panel-subtitle">Moderation and platform signals</div></div></div><div className="panel-body">{reports.slice(0, 5).map((item) => <div className="task-row" key={item.id}><div><strong>{item.type || 'Report'}</strong><div className="task-meta">{item.reason || item.message || 'Reported content'}</div></div><button className="btn" onClick={() => removeReport(item.id)}>RESOLVE</button></div>)}{!reports.length && <EmptyState icon="✓" title="No open reports" text="The moderation queue is clear." />}</div></div>
                </div>
              </>
            )}

            {tab === 'challenges' && (
              <section className="page-section">
                <div className="section-heading"><div><div className="section-kicker">&gt; instructor.challenges()</div><h2>Challenge Management</h2><p>Create and manage real challenges. Nothing is seeded into the UI.</p></div></div>
                <form className="panel" onSubmit={createChallenge}><div className="panel-body"><div className="form-grid">
                  <input className="search-input" placeholder="Challenge title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
                  <input className="search-input" placeholder="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} required />
                  <input className="search-input" placeholder="Reward XP" type="number" min="0" value={form.reward} onChange={(e) => setForm({ ...form, reward: e.target.value })} />
                  <input className="search-input" placeholder="Deadline" type="datetime-local" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} />
                  <textarea className="search-input" style={{ minHeight: 120, gridColumn: '1 / -1' }} placeholder="Challenge description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
                </div><button className="btn btn-primary" disabled={busy} type="submit">PUBLISH CHALLENGE</button></div></form>
                <div className="resource-grid section-spacer">{challenges.map((item) => <article className="resource-card" key={item.id}><Pill tone="green">{item.status || '—'}</Pill><h3 className="card-title">{item.title}</h3><p>{item.description || ''}</p><div className="project-author">{item.category || '—'} · +{item.reward || 0} XP</div><div className="card-footer"><button className="accept-btn" onClick={() => mutate(`/instructor/challenges/${item.id}`, 'DELETE')}>DELETE</button></div></article>)}</div>
                {!challenges.length && <EmptyState icon="⚡" title="No challenges published" text="Create the first challenge above." />}
              </section>
            )}

            {tab === 'submissions' && (
              <section className="page-section"><div className="section-heading"><div><div className="section-kicker">&gt; submissions.review()</div><h2>Submission Review</h2><p>Review student work and record the decision in the backend.</p></div></div><div className="panel"><div className="panel-body">{submissions.map((item) => <div className="task-row" key={item.id}><div><strong>{item.studentName || 'Student'}</strong><div className="task-meta">{item.challengeTitle || 'Submission'} · {formatDate(item.submittedAt)}</div><div style={{ marginTop: 5, color: 'var(--muted)', fontSize: 10 }}>{item.link || item.content || ''}</div></div><div style={{ display: 'flex', gap: 8 }}><button className="btn btn-primary" onClick={() => reviewSubmission(item.id, 'approved')}>APPROVE</button><button className="btn" onClick={() => reviewSubmission(item.id, 'rejected')}>REJECT</button></div></div>)}{!submissions.length && <EmptyState icon="✓" title="No submissions waiting" text="There is nothing to review." />}</div></div></section>
            )}

            {tab === 'students' && (
              <section className="page-section"><div className="section-heading"><div><div className="section-kicker">&gt; students.monitor()</div><h2>Student Progress</h2><p>Real student records returned by the protected API.</p></div></div><div className="leaderboard">{students.map((student) => <div className="leader-row" key={student.id}><div className="avatar">{String(student.name || 'ST').slice(0,2).toUpperCase()}</div><div style={{ flex: 1 }}><div className="leader-name">{student.name || 'Student'}</div><div className="leader-meta">{student.email || ''} · Level {student.level ?? '—'}</div></div><strong>{student.xp ?? 0} XP</strong></div>)}{!students.length && <EmptyState icon="👥" title="No student records" text="Student progress will appear when the backend returns authorized records." />}</div></section>
            )}

            {tab === 'events' && (
              <section className="page-section"><div className="section-heading"><div><div className="section-kicker">&gt; instructor.events()</div><h2>Event Management</h2><p>Publish real workshops and activities.</p></div></div><form className="panel" onSubmit={createEvent}><div className="panel-body"><div className="form-grid"><input className="search-input" placeholder="Event title" value={eventForm.title} onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })} required /><input className="search-input" type="datetime-local" value={eventForm.startsAt} onChange={(e) => setEventForm({ ...eventForm, startsAt: e.target.value })} required /><input className="search-input" type="number" min="1" placeholder="Capacity" value={eventForm.capacity} onChange={(e) => setEventForm({ ...eventForm, capacity: e.target.value })} /><textarea className="search-input" style={{ minHeight: 100, gridColumn: '1 / -1' }} placeholder="Description" value={eventForm.description} onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })} /></div><button className="btn btn-primary" disabled={busy}>PUBLISH EVENT</button></div></form><div className="resource-grid section-spacer">{events.map((item) => <article className="resource-card" key={item.id}><Pill tone="orange">{item.type || 'Event'}</Pill><h3 className="card-title">{item.title}</h3><div className="project-author">{formatDate(item.startsAt)}</div><p>{item.description || ''}</p></article>)}</div>{!events.length && <EmptyState icon="◈" title="No events" text="Create an event above." />}</section>
            )}

            {tab === 'resources' && (
              <section className="page-section"><div className="section-heading"><div><div className="section-kicker">&gt; instructor.resources()</div><h2>Resource Management</h2><p>Publish resources for students.</p></div></div><form className="panel" onSubmit={createResource}><div className="panel-body"><div className="form-grid"><input className="search-input" placeholder="Resource title" value={resourceForm.title} onChange={(e) => setResourceForm({ ...resourceForm, title: e.target.value })} required /><input className="search-input" placeholder="Resource URL" value={resourceForm.url} onChange={(e) => setResourceForm({ ...resourceForm, url: e.target.value })} /><textarea className="search-input" style={{ minHeight: 100, gridColumn: '1 / -1' }} placeholder="Description" value={resourceForm.description} onChange={(e) => setResourceForm({ ...resourceForm, description: e.target.value })} /></div><button className="btn btn-primary" disabled={busy}>PUBLISH RESOURCE</button></div></form><div className="resource-grid section-spacer">{resources.map((item) => <article className="resource-card" key={item.id}><Pill tone="blue">{item.type || 'Resource'}</Pill><h3 className="card-title">{item.title}</h3><p>{item.description || ''}</p></article>)}</div>{!resources.length && <EmptyState icon="▣" title="No resources" text="Create a resource above." />}</section>
            )}

            {tab === 'moderation' && (
              <section className="page-section"><div className="section-heading"><div><div className="section-kicker">&gt; moderation.queue()</div><h2>Moderation</h2><p>Resolve reported content through protected backend actions.</p></div></div><div className="panel"><div className="panel-body">{reports.map((item) => <div className="task-row" key={item.id}><div><strong>{item.type || 'Report'}</strong><div className="task-meta">{item.reason || item.message || 'Reported content'}</div></div><button className="btn" onClick={() => removeReport(item.id)}>RESOLVE</button></div>)}{!reports.length && <EmptyState icon="⚑" title="No moderation reports" text="The queue is empty." />}</div></div></section>
            )}
          </section>
        </div>
      )}

      {toast && <div className="toast">{toast}</div>}
    
<style jsx global>{`
  .profile-mini { cursor: pointer; border: 0; background: transparent; text-align: left; color: inherit; display: flex; align-items: center; gap: 10px; padding: 4px 8px; border-radius: 12px; }
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
  @media (max-width: 720px) { .form-grid { grid-template-columns: 1fr; } .form-grid > * { grid-column: auto !important; } }
`}</style>

    </main>
  );
}
