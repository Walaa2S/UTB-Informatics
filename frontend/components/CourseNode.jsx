'use client';

import { Handle, Position } from '@xyflow/react';

const STATUS_STYLES = {
  passed: {
    border: 'border-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.25)]',
    bg: 'bg-gradient-to-br from-emerald-950/40 to-[#0a0e14]',
    text: 'text-emerald-400 font-bold',
    dot: 'bg-emerald-400 animate-pulse',
  },
  available: {
    border: 'border-sky-500/80 shadow-[0_0_12px_rgba(56,189,248,0.15)]',
    bg: 'bg-gradient-to-br from-sky-950/30 to-[#0a0e14]',
    text: 'text-sky-300 font-bold',
    dot: 'bg-sky-400',
  },
};

export default function CourseNode({ data }) {
  const isPassed = data.status === 'passed';
  const style = isPassed ? STATUS_STYLES.passed : STATUS_STYLES.available;
  const isElective = data.category === 'elective';

  return (
    <div
      onClick={() => data.onMarkPassed && data.onMarkPassed(data.id, data.code)}
      className={`w-[180px] rounded-lg border ${style.border} ${style.bg} px-3.5 py-3 font-mono transition-all duration-200 cursor-pointer hover:-translate-y-1 hover:shadow-lg ${
        isElective ? 'border-dashed border-amber-500/50' : ''
      }`}
      title="Click to toggle pass status"
    >
      <Handle type="target" position={Position.Left} className="!bg-white/30 !border-0 !w-2 !h-2" />
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <span className={`text-[11px] tracking-wider ${style.text}`}>{data.code}</span>
        <span className={`h-2 w-2 rounded-full ${style.dot}`} />
      </div>
      <p className="text-[12px] leading-snug text-slate-100 font-medium line-clamp-2">{data.title}</p>
      <div className="mt-2.5 flex items-center justify-between text-[10px] text-slate-400 border-t border-white/[0.06] pt-1.5">
        <span className="bg-white/[0.05] px-1.5 py-0.5 rounded text-slate-300">{data.credits} cr</span>
        {isElective && <span className="text-amber-400 font-semibold">elective</span>}
      </div>
      <Handle type="source" position={Position.Right} className="!bg-white/30 !border-0 !w-2 !h-2" />
    </div>
  );
}