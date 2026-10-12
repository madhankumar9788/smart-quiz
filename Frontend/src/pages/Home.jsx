import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Code2,
  Palette,
  FileCode,
  Sparkles,
  Trophy,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  Users,
  Lock,
  GraduationCap,
  Clock,
  Award,
  Layers,
  ChevronRight,
  Terminal,
  BookOpen,
  Calendar,
  AlertTriangle,
  Server,
  Zap,
  HelpCircle,
  FileCheck
} from 'lucide-react';
import api from '../services/api';

const Home = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ quizzes: 3, questions: 30, students: 24 });
  const [topStudents, setTopStudents] = useState([]);
  const [activeFaq, setActiveFaq] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [qRes, lbRes] = await Promise.all([
          api.get('/quizzes'),
          api.get('/submissions/overall-leaderboard')
        ]);
        if (qRes.data.success) {
          const totalQ = qRes.data.quizzes.reduce((acc, q) => acc + (q.total_questions || 0), 0);
          setStats((prev) => ({
            ...prev,
            quizzes: qRes.data.quizzes.length || 3,
            questions: totalQ || 30
          }));
        }
        if (lbRes.data.success && lbRes.data.leaderboard) {
          setTopStudents(lbRes.data.leaderboard.slice(0, 3));
        }
      } catch {
        // Default fallbacks
      }
    };
    loadData();
  }, []);

  const faqs = [
    {
      q: 'How do candidates receive their examination credentials?',
      a: 'Student accounts are created directly by the CSE Department Administrator. Credentials and default passwords are distributed via the academic batch coordinator.'
    },
    {
      q: 'Can a candidate re-attempt any of the 3 modules?',
      a: 'No. Under the Single-Attempt College Examination Policy, candidates are strictly granted 1 attempt per module. After submitting or timer expiry, answers are permanently recorded in the database.'
    },
    {
      q: 'What is the passing percentage and grading criteria?',
      a: 'The minimum qualifying score is 40% across each module (HTML5, CSS3, and JavaScript). Instant score computation and department rank updates are performed upon submission.'
    },
    {
      q: 'How does the auto-submission timer work?',
      a: 'Each assessment features an active synchronized countdown clock. If a student runs out of time, their selected answers are automatically submitted and evaluated.'
    }
  ];

  return (
    <div className="space-y-16 pb-20">
      {/* ============================================================== */}
      {/* 1. HERO SECTION (CSE DEPARTMENT THEMED & GLASSIC DESIGN)      */}
      {/* ============================================================== */}
      <section className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white p-6 sm:p-10 lg:p-12 border border-slate-800 shadow-2xl">
        {/* Ambient Glass Glow Orbs with animations */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-indigo-500/25 rounded-full blur-3xl pointer-events-none animate-pulse-glow"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 bg-fuchsia-500/20 rounded-full blur-3xl pointer-events-none animate-pulse-glow"></div>
        <div className="absolute top-1/2 left-1/3 w-72 h-72 bg-sky-500/15 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Hero Content */}
          <div className="lg:col-span-7 space-y-5">
            {/* College Department Tag */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-indigo-200 text-xs font-semibold shadow-xs">
              <GraduationCap className="w-3.5 h-3.5 text-amber-400" />
              <span>Department of Computer Science & Engineering</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
              <span className="text-[11px] text-emerald-300 font-mono">Reg 2026</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-3xl sm:text-4xl lg:text-[44px] font-black tracking-tight leading-snug">
              Smart Examination Portal <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-sky-200 to-amber-200">
                CSE Technical Assessments
              </span>
            </h1>

            <p className="text-slate-300 text-sm sm:text-base max-w-xl font-normal leading-relaxed">
              Official timed evaluation platform for Computer Science & Engineering students. Comprehensive coverage across Web Technologies with strict single-attempt verification, live question palettes, and instant automated grading.
            </p>

            {/* CTA Buttons - No public registration button! */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              {user ? (
                <>
                  <Link
                    to="/quizzes"
                    className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-indigo-500/25 flex items-center gap-2 transition transform hover:-translate-y-0.5"
                  >
                    <Terminal className="w-4 h-4" />
                    <span>Launch CSE Assessments</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    to="/leaderboard"
                    className="px-5 py-3 bg-white/10 hover:bg-white/15 border border-white/20 text-white font-semibold text-xs sm:text-sm rounded-xl backdrop-blur-md transition flex items-center gap-2"
                  >
                    <Trophy className="w-4 h-4 text-amber-400" />
                    <span>Monthly Standings</span>
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-indigo-500/25 flex items-center gap-2 transition transform hover:-translate-y-0.5"
                  >
                    <Lock className="w-4 h-4" />
                    <span>Candidate Sign In</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <div className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-slate-300 text-xs font-medium">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Admin-Provisioned Accounts</span>
                  </div>
                </>
              )}
            </div>

            {/* Policy Metric Bar */}
            <div className="pt-4 border-t border-white/10 grid grid-cols-3 gap-3">
              <div className="bg-white/5 backdrop-blur-md p-3 rounded-2xl border border-white/10 hover:bg-white/10 transition">
                <div className="flex items-center gap-1.5 text-indigo-300">
                  <Layers className="w-3.5 h-3.5" />
                  <span className="text-sm font-extrabold text-white">3 Modules</span>
                </div>
                <p className="text-[11px] text-slate-400 font-medium">HTML, CSS & JS</p>
              </div>

              <div className="bg-white/5 backdrop-blur-md p-3 rounded-2xl border border-white/10 hover:bg-white/10 transition">
                <div className="flex items-center gap-1.5 text-sky-300">
                  <FileCode className="w-3.5 h-3.5" />
                  <span className="text-sm font-extrabold text-white">30 Questions</span>
                </div>
                <p className="text-[11px] text-slate-400 font-medium">10 Questions Each</p>
              </div>

              <div className="bg-white/5 backdrop-blur-md p-3 rounded-2xl border border-white/10 hover:bg-white/10 transition">
                <div className="flex items-center gap-1.5 text-amber-400">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span className="text-sm font-extrabold text-amber-300">1 Attempt</span>
                </div>
                <p className="text-[11px] text-slate-400 font-medium">College Policy</p>
              </div>
            </div>
          </div>

          {/* Right Column: Glassic 3D Visual with Floating Badges */}
          <div className="lg:col-span-5 relative flex justify-center items-center">
            <div className="relative group w-full max-w-sm">
              <div className="absolute -inset-1.5 bg-gradient-to-r from-indigo-500 via-sky-400 to-fuchsia-500 rounded-3xl blur-md opacity-40 group-hover:opacity-75 transition duration-700"></div>

              <div className="relative rounded-2xl overflow-hidden border border-white/20 shadow-2xl glass-dark">
                <img
                  src="/hero.jpg"
                  alt="SmartQuiz Platform Graphic"
                  className="w-full h-64 object-cover transform hover:scale-105 transition duration-700"
                />
              </div>

              {/* Floating Glass Badges */}
              <div className="absolute -bottom-4 -left-3 glass-panel p-3 rounded-2xl shadow-xl flex items-center gap-3 animate-float border border-white/40">
                <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-md">
                  <Trophy className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Department Standings</p>
                  <p className="text-xs font-black text-slate-900">Monthly Cycle Active</p>
                </div>
              </div>

              <div className="absolute -top-3 -right-3 glass-dark px-3 py-1.5 rounded-xl shadow-xl flex items-center gap-2 border border-white/20 animate-float-reverse">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></div>
                <span className="text-[11px] font-semibold text-emerald-300 font-mono">MySQL 8.0 Live</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 2. THE 3 MODULES GRID (HTML, CSS & JS - 10 QUESTIONS EACH)    */}
      {/* ============================================================== */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg">
              <Code2 className="w-3.5 h-3.5" /> Core Curriculum Modules
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
              Examination Modules Breakdown
            </h2>
            <p className="text-xs text-slate-500">
              Complete all 3 foundational assessment topics. Exactly 10 questions per subject under college exam rules.
            </p>
          </div>
          <div className="text-right">
            <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200">
              Single-Attempt Integrity Enforced
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Module 1: HTML5 */}
          <div className="relative group rounded-3xl bg-white/85 backdrop-blur-xl border border-slate-200/80 p-6 shadow-sm hover:shadow-xl hover:border-orange-300/80 transition duration-300 flex flex-col justify-between overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-orange-500/20 transition"></div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 border border-orange-100 flex items-center justify-center font-bold text-lg shadow-2xs">
                  <FileCode className="w-6 h-6" />
                </div>
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-orange-50 text-orange-700 border border-orange-200/50">
                  Module 01
                </span>
              </div>

              <div>
                <h3 className="text-base font-extrabold text-slate-900 group-hover:text-orange-600 transition">
                  HTML5 Fundamentals & Semantics
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Document structure, semantic HTML5 tags, form validations, multimedia integration, and web accessibility standards.
                </p>
              </div>

              {/* Badges */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                <span className="text-[10px] font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">10 Questions</span>
                <span className="text-[10px] font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">15 Mins</span>
                <span className="text-[10px] font-semibold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md">Pass: 40%</span>
                <span className="text-[10px] font-bold bg-amber-50 text-amber-700 px-2 py-0.5 rounded-md">1 Attempt</span>
              </div>

              {/* Topics Included */}
              <div className="pt-2 border-t border-slate-100 space-y-1.5 text-[11px] text-slate-600 font-medium">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                  <span>Semantic tags &lt;article&gt;, &lt;header&gt;</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                  <span>Audio / Video media tags & accessibility</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                  <span>Form validations & input types</span>
                </div>
              </div>
            </div>

            <div className="pt-5 mt-4 border-t border-slate-100">
              <Link
                to={user ? "/quizzes" : "/login"}
                className="w-full py-2.5 px-3 bg-slate-900 hover:bg-orange-600 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 group-hover:shadow-md"
              >
                <span>{user ? "Enter HTML5 Quiz" : "Sign In to Attempt"}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Module 2: CSS3 */}
          <div className="relative group rounded-3xl bg-white/85 backdrop-blur-xl border border-slate-200/80 p-6 shadow-sm hover:shadow-xl hover:border-sky-300/80 transition duration-300 flex flex-col justify-between overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-sky-500/20 transition"></div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 border border-sky-100 flex items-center justify-center font-bold text-lg shadow-2xs">
                  <Palette className="w-6 h-6" />
                </div>
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200/50">
                  Module 02
                </span>
              </div>

              <div>
                <h3 className="text-base font-extrabold text-slate-900 group-hover:text-sky-600 transition">
                  CSS3 Responsive Layouts & Styling
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Box model mathematics, Flexbox alignment, CSS Grid 2D layout systems, CSS variables, transitions, and media queries.
                </p>
              </div>

              {/* Badges */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                <span className="text-[10px] font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">10 Questions</span>
                <span className="text-[10px] font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">15 Mins</span>
                <span className="text-[10px] font-semibold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md">Pass: 40%</span>
                <span className="text-[10px] font-bold bg-amber-50 text-amber-700 px-2 py-0.5 rounded-md">1 Attempt</span>
              </div>

              {/* Topics Included */}
              <div className="pt-2 border-t border-slate-100 space-y-1.5 text-[11px] text-slate-600 font-medium">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                  <span>Flexbox justify-content & align-items</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                  <span>Grid template areas & fr units</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                  <span>Specificity rules & pseudo-classes</span>
                </div>
              </div>
            </div>

            <div className="pt-5 mt-4 border-t border-slate-100">
              <Link
                to={user ? "/quizzes" : "/login"}
                className="w-full py-2.5 px-3 bg-slate-900 hover:bg-sky-600 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 group-hover:shadow-md"
              >
                <span>{user ? "Enter CSS3 Quiz" : "Sign In to Attempt"}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Module 3: JavaScript */}
          <div className="relative group rounded-3xl bg-white/85 backdrop-blur-xl border border-slate-200/80 p-6 shadow-sm hover:shadow-xl hover:border-amber-300/80 transition duration-300 flex flex-col justify-between overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-amber-500/20 transition"></div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 border border-amber-100 flex items-center justify-center font-bold text-lg shadow-2xs">
                  <Code2 className="w-6 h-6" />
                </div>
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200/50">
                  Module 03
                </span>
              </div>

              <div>
                <h3 className="text-base font-extrabold text-slate-900 group-hover:text-amber-700 transition">
                  JavaScript (ES6+) Core Logic
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Execution contexts, event loop, closures, promises, async/await, array higher-order functions, and prototypal inheritance.
                </p>
              </div>

              {/* Badges */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                <span className="text-[10px] font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">10 Questions</span>
                <span className="text-[10px] font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">20 Mins</span>
                <span className="text-[10px] font-semibold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md">Pass: 40%</span>
                <span className="text-[10px] font-bold bg-amber-50 text-amber-700 px-2 py-0.5 rounded-md">1 Attempt</span>
              </div>

              {/* Topics Included */}
              <div className="pt-2 border-t border-slate-100 space-y-1.5 text-[11px] text-slate-600 font-medium">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                  <span>Closures, scope chains & hoisting</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                  <span>Asynchronous promises & event loop</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                  <span>Map, filter, reduce & destructuring</span>
                </div>
              </div>
            </div>

            <div className="pt-5 mt-4 border-t border-slate-100">
              <Link
                to={user ? "/quizzes" : "/login"}
                className="w-full py-2.5 px-3 bg-slate-900 hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 group-hover:shadow-md"
              >
                <span>{user ? "Enter JavaScript Quiz" : "Sign In to Attempt"}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 3. COLLEGE EXAMINATION POLICY & REGULATIONS                   */}
      {/* ============================================================== */}
      <section className="bg-white/80 backdrop-blur-xl rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200/50">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-600" /> Academic Exam Committee Protocol
            </div>
            <h3 className="text-xl font-black text-slate-900">
              Single-Attempt College Examination Policy
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              In accordance with college academic standards for Computer Science & Engineering assessments, each registered candidate is permitted strictly <strong>one examination attempt per module</strong>. Once submitted or when the timer expires, marks and answer choices are permanently stored in the MySQL database.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full lg:w-auto">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/60 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm shadow-xs">
                ⏱️
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">Countdown Timer</p>
                <p className="text-[11px] text-slate-500">Auto-submits when time expires</p>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/60 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm shadow-xs">
                🏆
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">Monthly Ranking</p>
                <p className="text-[11px] text-slate-500">Resets on the 1st of every month</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 4. CSE TOPPERS TEASER (MONTHLY STANDINGS PREVIEW)             */}
      {/* ============================================================== */}
      {topStudents.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-500" />
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                Monthly Toppers Leaderboard Preview
              </h3>
            </div>
            <Link
              to="/leaderboard"
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
            >
              <span>View Full Leaderboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {topStudents.map((st, idx) => (
              <div
                key={st.student_id}
                className="bg-white/85 backdrop-blur-md p-5 rounded-2xl border border-slate-200/70 shadow-xs flex items-center justify-between hover:shadow-md transition"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm text-white shadow-xs ${
                      idx === 0
                        ? 'bg-gradient-to-tr from-amber-500 to-yellow-400 shadow-amber-500/20'
                        : idx === 1
                        ? 'bg-gradient-to-tr from-slate-400 to-slate-300'
                        : 'bg-gradient-to-tr from-amber-700 to-amber-600'
                    }`}
                  >
                    #{idx + 1}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">{st.student_name}</p>
                    <p className="text-[10px] text-slate-400">{st.student_email}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-black text-indigo-600">{st.avg_percentage}%</p>
                  <p className="text-[10px] text-slate-400 font-medium">{st.quizzes_attempted} Cleared</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ============================================================== */}
      {/* 5. ACADEMIC FAQ ACCORDION                                      */}
      {/* ============================================================== */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-indigo-600" />
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
            Frequently Asked Assessment Questions
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className="bg-white/85 backdrop-blur-md p-5 rounded-2xl border border-slate-200/70 shadow-2xs space-y-2 hover:border-indigo-300 transition"
            >
              <h4 className="text-xs font-bold text-slate-900 flex items-start gap-2">
                <span className="w-5 h-5 rounded-md bg-indigo-50 text-indigo-600 flex items-center justify-center text-[10px] font-black flex-shrink-0">
                  {i + 1}
                </span>
                <span>{faq.q}</span>
              </h4>
              <p className="text-[11px] text-slate-500 leading-relaxed pl-7">
                {faq.a}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ============================================================== */}
      {/* 6. DEPARTMENT FOOTER NOTICE                                    */}
      {/* ============================================================== */}
      <footer className="pt-6 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
        <div className="flex items-center gap-2">
          <GraduationCap className="w-4 h-4 text-indigo-600" />
          <span className="font-semibold text-slate-700">Department of Computer Science & Engineering</span>
          <span>• Smart Examination Portal</span>
        </div>
        <div className="flex items-center gap-4 text-[11px]">
          <span className="text-emerald-700 font-semibold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            Evaluation Server Online
          </span>
          <span className="text-slate-400">Regulation 2026</span>
        </div>
      </footer>
    </div>
  );
};

export default Home;
