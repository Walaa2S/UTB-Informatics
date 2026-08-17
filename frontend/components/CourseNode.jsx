'use client';

import { Handle, Position } from '@xyflow/react';

const STATUS_STYLES = {
  passed: {
    border: 'border-emerald-500/80 shadow-[0_0_12px_rgba(16,185,129,0.2)]',
    bg: 'bg-gradient-to-br from-emerald-950/40 via-[#0a0e14] to-[#0a0e14]',
    text: 'text-emerald-400 font-bold',
    badgeBg: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
    icon: '✓',
  },
  unlocked: {
    // المواد التي فتحت حديثاً وأصبحت جاهزة للتسجيل (تومض باللون الأصفر/الذهبي)
    border: 'border-amber-400 shadow-[0_0_16px_rgba(251,191,36,0.35)] animate-pulse',
    bg: 'bg-gradient-to-br from-amber-950/40 via-[#0a0e14] to-[#0a0e14]',
    text: 'text-amber-300 font-bold',
    badgeBg: 'bg-amber-400/20 text-amber-300 border border-amber-400/40',
    icon: '★',
  },
  available: {
    border: 'border-sky-500/70 shadow-[0_0_10px_rgba(56,189,248,0.12)]',
    bg: 'bg-gradient-to-br from-sky-950/30 via-[#0a0e14] to-[#0a0e14]',
    text: 'text-sky-300 font-bold',
    badgeBg: 'bg-sky-500/20 text-sky-300 border border-sky-500/30',
    icon: '•',
  },
};

export default function CourseNode({ data }) {
  const statusKey = data.status || 'available';
  const style = STATUS_STYLES[statusKey] || STATUS_STYLES.available;
  const isElective = data.category === 'elective';

  const prerequisitesList = data.prerequisites || [];
  const tooltipText = prerequisitesList.length > 0
    ? `${data.code}: ${data.title} \nPrerequisites: ${prerequisitesList.join(', ')}`
    : `${data.code}: ${data.title} \nNo prerequisites`;

  return (
    <div
      onClick={() => data.onMarkPassed && data.onMarkPassed(data.id, data.code)}
      onMouseEnter={data.onMouseEnter}
      onMouseLeave={data.onMouseLeave}
      className={`w-[180px] rounded-xl border ${style.border} ${style.bg} px-3.5 py-3 font-mono transition-all duration-200 cursor-pointer hover:-translate-y-1 hover:shadow-lg ${
        isElective ? 'border-dashed border-amber-500/60' : ''
      }`}
      title={tooltipText}
    >
      <Handle type="target" position={Position.Left} className="!bg-white/40 !border-0 !w-2 !h-2" />
      
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className={`text-[11px] tracking-wider ${style.text}`}>{data.code}</span>
        <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] ${style.badgeBg}`}>
          {style.icon}
        </span>
      </div>

      <p className="text-[12px] leading-snug text-slate-100 font-medium line-clamp-2">{data.title}</p>

      <div className="mt-3 flex items-center justify-between text-[10px] text-slate-400 border-t border-white/[0.08] pt-2">
        <span className="bg-white/[0.06] px-1.5 py-0.5 rounded text-slate-300">{data.credits} cr</span>
        {statusKey === 'unlocked' && <span className="text-amber-400 font-bold animate-pulse">Ready!</span>}
        {isElective && <span className="text-amber-400 font-semibold tracking-wide">elective</span>}
      </div>

      <Handle type="source" position={Position.Right} className="!bg-white/40 !border-0 !w-2 !h-2" />
    </div>
  );
}