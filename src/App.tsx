import React, { useState, useEffect, useMemo } from "react";
import {
  GraduationCap,
  Calculator,
  CheckCircle2,
  Info,
  RefreshCw,
  Printer,
  ChevronDown,
  BookOpen,
  User,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Settings2,
  Trash2,
  Plus
} from "lucide-react";
import { Course, Semester } from "./types";
import { GRADING_SYSTEM, SEMESTER_2_COURSES } from "./data";
import { motion, AnimatePresence } from "motion/react";

export default function App() {
  // --- PERSISTENT STATE ---
  const [userName, setUserName] = useState<string>(() => {
    return localStorage.getItem("cgpa_user_name") || "";
  });

  const [isOnboarded, setIsOnboarded] = useState<boolean>(() => {
    return localStorage.getItem("cgpa_onboarded") === "true";
  });

  const [calcFirstYear, setCalcFirstYear] = useState<boolean>(() => {
    const saved = localStorage.getItem("cgpa_calc_first_year");
    return saved === "true";
  });

  const [sem1Gpa, setSem1Gpa] = useState<number>(() => {
    const saved = localStorage.getItem("cgpa_sem1_gpa");
    return saved ? Number(saved) : 8.0;
  });

  const [sem1Credits, setSem1Credits] = useState<number>(() => {
    const saved = localStorage.getItem("cgpa_sem1_credits");
    return saved ? Number(saved) : 20;
  });

  const [sem2Courses, setSem2Courses] = useState<Course[]>(() => {
    const saved = localStorage.getItem("cgpa_sem2_courses");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Error parsing sem2 courses", e);
      }
    }
    return SEMESTER_2_COURSES;
  });

  // UI States
  const [showToast, setShowToast] = useState<{ message: string; type: "success" | "info" } | null>(null);
  const [activeTab, setActiveTab] = useState<"calculator" | "explain">("calculator");
  const [inputNameTemp, setInputNameTemp] = useState(userName);

  // --- LOCALSTORAGE PERSISTENCE ---
  useEffect(() => {
    localStorage.setItem("cgpa_user_name", userName);
  }, [userName]);

  useEffect(() => {
    localStorage.setItem("cgpa_onboarded", String(isOnboarded));
  }, [isOnboarded]);

  useEffect(() => {
    localStorage.setItem("cgpa_calc_first_year", String(calcFirstYear));
  }, [calcFirstYear]);

  useEffect(() => {
    localStorage.setItem("cgpa_sem1_gpa", String(sem1Gpa));
  }, [sem1Gpa]);

  useEffect(() => {
    localStorage.setItem("cgpa_sem1_credits", String(sem1Credits));
  }, [sem1Credits]);

  useEffect(() => {
    localStorage.setItem("cgpa_sem2_courses", JSON.stringify(sem2Courses));
  }, [sem2Courses]);

  const triggerToast = (message: string, type: "success" | "info" = "success") => {
    setShowToast({ message, type });
    setTimeout(() => setShowToast(null), 3000);
  };

  // --- CALCULATIONS ---
  // Sem 2 totals
  const sem2Stats = useMemo(() => {
    let totalEarnedPoints = 0;
    let gradedCredits = 0;
    let totalPotentialCredits = 0;
    let gradedCount = 0;

    sem2Courses.forEach((c) => {
      const cred = Number(c.credits) || 0;
      totalPotentialCredits += cred;
      if (c.grade !== "" && c.gradePoint >= 0) {
        totalEarnedPoints += c.gradePoint * cred;
        gradedCredits += cred;
        gradedCount++;
      }
    });

    const sgpa = gradedCredits > 0 ? Number((totalEarnedPoints / gradedCredits).toFixed(3)) : 0;

    return {
      sgpa: Number(sgpa.toFixed(2)),
      preciseSgpa: sgpa,
      gradedCredits,
      totalPotentialCredits,
      gradedCount,
      totalCount: sem2Courses.length,
      allFilled: gradedCount === sem2Courses.length,
    };
  }, [sem2Courses]);

  // Overall First Year CGPA (combined sem 1 & sem 2)
  const firstYearCgpa = useMemo(() => {
    if (!calcFirstYear) return null;
    
    const sem1TotalPoints = sem1Gpa * sem1Credits;
    const sem2TotalPoints = sem2Stats.preciseSgpa * sem2Stats.gradedCredits;
    const totalCreditsCombined = sem1Credits + sem2Stats.gradedCredits;

    if (totalCreditsCombined === 0) return 0;
    const result = (sem1TotalPoints + sem2TotalPoints) / totalCreditsCombined;
    return Number(result.toFixed(2));
  }, [calcFirstYear, sem1Gpa, sem1Credits, sem2Stats]);

  // Handle grade change
  const handleGradeChange = (courseId: string, gradeValue: string) => {
    setSem2Courses((prev) =>
      prev.map((c) => {
        if (c.id !== courseId) return c;
        const matchingScale = GRADING_SYSTEM.scales.find((s) => s.value === gradeValue);
        return {
          ...c,
          grade: gradeValue,
          gradePoint: matchingScale ? matchingScale.points : -1,
        };
      })
    );
  };

  // Reset to default grades
  const handleResetGrades = () => {
    if (confirm("Reset all grades to blank? This action cannot be undone.")) {
      setSem2Courses(SEMESTER_2_COURSES);
      triggerToast("All semester grades have been reset.", "info");
    }
  };

  const handleEditNameDirect = (newName: string) => {
    setUserName(newName);
    setInputNameTemp(newName);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-[#E4E4E7] font-sans antialiased selection:bg-emerald-500/20 selection:text-emerald-300 pb-16">
      
      {/* Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-4 bg-[#121214] border border-emerald-500/20 rounded-2xl shadow-xl shadow-black/60 text-xs font-semibold text-emerald-400"
          >
            <CheckCircle2 className="h-5 w-5 text-emerald-400" />
            <span>{showToast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {!isOnboarded ? (
          /* --- STEP 1: ONBOARDING / NAME / 1ST YEAR CHECK --- */
          <motion.div
            key="onboarding"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="min-h-screen flex items-center justify-center p-6"
          >
            <div className="max-w-xl w-full bg-[#121214] border border-white/5 rounded-[2.5rem] p-10 md:p-12 shadow-2xl shadow-black/80 relative overflow-hidden">
              {/* Backglow element */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-72 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />

              <div className="text-center mb-8 relative">
                <div className="inline-flex p-3 bg-emerald-500/10 text-emerald-400 rounded-2xl border border-emerald-500/20 mb-4">
                  <GraduationCap className="h-8 w-8" />
                </div>
                <h1 className="text-3xl font-light tracking-tight text-white">
                  Welcome to <span className="font-semibold text-emerald-500">Academic Tracker</span>
                </h1>
                <p className="text-zinc-500 text-xs uppercase tracking-widest mt-2">
                  Semester 2 • Curriculum Customizer
                </p>
              </div>

              <div className="space-y-6 relative">
                {/* Name Input */}
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2.5 flex items-center gap-2">
                    <User className="h-3.5 w-3.5 text-emerald-400" />
                    Enter Your Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Rohit"
                    value={inputNameTemp}
                    onChange={(e) => setInputNameTemp(e.target.value)}
                    className="w-full bg-[#0A0A0B] border border-white/5 hover:border-emerald-500/30 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-2xl px-5 py-4 text-sm font-semibold text-white focus:outline-none transition-all placeholder:text-zinc-700"
                  />
                </div>

                {/* Calculate 1st Year CGPA Choice */}
                <div className="bg-[#0A0A0B]/50 border border-white/5 rounded-2xl p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-white">Calculate 1st Year CGPA?</p>
                      <p className="text-xs text-zinc-500 mt-1">Combine Sem 1 results with Sem 2 credits</p>
                    </div>
                    <button
                      onClick={() => setCalcFirstYear(!calcFirstYear)}
                      className={`relative inline-flex h-6.5 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        calcFirstYear ? "bg-emerald-500" : "bg-zinc-800"
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5.5 w-5.5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          calcFirstYear ? "translate-x-5.5 bg-black" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>

                  {/* If Yes, show Sem 1 GPA Input */}
                  <AnimatePresence>
                    {calcFirstYear && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-4 pt-3 border-t border-white/5 overflow-hidden"
                      >
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2">
                              Semester 1 SGPA
                            </label>
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              max="10"
                              value={sem1Gpa}
                              onChange={(e) => setSem1Gpa(Number(e.target.value))}
                              className="w-full bg-[#0A0A0B] border border-white/10 rounded-xl px-4 py-2.5 text-xs font-bold font-mono text-white focus:outline-none focus:border-emerald-500"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2">
                              Semester 1 Credits
                            </label>
                            <input
                              type="number"
                              min="1"
                              max="40"
                              value={sem1Credits}
                              onChange={(e) => setSem1Credits(Number(e.target.value))}
                              className="w-full bg-[#0A0A0B] border border-white/10 rounded-xl px-4 py-2.5 text-xs font-bold font-mono text-white focus:outline-none focus:border-emerald-500"
                            />
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Enter Dashboard Button */}
                <button
                  onClick={() => {
                    const finalName = inputNameTemp.trim() || "Guest Student";
                    setUserName(finalName);
                    setIsOnboarded(true);
                    triggerToast(`Welcome back, ${finalName}!`);
                  }}
                  className="w-full py-4.5 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-extrabold uppercase tracking-widest rounded-2xl shadow-lg shadow-emerald-500/10 flex items-center justify-center gap-2 transition-all cursor-pointer group"
                >
                  Configure Academic Profile
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </motion.div>
        ) : (
          /* --- STEP 2: MAIN DASHBOARD VIEW --- */
          <motion.div
            key="dashboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            {/* Header Section */}
            <header className="border-b border-white/5 pb-6 pt-8 px-6 no-print">
              <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="bg-emerald-500/10 text-emerald-400 p-2.5 rounded-2xl border border-emerald-500/20">
                    <GraduationCap className="h-8 w-8" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-light tracking-tight text-white flex items-center gap-2.5">
                      Academic <span className="font-semibold text-emerald-500">Tracker</span>
                    </h1>
                    <p className="text-zinc-500 text-xs uppercase tracking-widest mt-1">
                      Hi, <span className="text-zinc-300 font-semibold">{userName}</span> • Personalized Syllabus Engine
                    </p>
                  </div>
                </div>

                {/* Header Actions */}
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => {
                      setIsOnboarded(false);
                    }}
                    className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2.5 bg-white/5 hover:bg-white/10 text-zinc-300 rounded-xl border border-white/10 transition-all"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Reset Name / Mode
                  </button>

                  <button
                    onClick={() => window.print()}
                    className="p-2.5 bg-white/5 hover:bg-white/10 text-zinc-300 border border-white/10 rounded-xl transition-all"
                    title="Print Report"
                  >
                    <Printer className="h-4 w-4" />
                  </button>

                  <button
                    onClick={handleResetGrades}
                    className="p-2.5 bg-white/5 hover:bg-white/10 text-zinc-500 hover:text-white border border-white/10 rounded-xl transition-all"
                    title="Clear grades"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </header>

            {/* Dashboard Content */}
            <main className="max-w-7xl mx-auto px-6 py-10">
              
              {/* --- ANALYTICS / STATS BANNER --- */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-10">
                
                {/* Left side: CGPA displays */}
                <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
                  
                  {/* Semester 2 GPA Card */}
                  <div className="bg-[#121214] border border-white/5 rounded-3xl p-8 flex flex-col justify-between relative overflow-hidden shadow-xl shadow-black/20 group">
                    <div className="absolute right-0 bottom-0 translate-x-4 translate-y-4 opacity-5 pointer-events-none">
                      <Calculator className="w-28 h-28 text-white" />
                    </div>
                    <div>
                      <div className="flex items-center justify-between">
                        <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Semester 2 SGPA</p>
                        <span className="text-[10px] px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full font-bold">
                          Active Sem
                        </span>
                      </div>
                      <div className="flex items-baseline gap-2 mt-4">
                        <span className="text-6xl font-light tracking-tight text-white font-mono">
                          {sem2Stats.gradedCredits > 0 ? sem2Stats.sgpa.toFixed(2) : "0.00"}
                        </span>
                        <span className="text-sm font-mono text-zinc-500">/ 10.0</span>
                      </div>
                    </div>
                    <div className="mt-6 flex items-center justify-between text-xs text-zinc-400 pt-4 border-t border-white/5">
                      <span className="flex items-center gap-1.5">
                        <BookOpen className="h-4 w-4 text-emerald-500" />
                        {sem2Stats.gradedCount} of {sem2Stats.totalCount} courses filled
                      </span>
                      <span className="text-zinc-500 font-mono font-bold">{sem2Stats.gradedCredits} of {sem2Stats.totalPotentialCredits} Cr</span>
                    </div>
                  </div>

                  {/* Overall 1st Year Cumulative CGPA Card (Dynamic) */}
                  <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 border border-white/10 rounded-3xl p-8 flex flex-col justify-between shadow-2xl shadow-black/50 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-15">
                      <Sparkles className="h-5 w-5 text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-[10px] text-zinc-400 font-extrabold uppercase tracking-widest flex items-center gap-2">
                        {calcFirstYear ? "Combined 1st Year CGPA" : "Curriculum Mode"}
                      </p>
                      
                      {calcFirstYear ? (
                        <div className="mt-4">
                          <div className="flex items-baseline gap-2">
                            <span className="text-6xl font-extrabold tracking-tight text-emerald-400 font-mono">
                              {firstYearCgpa ? firstYearCgpa.toFixed(2) : "0.00"}
                            </span>
                            <span className="text-xs font-mono text-zinc-500">CGPA</span>
                          </div>
                          <p className="text-[11px] text-zinc-400 mt-2 leading-relaxed">
                            Combining Semester 1 ({sem1Gpa.toFixed(2)} GPA on {sem1Credits} Cr) and Semester 2 ({sem2Stats.sgpa.toFixed(2)} GPA)
                          </p>
                        </div>
                      ) : (
                        <div className="mt-4 space-y-2">
                          <span className="text-lg font-bold text-white block tracking-tight">Semester 2 Focus Mode</span>
                          <p className="text-xs text-zinc-400 leading-relaxed">
                            Currently showing Semester 2 results only. You can enable overall 1st Year calculation on the right panel at any time.
                          </p>
                        </div>
                      )}
                    </div>
                    <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-xs">
                      <span className="text-zinc-500">Grading System:</span>
                      <span className="text-zinc-300 font-bold">10-Point Scale</span>
                    </div>
                  </div>

                </div>

                {/* Right side: Fast interactive config for 1st year */}
                <div className="md:col-span-4 bg-[#121214] border border-white/5 rounded-3xl p-8 flex flex-col justify-between shadow-lg shadow-black/25">
                  <div>
                    <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                      <Settings2 className="h-4 w-4 text-emerald-400" />
                      1st Year Configuration
                    </h3>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between py-1">
                        <span className="text-xs text-zinc-300 font-medium">Calculate Overall CGPA</span>
                        <button
                          onClick={() => setCalcFirstYear(!calcFirstYear)}
                          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border border-white/10 transition-colors duration-200 ease-in-out focus:outline-none ${
                            calcFirstYear ? "bg-emerald-500" : "bg-zinc-800"
                          }`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                              calcFirstYear ? "translate-x-5 bg-black" : "translate-x-0"
                            }`}
                          />
                        </button>
                      </div>

                      {calcFirstYear && (
                        <div className="space-y-3 pt-2.5 border-t border-white/5">
                          <div>
                            <div className="flex justify-between text-[10px] font-bold text-zinc-500 mb-1">
                              <span>SEM 1 SGPA</span>
                              <span className="text-emerald-400">{sem1Gpa.toFixed(2)}</span>
                            </div>
                            <input
                              type="range"
                              min="0"
                              max="10"
                              step="0.05"
                              value={sem1Gpa}
                              onChange={(e) => setSem1Gpa(Number(e.target.value))}
                              className="w-full accent-emerald-500 h-1 bg-zinc-800 rounded-lg cursor-pointer"
                            />
                          </div>

                          <div>
                            <div className="flex justify-between text-[10px] font-bold text-zinc-500 mb-1">
                              <span>SEM 1 CREDITS</span>
                              <span className="text-zinc-300">{sem1Credits} Credits</span>
                            </div>
                            <input
                              type="range"
                              min="12"
                              max="30"
                              step="1"
                              value={sem1Credits}
                              onChange={(e) => setSem1Credits(Number(e.target.value))}
                              className="w-full accent-emerald-500 h-1 bg-zinc-800 rounded-lg cursor-pointer"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-white/5 flex gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1" />
                    <p className="text-[10px] text-zinc-500 uppercase tracking-widest">
                      Live sync & dynamic weighting enabled
                    </p>
                  </div>
                </div>

              </div>

              {/* --- MAIN CALCULATION LAYOUT --- */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Semester 2 Table (Col Span 8) */}
                <div className="lg:col-span-8 bg-[#121214] border border-white/5 rounded-3xl p-6 md:p-8 flex flex-col shadow-lg shadow-black/20">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                    <div>
                      <h2 className="text-xl font-medium tracking-tight text-white flex items-center gap-2">
                        Semester 2 Course Matrix
                        <span className="text-[10px] font-mono bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded border border-white/5 font-bold">
                          24 Total Credits
                        </span>
                      </h2>
                      <p className="text-xs text-zinc-500 mt-1">Select your grade for each official course to view real-time results.</p>
                    </div>
                    
                    {/* Clear grades button */}
                    <button
                      onClick={handleResetGrades}
                      className="px-3.5 py-2 bg-white/5 border border-white/5 text-zinc-400 hover:text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all"
                    >
                      <RefreshCw className="h-3.5 w-3.5" />
                      Clear Grades
                    </button>
                  </div>

                  {/* Course Table wrapper */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="text-zinc-500 text-[10px] uppercase tracking-widest border-b border-white/5">
                        <tr>
                          <th className="pb-4 px-3 font-semibold">Course & Code</th>
                          <th className="pb-4 text-center font-semibold w-20">Credits</th>
                          <th className="pb-4 text-center font-semibold w-44">Select Letter Grade</th>
                          <th className="pb-4 text-right font-semibold w-24">Points</th>
                        </tr>
                      </thead>
                      <tbody className="text-sm divide-y divide-white/5">
                        {sem2Courses.map((course) => (
                          <tr key={course.id} className="group hover:bg-white/[0.01] transition-colors">
                            {/* Title & Code */}
                            <td className="py-4.5 px-3">
                              <div className="font-semibold text-zinc-100 group-hover:text-emerald-400 transition-colors">
                                {course.name}
                              </div>
                              <div className="text-[11px] font-mono font-bold text-zinc-500 mt-1 bg-zinc-900/50 inline-block px-2 py-0.5 rounded border border-white/5">
                                {course.code}
                              </div>
                            </td>

                            {/* Credits */}
                            <td className="py-4.5 text-center font-mono font-extrabold text-zinc-300">
                              {course.credits}.0
                            </td>

                            {/* Grade Selector */}
                            <td className="py-4.5 text-center">
                              <div className="relative inline-block w-full max-w-[10rem]">
                                <select
                                  value={course.grade}
                                  onChange={(e) => handleGradeChange(course.id, e.target.value)}
                                  className={`w-full appearance-none bg-[#0A0A0B] border hover:border-white/20 transition-all rounded-xl py-2 px-3 pr-8 text-xs font-bold text-center cursor-pointer focus:outline-none ${
                                    course.grade !== ""
                                      ? "border-emerald-500/30 text-emerald-400 bg-emerald-500/[0.02]"
                                      : "border-white/10 text-zinc-400"
                                  }`}
                                >
                                  <option value="">-- Select Grade --</option>
                                  {GRADING_SYSTEM.scales.map((sc) => (
                                    <option key={sc.value} value={sc.value} className="bg-[#121214] text-zinc-300">
                                      {sc.value} ({sc.points})
                                    </option>
                                  ))}
                                </select>
                                <div className="absolute inset-y-0 right-0 flex items-center pr-2.5 pointer-events-none text-zinc-500">
                                  <ChevronDown className="h-4 w-4" />
                                </div>
                              </div>
                            </td>

                            {/* Dynamic Point Multiplier (Grade point * credits) */}
                            <td className="py-4.5 text-right font-mono text-zinc-400">
                              {course.grade !== "" && course.gradePoint >= 0 ? (
                                <span className="text-zinc-200">
                                  {(course.gradePoint * course.credits).toFixed(1)}
                                </span>
                              ) : (
                                <span className="text-zinc-600">-</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Summary bar inside matrix card */}
                  <div className="mt-8 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
                    <p className="text-zinc-500">
                      * Values convert automatically based on standard <strong className="text-zinc-300">10-Point Regulation</strong>.
                    </p>
                    <div className="flex gap-4 font-mono">
                      <span className="text-zinc-400">Total Credits: <strong className="text-white">24.0</strong></span>
                      <span className="text-zinc-400">Graded Credits: <strong className="text-emerald-400">{sem2Stats.gradedCredits}.0</strong></span>
                    </div>
                  </div>
                </div>

                {/* Right Column details (Col Span 4) */}
                <div className="lg:col-span-4 space-y-8">
                  
                  {/* Grading Guide card */}
                  <div className="bg-[#121214] border border-white/5 rounded-3xl p-6 shadow-md shadow-black/10">
                    <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                      <BookOpen className="h-4.5 w-4.5 text-emerald-400" />
                      10-Point Grade Scale
                    </h3>
                    
                    <div className="space-y-2.5">
                      {GRADING_SYSTEM.scales.map((s) => (
                        <div key={s.value} className="flex justify-between items-center py-1.5 border-b border-white/[0.02] last:border-0">
                          <span className="text-xs font-medium text-zinc-300">{s.label}</span>
                          <span className="text-xs font-mono font-bold px-2 py-0.5 bg-white/5 border border-white/5 rounded-md text-white">
                            {s.points} Points
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* How is GPA calculated guide */}
                  <div className="bg-[#121214] border border-white/5 rounded-3xl p-6 shadow-md shadow-black/10">
                    <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                      <Info className="h-4.5 w-4.5 text-emerald-400" />
                      Academic Formulation
                    </h3>
                    <div className="space-y-4 text-xs text-zinc-400 leading-relaxed">
                      <p>
                        <strong>SGPA</strong> is computed as the credit-weighted average of your grade points inside a single semester:
                      </p>
                      <div className="bg-[#0A0A0B] p-4.5 rounded-2xl border border-white/5 font-mono text-[11px] text-zinc-300 leading-normal">
                        SGPA = Σ (Points × Credits) / Σ Credits
                      </div>
                      
                      {calcFirstYear && (
                        <>
                          <p>
                            <strong>1st Year CGPA</strong> is the overall combined score of Semester 1 and Semester 2 weighted by credits:
                          </p>
                          <div className="bg-[#0A0A0B] p-4.5 rounded-2xl border border-white/5 font-mono text-[11px] text-zinc-300 leading-normal">
                            CGPA = (S1 Points + S2 Points) / Total Credits
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                </div>

              </div>

            </main>

            {/* Print Friendly Output Footer */}
            <footer className="mt-16 py-8 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center text-[10px] text-zinc-600 uppercase tracking-[0.2em] px-6 max-w-7xl mx-auto">
              <div className="space-y-1">
                <div>© 2026 Academic Tracker • Designed for Semester 2</div>
                <div className="text-emerald-500/80 font-semibold tracking-wider">Created by Rohit Bapu S B</div>
              </div>
              <div className="flex gap-6 mt-4 sm:mt-0">
                <span className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  System Engine Stable
                </span>
                <span>v3.0.0-PRO</span>
              </div>
            </footer>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
