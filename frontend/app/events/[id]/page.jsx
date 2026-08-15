'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';

const EVENTS_DETAILS = {
  'side-visit': {
    title: 'Side visit',
    src: '/Sidevisit.JPG',
    tag: 'SIDE VISIT',
    desc: 'An incredible field side-visit organized for informatics engineering students to experience real-world industrial environments, infrastructure setups, and practical engineering operations.'
  },
  'workshop-computer': {
    title: 'Workshop - Introduction to Computer Services A+',
    src: '/workshop-Introduction.jpg',
    tag: 'WORKSHOP',
    desc: 'A comprehensive hands-on workshop covering hardware components, system troubleshooting, maintenance fundamentals, and essential IT service skills.'
  },
  'sumo-competition': {
    title: 'Sumo X Competition',
    src: '/SumoXCompetition.jpg',
    tag: 'COMPETITION',
    desc: 'An exciting robotics and engineering showdown where student teams design, program, and battle autonomous sumo robots in an intense contest of strategy and engineering.'
  },
  'portfolio-website': {
    title: 'Build Your First Portfolio Website Workshop & Competition',
    src: '/images/BuildYourFirstPortfolioWebsiteWorkshop.jpg',
    tag: 'PORTFOLIO',
    desc: 'A specialized coding and web development workshop designed to help students build, style, and launch their professional developer portfolios from scratch.'
  }
};

export default function EventDetailPage() {
  const params = useParams();
  const event = EVENTS_DETAILS[params.id];

  if (!event) {
    return (
      <main className="min-h-screen bg-[#05070a] text-white flex flex-col items-center justify-center">
        <h1 className="text-3xl font-bold mb-4">Event Not Found</h1>
        <Link href="/events" className="text-sky-400 hover:underline">← Back to All Events</Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#05070a] text-[#e9edf3] px-[5%] py-24">
      <div className="max-w-4xl mx-auto">
        <Link href="/events" className="text-xs font-mono text-sky-400 hover:underline mb-6 inline-block">
          ← Back to Events
        </Link>
        
        <span className="text-xs font-mono px-3 py-1 rounded-full border border-white/10 bg-white/[0.02] text-orange-400 mb-4 inline-block">
          {event.tag}
        </span>

        <h1 className="text-4xl sm:text-5xl font-bold text-white mb-6">
          {event.title}
        </h1>

        <div className="rounded-2xl border border-white/[0.08] overflow-hidden mb-8 shadow-2xl bg-[#0a0e14]">
          <img src={event.src} alt={event.title} className="w-full h-auto max-h-[500px] object-cover" />
        </div>

        <div className="bg-[#0a0e14] border border-white/[0.08] rounded-2xl p-8 shadow-lg">
          <h2 className="text-xl font-semibold text-white mb-4">About this Event</h2>
          <p className="text-slate-300 leading-relaxed text-base">
            {event.desc}
          </p>
        </div>
      </div>
    </main>
  );
}