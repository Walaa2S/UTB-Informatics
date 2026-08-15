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

  const statusFor = useCallback(
    (course) => {
      if (passedCodes.has(course.code)) return 'passed';
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
              body: JSON.stringify({
                email: userRes.user.email,
                passedCourses: formattedPassed
              }),
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

  useEffect(() => {
    if (!courses) return;
    const positioned = layoutCourses(courses);
    const codeToId = Object.fromEntries(positioned.map((c) => [c.code, c.id]));

    setNodes(
      positioned.map((c) => ({
        id: c.id,
        type: 'course',
        position: { x: c.x, y: c.y },
        data: {
          id: c.id,
          code: c.code,
          title: c.title,
          credits: c.credits,
          category: c.category,
          status: statusFor(c),
          onMarkPassed: markPassed,
        },
      }))
    );

    const edgeList = [];
    positioned.forEach((c) => {
      (c.prerequisites || []).forEach((prereqCode) => {
        const sourceId = codeToId[prereqCode];
        if (!sourceId) return;
        const passed = passedCodes.has(prereqCode);
        edgeList.push({
          id: `${prereqCode}-${c.code}`,
          source: sourceId,
          target: c.id,
          animated: passed,
          style: { stroke: passed ? '#10b981' : 'rgba(255,255,255,0.12)', strokeWidth: passed ? 1.5 : 1 },
        });
      });
    });
    setEdges(edgeList);
  }, [courses, passedCodes, statusFor, markPassed, setNodes, setEdges]);

  const percentage = Math.round((totalPassedCredits / TOTAL_DEGREE_CREDITS) * 100);
  const columnCount = courses ? Math.max(...courses.map(columnFor)) + 1 : 0;

  return (
    <main className="flex h-screen flex-col bg-[#05070a] text-[#e9edf3]">
      <header className="flex items-center justify-between border-b border-white/[0.08] px-6 py-4">
        <div className="flex items-center gap-4">
          <Link href="/" className="font-mono text-xs text-slate-400 transition hover:text-emerald-400">
            ← back
          </Link>
          <h1 className="font-display text-base font-medium">Curriculum tree · BSIE</h1>
          {!authed && (
            <span className="rounded-full border border-white/10 px-2.5 py-1 font-mono text-[10px] text-slate-500">
              guest mode — progress saved to this browser
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <div className="h-1.5 w-40 overflow-hidden rounded-full bg-white/[0.08]">
            <div
              className="h-full bg-emerald-400 transition-all duration-500"
              style={{ width: `${Math.min(percentage, 100)}%` }}
            />
          </div>
          <span className="font-mono text-xs text-slate-400">
            {totalPassedCredits}/{TOTAL_DEGREE_CREDITS} credits · {percentage}%
          </span>
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
                nodeColor={(n) =>
                  n.data.status === 'passed' ? '#10b981' : '#38bdf8'
                }
              />
            </ReactFlow>
          </ReactFlowProvider>
        )}
      </div>

      <footer className="flex items-center gap-5 border-t border-white/[0.08] px-6 py-3 font-mono text-[11px] text-slate-500">
        <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-500" /> passed</span>
        <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-sky-400" /> available — click to toggle</span>
        <span className="ml-auto">source: {source === 'api' ? 'live backend' : 'bundled dataset'}</span>
      </footer>
    </main>
  );
}