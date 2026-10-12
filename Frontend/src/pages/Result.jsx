import React, { useState } from 'react';
import { useLocation, Link, Navigate } from 'react-router-dom';
import {
  CheckCircle2,
  XCircle,
  Award,
  ArrowLeft,
  RotateCcw,
  LayoutDashboard,
  Trophy,
  Clock,
  Sparkles,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import Button from '../components/Button';

const Result = () => {
  const location = useLocation();
  const result = location.state?.result;
  const timeTakenFormatted = location.state?.timeTakenFormatted || '12:45';
  const passingScore = location.state?.passingScore || 40;

  const [showAnswers, setShowAnswers] = useState(false);

  if (!result) {
    return <Navigate to="/quizzes" replace />;
  }

  const correctCount = result.score;
  const totalCount = result.total_questions;
  const wrongCount = Math.max(0, totalCount - correctCount);
  const percentage = Math.round(Number(result.percentage));
  const isPassed = percentage >= passingScore;

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-16">
      {/* Result Card (Matching Figma Screen 8) */}
      <div className="glass-panel rounded-3xl border border-slate-200 p-8 sm:p-12 text-center shadow-xl space-y-6">
        <div className="text-5xl animate-bounce">🎉</div>

        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Quiz Completed!</h1>
          <p className="text-slate-500 font-semibold text-base mt-1">{result.quiz_title}</p>
        </div>

        {/* Big Score Card */}
        <div className="p-8 rounded-3xl bg-gradient-to-b from-indigo-50/70 to-white border border-indigo-100 max-w-sm mx-auto shadow-inner space-y-2">
          <p className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">
            {correctCount} <span className="text-slate-400 text-3xl font-bold">/ {totalCount}</span>
          </p>
          <p
            className={`text-3xl font-black ${
              isPassed ? 'text-emerald-600' : 'text-rose-600'
            }`}
          >
            {percentage}%
          </p>
          <span
            className={`inline-block px-4 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
              isPassed
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                : 'bg-rose-100 text-rose-800 border border-rose-200'
            }`}
          >
            {isPassed ? 'Passed' : 'Failed'}
          </span>
        </div>

        {/* 3 Metric Stats (Correct, Wrong, Time Taken - Matching Figma Screen 8) */}
        <div className="grid grid-cols-3 gap-4 max-w-md mx-auto pt-2">
          <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-100 text-center">
            <p className="text-xs font-bold text-emerald-700 uppercase">Correct</p>
            <p className="text-2xl font-black text-emerald-800 mt-0.5">{correctCount}</p>
          </div>

          <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-100 text-center">
            <p className="text-xs font-bold text-rose-700 uppercase">Wrong</p>
            <p className="text-2xl font-black text-rose-800 mt-0.5">{wrongCount}</p>
          </div>

          <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 text-center">
            <p className="text-xs font-bold text-indigo-700 uppercase">Time Taken</p>
            <p className="text-2xl font-black text-indigo-800 mt-0.5">{timeTakenFormatted}</p>
          </div>
        </div>

        {/* Performance Progress Bar */}
        <div className="max-w-md mx-auto space-y-1.5 pt-2">
          <div className="flex justify-between text-xs font-bold text-slate-600">
            <span>Performance</span>
            <span>{percentage}%</span>
          </div>
          <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden border border-slate-200">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                isPassed ? 'bg-emerald-500' : 'bg-rose-500'
              }`}
              style={{ width: `${percentage}%` }}
            ></div>
          </div>
        </div>

        {/* Action Buttons (Matching Figma Screen 8) */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
          <Button
            onClick={() => setShowAnswers((prev) => !prev)}
            variant="outline"
            className="flex items-center gap-2 font-bold px-5 py-2.5"
          >
            <span>{showAnswers ? 'Hide Answers' : 'View Answers'}</span>
            {showAnswers ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>

          <Link to={`/quizzes/${result.quiz_id}/attempt`}>
            <Button variant="secondary" className="flex items-center gap-2 font-bold px-5 py-2.5">
              <RotateCcw className="w-4 h-4" />
              <span>Try Again</span>
            </Button>
          </Link>

          <Link to="/dashboard">
            <Button className="flex items-center gap-2 font-bold px-5 py-2.5">
              <LayoutDashboard className="w-4 h-4" />
              <span>Back to Dashboard</span>
            </Button>
          </Link>

          <Link to={`/quizzes/${result.quiz_id}/leaderboard`}>
            <Button className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-5 py-2.5 flex items-center gap-2">
              <Trophy className="w-4 h-4" />
              <span>Leaderboard</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Answer Review Section (Toggled by "View Answers") */}
      {showAnswers && result.breakdown && (
        <div className="glass-panel p-8 rounded-3xl border border-slate-200 shadow-lg space-y-6 animate-in fade-in duration-300">
          <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900">Detailed Question Breakdown</h2>
            <span className="text-xs text-slate-400 font-semibold">{result.breakdown.length} Total Questions</span>
          </div>

          <div className="space-y-4">
            {result.breakdown.map((item, idx) => (
              <div
                key={idx}
                className={`p-5 rounded-2xl border transition ${
                  item.is_correct
                    ? 'border-emerald-200 bg-emerald-50/30'
                    : 'border-rose-200 bg-rose-50/30'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  {item.is_correct ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1 space-y-2">
                    <p className="text-sm sm:text-base font-bold text-slate-900">
                      {idx + 1}. {item.question}
                    </p>

                    <div className="flex flex-wrap gap-4 text-xs font-semibold">
                      <span className="text-slate-600">
                        Your choice:{' '}
                        <strong className={item.is_correct ? 'text-emerald-700' : 'text-rose-700'}>
                          Option {item.selected_answer || 'None'}
                        </strong>
                      </span>
                      {!item.is_correct && (
                        <span className="text-slate-600">
                          Correct key:{' '}
                          <strong className="text-emerald-700">Option {item.correct_answer}</strong>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Result;
