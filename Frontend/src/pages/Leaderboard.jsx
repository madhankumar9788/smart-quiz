import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import {
  Trophy,
  ArrowLeft,
  Medal,
  Crown,
  Sparkles,
  Calendar,
  BookOpen,
  Search,
  RefreshCw,
  Award,
  Flame,
  CheckCircle2,
  GraduationCap,
  Layers,
  ChevronRight,
  TrendingUp,
  Clock,
  ShieldCheck
} from 'lucide-react';

const Leaderboard = () => {
  const [searchParams] = useSearchParams();
  const initialQuizId = searchParams.get('quiz') || 'overall';

  const [activeTab, setActiveTab] = useState(initialQuizId === 'overall' ? 'overall' : initialQuizId);
  const [quizzes, setQuizzes] = useState([]);
  const [overallLeaderboard, setOverallLeaderboard] = useState([]);
  const [quizLeaderboard, setQuizLeaderboard] = useState([]);
  const [currentQuizTitle, setCurrentQuizTitle] = useState('');
  const [monthlyCycle, setMonthlyCycle] = useState({
    month: 'October 2026',
    resetsInDays: 23,
    description: 'Monthly Departmental Standings — Evaluated across HTML5, CSS3 & JavaScript modules'
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Load quizzes list
  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const res = await api.get('/quizzes');
        if (res.data.success) {
          setQuizzes(res.data.quizzes);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchQuizzes();
  }, []);

  // Fetch overall leaderboard
  const fetchOverallLeaderboard = async () => {
    setLoading(true);
    try {
      const res = await api.get('/submissions/overall-leaderboard');
      if (res.data.success) {
        setOverallLeaderboard(res.data.leaderboard);
        if (res.data.cycle) {
          setMonthlyCycle(res.data.cycle);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch individual quiz leaderboard
  const fetchQuizLeaderboard = async (qId) => {
    setLoading(true);
    try {
      const res = await api.get(`/quizzes/${qId}/leaderboard`);
      if (res.data.success) {
        setQuizLeaderboard(res.data.leaderboard);
        setCurrentQuizTitle(res.data.quiz_title);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'overall') {
      fetchOverallLeaderboard();
    } else {
      fetchQuizLeaderboard(activeTab);
    }
  }, [activeTab]);

  const displayedList = activeTab === 'overall' ? overallLeaderboard : quizLeaderboard;

  // Filter by search query
  const filteredList = displayedList.filter((item) => {
    const name = item.student_name || '';
    const email = item.student_email || '';
    return name.toLowerCase().includes(searchQuery.toLowerCase()) ||
           email.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const topThree = filteredList.slice(0, 3);
  const remaining = filteredList.slice(3);

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      {/* ============================================================== */}
      {/* 1. TOP HEADER & MONTHLY CYCLE BANNER (GLASSIC)                */}
      {/* ============================================================== */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white p-6 sm:p-8 border border-slate-800 shadow-xl">
        <div className="absolute top-0 right-0 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-indigo-200 text-xs font-semibold">
              <GraduationCap className="w-3.5 h-3.5 text-amber-400" />
              <span>CSE Department • Academic Cycle {monthlyCycle.month}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
              Overall Department Leaderboard
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl font-normal leading-relaxed">
              Official monthly standings across all technical modules (HTML5, CSS3 & JavaScript). Scores reset every month to acknowledge consistent academic excellence.
            </p>
          </div>

          {/* Monthly Cycle Card */}
          <div className="bg-white/10 backdrop-blur-xl border border-white/15 p-4 rounded-2xl w-full md:w-auto min-w-[240px] space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-300">
              <span className="flex items-center gap-1.5 font-bold">
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                <span>Monthly Cycle</span>
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold">
                Active
              </span>
            </div>

            <div className="text-lg font-black text-white">{monthlyCycle.month}</div>

            <div className="flex items-center gap-2 pt-1 border-t border-white/10 text-[11px] text-slate-300">
              <Clock className="w-3.5 h-3.5 text-amber-300" />
              <span>Resets in: <strong className="text-amber-300 font-mono">{monthlyCycle.resetsInDays} days</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. TAB CONTROLS & SEARCH BAR (GLASSIC)                        */}
      {/* ============================================================== */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Module Switcher Tabs */}
        <div className="flex items-center p-1 bg-slate-200/80 rounded-2xl backdrop-blur-md border border-slate-300/60 overflow-x-auto">
          <button
            onClick={() => setActiveTab('overall')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'overall'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Trophy className="w-3.5 h-3.5 text-amber-500" />
            <span>Overall Monthly</span>
          </button>

          {quizzes.map((q) => (
            <button
              key={q.id}
              onClick={() => setActiveTab(String(q.id))}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                String(activeTab) === String(q.id)
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>{q.title.split(' ')[0]}</span>
            </button>
          ))}
        </div>

        {/* Search & Refresh */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search candidate name..."
              className="w-full pl-8 pr-3 py-2 bg-white/90 backdrop-blur-md text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-2xs"
            />
          </div>

          <button
            onClick={() => activeTab === 'overall' ? fetchOverallLeaderboard() : fetchQuizLeaderboard(activeTab)}
            className="p-2.5 bg-white/90 hover:bg-white text-slate-600 hover:text-indigo-600 rounded-xl border border-slate-200 transition shadow-2xs"
            title="Refresh Standings"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-indigo-500' : ''}`} />
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 3. PODIUM (TOP 3 PERFORMERS WITH GLASSIC CARDS)               */}
      {/* ============================================================== */}
      {topThree.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end pt-4">
          {/* Rank 2 (Silver) */}
          {topThree[1] && (
            <div className="order-2 md:order-1 bg-white/80 backdrop-blur-xl p-5 rounded-2xl border border-slate-200/80 shadow-md relative overflow-hidden flex flex-col items-center text-center">
              <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 text-xs font-black flex items-center justify-center mb-2">
                #2
              </div>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-slate-300 via-slate-100 to-slate-200 text-slate-700 font-black text-xl flex items-center justify-center shadow-md mb-3 border border-slate-200">
                {(topThree[1].student_name || 'S').charAt(0).toUpperCase()}
              </div>
              <h3 className="text-sm font-extrabold text-slate-900">{topThree[1].student_name}</h3>
              <p className="text-[11px] text-slate-400 truncate max-w-full">{topThree[1].student_email}</p>
              
              <div className="mt-4 pt-3 border-t border-slate-100 w-full flex items-center justify-between text-xs">
                <span className="text-slate-400 font-semibold">Average</span>
                <span className="font-black text-slate-700">{topThree[1].avg_percentage || topThree[1].percentage}%</span>
              </div>
              <span className="mt-2 text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                🥈 Silver Medal
              </span>
            </div>
          )}

          {/* Rank 1 (Gold / Champion) */}
          {topThree[0] && (
            <div className="order-1 md:order-2 bg-gradient-to-b from-amber-500/10 via-white/90 to-white/90 backdrop-blur-xl p-6 rounded-3xl border-2 border-amber-300/80 shadow-xl relative overflow-hidden flex flex-col items-center text-center transform -translate-y-2">
              <div className="absolute top-2 right-2">
                <Crown className="w-5 h-5 text-amber-500 animate-bounce" />
              </div>
              <div className="w-9 h-9 rounded-full bg-amber-500 text-white text-xs font-black flex items-center justify-center mb-2 shadow-md">
                #1
              </div>
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-400 via-yellow-300 to-amber-500 text-amber-950 font-black text-2xl flex items-center justify-center shadow-lg shadow-amber-500/25 mb-3 border-2 border-white">
                {(topThree[0].student_name || 'S').charAt(0).toUpperCase()}
              </div>
              <h3 className="text-base font-black text-slate-900">{topThree[0].student_name}</h3>
              <p className="text-xs text-slate-500 truncate max-w-full">{topThree[0].student_email}</p>

              <div className="mt-4 pt-3 border-t border-amber-100 w-full flex items-center justify-between text-xs">
                <span className="text-amber-800 font-bold">Top Score</span>
                <span className="font-black text-amber-600 text-base">{topThree[0].avg_percentage || topThree[0].percentage}%</span>
              </div>
              <span className="mt-2 text-[10px] font-black text-amber-800 bg-amber-100 px-3 py-1 rounded-full shadow-2xs">
                🥇 Department Topper (Month of {monthlyCycle.month})
              </span>
            </div>
          )}

          {/* Rank 3 (Bronze) */}
          {topThree[2] && (
            <div className="order-3 bg-white/80 backdrop-blur-xl p-5 rounded-2xl border border-slate-200/80 shadow-md relative overflow-hidden flex flex-col items-center text-center">
              <div className="w-8 h-8 rounded-full bg-amber-800/15 text-amber-800 text-xs font-black flex items-center justify-center mb-2">
                #3
              </div>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-700 via-amber-600 to-amber-800 text-white font-black text-xl flex items-center justify-center shadow-md mb-3 border border-amber-600/30">
                {(topThree[2].student_name || 'S').charAt(0).toUpperCase()}
              </div>
              <h3 className="text-sm font-extrabold text-slate-900">{topThree[2].student_name}</h3>
              <p className="text-[11px] text-slate-400 truncate max-w-full">{topThree[2].student_email}</p>

              <div className="mt-4 pt-3 border-t border-slate-100 w-full flex items-center justify-between text-xs">
                <span className="text-slate-400 font-semibold">Average</span>
                <span className="font-black text-slate-700">{topThree[2].avg_percentage || topThree[2].percentage}%</span>
              </div>
              <span className="mt-2 text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                🥉 Bronze Medal
              </span>
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* 4. FULL LEADERBOARD TABLE (GLASSIC DESIGN)                    */}
      {/* ============================================================== */}
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
          <div>
            <h2 className="text-sm font-black text-slate-900">
              {activeTab === 'overall' ? 'Cumulative Monthly Rankings' : `${currentQuizTitle} Leaderboard`}
            </h2>
            <p className="text-[11px] text-slate-400">
              Department of Computer Science & Engineering • Reg 2026
            </p>
          </div>
          <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg">
            {filteredList.length} Ranked Students
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center space-y-2">
            <RefreshCw className="w-6 h-6 text-indigo-500 animate-spin mx-auto" />
            <p className="text-xs text-slate-400">Fetching latest departmental examination scores...</p>
          </div>
        ) : filteredList.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <Trophy className="w-8 h-8 mx-auto mb-2 opacity-30 text-slate-300" />
            <p className="text-xs font-medium">No candidates match your search query or have attempted this assessment.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-[11px] uppercase font-bold text-slate-400 border-b border-slate-100">
                <tr>
                  <th className="px-5 py-3.5">Rank</th>
                  <th className="px-5 py-3.5">Candidate</th>
                  {activeTab === 'overall' && <th className="px-5 py-3.5">Modules Completed</th>}
                  <th className="px-5 py-3.5">Score</th>
                  <th className="px-5 py-3.5">Performance %</th>
                  <th className="px-5 py-3.5">Department Standing</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredList.map((st, idx) => {
                  const pct = Number(st.avg_percentage || st.percentage || 0);
                  const isTop3 = idx < 3;
                  return (
                    <tr
                      key={st.student_id || st.id || idx}
                      className={`hover:bg-slate-50/70 transition ${
                        idx === 0 ? 'bg-amber-50/30' : ''
                      }`}
                    >
                      <td className="px-5 py-3.5 font-bold">
                        <span
                          className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black ${
                            idx === 0
                              ? 'bg-amber-500 text-white shadow-xs'
                              : idx === 1
                              ? 'bg-slate-300 text-slate-700'
                              : idx === 2
                              ? 'bg-amber-700 text-white'
                              : 'text-slate-400'
                          }`}
                        >
                          #{idx + 1}
                        </span>
                      </td>

                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-700 font-bold text-xs flex items-center justify-center flex-shrink-0">
                            {(st.student_name || 'S').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                              <span>{st.student_name}</span>
                              {idx === 0 && <Crown className="w-3.5 h-3.5 text-amber-500 inline" />}
                            </p>
                            <p className="text-[10px] text-slate-400">{st.student_email}</p>
                          </div>
                        </div>
                      </td>

                      {activeTab === 'overall' && (
                        <td className="px-5 py-3.5">
                          <span className="font-bold text-slate-700 text-xs">
                            {st.quizzes_attempted || 1} / 3 Modules
                          </span>
                        </td>
                      )}

                      <td className="px-5 py-3.5 font-bold text-slate-800 text-xs">
                        {st.total_score || st.score} / {st.total_questions}
                      </td>

                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                pct >= 80 ? 'bg-emerald-500' : pct >= 50 ? 'bg-indigo-500' : 'bg-rose-500'
                              }`}
                              style={{ width: `${Math.min(pct, 100)}%` }}
                            ></div>
                          </div>
                          <span className="font-bold text-xs text-indigo-600 whitespace-nowrap">{pct}%</span>
                        </div>
                      </td>

                      <td className="px-5 py-3.5">
                        {pct >= 80 ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 flex items-center gap-1 w-max">
                            <Sparkles className="w-3 h-3 text-emerald-600" /> High Distinction
                          </span>
                        ) : pct >= 50 ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 flex items-center gap-1 w-max">
                            <CheckCircle2 className="w-3 h-3 text-indigo-600" /> Passed
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 flex items-center gap-1 w-max">
                            Candidate
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;
