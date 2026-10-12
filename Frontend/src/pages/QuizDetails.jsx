import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import {
  BookOpen,
  Target,
  HelpCircle,
  Clock,
  Trophy,
  CheckCircle,
  AlertTriangle,
  ArrowLeft,
  Play,
  CheckCircle2,
  Lock
} from 'lucide-react';
import Button from '../components/Button';

const QuizDetails = () => {
  const { id } = useParams();
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const res = await api.get(`/quizzes/${id}`);
        if (res.data.success) {
          setQuiz(res.data.quiz);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [id]);

  if (loading) return <div className="p-16 text-center text-slate-400">Loading quiz overview...</div>;
  if (!quiz) return <div className="p-16 text-center text-rose-500 font-bold">Quiz not found.</div>;

  const isAttempted = Boolean(quiz.is_attempted);
  const myAttempt = quiz.my_attempt;

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-16">
      <Link to="/quizzes" className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-800 transition">
        <ArrowLeft className="w-4 h-4" /> Back to Quizzes
      </Link>

      <div className="glass-panel rounded-3xl border border-slate-200 p-8 sm:p-10 shadow-xl space-y-8">
        {/* Title & Badge */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-bold px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full border border-indigo-200">
              {quiz.category || 'Web Development'}
            </span>
            <span className="text-xs font-bold px-3 py-1 bg-amber-50 text-amber-700 rounded-full border border-amber-200">
              {quiz.difficulty || 'Beginner'}
            </span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">{quiz.title}</h1>
          <p className="text-slate-600 text-sm mt-2 leading-relaxed">
            {quiz.description || 'Test your proficiency and fundamentals in this assessment.'}
          </p>
        </div>

        {/* 1-Time Exam Lock Banner */}
        {isAttempted && (
          <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 space-y-2">
            <div className="flex items-center gap-2 font-black text-sm text-emerald-800">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>Assessment Completed (Attempt Locked)</span>
            </div>
            <p className="text-xs text-emerald-700 leading-relaxed">
              You scored <strong>{myAttempt?.score} / {myAttempt?.total_questions} ({myAttempt?.percentage}%)</strong> on this exam. Under college policy, each candidate is granted strictly <strong>1 attempt</strong>.
            </p>
            <div className="pt-2">
              <Link to="/dashboard">
                <Button className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 shadow-sm">
                  View Full Scorecard & Answer Key
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* 6 Key Spec Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-5 rounded-2xl bg-slate-50 border border-slate-200/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-white text-indigo-600 shadow-sm border border-slate-200">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-400 uppercase">Category</p>
              <p className="text-sm font-bold text-slate-900">{quiz.category || 'General'}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-white text-amber-500 shadow-sm border border-slate-200">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-400 uppercase">Difficulty</p>
              <p className="text-sm font-bold text-slate-900">{quiz.difficulty || 'Beginner'}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-white text-sky-500 shadow-sm border border-slate-200">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-400 uppercase">Questions</p>
              <p className="text-sm font-bold text-slate-900">{quiz.total_questions || 10} Qs</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-white text-rose-500 shadow-sm border border-slate-200">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-400 uppercase">Duration</p>
              <p className="text-sm font-bold text-slate-900">{quiz.duration || 15} Mins</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-white text-purple-500 shadow-sm border border-slate-200">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-400 uppercase">Total Marks</p>
              <p className="text-sm font-bold text-slate-900">{quiz.total_questions || 10} Pts</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-white text-emerald-500 shadow-sm border border-slate-200">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-400 uppercase">Passing Score</p>
              <p className="text-sm font-bold text-emerald-600">{quiz.passing_percentage || 40}%</p>
            </div>
          </div>
        </div>

        {/* Instructions Box */}
        <div className="p-6 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-3">
          <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>Official Examination Instructions:</span>
          </div>
          <ul className="text-xs text-amber-950 space-y-1.5 list-disc list-inside">
            <li>Strict policy: <strong>1 Attempt Allowed</strong> per student.</li>
            <li>Each question has exactly one correct choice.</li>
            <li>Use the Right Side Question Palette to jump between questions.</li>
            <li>Do not refresh or leave the examination tab.</li>
            <li>The test will automatically submit when the live timer runs out.</li>
          </ul>
        </div>

        {/* Start Quiz Action */}
        {!isAttempted ? (
          <Link to={`/quizzes/${id}/attempt`} className="block">
            <Button className="w-full py-4 text-base font-bold shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2.5">
              <Play className="w-5 h-5 fill-current" />
              <span>Start Assessment Now</span>
            </Button>
          </Link>
        ) : (
          <div className="p-4 bg-slate-100 rounded-2xl text-center text-slate-500 font-bold text-sm flex items-center justify-center gap-2">
            <Lock className="w-4 h-4" />
            <span>Examination Completed — Further attempts disabled</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizDetails;
