import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, HelpCircle, ArrowRight, CheckCircle2, Lock } from 'lucide-react';

const QuizCard = ({ quiz }) => {
  const isAttempted = Boolean(quiz.is_attempted);
  const myScore = quiz.my_attempt ? Math.round(Number(quiz.my_attempt.percentage)) : null;

  return (
    <div
      className={`glass-panel rounded-2xl border p-6 shadow-sm transition-all duration-300 flex flex-col justify-between hover:-translate-y-1 group ${
        isAttempted ? 'border-emerald-200/90 bg-emerald-50/20' : 'border-slate-200/90'
      }`}
    >
      <div>
        {/* Top Badges */}
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-3 py-0.5 bg-indigo-50 text-indigo-700 rounded-full border border-indigo-200/60">
              {quiz.category || 'General'}
            </span>
            <span className="text-xs font-bold px-2.5 py-0.5 bg-amber-50 text-amber-700 rounded-full border border-amber-200/60">
              {quiz.difficulty || 'Beginner'}
            </span>
          </div>

          <span className="flex items-center text-xs text-slate-500 font-semibold gap-1 bg-slate-50 px-2.5 py-0.5 rounded-full border border-slate-100">
            <Clock className="w-3.5 h-3.5 text-indigo-500" />
            {quiz.duration || 15}m
          </span>
        </div>

        {/* Title & Description */}
        <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition mb-1.5">
          {quiz.title}
        </h3>
        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-4">
          {quiz.description || 'Comprehensive assessment to test subject mastery.'}
        </p>

        {/* Attempt Notice (1-Time Rule) */}
        {isAttempted && (
          <div className="mb-4 p-2.5 bg-emerald-50 rounded-xl border border-emerald-200/70 flex items-center justify-between text-xs">
            <span className="font-bold text-emerald-800 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Exam Completed</span>
            </span>
            <span className="font-black text-emerald-700 text-sm">{myScore}%</span>
          </div>
        )}
      </div>

      <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
        <span className="flex items-center text-xs font-medium text-slate-500 gap-1.5">
          <HelpCircle className="w-4 h-4 text-slate-400" />
          <span>{quiz.total_questions || 10} Questions</span>
        </span>

        {isAttempted ? (
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-100 hover:bg-emerald-200 px-3.5 py-2 rounded-xl transition shadow-xs"
          >
            <span>View Scorecard</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        ) : (
          <Link
            to={`/quizzes/${quiz.id}`}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3.5 py-2 rounded-xl transition shadow-xs"
          >
            <span>Start Exam</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition" />
          </Link>
        )}
      </div>
    </div>
  );
};

export default QuizCard;
