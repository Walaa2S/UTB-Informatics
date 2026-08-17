'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import CourseNode from './CourseNode';
import { api, isAuthenticated } from '../lib/api';
import fallbackCourses from '../data/courses.json';

const nodeTypes = { course: CourseNode };
const LOCAL_STORAGE_KEY = 'utb_passed_courses';
const TOTAL_DEGREE_CREDITS = 204;

const COL_WIDTH = 230;
const ROW_HEIGHT = 108;

function columnFor(course) {
  if (course.year === 0) return 0;
  return (course.year - 1) * 3 + course.semester;
}

function layoutCourses(courses) {
  const columns = {};
  courses.forEach((c) => {
    const col = columnFor(c);
    columns[col] = columns[col] || [];
    columns[col].push(c);
  });

  const positioned = [];
  Object.entries(columns).forEach(([col, list]) => {
    list.sort((a, b) => (a.electiveGroup || '').localeCompare(b.electiveGroup || ''));
    list.forEach((c, i) => {
      positioned.push({
        ...c,
        x: Number(col) * COL_WIDTH,
        y: i * ROW_HEIGHT,
      });
    });
  });
  return positioned;
}

function columnLabel(col) {
  if (col === 0) return 'Foundation';
  const year = Math.ceil(col / 3);
  const tri = ((col - 1) % 3) + 1;
  return `Year ${year} · Tri ${tri}`;
}

export default function SkillsTree() {
  const [courses, setCourses] = useState(null);
  const [passedCodes, setPassedCodes] = useState(new Set());
  const [source, setSource] = useState('loading');
  const [hoveredCourseCode, setHoveredCourseCode] = useState(null);
  const [showHelp, setShowHelp] = useState(false);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const authed = isAuthenticated();

  useEffect(() => {
    let cancelled = false;
    api
      .getCourses()
      .then(({ courses: apiCourses }) => {
        if (cancelled) return;
        const normalized = apiCourses.map((c) => ({
          id: c._id,
          code: c.code,
          title: c.title,
          credits: c.credits,
          year: c.year,
          semester: c.semester,
          category: c.category || 'core',
          electiveGroup: c.electiveGroup || null,
          prerequisiteCredits: c.prerequisiteCredits || null,
          prerequisites: (c.prerequisites || []).map((p) => (typeof p === 'string' ? p : p.code)),
        }));
        setCourses(normalized);
        setSource('api');
      })
      .catch(() => {
        if (cancelled) return;
        setCourses(
          fallbackCourses.map((c) => ({
            ...c,
            id: c.code,
          }))
        );
        setSource('local');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (authed) {
      api
        .me()
        .then(async ({ user }) => {
          if (user && user.email) {
            try {
              const res = await fetch(`http://localhost:4000/api/progress/${user.email}`);
              const data = await res.json();
              if (data && data.passedCourses) {
                const codes = data.passedCourses.map((pc) => (pc.course && pc.course.code ? pc.course.code : pc.code)).filter(Boolean);
                setPassedCodes(new Set(codes));
                return;
              }
            } catch (e) {
              console.error(e);
            }
          }
          window.__utbPassedRefs = (user.passedCourses || []).map((pc) => pc.course);
        })
        .catch(() => {});
    } else {
      try {
        const stored = JSON.parse(window.localStorage.getItem(LOCAL_STORAGE_KEY) || '[]');
        setPassedCodes(new Set(stored));
      } catch {
        setPassedCodes(new Set());
      }
    }
  }, [authed]);

  useEffect(() => {
    if (authed && courses && window.__utbPassedRefs && passedCodes.size === 0) {
      const idToCode = Object.fromEntries(courses.map((c) => [c.id, c.code]));
      const codes = window.__utbPassedRefs.map((id) => idToCode[id]).filter(Boolean);
      setPassedCodes(new Set(codes));
    }
  }, [authed, courses, passedCodes.size]);

  const totalPassedCredits = useMemo(() => {
    if (!courses) return 0;
    return courses.filter((c) => passedCodes.has(c.code)).reduce((sum, c) => sum + c.credits, 0);
  }, [courses, passedCodes]);

  const remainingCredits = TOTAL_DEGREE_CREDITS - totalPassedCredits;

  const statusFor = useCallback(
    (course) => {
      if (passedCodes.has(course.code)) return 'passed';
      const prereqs = course.prerequisites || [];
      const allPrereqsPassed = prereqs.length === 0 || prereqs.every((p) => passedCodes.has(p));
      if (allPrereqsPassed) return 'unlocked';
      return 'available';
    },
    [passedCodes]
  );

  const markPassed = useCallback(
    async (courseId, code) => {
      const next = new Set(passedCodes);
      if (next.has(code)) {
        next.delete(code);
      } else {
        next.add(code);
      }
      setPassedCodes(next);

      if (authed && source === 'api') {
        try {
          const userRes = await api.me();
          if (userRes && userRes.user && userRes.user.email) {
            const formattedPassed = Array.from(next).map(cCode => {
              const matchCourse = courses?.find(getC => getC.code === cCode);
              return { course: matchCourse ? matchCourse.id : cCode };
            });

            await fetch('http://localhost:4000/api/progress/update-passed', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email: userRes.user.email, passedCourses: formattedPassed }),
            });
          }
        } catch (err) {
          console.error(err);
        }
      } else {
        window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify([...next]));
      }
    },
    [authed, source, passedCodes, courses]
  );

  const handleResetProgress = async () => {
    if (!window.confirm('Are you sure you want to reset all passed courses?')) return;
    setPassedCodes(new Set());
    if (authed && source === 'api') {
      try {
        const userRes = await api.me();
        if (userRes && userRes.user && userRes.user.email) {
          await fetch('http://localhost:4000/api/progress/update-passed', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: userRes.user.email, passedCourses: [] }),
          });
        }
      } catch (err) {
        console.error(err);
      }
    } else {
      window.localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
  };

  const relatedCodes = useMemo(() => {
    if (!hoveredCourseCode || !courses) return new Set();
    const set = new Set([hoveredCourseCode]);
    const target = courses.find((c) => c.code === hoveredCourseCode);
    if (target) {
      (target.prerequisites || []).forEach((p) => set.add(p));
      courses.forEach((c) => {
        if ((c.prerequisites || []).includes(hoveredCourseCode)) {
          set.add(c.code);
        }
      });
    }
    return set;
  }, [hoveredCourseCode, courses]);

  useEffect(() => {
    if (!courses) return;
    const positioned = layoutCourses(courses);
    const codeToId = Object.fromEntries(positioned.map((c) => [c.code, c.id]));

    setNodes(
      positioned.map((c) => {
        const isPassed = passedCodes.has(c.code);
        const st = statusFor(c);
        const isHoveredRelated = hoveredCourseCode && relatedCodes.has(c.code);
        const isDimmed = hoveredCourseCode && !isHoveredRelated;
        
        let opacityValue = 1;
        if (isDimmed) {
          opacityValue = 0.2;
        } else if (!isPassed && st !== 'unlocked' && !hoveredCourseCode) {
          opacityValue = 0.45;
        }

        return {
          id: c.id,
          type: 'course',
          position: { x: c.x, y: c.y },
          style: { opacity: opacityValue, transition: 'opacity 0.2s ease' },
          data: {
            id: c.id,
            code: c.code,
            title: c.title,
            credits: c.credits,
            category: c.category,
            status: st,
            prerequisites: c.prerequisites,
            onMarkPassed: markPassed,
            onMouseEnter: () => setHoveredCourseCode(c.code),
            onMouseLeave: () => setHoveredCourseCode(null),
          },
        };
      })
    );

    const edgeList = [];
    positioned.forEach((c) => {
      (c.prerequisites || []).forEach((prereqCode) => {
        const sourceId = codeToId[prereqCode];
        if (!sourceId) return;
        const passed = passedCodes.has(prereqCode);
        const isEdgeHighlighted = hoveredCourseCode && (c.code === hoveredCourseCode || prereqCode === hoveredCourseCode);

        edgeList.push({
          id: `${prereqCode}-${c.code}`,
          source: sourceId,
          target: c.id,
          animated: passed,
          style: {
            stroke: isEdgeHighlighted ? '#38bdf8' : passed ? '#10b981' : 'rgba(255,255,255,0.08)',
            strokeWidth: isEdgeHighlighted ? 2.5 : passed ? 1.5 : 1,
            opacity: hoveredCourseCode && !isEdgeHighlighted ? 0.1 : 1,
          },
        });
      });
    });
    setEdges(edgeList);
  }, [courses, passedCodes, statusFor, markPassed, hoveredCourseCode, relatedCodes, setNodes, setEdges]);

  const percentage = Math.round((totalPassedCredits / TOTAL_DEGREE_CREDITS) * 100);
  const columnCount = courses ? Math.max(...courses.map(columnFor)) + 1 : 0;

  return (
    <main className="flex h-screen flex-col bg-[#05070a] text-[#e9edf3]">
      <header className="flex items-center justify-between border-b border-white/[0.08] px-6 py-4">
        <div className="flex items-center gap-3">
          <Link href="/" className="font-mono text-xs text-slate-400 transition hover:text-emerald-400">
            ← back
          </Link>
          <h1 className="font-display text-base font-medium">Curriculum tree · BSIE</h1>
          
          <button
            onClick={handleResetProgress}
            className="rounded border border-red-500/30 bg-red-500/10 px-2.5 py-1 font-mono text-[10px] text-red-400 transition hover:bg-red-500/20"
            title="Reset progress"
          >
            Reset Progress
          </button>

          {/* زر المساعدة (?) */}
          <button
            onClick={() => setShowHelp(true)}
            className="flex h-7 w-7 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] text-xs text-slate-300 transition hover:bg-white/10 hover:text-white font-mono shadow-sm"
            title="Quick Guide"
          >
            ?
          </button>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right font-mono text-xs">
            <span className="text-emerald-400 font-bold">{totalPassedCredits} passed</span>
            <span className="text-slate-500 mx-1.5">·</span>
            <span className="text-slate-400">{remainingCredits} credits remaining</span>
          </div>
          <div className="h-1.5 w-32 overflow-hidden rounded-full bg-white/[0.08]">
            <div
              className="h-full bg-emerald-400 transition-all duration-500"
              style={{ width: `${Math.min(percentage, 100)}%` }}
            />
          </div>
          <span className="font-mono text-xs text-slate-400">{percentage}%</span>
        </div>
      </header>

      <div className="flex gap-3 overflow-x-auto border-b border-white/[0.08] px-6 py-2 font-mono text-[10px] text-slate-500">
        {Array.from({ length: columnCount }, (_, i) => (
          <span key={i} className="whitespace-nowrap" style={{ minWidth: COL_WIDTH }}>
            {columnLabel(i)}
          </span>
        ))}
      </div>

      <div className="relative flex-1">
        {!courses ? (
          <div className="flex h-full items-center justify-center font-mono text-sm text-slate-500">
            loading curriculum…
          </div>
        ) : (
          <ReactFlowProvider>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              nodeTypes={nodeTypes}
              fitView
              minZoom={0.3}
              maxZoom={1.5}
              proOptions={{ hideAttribution: true }}
            >
              <Background color="#1a5c82" gap={28} size={1} style={{ opacity: 0.25 }} />
              <Controls className="!bottom-4 !left-4" showInteractive={false} />
              <MiniMap
                pannable
                zoomable
                maskColor="rgba(5,7,10,0.7)"
                style={{ background: '#0a0e14', border: '1px solid rgba(255,255,255,0.08)' }}
                nodeColor={(n) => (n.data.status === 'passed' ? '#10b981' : n.data.status === 'unlocked' ? '#fbbf24' : '#38bdf8')}
              />
            </ReactFlow>
          </ReactFlowProvider>
        )}
      </div>

      <footer className="flex items-center gap-5 border-t border-white/[0.08] px-6 py-3 font-mono text-[11px] text-slate-500">
        <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-500" /> passed</span>
        <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" /> ready to register</span>
        <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-sky-400" /> available / locked</span>
        <span className="ml-auto">hover on any course to highlight dependencies</span>
      </footer>

      {/* نافذة المساعدة البصرية السريعة (Quick Visual Guide) */}
      {showHelp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 font-mono">
          <div className="w-full max-w-md rounded-2xl border border-white/20 bg-[#0a0e14] p-6 text-slate-200 shadow-2xl">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-5">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-sky-500/20 text-sky-400 text-xs font-bold border border-sky-500/30">?</span>
                <h3 className="text-sm font-bold text-sky-300 tracking-wide">Quick Guide</h3>
              </div>
              <button
                onClick={() => setShowHelp(false)}
                className="text-slate-400 hover:text-white transition text-sm p-1 rounded-lg hover:bg-white/5"
              >
                ✕
              </button>
            </div>

            {/* Visual Quick Tips (No Long Paragraphs) */}
            <div className="space-y-3 text-xs">
              
              <div className="flex items-center gap-3.5 rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/40">✓</span>
                <div>
                  <p className="font-bold text-emerald-400">Click to Pass</p>
                  <p className="text-[11px] text-slate-400">Mark finished courses to update your credit progress.</p>
                </div>
              </div>

              <div className="flex items-center gap-3.5 rounded-xl border border-amber-500/30 bg-amber-950/20 p-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/20 text-amber-400 font-bold border border-amber-500/40 animate-pulse">★</span>
                <div>
                  <p className="font-bold text-amber-400">Pulsing Gold = Ready</p>
                  <p className="text-[11px] text-slate-400">Prerequisites met! Register for these next.</p>
                </div>
              </div>

              <div className="flex items-center gap-3.5 rounded-xl border border-sky-500/30 bg-sky-950/20 p-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sky-500/20 text-sky-400 font-bold border border-sky-500/40">👁</span>
                <div>
                  <p className="font-bold text-sky-300">Hover to Inspect</p>
                  <p className="text-[11px] text-slate-400">See requirements and dependency paths instantly.</p>
                </div>
              </div>

            </div>

            {/* Footer Button */}
            <div className="mt-6 text-center">
              <button
                onClick={() => setShowHelp(false)}
                className="w-full rounded-xl bg-sky-500/20 border border-sky-500/40 py-2.5 text-xs font-bold text-sky-300 transition hover:bg-sky-500/30"
              >
                Got it, let's go!
              </button>
            </div>

          </div>
        </div>
      )}
    </main>
  );
}