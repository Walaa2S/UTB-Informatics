'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

const ALL_EVENTS = [
  { id: 'side-visit', title: 'Side visit', src: '/Sidevisit.JPG', tag: 'SIDE VISIT' },
  { id: 'workshop-computer', title: 'Workshop - Introduction to Computer Services A+', src: '/workshop-Introduction.jpg', tag: 'WORKSHOP' },
  { id: 'sumo-competition', title: 'Sumo X Competition', src: '/SumoXCompetition.jpg', tag: 'COMPETITION' },
  { id: 'portfolio-website', title: 'Build Your First Portfolio Website Workshop & Competition', src: '/Por1tfolioWorkshop.jpg', tag: 'PORTFOLIO' },
];

export default function EventsPage() {
  return (
    <main className="min-h-screen bg-[#05070a] text-[#e9edf3] px-[5%] py-24">
      <div className="max-w-6xl mx-auto mb-12">
        <Link href="/" className="text-xs font-mono text-sky-400 hover:underline mb-4 inline-block">
          ← Back to Home
        </Link>
        <p className="font-mono text-xs uppercase tracking-[0.12em] text-orange-400 mb-2">
          Discover More
        </p>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-white">
          All Student Events & Activities
        </h1>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        {ALL_EVENTS.map((event) => (
          <Link key={event.id} href={`/events/${event.id}`} className="group block">
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="rounded-2xl border border-white/[0.08] bg-[#0a0e14] overflow-hidden shadow-lg transition"
            >
              <div className="aspect-[16/9] overflow-hidden relative">
                <img 
                  src={event.src} 
                  alt={event.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                />
              </div>
              <div className="p-6 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white group-hover:text-sky-400 transition-colors">
                  {event.title}
                </h2>
                <span className="text-[10px] font-mono px-3 py-1 rounded-full border border-white/10 bg-white/[0.02] text-slate-400">
                  {event.tag}
                </span>
              </div>
            </motion.div>
          </Link>
        ))}
      </div>
    </main>
  );
}