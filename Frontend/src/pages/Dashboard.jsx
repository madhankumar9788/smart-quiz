import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import api from '../services/api';
import {
  Award,
  BookOpen,
  CheckCircle,
  Clock,
  Flame,
  Star,
  Trophy,
  ArrowRight,
  TrendingUp,
  Target,
  Sparkles,
  Eye,
  Calendar,
  X,
  CheckCircle2,
  XCircle,
  GraduationCap,
  ShieldCheck,
  FileCode,
  Palette,
  Code2,
  Printer,
  ChevronRight,
  Layers,
  Lock,
  Check,
  ExternalLink
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  // Modal for viewing attempt details
  const [selectedAttempt, setSelectedAttempt] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [histRes, quizRes] = await Promise.all([
          api.get('/submissions/my-history'),
          api.get('/quizzes')
        ]);
        if (histRes.data.success) {
          setHistory(histRes.data.history);
        }
        if (quizRes.data.success) {
          setQuizzes(quizRes.data.quizzes);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Compute metrics
  const totalAttempts = history.length;
  const avgScore = totalAttempts > 0
    ? Math.round(history.reduce((a, b) => a + Number(b.percentage), 0) / totalAttempts)
    : 0;
  const highestScore = totalAttempts > 0
    ? Math.max(...history.map((h) => Number(h.percentage)))
    : 0;
  const totalPoints = history.reduce((a, b) => a + Number(b.score), 0);

  // Open modal breakdown
  const handleOpenBreakdown = async (attemptId) => {
    setModalLoading(true);
    try {
      const res = await api.get(`/submissions/${attemptId}`);
      if (res.data.success) {
        setSelectedAttempt(res.data.attempt);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setModalLoading(false);
    }
  };

  // Assessment attempt tracking for badges
  const htmlAttempt = history.find((h) => h.quiz_title?.toLowerCase().includes('html'));
  const cssAttempt = history.find((h) => h.quiz_title?.toLowerCase().includes('css'));
  const jsAttempt = history.find((h) => h.quiz_title?.toLowerCase().includes('js') || h.quiz_title?.toLowerCase().includes('javascript'));

  const htmlQuiz = quizzes.find((q) => q.title?.toLowerCase().includes('html'));
  const cssQuiz = quizzes.find((q) => q.title?.toLowerCase().includes('css'));
  const jsQuiz = quizzes.find((q) => q.title?.toLowerCase().includes('js') || q.title?.toLowerCase().includes('javascript'));

  // Achievement badges logic
  const badges = [
    {
      id: 1,
      title: 'First Submission',
      desc: 'Completed your first college quiz assessment',
      requirement: 'Submit any 1 assessment module',
      howToUnlock: 'Complete and submit any quiz assessment (HTML5, CSS3, or JavaScript). Your submission automatically unlocks this honor.',
      progress: totalAttempts >= 1 ? '1/1 Assessment Submitted' : '0/1 Assessment Submitted',
      icon: '🌱',
      unlocked: totalAttempts >= 1,
      targetLink: '/quizzes',
      targetLabel: 'Launch Any Assessment',
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200'
    },
    {
      id: 2,
      title: 'Perfectionist',
      desc: 'Achieved a perfect 100% score on an exam',
      requirement: 'Attain 100% (10/10 marks) on any exam',
      howToUnlock: 'Score a flawless 100% on any module. Answer all 10 questions accurately before submitting or timer completion.',
      progress: highestScore > 0 ? `Current Best: ${highestScore}% (Target: 100%)` : 'Not attempted yet (Target: 100%)',
      icon: '🎯',
      unlocked: highestScore === 100,
      targetLink: '/quizzes',
      targetLabel: 'Aim for 100% Score',
      color: 'bg-indigo-50 text-indigo-700 border-indigo-200'
    },
    {
      id: 3,
      title: 'HTML5 Specialist',
      desc: 'Passed the HTML5 Semantic Architecture assessment',
      requirement: 'Pass Module 01 (HTML5) with score ≥ 40%',
      howToUnlock: 'Attempt the HTML5 Fundamentals assessment and achieve at least 4 out of 10 marks (40% qualifying score).',
      progress: htmlAttempt ? `Current: ${htmlAttempt.percentage}% (${Number(htmlAttempt.percentage) >= 40 ? 'Passed' : 'Failed'})` : 'Module 01 not attempted',
      icon: '📄',
      unlocked: Boolean(htmlAttempt && Number(htmlAttempt.percentage) >= 40),
      targetLink: htmlQuiz ? `/quiz/${htmlQuiz.id}` : '/quizzes',
      targetLabel: 'Attempt HTML5 Module',
      color: 'bg-orange-50 text-orange-700 border-orange-200'
    },
    {
      id: 4,
      title: 'CSS3 Layout Master',
      desc: 'Passed the CSS3 Responsive Design assessment',
      requirement: 'Pass Module 02 (CSS3) with score ≥ 40%',
      howToUnlock: 'Attempt the CSS3 Responsive Design assessment and achieve at least 4 out of 10 marks (40% qualifying score).',
      progress: cssAttempt ? `Current: ${cssAttempt.percentage}% (${Number(cssAttempt.percentage) >= 40 ? 'Passed' : 'Failed'})` : 'Module 02 not attempted',
      icon: '🎨',
      unlocked: Boolean(cssAttempt && Number(cssAttempt.percentage) >= 40),
      targetLink: cssQuiz ? `/quiz/${cssQuiz.id}` : '/quizzes',
      targetLabel: 'Attempt CSS3 Module',
      color: 'bg-sky-50 text-sky-700 border-sky-200'
    },
    {
      id: 5,
      title: 'JavaScript Logic Ace',
      desc: 'Passed the JavaScript Core Logic assessment',
      requirement: 'Pass Module 03 (JavaScript) with score ≥ 40%',
      howToUnlock: 'Attempt the JavaScript Core Logic assessment and achieve at least 4 out of 10 marks (40% qualifying score).',
      progress: jsAttempt ? `Current: ${jsAttempt.percentage}% (${Number(jsAttempt.percentage) >= 40 ? 'Passed' : 'Failed'})` : 'Module 03 not attempted',
      icon: '💻',
      unlocked: Boolean(jsAttempt && Number(jsAttempt.percentage) >= 40),
      targetLink: jsQuiz ? `/quiz/${jsQuiz.id}` : '/quizzes',
      targetLabel: 'Attempt JavaScript Module',
      color: 'bg-amber-50 text-amber-700 border-amber-200'
    },
    {
      id: 6,
      title: 'Tri-Module Scholar',
      desc: 'Completed all 3 core technical modules',
      requirement: 'Attempt all 3 curriculum modules (HTML, CSS, JS)',
      howToUnlock: 'Submit assessments for all three foundational topics: HTML5, CSS3, and JavaScript. Once all 3 records are registered, this department honor unlocks.',
      progress: `${[htmlAttempt, cssAttempt, jsAttempt].filter(Boolean).length}/3 Modules Completed`,
      icon: '👑',
      unlocked: (Boolean(htmlAttempt && cssAttempt && jsAttempt)) || totalAttempts >= 3,
      targetLink: '/quizzes',
      targetLabel: 'Complete All 3 Modules',
      color: 'bg-purple-50 text-purple-700 border-purple-200'
    }
  ];

  const unlockedBadgesCount = badges.filter((b) => b.unlocked).length;

  // Print grade slip
  const handlePrintGradeSlip = (attempt) => {
    const printHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Student Grade Slip - ${attempt.quiz_title}</title>
        <style>
          * { font-family: Arial, sans-serif; }
          body { padding: 32px; color: #1e293b; }
          .header { border-bottom: 2px solid #e2e8f0; padding-bottom: 16px; margin-bottom: 24px; }
          h1 { margin: 0; font-size: 20px; color: #1e293b; }
          .sub { color: #64748b; font-size: 12px; margin: 4px 0 0; }
          .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px; font-size: 12px; }
          .card { background: #f8fafc; border: 1px solid #e2e8f0; padding: 12px 16px; border-radius: 8px; }
          .label { font-size: 10px; color: #94a3b8; text-transform: uppercase; font-weight: bold; }
          .val { font-size: 16px; font-weight: bold; color: #1e293b; margin-top: 4px; }
          .footer { margin-top: 32px; font-size: 10px; color: #94a3b8; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 16px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🎓 SmartQuiz — Official Student Grade Slip</h1>
          <p class="sub">Department of Computer Science & Engineering • Regulation 2026</p>
        </div>
        <div class="grid">
          <div class="card"><div class="label">Candidate Name</div><div class="val">${user?.name || 'Student'}</div></div>
          <div class="card"><div class="label">Candidate Email</div><div class="val">${user?.email || ''}</div></div>
          <div class="card"><div class="label">Assessment Module</div><div class="val">${attempt.quiz_title}</div></div>
          <div class="card"><div class="label">Submission Date</div><div class="val">${new Date(attempt.submitted_at).toLocaleString()}</div></div>
          <div class="card"><div class="label">Score Achieved</div><div class="val">${attempt.score} / ${attempt.total_questions} Marks</div></div>
          <div class="card"><div class="label">Percentage & Result</div><div class="val" style="color:${Number(attempt.percentage)>=40?'#059669':'#dc2626'}">${attempt.percentage}% — ${Number(attempt.percentage)>=40?'PASSED':'FAILED'}</div></div>
        </div>
        <p style="font-size:11px;color:#64748b;">Notice: This assessment is governed by the single-attempt college examination policy. Re-attempts are not permitted.</p>
        <div class="footer">Confidential Examination Record • Verified by SmartQuiz Online Evaluation Engine</div>
      </body>
      </html>
    `;
    const win = window.open('', '_blank');
    win.document.write(printHTML);
    win.document.close();
    win.print();
  };

  return (
    <div className="space-y-8 pb-16">
      {/* ============================================================== */}
      {/* 1. STUDENT WELCOME BANNER (GLASSIC + VISIBLE START BUTTON)     */}
      {/* ============================================================== */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 lg:p-10 border border-slate-800 shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-500/15 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-4">
            {/* Student Avatar */}
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-indigo-500 via-sky-400 to-amber-300 text-white font-black text-2xl flex items-center justify-center shadow-lg shadow-indigo-500/30 flex-shrink-0 border-2 border-white/20">
              {(user?.name || 'S').charAt(0).toUpperCase()}
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs uppercase font-bold px-2.5 py-0.5 rounded-full bg-white/10 border border-white/20 text-indigo-200">
                  <GraduationCap className="w-3 h-3 inline mr-1 text-amber-400" />
                  CSE Department • Reg 2026
                </span>
                <span className="flex items-center gap-1 text-xs text-amber-300 font-bold bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-300/20">
                  <Flame className="w-3 h-3 fill-current text-amber-400" /> 3-Day Study Streak
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                Welcome back, {user?.name || 'Student'}! 👋
              </h1>
              <p className="text-slate-300 text-xs sm:text-sm max-w-xl font-normal leading-relaxed">
                Your technical academic portal. Monitor examination performance across HTML5, CSS3 & JavaScript with single-attempt test integrity.
              </p>
            </div>
          </div>

          {/* CRITICAL FIX: Vividly Visible "Start New Quiz" Button with High Contrast */}
          <div className="flex-shrink-0 w-full sm:w-auto">
            <Link to="/quizzes" className="block w-full sm:w-auto">
              <button className="w-full sm:w-auto flex items-center justify-center gap-2.5 py-3 px-6 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-300 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-lg shadow-amber-500/25 transition transform hover:-translate-y-0.5 cursor-pointer border border-amber-200">
                <Sparkles className="w-4 h-4 text-slate-950" />
                <span className="text-slate-950 uppercase tracking-wider">Start New Quiz</span>
                <ArrowRight className="w-4 h-4 text-slate-950" />
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. GLASSIC KPI METRICS ROW                                     */}
      {/* ============================================================== */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white/80 backdrop-blur-xl p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center gap-4 hover:shadow-md transition">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0 font-bold">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Quizzes Taken</p>
            <p className="text-2xl font-black text-slate-900">{totalAttempts} <span className="text-xs font-semibold text-slate-400">/ 3</span></p>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-xl p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center gap-4 hover:shadow-md transition">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0 font-bold">
            <Target className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Average Score</p>
            <p className="text-2xl font-black text-emerald-600">{avgScore}%</p>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-xl p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center gap-4 hover:shadow-md transition">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0 font-bold">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Top Score</p>
            <p className="text-2xl font-black text-amber-600">{highestScore}%</p>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-xl p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center gap-4 hover:shadow-md transition">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0 font-bold">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Marks</p>
            <p className="text-2xl font-black text-purple-600">{totalPoints} <span className="text-xs font-semibold text-slate-400">pts</span></p>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 3. TABS (OVERVIEW, ATTEMPT HISTORY, BADGES)                   */}
      {/* ============================================================== */}
      <div className="flex border-b border-slate-200/80 gap-6 text-xs sm:text-sm font-bold overflow-x-auto">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-3 border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'overview'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Curriculum Modules</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`pb-3 border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'history'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Attempt History ({history.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('badges')}
          className={`pb-3 border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'badges'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Achievement Badges ({badges.filter((b) => b.unlocked).length}/{badges.length})</span>
        </button>
      </div>

      {/* ============================================================== */}
      {/* TAB 1: CURRICULUM MODULES (HTML, CSS, JS STATUS)               */}
      {/* ============================================================== */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-black text-slate-900">Your Technical Modules Status</h2>
              <p className="text-xs text-slate-400">Strict single-attempt college examination policy applies</p>
            </div>
            <Link to="/quizzes" className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
              <span>View All Quizzes</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {quizzes.slice(0, 3).map((q) => {
              const attempt = history.find((h) => h.quiz_id === q.id);
              const isAttempted = Boolean(attempt);
              const isPassed = isAttempted && Number(attempt.percentage) >= (q.passing_percentage || 40);

              return (
                <div
                  key={q.id}
                  className="bg-white/80 backdrop-blur-xl rounded-2xl border border-slate-200/80 p-5 shadow-2xs hover:shadow-md transition flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700">
                        {q.category || 'Programming'}
                      </span>
                      {isAttempted ? (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isPassed ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                        }`}>
                          {isPassed ? '✓ Completed' : '✗ Failed'}
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700">
                          Ready to Take
                        </span>
                      )}
                    </div>

                    <h3 className="text-sm font-extrabold text-slate-900">{q.title}</h3>
                    <p className="text-xs text-slate-500 line-clamp-2">{q.description || 'College examination module'}</p>

                    <div className="flex items-center gap-3 text-[11px] text-slate-500 pt-1">
                      <span>⏱️ {q.duration || 15} Mins</span>
                      <span>•</span>
                      <span>📝 {q.total_questions || 10} Questions</span>
                      <span>•</span>
                      <span>🎯 Pass: {q.passing_percentage || 40}%</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100">
                    {isAttempted ? (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-400 font-medium">Your Score:</span>
                          <span className="font-black text-indigo-600">{attempt.score}/{attempt.total_questions} ({attempt.percentage}%)</span>
                        </div>
                        <button
                          onClick={() => handleOpenBreakdown(attempt.id)}
                          className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Review Answers</span>
                        </button>
                      </div>
                    ) : (
                      <Link
                        to={`/quiz/${q.id}`}
                        className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs"
                      >
                        <span>Start Assessment</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: ATTEMPT HISTORY (WITH PRINT & DETAILED REVIEW)          */}
      {/* ============================================================== */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-black text-slate-900">Official Attempt Audit Log</h2>
              <p className="text-xs text-slate-400">All submitted test records locked under single-attempt integrity</p>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-slate-200/80 overflow-hidden shadow-2xs">
            {history.length === 0 ? (
              <div className="p-12 text-center text-slate-400 space-y-2">
                <BookOpen className="w-8 h-8 mx-auto opacity-30" />
                <p className="text-xs font-medium">You haven't attempted any assessments yet.</p>
                <Link to="/quizzes" className="inline-block px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold mt-2">
                  Take Your First Quiz
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50/80 text-[11px] uppercase font-bold text-slate-400 border-b border-slate-100">
                    <tr>
                      <th className="px-5 py-3.5">#</th>
                      <th className="px-5 py-3.5">Assessment Title</th>
                      <th className="px-5 py-3.5">Score</th>
                      <th className="px-5 py-3.5">Percentage</th>
                      <th className="px-5 py-3.5">Status</th>
                      <th className="px-5 py-3.5">Date</th>
                      <th className="px-5 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {history.map((h, idx) => (
                      <tr key={h.id} className="hover:bg-slate-50/70 transition">
                        <td className="px-5 py-3.5 font-mono text-[11px] text-slate-400">#{idx + 1}</td>
                        <td className="px-5 py-3.5 font-bold text-slate-900">{h.quiz_title}</td>
                        <td className="px-5 py-3.5 font-bold text-slate-800">{h.score}/{h.total_questions}</td>
                        <td className="px-5 py-3.5 font-black text-indigo-600">{h.percentage}%</td>
                        <td className="px-5 py-3.5">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            Number(h.percentage) >= 40 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                          }`}>
                            {Number(h.percentage) >= 40 ? '✓ Passed' : '✗ Failed'}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-slate-400 text-[11px]">
                          {new Date(h.submitted_at).toLocaleDateString()}
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handlePrintGradeSlip(h)}
                              className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
                              title="Print Official Grade Slip"
                            >
                              <Printer className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleOpenBreakdown(h.id)}
                              className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-[11px] font-bold transition flex items-center gap-1"
                            >
                              <Eye className="w-3 h-3" />
                              <span>Review</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 3: ACHIEVEMENT BADGES (CSE TECHNICAL HONORS)               */}
      {/* ============================================================== */}
      {activeTab === 'badges' && (
        <div className="space-y-6">
          {/* Header & Overall Progress Bar */}
          <div className="bg-white/85 backdrop-blur-xl p-6 rounded-3xl border border-slate-200/80 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200/60 mb-1.5">
                  <Award className="w-3.5 h-3.5 text-amber-600" />
                  <span>Academic Honors Program</span>
                </div>
                <h2 className="text-lg font-black text-slate-900 tracking-tight">
                  CSE Department Honors & Badges ({unlockedBadgesCount}/{badges.length})
                </h2>
                <p className="text-xs text-slate-500">
                  Earn formal technical honors verified automatically from your examination submission records
                </p>
              </div>

              <div className="text-left sm:text-right">
                <span className="text-2xl font-black text-indigo-600">
                  {Math.round((unlockedBadgesCount / badges.length) * 100)}%
                </span>
                <p className="text-[11px] font-semibold text-slate-400">Total Unlocked ({unlockedBadgesCount} / {badges.length})</p>
              </div>
            </div>

            {/* Visual Progress Bar */}
            <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-gradient-to-r from-indigo-500 via-sky-500 to-emerald-500 h-2.5 rounded-full transition-all duration-700"
                style={{ width: `${(unlockedBadgesCount / badges.length) * 100}%` }}
              ></div>
            </div>

            {/* How It Works Explainer Callout */}
            <div className="p-3.5 bg-slate-50/80 rounded-2xl border border-slate-200/60 text-xs text-slate-600 flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-slate-800">How Achievement Badges Work:</p>
                <p className="text-[11px] text-slate-500 leading-relaxed mt-0.5">
                  Badges are computed live from your official MySQL examination submissions. Once you submit a quiz meeting the required score or module criteria, the corresponding department badge unlocks instantly and reflects on your student profile.
                </p>
              </div>
            </div>
          </div>

          {/* Badges Grid (6 Cards) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {badges.map((b) => (
              <div
                key={b.id}
                className={`p-5 rounded-3xl border transition-all flex flex-col justify-between space-y-4 ${
                  b.unlocked
                    ? 'bg-white/90 backdrop-blur-xl border-emerald-200/80 shadow-sm hover:shadow-md'
                    : 'bg-white/60 backdrop-blur-md border-slate-200/60 hover:border-slate-300'
                }`}
              >
                <div className="space-y-3">
                  {/* Top Bar: Icon & Status Pill */}
                  <div className="flex items-start justify-between">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-xs border ${
                      b.unlocked ? 'bg-emerald-50 border-emerald-100' : 'bg-slate-100 border-slate-200/80'
                    }`}>
                      {b.icon}
                    </div>

                    {b.unlocked ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs">
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span>Unlocked</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-500 border border-slate-200">
                        <Lock className="w-3 h-3 text-slate-400" />
                        <span>Locked</span>
                      </span>
                    )}
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h3 className="text-sm font-black text-slate-900">{b.title}</h3>
                    <p className="text-xs text-slate-500 mt-0.5 leading-snug">{b.desc}</p>
                  </div>

                  {/* Requirement & How to Unlock */}
                  <div className="p-3 rounded-2xl bg-slate-50/80 border border-slate-100 space-y-1.5 text-[11px]">
                    <div>
                      <span className="font-bold text-slate-700 block text-[10px] uppercase tracking-wider">Requirement:</span>
                      <p className="text-slate-600 leading-snug">{b.requirement}</p>
                    </div>

                    <div className="pt-1.5 border-t border-slate-200/60">
                      <span className="font-bold text-indigo-700 block text-[10px] uppercase tracking-wider">How to Unlock:</span>
                      <p className="text-slate-500 leading-snug">{b.howToUnlock}</p>
                    </div>
                  </div>
                </div>

                {/* Live Progress & Action CTA */}
                <div className="pt-3 border-t border-slate-100 space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-slate-400">Your Progress:</span>
                    <span className={`font-bold ${b.unlocked ? 'text-emerald-600' : 'text-slate-600'}`}>
                      {b.progress}
                    </span>
                  </div>

                  {!b.unlocked && (
                    <Link
                      to={b.targetLink}
                      className="w-full py-2 px-3 bg-slate-900 hover:bg-indigo-600 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-2xs"
                    >
                      <span>{b.targetLabel}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: DETAILED ANSWER BREAKDOWN                               */}
      {/* ============================================================== */}
      {selectedAttempt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-black text-slate-900">
                  {selectedAttempt.quiz_title} — Examination Breakdown
                </h3>
                <p className="text-xs text-slate-400">
                  Score: {selectedAttempt.score}/{selectedAttempt.total_questions} ({selectedAttempt.percentage}%)
                </p>
              </div>
              <button
                onClick={() => setSelectedAttempt(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              {selectedAttempt.answers?.map((ans, i) => {
                const isCorrect = ans.is_correct === 1 || ans.is_correct === true;
                return (
                  <div
                    key={ans.id || i}
                    className={`p-4 rounded-xl border text-xs space-y-2 ${
                      isCorrect ? 'bg-emerald-50/50 border-emerald-200' : 'bg-rose-50/50 border-rose-200'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-bold text-slate-900">
                        {i + 1}. {ans.question}
                      </p>
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full flex-shrink-0 ${
                        isCorrect ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {isCorrect ? '✓ Correct' : '✗ Incorrect'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                      <div>
                        <span className="text-slate-400">Your Answer: </span>
                        <strong className={isCorrect ? 'text-emerald-700' : 'text-rose-700'}>
                          Option {ans.selected_answer}
                        </strong>
                      </div>
                      <div>
                        <span className="text-slate-400">Correct Answer: </span>
                        <strong className="text-emerald-700">
                          Option {ans.correct_answer}
                        </strong>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
              <button
                onClick={() => handlePrintGradeSlip(selectedAttempt)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Grade Slip</span>
              </button>
              <button
                onClick={() => setSelectedAttempt(null)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
