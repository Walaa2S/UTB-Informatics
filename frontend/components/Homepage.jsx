"use client";

import ActivityGallery from './ActivityGallery';
import AiAdvisor from './AiAdvisor';
import { Suspense, useState, useRef, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import {
  motion,
  useScroll,
  useTransform,
  AnimatePresence,
  useMotionValueEvent,
  useScroll as useFramerScroll,
} from 'framer-motion';
import { Hero3DFallback } from './Hero3D';
import fallbackCourses from '../data/courses.json';

const Hero3D = dynamic(() => import('./Hero3D'), { ssr: false });

const CAREER_TRACKS = [
  {
    key: 'cloud',
    label: 'Cloud Solutions Architect',
    highlights: 'Cloud Infrastructure · Distributed Systems · DevOps Pipelines · Huawei Cloud Track',
  },
  {
    key: 'network',
    label: 'Network Engineer',
    highlights: 'Routing & Switching · Network Security · Cisco CCNA Track · Wireless Systems',
  },
  {
    key: 'security',
    label: 'Cybersecurity Analyst',
    highlights: 'Cybersecurity Fundamentals · Ethical Hacking · Cisco Security Track · Cryptography',
  },
  {
    key: 'ai',
    label: 'AI / ML Engineer',
    highlights: 'Machine Learning · Data Structures · Applied AI Lab · Huawei AI Track',
  },
  {
    key: 'developer',
    label: 'Software Developer',
    highlights: 'Software Engineering · Web Systems · Mobile Development · Capstone Studio',
  },
];

/* ---------- Student Achievement Card ---------- */
function StudentAchievementCard({ student }) {
  const [isOpen, setIsOpen] = useState(false);

  const tone = student.tone || {
    accent: '#38bdf8',
    soft: 'rgba(56,189,248,0.12)',
  };

  return (
    <>
      <motion.article
        onClick={() => setIsOpen(true)}
        whileHover={{ y: -5 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="
          group relative
          min-h-[350px]
          w-full
          cursor-pointer
          overflow-hidden
          rounded-[1.5rem]
          border border-white/[0.08]
          bg-[#091224]
          p-5 sm:p-6
          shadow-[0_20px_60px_rgba(0,0,0,.18)]
          transition-all duration-300
          hover:border-white/[0.16]
          hover:shadow-[0_24px_80px_rgba(0,0,0,.28)]
        "
        style={{ '--accent': tone.accent }}
      >

        {/* Accent glow */}
        <div
          className="
            pointer-events-none
            absolute -right-20 -top-20
            h-40 w-40
            rounded-full
            blur-3xl
            opacity-0
            transition-opacity duration-500
            group-hover:opacity-100
          "
          style={{ background: tone.accent }}
        />

        {/* Top */}
        <div className="relative z-10 flex items-center justify-between">

          <span
            className="rounded-full border px-3 py-1 text-[9px] font-mono uppercase tracking-[0.16em]"
            style={{
              color: tone.accent,
              borderColor: `${tone.accent}35`,
              background: tone.soft,
            }}
          >
            {student.category || 'Achievement'}
          </span>

          {/* Pie */}
          <div
            className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-full"
            style={{
              background: `conic-gradient(
                ${tone.accent} ${student.progress || 100}%,
                rgba(255,255,255,0.06) 0
              )`,
            }}
          >
            <div className="absolute inset-[5px] rounded-full bg-[#091224]" />

            <span className="relative z-10 text-[10px] font-mono font-semibold text-white">
              {student.value || '★'}
            </span>
          </div>

        </div>

        {/* Student */}
        <div className="relative z-10 mt-6 flex items-center gap-3">

          <div
            className="
              flex h-11 w-11
              shrink-0
              items-center justify-center
              overflow-hidden
              rounded-full
              border
              bg-white/[0.04]
              text-sm font-semibold
            "
            style={{
              borderColor: `${tone.accent}45`,
              color: tone.accent,
            }}
          >
            {student.image ? (
              <img
                src={student.image}
                alt={student.name}
                className="h-full w-full object-cover"
              />
            ) : (
              student.name?.charAt(0)?.toUpperCase()
            )}
          </div>

          <div className="min-w-0">
            <h3 className="truncate text-lg font-semibold text-white">
              {student.name}
            </h3>

            <p className="mt-0.5 text-[10px] font-mono uppercase tracking-[0.1em] text-slate-500">
              {student.title || 'Informatics Engineering'}
            </p>
          </div>

        </div>

        {/* Main achievement */}
        <div className="relative z-10 mt-6">

          <h4 className="text-xl font-semibold leading-tight text-white">
            {student.achievement}
          </h4>

          <p className="mt-2 text-sm leading-relaxed text-slate-400">
            {student.description}
          </p>

        </div>

        {/* Achievement badges */}
        <div className="relative z-10 mt-5">

          <p className="mb-2 text-[9px] font-mono uppercase tracking-[0.15em] text-slate-500">
            Achievements
          </p>

          <div className="flex flex-wrap gap-2">

            {(student.achievements || []).slice(0, 4).map((item, index) => (
              <span
                key={`${student.name}-${index}`}
                className="
                  rounded-lg
                  border border-white/[0.07]
                  bg-white/[0.025]
                  px-2.5 py-1.5
                  text-[10px]
                  text-slate-300
                  transition-colors
                  group-hover:border-white/[0.12]
                "
              >
                {item}
              </span>
            ))}

          </div>

        </div>

        {/* Bottom */}
        <div className="relative z-10 mt-5 border-t border-white/[0.07] pt-4">

          <div className="flex items-center justify-between">

            <span className="text-[9px] font-mono uppercase tracking-[0.12em] text-slate-500">
              Student Spotlight
            </span>

            <span
              className="
                text-[10px]
                font-mono
                opacity-0
                translate-x-1
                transition-all duration-300
                group-hover:translate-x-0
                group-hover:opacity-100
              "
              style={{ color: tone.accent }}
            >
              View details →
            </span>

          </div>

        </div>

      </motion.article>


      {/* =========================
          DETAILS POPUP
      ========================= */}

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="
              fixed inset-0 z-[100]
              flex items-center justify-center
              bg-black/75
              p-4
              backdrop-blur-md
            "
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
          >

            <motion.div
              initial={{
                opacity: 0,
                y: 20,
                scale: 0.96,
              }}
              animate={{
                opacity: 1,
                y: 0,
                scale: 1,
              }}
              exit={{
                opacity: 0,
                y: 20,
                scale: 0.96,
              }}
              transition={{
                duration: 0.25,
                ease: 'easeOut',
              }}
              onClick={(e) => e.stopPropagation()}
              className="
                relative
                w-full
                max-w-md
                overflow-hidden
                rounded-[1.75rem]
                border border-white/[0.1]
                bg-[#091224]
                p-6
                shadow-[0_30px_100px_rgba(0,0,0,.5)]
              "
            >

              {/* Close */}
              <button
                onClick={() => setIsOpen(false)}
                className="
                  absolute
                  right-4
                  top-4
                  flex
                  h-9
                  w-9
                  items-center
                  justify-center
                  rounded-full
                  border
                  border-white/[0.08]
                  bg-white/[0.04]
                  text-slate-400
                  transition
                  hover:border-white/20
                  hover:text-white
                "
              >
                ✕
              </button>


              {/* Student header */}
              <div className="flex items-center gap-4 pr-10">

                <div
                  className="
                    flex h-14 w-14
                    shrink-0
                    items-center justify-center
                    overflow-hidden
                    rounded-full
                    border
                    bg-white/[0.04]
                    text-base
                    font-semibold
                  "
                  style={{
                    borderColor: `${tone.accent}45`,
                    color: tone.accent,
                  }}
                >
                  {student.image ? (
                    <img
                      src={student.image}
                      alt={student.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    student.name?.charAt(0)?.toUpperCase()
                  )}
                </div>

                <div>

                  <p
                    className="mb-1 text-[9px] font-mono uppercase tracking-[0.16em]"
                    style={{ color: tone.accent }}
                  >
                    {student.category || 'Achievement'}
                  </p>

                  <h3 className="text-xl font-semibold text-white">
                    {student.name}
                  </h3>

                  <p className="mt-1 text-xs text-slate-500">
                    {student.title || 'Informatics Engineering'}
                  </p>

                </div>

              </div>


              {/* Main achievement */}
              <div className="mt-7">

                <p className="text-[9px] font-mono uppercase tracking-[0.15em] text-slate-500">
                  Featured Achievement
                </p>

                <h4 className="mt-2 text-2xl font-semibold leading-tight text-white">
                  {student.achievement}
                </h4>

                <p className="mt-3 text-sm leading-relaxed text-slate-400">
                  {student.description}
                </p>

              </div>


              {/* Full achievements */}
              <div className="mt-7">

                <p className="mb-3 text-[9px] font-mono uppercase tracking-[0.15em] text-slate-500">
                  Certifications & Activities
                </p>

                <div className="space-y-2">

                  {(student.achievements || []).map((item, index) => (
                    <div
                      key={`${student.name}-detail-${index}`}
                      className="
                        flex
                        items-center
                        gap-3
                        rounded-xl
                        border
                        border-white/[0.07]
                        bg-white/[0.025]
                        px-3
                        py-2.5
                      "
                    >

                      <span
                        className="h-1.5 w-1.5 rounded-full"
                        style={{ background: tone.accent }}
                      />

                      <span className="text-xs text-slate-300">
                        {item}
                      </span>

                    </div>
                  ))}

                </div>

              </div>


              {/* Value */}
              <div className="mt-6 grid grid-cols-2 gap-3">

                <div className="rounded-xl border border-white/[0.07] bg-white/[0.025] p-4">

                  <p className="text-[9px] font-mono uppercase tracking-[0.12em] text-slate-500">
                    Recognition
                  </p>

                  <p className="mt-2 text-sm font-medium text-white">
                    {student.category}
                  </p>

                </div>

                <div className="rounded-xl border border-white/[0.07] bg-white/[0.025] p-4">

                  <p className="text-[9px] font-mono uppercase tracking-[0.12em] text-slate-500">
                    Highlight
                  </p>

                  <p
                    className="mt-2 text-sm font-semibold"
                    style={{ color: tone.accent }}
                  >
                    {student.value || '—'}
                  </p>

                </div>

              </div>

            </motion.div>

          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default function Homepage() {
  const [activeTrack, setActiveTrack] = useState('cloud');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAdvisorOpen, setIsAdvisorOpen] = useState(false);
  const [courses, setCourses] = useState([]);
  const [passedCodes, setPassedCodes] = useState(new Set());

  // Navbar Hide/Show on Scroll logic
  const [hidden, setHidden] = useState(false);
  const { scrollY } = useFramerScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious();
    if (latest > previous && latest > 150) {
      setHidden(true);
    } else {
      setHidden(false);
    }
  });

  useEffect(() => {
    const normalized = fallbackCourses.map((c) => ({
      ...c,
      id: c.code,
    }));
    setCourses(normalized);

    try {
      const stored = JSON.parse(window.localStorage.getItem('utb_passed_courses') || '[]');
      setPassedCodes(new Set(stored));
    } catch {
      setPassedCodes(new Set());
    }
  }, []);

  const totalPassedCredits = useMemo(() => {
    if (!courses) return 0;
    return courses.filter((c) => passedCodes.has(c.code)).reduce((sum, c) => sum + c.credits, 0);
  }, [courses, passedCodes]);

  const active = CAREER_TRACKS.find((t) => t.key === activeTrack);

  // دالة الانتقال السلس للأقسام مع غلق القائمة في الموبايل
  const scrollToSection = (id) => {
    setIsMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // مرجع لتتبع حركة السكرول في بطاقات الشراكات
  const bsieSectionRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: bsieSectionRef,
    offset: ['start end', 'end start'],
  });

  const leftCardsX = useTransform(
    scrollYProgress,
    [0, 0.45],
    [-160, 0]
  );

  const rightCardsX = useTransform(
    scrollYProgress,
    [0, 0.45],
    [160, 0]
  );

  const cardsOpacity = useTransform(
    scrollYProgress,
    [0, 0.35],
    [0.1, 1]
  );

  // مرجع قسم الـ Clubs & Academies Hub
  const clubsSectionRef = useRef(null);

  const { scrollYProgress: clubsScrollProgress } = useScroll({
    target: clubsSectionRef,
    offset: ['start end', 'end start'],
  });

  const card1X = useTransform(
    clubsScrollProgress,
    [0.1, 0.4],
    [-120, 0]
  );

  const card3X = useTransform(
    clubsScrollProgress,
    [0.1, 0.4],
    [120, 0]
  );

  const cardsScale = useTransform(
    clubsScrollProgress,
    [0.1, 0.4],
    [0.85, 1]
  );

  const cardsOpacityScroll = useTransform(
    clubsScrollProgress,
    [0.1, 0.35],
    [0, 1]
  );

  // تفعيل أنيميشن الـ Blur → Sharp Reveal مع سكرول الصفحة العام
  const careerSectionRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!careerSectionRef.current) return;

      const cards =
        careerSectionRef.current.querySelectorAll('.blursharp-card');

      const triggerPoint = window.innerHeight * 0.85;

      cards.forEach((card) => {
        const cardRect = card.getBoundingClientRect();

        if (cardRect.top < triggerPoint) {
          card.classList.add('active');
        }
      });
    };

    window.addEventListener('scroll', handleScroll);

    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <main className="relative min-h-screen bg-[#050b18] text-white overflow-x-hidden overflow-y-visible">

      {/* Premium ambient field — keeps the page deep without competing with the robot */}
      <div className="absolute inset-0 pointer-events-none z-0 bg-[radial-gradient(circle_at_12%_8%,rgba(34,211,238,0.10),transparent_24%),radial-gradient(circle_at_82%_18%,rgba(59,130,246,0.12),transparent_28%),radial-gradient(circle_at_52%_72%,rgba(52,211,153,0.045),transparent_26%)]" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/35 to-transparent pointer-events-none z-0" />
      <div
        className="absolute inset-0 pointer-events-none z-0 opacity-[0.22]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.035) 1px, transparent 1px)',
          backgroundSize: '72px 72px',
          maskImage: 'linear-gradient(to bottom, black, transparent 68%)',
          WebkitMaskImage: 'linear-gradient(to bottom, black, transparent 68%)',
        }}
      />

      {/* ---------- Navbar النظيف والمطور (متوسط تماماً مع تمركز الروابط والبرقر للموبايل) ---------- */}

      <motion.nav 
        variants={{
          visible: { y: 0 },
          hidden: { y: "-120%" }
        }}
        animate={hidden ? "hidden" : "visible"}
        transition={{ duration: 0.35, ease: "easeInOut" }}
        className="fixed top-3 sm:top-4 left-0 right-0 z-50 mx-auto w-[94%] max-w-7xl flex items-center justify-between gap-4 px-3 sm:px-5 py-2.5 sm:py-3 bg-[#07101f]/80 backdrop-blur-2xl border border-white/[0.09] rounded-[1.4rem] sm:rounded-full shadow-[0_18px_60px_rgba(0,0,0,0.42)]"
      >

        {/* Brand */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative h-10 w-10 shrink-0 rounded-2xl bg-gradient-to-br from-cyan-300 via-sky-500 to-blue-700 p-[1px] shadow-[0_0_30px_rgba(56,189,248,.18)]">
            <div className="h-full w-full rounded-[0.9rem] bg-[#07101f] flex items-center justify-center font-mono font-bold text-[10px] tracking-tight text-white">
              BSIE
            </div>
          </div>
          <div className="hidden sm:block min-w-0">
            <span className="block text-[10px] font-mono font-bold tracking-[0.22em] text-cyan-300">
              INFORMATICS ENGINEERING

            </span>
          </div>
        </div>

{/* Quick Links for Desktop */}
<div className="hidden md:flex items-center gap-8 font-mono text-xs text-slate-300 absolute left-1/2 -translate-x-1/2">
  <button onClick={() => scrollToSection('clubs-section')} className="hover:text-sky-400 transition">Clubs</button>
  <button onClick={() => scrollToSection('event-section')} className="hover:text-sky-400 transition">Event</button>
  
  {/* هنا سنضيف رابط صفحة المجتمع الجديد */}
  <Link href="/community" className="hover:text-sky-400 transition font-bold text-sky-300">
    Community
  </Link>

  <button onClick={() => scrollToSection('career-section')} className="hover:text-sky-400 transition">Study Plan</button>
  <button onClick={() => scrollToSection('faq-contact-section')} className="hover:text-sky-400 transition">FAQ</button>
</div>

        {/* Burger Menu Button for Mobile */}
        <div className="flex items-center">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden h-10 w-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white transition hover:scale-105 hover:border-sky-400 shadow-md"
            aria-label="Toggle Menu"
          >
            {isMenuOpen ? '✕' : '☰'}
          </button>
        </div>

      </motion.nav>


      {/* ---------- Compact Dark Theme Dropdown Menu للموبايل فقط ---------- */}

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{
              opacity: 0,
              y: -10,
              scale: 0.95,
            }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
            }}
            exit={{
              opacity: 0,
              y: -10,
              scale: 0.95,
            }}
            transition={{
              duration: 0.2,
              ease: 'easeInOut',
            }}
            className="fixed top-20 right-[3%] z-50 w-[min(92vw,360px)] bg-[#07101f]/96 backdrop-blur-2xl border border-white/[0.1] rounded-[1.75rem] p-4 shadow-[0_30px_90px_rgba(0,0,0,.6)] flex flex-col gap-3 md:hidden"
          >

            <div className="flex flex-col gap-2">

              <button
                onClick={() => scrollToSection('clubs-section')}
                className="text-left text-sm font-mono tracking-wide text-slate-300 hover:text-sky-400 transition py-2 px-3 rounded-xl hover:bg-white/[0.04]"
              >
                Clubs & Academies
              </button>

              <button
                onClick={() => scrollToSection('event-section')}
                className="text-left text-sm font-mono tracking-wide text-slate-300 hover:text-sky-400 transition py-2 px-3 rounded-xl hover:bg-white/[0.04]"
              >
                Event
              </button>

              <Link
                href="/community"
                onClick={() => setIsMenuOpen(false)}
                className="text-left text-sm font-mono tracking-wide text-cyan-300 bg-cyan-400/[0.06] hover:bg-cyan-400/[0.10] transition py-3 px-3 rounded-xl"
              >
                Community
              </Link>
              <button
                onClick={() => scrollToSection('career-section')}
                className="text-left text-sm font-mono tracking-wide text-slate-300 hover:text-sky-400 transition py-2 px-3 rounded-xl hover:bg-white/[0.04]"
              >
                Study Plan
              </button>

              <button
                onClick={() => scrollToSection('faq-contact-section')}
                className="text-left text-sm font-mono tracking-wide text-slate-300 hover:text-sky-400 transition py-2 px-3 rounded-xl hover:bg-white/[0.04]"
              >
                FAQ & Contact
              </button>

            </div>

            <div className="pt-3 border-t border-white/[0.08] flex items-center justify-between">

              <span className="text-xs font-mono text-slate-500">
                Social
              </span>

              <Link
                href="#"
                onClick={() => setIsMenuOpen(false)}
                className="h-9 w-9 rounded-full border border-white/10 flex items-center justify-center text-xs font-mono text-slate-300 hover:border-sky-400 hover:text-sky-400 transition"
              >
                IG
              </Link>

            </div>

          </motion.div>
        )}
      </AnimatePresence>


      {/* ---------- HERO — UTB / FUTURE OF INFORMATICS ---------- */}
      <section
        className="
          relative
          min-h-[100svh]
          lg:min-h-screen
          overflow-hidden
          px-4
          sm:px-[5%]
          pt-28
          pb-10
          sm:pt-32
          sm:pb-14
          lg:pt-32
          lg:pb-16
          flex
          items-center
          z-10
        "
      >
        {/* 3D scene */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <Suspense fallback={<Hero3DFallback />}>
            <Hero3D />
          </Suspense>
        </div>

        {/* Readability layers */}
        <div className="absolute inset-0 z-0 pointer-events-none bg-[radial-gradient(circle_at_70%_44%,transparent_0,transparent_28%,rgba(5,11,24,.25)_58%,rgba(5,11,24,.82)_100%)]" />
        <div className="absolute inset-0 z-0 pointer-events-none lg:bg-gradient-to-r lg:from-[#050b18]/96 lg:via-[#050b18]/62 lg:to-transparent" />
        <div className="absolute inset-0 z-0 pointer-events-none bg-gradient-to-b from-[#050b18]/35 via-transparent to-[#050b18]/84 lg:from-transparent lg:to-[#050b18]/35" />

        <div
          className="
            relative z-10
            max-w-7xl mx-auto w-full
            grid grid-cols-1 lg:grid-cols-12
            gap-8 lg:gap-0
            items-center
          "
        >
          {/* Left: message + actions */}
          <motion.div
            initial={{ opacity: 0, y: 34 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="
              lg:col-span-7
              max-w-3xl
              text-left
              flex flex-col justify-center
              pt-2
            "
          >
            {/* Eyebrow */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.15 }}
              className="inline-flex w-fit items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/[0.06] px-3.5 py-2 backdrop-blur-md"
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-300 opacity-70" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-300" />
              </span>
              <span className="font-mono text-[10px] sm:text-xs uppercase tracking-[0.20em] text-cyan-200">
                UTB / INFORMATICS ENGINEERING
              </span>
            </motion.div>

            {/* Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.85, delay: 0.22, ease: [0.22, 1, 0.36, 1] }}
              className="
                mt-6
                max-w-[900px]
                font-bold
                tracking-[-0.055em]
                text-white
                text-[3.2rem]
                sm:text-[4.8rem]
                md:text-[5.5rem]
                lg:text-[6.5rem]
                xl:text-[7.1rem]
                leading-[0.86]
              "
            >
              <span className="block text-white">INFORMATICS </span>
              <span className="block bg-gradient-to-r from-white via-cyan-300 to-blue-500 bg-clip-text text-transparent">
                ENGINEERING.
              </span>
            </motion.h1>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.42 }}
              className="mt-6 max-w-xl"
            >
              <p className="text-sm sm:text-base lg:text-lg leading-relaxed text-slate-300/95">
                BUILD .. CONNECT .. INNOVATE
              </p>
            </motion.div>

            {/* CTA row */}
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.56 }}
              className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3"
            >
              <Link
                href="/curriculum"
                className="
                  group relative overflow-hidden
                  inline-flex items-center justify-center gap-2
                  min-h-12 rounded-xl
                  bg-white px-6 sm:px-7
                  font-mono text-sm font-semibold text-slate-950
                  transition-all duration-300
                  hover:-translate-y-1
                  hover:shadow-[0_16px_46px_rgba(255,255,255,.12)]
                "
              >
                <span className="relative z-10">Explore Study Plan</span>
                <span className="relative z-10 transition-transform duration-300 group-hover:translate-x-1">→</span>
                <span className="absolute inset-0 -translate-x-full bg-cyan-300/40 transition-transform duration-500 group-hover:translate-x-full" />
              </Link>

              <button
                onClick={() => setIsAdvisorOpen(true)}
                className="
                  group relative overflow-hidden
                  inline-flex items-center justify-center gap-2
                  min-h-12 rounded-xl
                  border border-cyan-300/20
                  bg-[#07101f]/76 px-6 sm:px-7
                  font-mono text-sm text-slate-100
                  backdrop-blur-xl
                  transition-all duration-300
                  hover:-translate-y-1 hover:border-cyan-300/50
                "
              >
                <span className="text-base">✦</span>
                <span>Ask AI Advisor</span>
                <span className="text-cyan-300 transition-transform duration-300 group-hover:translate-x-1">→</span>
              </button>
            </motion.div>



            {/* Tech partner ticker */}
            <motion.section
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.9 }}
              className="mt-8 w-full overflow-hidden rounded-2xl border border-white/[0.08] bg-[#07101f]/58 backdrop-blur-xl"
            >
              <div className="flex items-center min-h-16 sm:min-h-20">
                <div className="shrink-0 border-r border-white/[0.08] px-3 sm:px-5">
                  <div className="text-[9px] sm:text-[10px] font-mono font-bold tracking-[0.16em] text-white">TECH PARTNERS</div>
                  <div className="mt-1 text-[9px] font-mono text-cyan-300">CERTIFIED</div>
                </div>

                <div className="relative flex-1 overflow-hidden">
                  <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-gradient-to-r from-[#07101f] to-transparent" />
                  <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l from-[#07101f] to-transparent" />

                  <div className="flex w-max items-center gap-12 sm:gap-20 px-8" style={{ animation: 'techPartnersMove 18s linear infinite' }}>
                    {[1, 2].map((copy) => (
                      <div key={copy} className="flex items-center gap-12 sm:gap-20">
                        <img src="/iotLogo.png" alt="IoT" className="h-6 sm:h-7 w-auto object-contain opacity-80" />
                        <img src="/Huawei-Logo.png" alt="Huawei" className="h-5 sm:h-6 w-auto object-contain opacity-80" />
                        <img src="/cisco.png" alt="Cisco" className="h-5 sm:h-6 w-auto object-contain opacity-80" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </motion.section>
          </motion.div>

          {/* Right visual space — the Hero3D component owns this area */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.15, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="
              lg:col-span-5
              min-h-[340px]
              sm:min-h-[420px]
              lg:min-h-[650px]
              relative
              flex items-center justify-center
              pointer-events-none
            "
          >
            {/* small composition labels around the Robot */}
            <div className="absolute right-[6%] top-[14%] hidden lg:flex flex-col items-end gap-2">
              <span className="rounded-full border border-cyan-300/15 bg-cyan-300/[0.05] px-3 py-1.5 text-[9px] font-mono uppercase tracking-[0.18em] text-cyan-200">
                SMART CAMPUS
              </span>
              <span className="text-[9px] font-mono uppercase tracking-[0.18em] text-slate-600">
                IoT / AI / NETWORK
              </span>
            </div>

            <div className="absolute left-[6%] bottom-[16%] hidden lg:block">
              <div className="rounded-2xl border border-white/[0.08] bg-[#07101f]/55 px-4 py-3 backdrop-blur-lg">
                <span className="block text-[9px] font-mono uppercase tracking-[0.18em] text-slate-600">SYSTEM</span>
                <span className="mt-1 block text-[11px] font-mono text-emerald-300">CONNECTED / READY</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Scroll cue */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.15 }}
          className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 hidden sm:flex items-center gap-3"
        >
          <span className="text-[9px] font-mono uppercase tracking-[0.22em] text-slate-500">SCROLL TO EXPLORE</span>
          <span className="h-7 w-px bg-gradient-to-b from-cyan-300/70 to-transparent" />
        </motion.div>
      </section>

      {/* ---------- Animated BSIE Academics & Partnerships ---------- */}

      {}
      <section
        ref={bsieSectionRef}
        className="relative overflow-hidden border-t border-white/[0.08] bg-[#07101c] px-4 sm:px-[5%] py-20 sm:py-28 flex items-center justify-center"
      >

        <div className="relative max-w-6xl w-full grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-8 lg:gap-12 items-center z-10">

          <motion.div
            style={{
              x: leftCardsX,
              opacity: cardsOpacity,
            }}
            className="flex flex-col gap-5 items-start lg:items-end justify-center"
          >

            <div className="flex items-center gap-2 bg-[#0d1527] border border-white/[0.06] rounded-full px-5 py-2.5 shadow-xl transition-all duration-300 hover:border-orange-500/30">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-orange-500/20 text-orange-400 text-xs">
                🛠️
              </span>

              <span className="text-xs font-mono tracking-wide text-slate-300">
                Application support specialist
              </span>
            </div>

            <div className="flex items-center gap-2 bg-[#0d1527] border border-white/[0.06] rounded-full px-5 py-2.5 shadow-xl transition-all duration-300 hover:border-sky-500/30">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-sky-500/20 text-sky-400 text-xs">
                📱
              </span>

              <span className="text-xs font-mono tracking-wide text-slate-300">
                UI / UX Specialist
              </span>
            </div>

            <div className="flex items-center gap-2 bg-[#0d1527] border border-white/[0.06] rounded-full px-5 py-2.5 shadow-xl transition-all duration-300 hover:border-sky-400/30">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-sky-400/20 text-sky-400 text-xs">
                🔒
              </span>

              <span className="text-xs font-mono tracking-wide text-slate-300">
                Cybersecurity analyst
              </span>
            </div>

          </motion.div>


          <div className="text-center flex flex-col justify-center items-center px-4">

            <span className="text-xs font-mono font-semibold tracking-[0.35em] text-orange-400 block mb-5">
              BSIE
            </span>

            <h2 className="text-2xl sm:text-3xl font-medium text-white leading-relaxed max-w-lg tracking-tight">
              Preparing the next generation of ICT professionals — through rigorous academics,
              industry partnerships, and hands-on learning with{' '}
              <span className="font-semibold bg-gradient-to-r from-sky-400 to-blue-500 bg-clip-text text-transparent">
                Cisco
              </span>{' '}
              and{' '}
              <span className="font-semibold text-slate-400">
                Huawei
              </span>.
            </h2>

          </div>


          <motion.div
            style={{
              x: rightCardsX,
              opacity: cardsOpacity,
            }}
            className="flex flex-col gap-5 items-start justify-center"
          >

            <div className="flex items-center gap-2 bg-[#0d1527] border border-white/[0.06] rounded-full px-5 py-2.5 shadow-xl transition-all duration-300 hover:border-emerald-500/30">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 text-xs">
                ⚡
              </span>

              <span className="text-xs font-mono tracking-wide text-slate-300">
                IOT Solutions Architect
              </span>
            </div>

            <div className="flex items-center gap-2 bg-[#0d1527] border border-white/[0.06] rounded-full px-5 py-2.5 shadow-xl transition-all duration-300 hover:border-pink-500/30">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-pink-500/20 text-pink-400 text-xs">
                💻
              </span>

              <span className="text-xs font-mono tracking-wide text-slate-300">
                Software engineer
              </span>
            </div>

            <div className="flex items-center gap-2 bg-[#0d1527] border border-white/[0.06] rounded-full px-5 py-2.5 shadow-xl transition-all duration-300 hover:border-yellow-500/30">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-yellow-500/20 text-yellow-400 text-xs">
                🌐
              </span>

              <span className="text-xs font-mono tracking-wide text-slate-300">
                Network engineer
              </span>
            </div>

          </motion.div>

        </div>

      </section>


      {/* ---------- Clubs & Academies Hub (مع id للربط) ---------- */}

      {}
<section
  id="clubs-section"
  ref={clubsSectionRef}
  className="border-t border-white/[0.08] px-[5%] py-32 bg-[#050b18] relative overflow-hidden"
>

  <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
    <p className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-sky-400">
      Student Communities
    </p>

    <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white">
      Clubs & Academies Hub
    </h2>
  </div>



        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 max-w-6xl mx-auto items-stretch">

          {/* Card 1: IoT Club */}

          <motion.div
            style={{
              x: card1X,
              scale: cardsScale,
              opacity: cardsOpacityScroll,
            }}
            whileHover={{
              y: -8,
              rotate: -1,
            }}
            className="group relative rounded-[2rem] border border-white/[0.08] bg-[#091224] p-8 flex flex-col justify-between transition-all duration-300 hover:border-emerald-400/50 group-hover:shadow-[0_0_30px_rgba(33,230,160,0.15)] z-10"
          >

            <div>

              <div className="flex items-center justify-between mb-8">

                <span className="text-4xl font-mono font-bold text-white/20 group-hover:text-white/40 transition-colors">
                  01
                </span>

                <span className="text-xs font-mono px-3 py-1 rounded-full border border-white/10 bg-white/[0.02] text-emerald-400">
                  IoT
                </span>

              </div>

              <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-sky-300 transition-colors">
                IoT Club
              </h3>

              <p className="text-sm leading-relaxed text-slate-400 mb-8">
                Connect, build, and innovate with the Internet of Things. Build connected devices and smart systems from Arduino to cloud integration.
              </p>

            </div>

            <Link
              href="#"
              className="inline-flex items-center gap-2 font-mono text-xs font-semibold text-slate-300 group-hover:text-white transition-colors pt-4 border-t border-white/[0.06]"
            >
              <span>Explore Hub</span>
              <span className="transform group-hover:translate-x-1 transition-transform">
                →
              </span>
            </Link>

          </motion.div>


          {/* Card 2: Huawei Academy */}

          <motion.div
            style={{
              scale: cardsScale,
              opacity: cardsOpacityScroll,
            }}
            whileHover={{
              y: -8,
            }}
            className="group relative rounded-[2rem] border border-white/[0.08] bg-[#091224] p-8 flex flex-col justify-between transition-all duration-300 hover:border-red-400/50 group-hover:shadow-[0_0_30px_rgba(239,68,68,0.15)] z-20"
          >

            <div>

              <div className="flex items-center justify-between mb-8">

                <span className="text-4xl font-mono font-bold text-white/20 group-hover:text-white/40 transition-colors">
                  02
                </span>

                <span className="text-xs font-mono px-3 py-1 rounded-full border border-white/10 bg-white/[0.02] text-red-400">
                  Huawei
                </span>

              </div>

              <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-sky-300 transition-colors">
                Huawei Academy
              </h3>

              <p className="text-sm leading-relaxed text-slate-400 mb-8">
                Official Huawei ICT Academy. Globally recognized ICT certifications at UTB covering HCIA and HCIP in networking, cloud, and AI.
              </p>

            </div>

            <Link
              href="/huawei"
              className="inline-flex items-center gap-2 font-mono text-xs font-semibold text-slate-300 group-hover:text-white transition-colors pt-4 border-t border-white/[0.06]"
            >
              <span>Explore Hub</span>

              <span className="transform group-hover:translate-x-1 transition-transform">
                →
              </span>
            </Link>

          </motion.div>


          {/* Card 3: Cisco Academy */}

          <motion.div
            style={{
              x: card3X,
              scale: cardsScale,
              opacity: cardsOpacityScroll,
            }}
            whileHover={{
              y: -8,
              rotate: 1,
            }}
            className="group relative rounded-[2rem] border border-white/[0.08] bg-[#091224] p-8 flex flex-col justify-between transition-all duration-300 hover:border-sky-400/50 group-hover:shadow-[0_0_30px_rgba(54,163,255,0.15)] z-10"
          >

            <div>

              <div className="flex items-center justify-between mb-8">

                <span className="text-4xl font-mono font-bold text-white/20 group-hover:text-white/40 transition-colors">
                  03
                </span>

                <span className="text-xs font-mono px-3 py-1 rounded-full border border-white/10 bg-white/[0.02] text-sky-400">
                  Cisco
                </span>

              </div>

              <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-sky-300 transition-colors">
                Cisco Academy
              </h3>

              <p className="text-sm leading-relaxed text-slate-400 mb-8">
                Official Cisco Networking Academy. World-class networking and cybersecurity education including CCNA, CyberOps, and DevNet.
              </p>

            </div>

            <Link
              href="#"
              className="inline-flex items-center gap-2 font-mono text-xs font-semibold text-slate-300 group-hover:text-white transition-colors pt-4 border-t border-white/[0.06]"
            >
              <span>Explore Hub</span>

              <span className="transform group-hover:translate-x-1 transition-transform">
                →
              </span>
            </Link>

          </motion.div>

        </div>

      </section>


{/* ---------- Student Achievements ---------- */}
      <section
        id="career-section"
        ref={careerSectionRef}
        className="relative overflow-hidden border-t border-white/[0.08] bg-[#050b18] px-4 py-24 sm:px-[5%] sm:py-28"
      >
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto mb-12 max-w-3xl text-center sm:mb-16">
            <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.24em] text-cyan-300">
              Student Achievements
            </p>
            <h2 className="text-4xl font-bold tracking-[-0.035em] text-white sm:text-5xl lg:text-6xl">
              Student Spotlight
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-slate-400 sm:text-base">
              A snapshot of academic excellence, technical impact, certifications, and student leadership.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {[
              {
                name: 'Ahmed Ali',
                role: 'Academic Excellence',
                type: 'Academic',
                image: '/student-1.jpg',
                value: '3.92',
                progress: 98,
                description: 'Highest academic performance in Informatics Engineering.',
                color: 'sky',
                achievements: ['Highest GPA', 'Academic Excellence Award', 'Outstanding Student'],
              },
              {
                name: 'Sara Mohammed',
                role: 'Project Excellence',
                type: 'Technical',
                image: '/student-2.jpg',
                value: '12',
                progress: 91,
                description: 'Outstanding contribution through software and AI projects.',
                color: 'violet',
                achievements: ['12 Projects', 'AI Research Project', 'Innovation Award'],
              },
              {
                name: 'Omar Hassan',
                role: 'Huawei Student Ambassador',
                type: 'Leadership',
                image: '/student-3.jpg',
                value: 'HCIA',
                progress: 87,
                description: 'Active student ambassador representing Huawei ICT Academy.',
                color: 'red',
                achievements: ['Huawei Ambassador', 'HCIA Certified', 'ICT Academy Leader'],
              },
              {
                name: 'Mariam Khalid',
                role: 'IoT Student Ambassador',
                type: 'Innovation',
                image: '/student-4.jpg',
                value: '8',
                progress: 84,
                description: 'Leading student initiatives and projects in IoT technologies.',
                color: 'emerald',
                achievements: ['IoT Ambassador', '8 IoT Projects', 'Innovation Team'],
              },
            ].map((student) => (
              <StudentAchievementCard key={student.name} student={student} />
            ))}
          </div>

          <p className="mt-6 text-center text-[9px] font-mono uppercase tracking-[0.18em] text-slate-600">
            Desktop: hover a student · Mobile: tap a student
          </p>
        </div>
      </section>

      {/* ---------- Activity Gallery / Event (مع id للربط) ---------- */}

      {}
      <div id="event-section">
        <ActivityGallery />
      </div>


      {/* ---------- FAQ / Contact Section & Footer (مع id للربط) ---------- */}

      {}
      <section id="faq-contact-section" className="border-t border-white/[0.08] bg-[#050b18] px-4 sm:px-[5%] pt-20 sm:pt-28 pb-10 sm:pb-12 relative overflow-hidden">
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto text-center mb-16 relative z-10"
        >
          <p className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-sky-400">
            FAQ
          </p>
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white">
            Academic & Program Guidance
          </h2>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 40, scale: 0.96 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="max-w-4xl mx-auto rounded-[2.5rem] bg-[#091224] border border-white/[0.08] p-8 sm:p-12 shadow-2xl relative z-10 overflow-hidden mb-12"
        >
          <div className="flex flex-col md:flex-row items-center gap-8 mb-10">
            {/* Doctor Photo */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="w-40 h-40 sm:w-48 sm:h-48 rounded-2xl overflow-hidden border border-white/10 shrink-0 bg-[#121c30]"
            >
              <img 
                src="/dr-hani.jpg" 
                alt="Dr. Hani Al-Balasmeh" 
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </motion.div>

            {/* Doctor Info */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-center md:text-left"
            >
              <h3 className="text-2xl sm:text-3xl font-bold text-white mb-3">
                Dr. Hani Al-Balasmeh
              </h3>
              <p className="text-lg sm:text-xl font-medium text-sky-400 leading-relaxed">
                Programme Head of Informatics Engineering at the University of Technology Bahrain (UTB)
              </p>
            </motion.div>
          </div>

          {/* Action Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Link
              href="#"
              className="flex items-center justify-between w-full rounded-full bg-[#131f38] border border-white/15 px-8 py-5 text-white transition-all duration-300 hover:border-sky-400 group shadow-xl hover:bg-[#192745]"
            >
              <span className="font-mono text-sm tracking-wider text-slate-300 group-hover:text-white transition">
                Have more questions?
              </span>
              <span className="text-sky-400 transform group-hover:translate-x-1 transition-transform">
                →
              </span>
            </Link>
          </motion.div>
        </motion.div>

        {/* Footer Content */}
        <div className="relative z-10 max-w-6xl mx-auto pt-8 border-t border-white/[0.06] flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-sky-400 font-semibold">
              University of Technology Bahrain (UTB)
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Bachelor of Engineering in Informatics Engineering (BSIE)
            </p>
            <p className="mt-2 text-sm font-semibold text-white">
              © 2026 WALAA SALAH, BSIE
            </p>
          </div>

          <div className="text-center">
            <p className="font-serif text-sm italic text-slate-500">
              BSIE
            </p>
          </div>

          <div className="flex items-center justify-start sm:justify-end">
            <Link
              href="#"
              aria-label="Instagram"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-slate-400 transition hover:border-sky-400 hover:text-sky-400 hover:scale-105"
            >
              <span className="text-sm">
                ◎
              </span>
            </Link>
          </div>
        </div>

      </section>

      {/* ---------- AI Advisor Modal Overlay ---------- */}
      <AnimatePresence>
        {isAdvisorOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-md bg-[#0a0e14] border border-white/10 rounded-2xl p-6 shadow-2xl"
            >
              <button
                onClick={() => setIsAdvisorOpen(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white font-mono text-sm z-10"
              >
                ✕
              </button>
              <AiAdvisor
                passedCodes={passedCodes}
                totalPassedCredits={totalPassedCredits}
                courses={courses}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>


      {/* CSS Styles for Blur Sharp Reveal Animation */}

      <style jsx global>{`
        html {
          scroll-behavior: smooth;
        }

        button,
        a {
          -webkit-tap-highlight-color: transparent;
        }

        @media (prefers-reduced-motion: reduce) {
          html {
            scroll-behavior: auto;
          }

          .blursharp-card,
          .blursharp-card.active {
            transition: none !important;
          }
        }

        @keyframes techPartnersMove {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }

        .blursharp-card {
          opacity: 0.2;
          filter: blur(14px);
          transform: scale(0.96) translateY(40px);

          transition:
            opacity 0.75s ease,
            filter 0.75s ease,
            transform 0.75s cubic-bezier(.22,.61,.36,1);

          will-change: opacity, filter, transform;
        }

        .blursharp-card.active {
          opacity: 1;
          filter: blur(0);
          transform: scale(1) translateY(0);
        }

      `}</style>

    </main>
  );
}