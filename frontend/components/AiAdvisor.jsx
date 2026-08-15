'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const GRADE_POINTS = {
  'A': 4.0, 'A-': 3.7,
  'B+': 3.3, 'B': 3.0, 'B-': 2.7,
  'C+': 2.3, 'C': 2.0,
  'D+': 1.5, 'D': 1.0,
  'F': 0.0
};

export default function AiAdvisor({ passedCodes, totalPassedCredits, courses }) {
  // جلب البيانات المخزنة مسبقاً من المتصفح إن وجدت
  const [step, setStep] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('utb_student_id') ? 2 : 1;
    }
    return 1;
  });

  const [studentId, setStudentId] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('utb_student_id') || 'BH';
    }
    return 'BH';
  });

  const [major, setMajor] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('utb_student_major') || '';
    }
    return '';
  });

  const [selectedAdvice, setSelectedAdvice] = useState(null);

  const [gpaCourses, setGpaCourses] = useState([{ credits: '3', grade: 'A' }]);
  const [calculatedGpa, setCalculatedGpa] = useState(null);

  const TOTAL_CREDITS = 204;

  const handleStudentIdChange = (e) => {
    let val = e.target.value.toUpperCase();
    if (!val.startsWith('BH')) {
      val = 'BH' + val.replace(/^BH*/, '');
    }
    setStudentId(val);
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (studentId.length <= 2 || !major) return;

    // حفظ البيانات في المتصفح لكي تتخزن
    if (typeof window !== 'undefined') {
      localStorage.setItem('utb_student_id', studentId);
      localStorage.setItem('utb_student_major', major);
    }

    setStep(2);
  };

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('utb_student_id');
      localStorage.removeItem('utb_student_major');
    }
    setStudentId('BH');
    setMajor('');
    setSelectedAdvice(null);
    setCalculatedGpa(null);
    setStep(1);
  };

  const percentage = Math.round((totalPassedCredits / TOTAL_CREDITS) * 100);

  const getAvailableCourses = () => {
    if (!courses) return [];
    return courses.filter((c) => {
      if (passedCodes.has(c.code)) return false;
      const prereqs = c.prerequisites || [];
      return prereqs.every((pCode) => passedCodes.has(pCode));
    });
  };

  const remainingCredits = TOTAL_CREDITS - totalPassedCredits;
  const estimatedTrimesters = Math.ceil(remainingCredits / 15);

  const handleAddGpaRow = () => {
    setGpaCourses([...gpaCourses, { credits: '3', grade: 'A' }]);
  };

  const handleGpaChange = (index, field, value) => {
    const updated = [...gpaCourses];
    updated[index][field] = value;
    setGpaCourses(updated);
  };

  const handleCalculateGpa = (e) => {
    e.preventDefault();
    let totalPoints = 0;
    let totalCreds = 0;

    gpaCourses.forEach((item) => {
      const creds = parseFloat(item.credits) || 0;
      const points = GRADE_POINTS[item.grade] ?? 0;
      totalPoints += creds * points;
      totalCreds += creds;
    });

    if (totalCreds === 0) {
      setCalculatedGpa(0);
      return;
    }

    const gpa = (totalPoints / totalCreds).toFixed(2);
    setCalculatedGpa(gpa);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95, y: 15 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 15 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="relative w-full max-w-lg rounded-[2rem] border border-white/10 bg-gradient-to-b from-[#0d131f] to-[#080c14] p-6 sm:p-8 font-mono text-slate-300 shadow-[0_0_50px_rgba(0,0,0,0.8)] backdrop-blur-2xl overflow-hidden"
    >
      {/* خلفية جمالية مضيئة ومتوهجة خفيفة */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 mb-6 flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-base shadow-inner">
            🤖
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide">Academic Advisor</h3>
            <p className="text-[10px] text-emerald-400/80">Autonomous Guidance System</p>
          </div>
        </div>
        <span className="rounded-full bg-white/5 border border-white/10 px-3 py-1 text-[10px] text-slate-400 tracking-wider">
          v2.0
        </span>
      </div>

      <AnimatePresence mode="wait">
        {step === 1 ? (
          <motion.form 
            key="step1"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            transition={{ duration: 0.25 }}
            onSubmit={handleLogin} 
            className="space-y-5 relative z-10"
          >
            <div>
              <p className="text-xs text-slate-300 font-medium mb-1">Let's personalize your experience</p>
              <p className="text-[11px] text-slate-500">Please enter your institutional credentials to get started.</p>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[11px] font-semibold text-slate-300">Student ID:</label>
              <input
                type="text"
                value={studentId}
                onChange={handleStudentIdChange}
                placeholder="BH2021000"
                className="w-full rounded-xl bg-white/[0.03] border border-white/10 px-4 py-3 text-xs text-slate-100 tracking-wider focus:border-emerald-400 focus:bg-white/[0.06] focus:outline-none transition-all shadow-inner"
                required
              />
              <span className="text-[10px] text-slate-500 block pl-1">Must start with university prefix (BH)</span>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[11px] font-semibold text-slate-300">Major / Program:</label>
              <select
                value={major}
                onChange={(e) => setMajor(e.target.value)}
                className="w-full rounded-xl bg-[#0a0e14] border border-white/10 px-4 py-3 text-xs text-slate-200 focus:border-emerald-400 focus:outline-none transition-all cursor-pointer shadow-inner"
                required
              >
                <option value="" disabled className="text-slate-500 bg-[#0a0e14]">Select your program...</option>
                
                <optgroup label="── College of Engineering ──" className="text-emerald-400 font-bold bg-[#0a0e14]">
                  <option value="BSIE" className="text-slate-200 bg-[#0a0e14]">Bachelor of Science in Informatics Engineering</option>
                  <option value="MECH" className="text-slate-200 bg-[#0a0e14]">Bachelor of Science in Mechatronics Engineering</option>
                  <option value="ENVE" className="text-slate-200 bg-[#0a0e14]">Bachelor of Science in Environmental Engineering</option>
                </optgroup>

                <optgroup label="── College of Computer Studies ──" className="text-sky-400 font-bold bg-[#0a0e14]">
                  <option value="BSIT" className="text-slate-200 bg-[#0a0e14]">Bachelor of Science in Information Technology</option>
                  <option value="BSCS" className="text-slate-200 bg-[#0a0e14]">Bachelor of Science in Computer Science</option>
                </optgroup>

                <optgroup label="── College of Administrative & Financial Sciences ──" className="text-amber-400 font-bold bg-[#0a0e14]">
                  <option value="BSAF" className="text-slate-200 bg-[#0a0e14]">BSc. in Accounting and Finance</option>
                  <option value="BSIB" className="text-slate-200 bg-[#0a0e14]">BSc. in International Business</option>
                  <option value="BSBI" className="text-slate-200 bg-[#0a0e14]">BSc. in Business Informatics</option>
                  <option value="MBA" className="text-slate-200 bg-[#0a0e14]">Master of Business Administration (MBA)</option>
                  <option value="MSDM" className="text-slate-200 bg-[#0a0e14]">MSc. in Digital Marketing</option>
                  <option value="MSLSC" className="text-slate-200 bg-[#0a0e14]">MSc. in Logistics & Supply Chain Management</option>
                  <option value="MSREMI" className="text-slate-200 bg-[#0a0e14]">MSc. in Real Estate Management & Investment</option>
                </optgroup>
              </select>
            </div>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 py-3 text-xs font-bold text-emerald-950 transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] mt-2"
            >
              Initialize Advisor Session →
            </motion.button>
          </motion.form>
        ) : (
          <motion.div 
            key="step2"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.25 }}
            className="space-y-4 relative z-10"
          >
            {/* Status Card */}
            <div className="rounded-2xl bg-white/[0.03] p-4 text-xs border border-white/10 shadow-inner">
              <div className="flex items-center justify-between mb-1">
                <span className="text-emerald-400 font-bold">Active Session</span>
                <span className="text-[10px] bg-emerald-500/10 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/20">{studentId}</span>
              </div>
              <p className="text-slate-400 text-[11px]">
                {major === 'BSIE' ? (
                  <>Completed <span className="text-slate-100 font-bold">{totalPassedCredits}</span> of {TOTAL_CREDITS} credits (<span className="text-emerald-400 font-bold">{percentage}%</span>)</>
                ) : (
                  <>Program: <span className="text-slate-100 font-bold">{major}</span> (General Student Mode)</>
                )}
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-[11px] font-semibold text-slate-400 pl-1">Available Guidance Options:</p>
              
              {major === 'BSIE' ? (
                <div className="grid gap-2">
                  <motion.button
                    whileHover={{ scale: 1.01, x: 2 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => setSelectedAdvice('available')}
                    className="w-full text-left rounded-xl bg-sky-500/10 border border-sky-500/30 px-4 py-3 text-xs text-sky-300 hover:bg-sky-500/20 transition flex items-center justify-between group shadow-sm"
                  >
                    <span className="flex items-center gap-2">✨ What courses are available to register?</span>
                    <span className="transform group-hover:translate-x-1 transition-transform">→</span>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.01, x: 2 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => setSelectedAdvice('graduation')}
                    className="w-full text-left rounded-xl bg-amber-500/10 border border-amber-500/30 px-4 py-3 text-xs text-amber-300 hover:bg-amber-500/20 transition flex items-center justify-between group shadow-sm"
                  >
                    <span className="flex items-center gap-2">🚀 What is remaining for graduation?</span>
                    <span className="transform group-hover:translate-x-1 transition-transform">→</span>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.01, x: 2 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => setSelectedAdvice('trimesters')}
                    className="w-full text-left rounded-xl bg-emerald-500/10 border border-emerald-500/30 px-4 py-3 text-xs text-emerald-300 hover:bg-emerald-500/20 transition flex items-center justify-between group shadow-sm"
                  >
                    <span className="flex items-center gap-2">⏳ Expected trimesters until graduation?</span>
                    <span className="transform group-hover:translate-x-1 transition-transform">→</span>
                  </motion.button>
                </div>
              ) : (
                <div className="rounded-xl bg-sky-500/10 border border-sky-500/20 p-3 text-xs text-sky-300 mb-1 leading-relaxed">
                  💡 Welcome! Since your major is outside BSIE, you can use our Quick GPA Calculator below to manage your semester performance effortlessly.
                </div>
              )}

              <motion.button
                whileHover={{ scale: 1.01, x: 2 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => setSelectedAdvice('gpaCalculator')}
                className="w-full text-left rounded-xl bg-purple-500/10 border border-purple-500/30 px-4 py-3 text-xs text-purple-300 hover:bg-purple-500/20 transition flex items-center justify-between group font-semibold shadow-sm"
              >
                <span className="flex items-center gap-2">📊 Quick GPA Calculator</span>
                <span className="transform group-hover:translate-x-1 transition-transform">→</span>
              </motion.button>
            </div>

            {/* Content Results Box */}
            <AnimatePresence>
              {selectedAdvice === 'available' && major === 'BSIE' && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="rounded-xl bg-black/50 p-3 text-xs border border-sky-500/30 max-h-36 overflow-y-auto space-y-1.5"
                >
                  <p className="text-sky-400 font-bold mb-1">Suggested Courses For Registration:</p>
                  {getAvailableCourses().length === 0 ? (
                    <p className="text-slate-500 text-[11px]">No courses available. Make sure to mark passed courses on the curriculum tree.</p>
                  ) : (
                    <ul className="list-disc list-inside space-y-1 text-slate-300 text-[11px]">
                      {getAvailableCourses().slice(0, 5).map((c) => (
                        <li key={c.code}>
                          <span className="text-sky-300 font-bold">{c.code}</span>: {c.title} ({c.credits} cr)
                        </li>
                      ))}
                    </ul>
                  )}
                </motion.div>
              )}

              {selectedAdvice === 'graduation' && major === 'BSIE' && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="rounded-xl bg-black/50 p-3 text-xs border border-amber-500/30"
                >
                  <p className="text-amber-400 font-bold mb-1">Graduation Status Breakdown:</p>
                  <p className="text-slate-300 leading-relaxed text-[11px]">
                    Remaining credits: <strong className="text-white">{remainingCredits}</strong>. Ensure you complete core requirements, Industrial Attachment, and Capstone Project milestones.
                  </p>
                </motion.div>
              )}

              {selectedAdvice === 'trimesters' && major === 'BSIE' && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="rounded-xl bg-black/50 p-3 text-xs border border-emerald-500/30"
                >
                  <p className="text-emerald-400 font-bold mb-1">Estimated Academic Timeline:</p>
                  <p className="text-slate-300 leading-relaxed text-[11px]">
                    Based on your remaining {remainingCredits} credits, you have approximately <strong className="text-emerald-300">{estimatedTrimesters} trimesters</strong> left until expected graduation.
                  </p>
                </motion.div>
              )}

              {selectedAdvice === 'gpaCalculator' && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="rounded-xl bg-black/60 p-4 text-xs border border-purple-500/30 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-purple-400 font-bold">Semester GPA Calculator</p>
                    <button 
                      type="button" 
                      onClick={() => setCalculatedGpa(null)}
                      className="text-[10px] text-slate-500 hover:text-slate-300"
                    >
                      Reset
                    </button>
                  </div>
                  
                  <form onSubmit={handleCalculateGpa} className="space-y-2.5">
                    {gpaCourses.map((item, idx) => (
                      <div key={idx} className="flex gap-2 items-center">
                        <select
                          value={item.credits}
                          onChange={(e) => handleGpaChange(idx, 'credits', e.target.value)}
                          className="bg-[#0d131f] border border-white/15 rounded-lg px-2 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-purple-400 cursor-pointer"
                        >
                          <option value="1" className="bg-[#0a0e14]">1 Cr</option>
                          <option value="2" className="bg-[#0a0e14]">2 Cr</option>
                          <option value="3" className="bg-[#0a0e14]">3 Cr</option>
                          <option value="4" className="bg-[#0a0e14]">4 Cr</option>
                        </select>
                        <select
                          value={item.grade}
                          onChange={(e) => handleGpaChange(idx, 'grade', e.target.value)}
                          className="bg-[#0d131f] border border-white/15 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 flex-1 focus:outline-none focus:border-purple-400 cursor-pointer"
                        >
                          {Object.keys(GRADE_POINTS).map((g) => (
                            <option key={g} value={g} className="bg-[#0a0e14] text-slate-100">
                              Grade: {g} ({GRADE_POINTS[g]})
                            </option>
                          ))}
                        </select>
                      </div>
                    ))}

                    <div className="flex items-center justify-between pt-1">
                      <button
                        type="button"
                        onClick={handleAddGpaRow}
                        className="text-[11px] text-sky-400 hover:text-sky-300 font-semibold transition"
                      >
                        + Add Course
                      </button>
                      <button
                        type="submit"
                        className="bg-purple-500/20 border border-purple-500/50 text-purple-300 px-3 py-1.5 rounded-lg text-xs hover:bg-purple-500/30 font-bold transition shadow-sm"
                      >
                        Calculate
                      </button>
                    </div>
                  </form>

                  {calculatedGpa !== null && (
                    <motion.div 
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="mt-3 p-3 bg-purple-500/15 border border-purple-500/40 rounded-xl text-center text-purple-200 font-bold tracking-wide"
                    >
                      Estimated Semester GPA: <span className="text-white text-sm">{calculatedGpa}</span> / 4.00
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            <button
              onClick={handleLogout}
              className="text-[11px] text-slate-500 hover:text-slate-300 transition block pt-1"
            >
              ← Logout / Change ID
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Warning Disclaimer Footer */}
      <div className="mt-5 pt-3 border-t border-red-500/20 flex items-start gap-2.5 text-[10px] text-red-400/90 leading-relaxed relative z-10">
        <span className="text-sm shrink-0">⚠️</span>
        <p>
          <strong>Disclaimer:</strong> This system does not replace official academic advising. Always verify your study plan and registration requirements with your university advisor.
        </p>
      </div>
    </motion.div>
  );
}