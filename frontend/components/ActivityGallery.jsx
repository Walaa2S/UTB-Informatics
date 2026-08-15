'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Folder,
  ChevronLeft,
  ChevronRight,
  ArrowUpRight,
  CalendarDays,
} from 'lucide-react';
import Link from 'next/link';

const GALLERY_IMAGES = [
  {
    id: 'side-visit',
    src: '/Sidevisit.JPG',
    alt: 'Side visit',
    title: 'Side visit',
    tag: 'SIDE VISIT',
    date: '15 July 2025',
  },
  {
    id: 'workshop-computer',
    src: '/workshop-Introduction.jpg',
    alt: 'Workshop - Introduction to Computer Services A+',
    title: 'Workshop - Introduction to Computer Services A+',
    tag: 'WORKSHOP',
    date: '2 August 2025',
  },
  {
    id: 'sumo-competition',
    src: '/SumoXCompetition.jpg',
    alt: 'Sumo X Competition',
    title: 'Sumo X Competition',
    tag: 'COMPETITION',
    date: '14 July 2025',
  },
  {
    id: 'portfolio-website',
    title: 'Build Your First Portfolio Website Workshop & Competition',
    src: '/Por1tfolioWorkshop.jpg',
    alt: 'Build Your First Portfolio Website Workshop & Competition',
    tag: 'PORTFOLIO',
    date: '23 & 30 June',
  },
];

export default function ActivityGallery() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  const total = GALLERY_IMAGES.length;

  const goTo = (index) => {
    setDirection(index > activeIndex ? 1 : -1);

    if (index < 0) {
      setActiveIndex(total - 1);
    } else if (index >= total) {
      setActiveIndex(0);
    } else {
      setActiveIndex(index);
    }
  };

  const next = () => {
    setDirection(1);
    setActiveIndex((prev) => (prev + 1) % total);
  };

  const previous = () => {
    setDirection(-1);
    setActiveIndex((prev) => (prev - 1 + total) % total);
  };

  const activeItem = GALLERY_IMAGES[activeIndex];

  return (
    <section
      id="event-gallery"
      className="
        relative
        w-full
        overflow-hidden
        border-t border-white/[0.08]
        bg-[#05070a]
        px-4
        py-24
        sm:px-[5%]
        sm:py-28
      "
    >
      {/* Ambient background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-0 h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-sky-500/[0.04] blur-[120px]" />
        <div className="absolute bottom-0 right-0 h-[350px] w-[350px] rounded-full bg-blue-600/[0.035] blur-[100px]" />
      </div>

      <div className="relative mx-auto w-full max-w-7xl">

        {/* ------------------------------------------------ */}
        {/* HEADER */}
        {/* ------------------------------------------------ */}

        <div className="mb-12 flex flex-col items-center text-center">

          <div className="mb-5 flex items-center gap-3">
            <span className="h-px w-8 bg-sky-400/50" />

            <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-sky-400">
              Student Communities / 03
            </p>

            <span className="h-px w-8 bg-sky-400/50" />
          </div>

          <h2 className="max-w-3xl text-3xl font-semibold tracking-[-0.025em] text-[#e9edf3] sm:text-4xl lg:text-5xl">
            Recent Activities & Events
          </h2>

          <p className="mt-4 max-w-xl text-sm leading-relaxed text-slate-500">
            Explore workshops, competitions, visits, and student activities.
          </p>

        </div>

        {/* ------------------------------------------------ */}
        {/* MAIN CAROUSEL */}
        {/* ------------------------------------------------ */}

        <div className="relative">

          {/* Desktop side preview */}
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 hidden w-[16%] bg-gradient-to-r from-[#05070a] to-transparent lg:block" />

          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 hidden w-[16%] bg-gradient-to-l from-[#05070a] to-transparent lg:block" />

          {/* Slider */}
          <div className="mx-auto max-w-5xl overflow-hidden rounded-[2rem]">

            <AnimatePresence
              initial={false}
              custom={direction}
              mode="wait"
            >
              <motion.div
                key={activeItem.id}
                custom={direction}
                initial={{
                  opacity: 0,
                  x: direction > 0 ? 60 : -60,
                }}
                animate={{
                  opacity: 1,
                  x: 0,
                }}
                exit={{
                  opacity: 0,
                  x: direction > 0 ? -60 : 60,
                }}
                transition={{
                  duration: 0.35,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="group"
              >

                <Link
                  href={`/events/${activeItem.id}`}
                  className="block"
                >

                  <div
                    className="
                      relative
                      overflow-hidden
                      rounded-[2rem]
                      border border-white/[0.09]
                      bg-[#090d15]
                      shadow-[0_30px_100px_rgba(0,0,0,.35)]
                    "
                  >

                    {/* Image */}
                    <div
                      className="
                        relative
                        aspect-[16/9]
                        overflow-hidden
                        sm:aspect-[2/1]
                        lg:aspect-[2.15/1]
                      "
                    >

                      <img
                        src={activeItem.src}
                        alt={activeItem.alt || activeItem.title}
                        className="
                          h-full
                          w-full
                          object-cover
                          transition-transform
                          duration-700
                          ease-out
                          group-hover:scale-[1.035]
                        "
                      />

                      {/* Image overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/15 to-transparent" />

                      {/* Top metadata */}
                      <div className="absolute left-4 right-4 top-4 flex items-center justify-between sm:left-6 sm:right-6 sm:top-6">

                        <span
                          className="
                            rounded-full
                            border border-white/15
                            bg-black/40
                            px-3
                            py-1.5
                            font-mono
                            text-[9px]
                            tracking-[0.18em]
                            text-white
                            backdrop-blur-md
                          "
                        >
                          {activeItem.tag}
                        </span>

                        <span
                          className="
                            flex
                            h-9
                            w-9
                            items-center
                            justify-center
                            rounded-full
                            border border-white/15
                            bg-black/35
                            text-white
                            backdrop-blur-md
                            transition-all
                            duration-300
                            group-hover:border-sky-400/60
                            group-hover:bg-sky-400
                            group-hover:text-slate-950
                          "
                        >
                          <ArrowUpRight className="h-4 w-4" />
                        </span>

                      </div>

                      {/* Bottom information */}
                      <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-7 lg:p-8">

                        <div className="flex items-end justify-between gap-6">

                          <div className="min-w-0">

                            <div className="mb-3 flex items-center gap-2 text-[10px] font-mono uppercase tracking-wider text-sky-300/80">
                              <CalendarDays className="h-3.5 w-3.5" />
                              <span>{activeItem.date}</span>
                            </div>

                            <h3
                              className="
                                max-w-3xl
                                text-xl
                                font-semibold
                                leading-tight
                                tracking-tight
                                text-white
                                sm:text-2xl
                                lg:text-3xl
                              "
                            >
                              {activeItem.title}
                            </h3>

                          </div>

                          {/* Counter */}
                          <div className="hidden shrink-0 text-right sm:block">
                            <span className="font-mono text-[10px] text-slate-500">
                              ACTIVITY
                            </span>

                            <div className="mt-1 font-mono text-sm text-white">
                              {String(activeIndex + 1).padStart(2, '0')}
                              <span className="mx-1 text-slate-600">/</span>
                              {String(total).padStart(2, '0')}
                            </div>
                          </div>

                        </div>

                      </div>

                    </div>

                  </div>

                </Link>

              </motion.div>
            </AnimatePresence>

          </div>

          {/* ------------------------------------------------ */}
          {/* CONTROLS */}
          {/* ------------------------------------------------ */}

          <div className="mt-7 flex items-center justify-between gap-4">

            {/* Previous */}
            <button
              type="button"
              onClick={previous}
              aria-label="Previous activity"
              className="
                flex
                h-11
                w-11
                shrink-0
                items-center
                justify-center
                rounded-full
                border border-white/10
                bg-white/[0.03]
                text-slate-300
                transition-all
                duration-300
                hover:border-sky-400/50
                hover:bg-sky-400
                hover:text-slate-950
                active:scale-95
              "
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            {/* Dots */}
            <div className="flex flex-1 items-center justify-center gap-2">

              {GALLERY_IMAGES.map((item, index) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => goTo(index)}
                  aria-label={`Go to activity ${index + 1}`}
                  className="
                    group
                    flex
                    h-6
                    items-center
                    justify-center
                  "
                >
                  <span
                    className={`
                      block
                      h-1
                      rounded-full
                      transition-all
                      duration-300
                      ${
                        activeIndex === index
                          ? 'w-8 bg-sky-400'
                          : 'w-2 bg-white/20 group-hover:bg-white/40'
                      }
                    `}
                  />
                </button>
              ))}

            </div>

            {/* Next */}
            <button
              type="button"
              onClick={next}
              aria-label="Next activity"
              className="
                flex
                h-11
                w-11
                shrink-0
                items-center
                justify-center
                rounded-full
                border border-white/10
                bg-white/[0.03]
                text-slate-300
                transition-all
                duration-300
                hover:border-sky-400/50
                hover:bg-sky-400
                hover:text-slate-950
                active:scale-95
              "
            >
              <ChevronRight className="h-5 w-5" />
            </button>

          </div>

        </div>

        {/* ------------------------------------------------ */}
        {/* BOTTOM NAVIGATION */}
        {/* ------------------------------------------------ */}

        <div className="mt-10 flex items-center justify-center">

          <Link
            href="/events"
            className="
              group
              inline-flex
              min-h-11
              items-center
              justify-center
              gap-3
              rounded-full
              bg-white
              px-6
              font-mono
              text-[11px]
              font-semibold
              tracking-wide
              text-slate-950
              transition-all
              duration-300
              hover:-translate-y-0.5
              hover:bg-sky-400
              hover:shadow-[0_0_35px_rgba(56,189,248,0.25)]
            "
          >
            <Folder className="h-4 w-4" fill="currentColor" />
            All Events

            <span className="transition-transform duration-300 group-hover:translate-x-1">
              →
            </span>
          </Link>

        </div>

        {/* Mobile hint */}
        <p className="mt-6 text-center font-mono text-[9px] uppercase tracking-[0.2em] text-slate-600 sm:hidden">
          Use the arrows to explore
        </p>

      </div>
    </section>
  );
}