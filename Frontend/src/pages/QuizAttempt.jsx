import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import Button from '../components/Button';
import {
  Clock,
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Send,
  HelpCircle,
  X
} from 'lucide-react';

const QuizAttempt = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  // Live Timer (in seconds)
  const [timeLeft, setTimeLeft] = useState(0);
  const [startTime] = useState(Date.now());

  useEffect(() => {
    const fetchQuizAndQuestions = async () => {
      try {
        const [qDetailsRes, qQuestionsRes] = await Promise.all([
          api.get(`/quizzes/${id}`),
          api.get(`/quizzes/${id}/questions`)
        ]);

        if (qDetailsRes.data.success) {
          setQuiz(qDetailsRes.data.quiz);
          setTimeLeft((qDetailsRes.data.quiz.duration || 15) * 60);
        }

        if (qQuestionsRes.data.success) {
          setQuestions(qQuestionsRes.data.questions);
        }
      } catch (err) {
        setError('Failed to load quiz. Please make sure you are logged in.');
      } finally {
        setLoading(false);
      }
    };

    fetchQuizAndQuestions();
  }, [id]);

  // Live countdown timer
  useEffect(() => {
    if (timeLeft <= 0 || loading) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitQuiz(); // Auto submit
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, loading]);

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleSelectOption = (questionId, option) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: option
    }));
  };

  const handleClearOption = (questionId) => {
    setSelectedAnswers((prev) => {
      const updated = { ...prev };
      delete updated[questionId];
      return updated;
    });
  };

  const handleSubmitQuiz = async () => {
    setSubmitting(true);
    setShowSubmitModal(false);
    setError('');

    const timeSpentSeconds = Math.round((Date.now() - startTime) / 1000);

    try {
      const payload = {
        answers: Object.entries(selectedAnswers).map(([questionId, selectedOption]) => ({
          questionId: Number(questionId),
          selectedOption
        }))
      };

      const res = await api.post(`/quizzes/${id}/submit`, payload);
      if (res.data.success) {
        navigate('/result', {
          state: {
            result: res.data.result,
            timeTakenFormatted: formatTimer(timeSpentSeconds),
            passingScore: quiz?.passing_percentage || 40
          }
        });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error submitting quiz.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-16 text-center text-slate-400">Loading exam environment...</div>;

  if (quiz?.is_attempted) {
    return (
      <div className="max-w-md mx-auto text-center p-8 sm:p-10 glass-panel rounded-3xl border border-amber-300 bg-amber-50/50 mt-12 shadow-xl space-y-5 animate-in fade-in zoom-in-95">
        <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto shadow-inner">
          <AlertCircle className="w-8 h-8" />
        </div>
        <div>
          <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 bg-amber-200/70 px-3 py-1 rounded-full">
            Single-Attempt Policy Enforced
          </span>
          <h2 className="text-2xl font-black text-slate-900 mt-2">Exam Already Completed</h2>
          <p className="text-xs text-slate-600 mt-2 leading-relaxed">
            As per college exam regulations, each student is strictly permitted <strong>only 1 attempt</strong> for this assessment. Your previous submission has already been officially recorded.
          </p>
        </div>

        {quiz?.my_attempt && (
          <div className="p-4 rounded-2xl bg-white border border-amber-200 text-left space-y-2">
            <div className="flex justify-between text-xs text-slate-600">
              <span>Your Recorded Score:</span>
              <strong className="text-indigo-700 text-sm">
                {quiz.my_attempt.score} / {quiz.my_attempt.total_marks} ({quiz.my_attempt.percentage}%)
              </strong>
            </div>
            <div className="flex justify-between text-xs text-slate-600">
              <span>Result Status:</span>
              <span
                className={`font-bold px-2 py-0.5 rounded-full text-[10px] ${
                  quiz.my_attempt.status === 'Passed'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-rose-100 text-rose-800'
                }`}
              >
                {quiz.my_attempt.status}
              </span>
            </div>
            {quiz.my_attempt.created_at && (
              <div className="flex justify-between text-xs text-slate-500">
                <span>Completed At:</span>
                <span>{new Date(quiz.my_attempt.created_at).toLocaleString()}</span>
              </div>
            )}
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <button
            onClick={() => navigate('/quizzes')}
            className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition"
          >
            All Quizzes
          </button>
          <button
            onClick={() => navigate('/dashboard')}
            className="flex-1 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-md"
          >
            My Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="max-w-md mx-auto text-center p-12 glass-panel rounded-3xl border border-slate-200 mt-12">
        <HelpCircle className="w-12 h-12 text-slate-400 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-slate-900">No Questions Found</h2>
        <p className="text-xs text-slate-500 mt-1">This quiz does not have any questions authored yet.</p>
        <button
          onClick={() => navigate('/quizzes')}
          className="mt-6 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold"
        >
          Return to Quizzes
        </button>
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  const isAnswered = (qId) => Boolean(selectedAnswers[qId]);
  const answeredTotal = Object.keys(selectedAnswers).length;

  return (
    <div className="space-y-6 pb-16">
      {/* Top Header Bar (Matching Figma Screen 7) */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-200 shadow-md flex items-center justify-between sticky top-16 z-30">
        <div>
          <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700">
            {quiz?.category || 'Assessment'}
          </span>
          <h1 className="text-lg font-black text-slate-900 mt-0.5">{quiz?.title}</h1>
        </div>

        <div className="flex items-center gap-3">
          <div
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-mono text-sm font-bold border transition ${
              timeLeft < 180
                ? 'bg-rose-50 border-rose-300 text-rose-600 animate-pulse'
                : 'bg-indigo-50 border-indigo-200 text-indigo-700'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>⏱ {formatTimer(timeLeft)}</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Grid: Left Question, Right Question Palette */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Question Area (8 Columns) */}
        <div className="lg:col-span-8 glass-panel p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-lg space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <span className="text-xs font-black uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
              Question {currentIndex + 1} of {questions.length}
            </span>
            {isAnswered(currentQ.id) && (
              <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> Answered
              </span>
            )}
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 leading-snug">
            {currentQ.question}
          </h2>

          {/* Options (Radio Style) */}
          <div className="space-y-3.5 pt-2">
            {[
              { key: 'A', text: currentQ.option_a },
              { key: 'B', text: currentQ.option_b },
              { key: 'C', text: currentQ.option_c },
              { key: 'D', text: currentQ.option_d }
            ].map((opt) => {
              const isSelected = selectedAnswers[currentQ.id] === opt.key;
              return (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => handleSelectOption(currentQ.id, opt.key)}
                  className={`w-full text-left p-4 rounded-2xl border text-sm transition flex items-center gap-4 ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/80 text-indigo-950 font-bold ring-2 ring-indigo-500/20 shadow-sm'
                      : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold transition ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-600 text-white'
                        : 'border-slate-300 text-slate-500'
                    }`}
                  >
                    {opt.key}
                  </span>
                  <span className="flex-1 text-sm sm:text-base">{opt.text}</span>
                </button>
              );
            })}
          </div>

          {/* Bottom Navigation Buttons: Previous, Clear, Next */}
          <div className="flex items-center justify-between pt-6 border-t border-slate-100">
            <Button
              variant="outline"
              onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
              disabled={currentIndex === 0}
              className="flex items-center gap-1.5 px-4"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </Button>

            {selectedAnswers[currentQ.id] && (
              <button
                type="button"
                onClick={() => handleClearOption(currentQ.id)}
                className="text-xs text-slate-400 hover:text-rose-600 underline"
              >
                Clear Selection
              </button>
            )}

            {currentIndex < questions.length - 1 ? (
              <Button
                onClick={() => setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1))}
                className="flex items-center gap-1.5 px-5"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                onClick={() => setShowSubmitModal(true)}
                className="bg-emerald-600 hover:bg-emerald-700 px-5 flex items-center gap-1.5"
              >
                <span>Submit Quiz</span>
                <Send className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Right Column: Question Palette (4 Columns - Matching Figma Screen 7) */}
        <div className="lg:col-span-4 glass-panel p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-lg space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900 text-base">Question Palette</h3>
            <p className="text-xs text-slate-400 mt-0.5">Jump directly to any question</p>
          </div>

          {/* Palette Grid */}
          <div className="grid grid-cols-5 gap-2.5">
            {questions.map((q, idx) => {
              const answered = isAnswered(q.id);
              const isCurrent = idx === currentIndex;

              let btnStyle = 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200';
              if (answered) {
                btnStyle = 'bg-emerald-500 text-white font-bold border-emerald-600 shadow-sm';
              }
              if (isCurrent) {
                btnStyle += ' ring-2 ring-amber-400 ring-offset-2 font-black';
              }

              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-10 rounded-xl text-xs font-bold border transition flex items-center justify-center ${btnStyle}`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>

          {/* Palette Legend */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2 text-xs font-medium text-slate-600">
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-full bg-emerald-500"></span>
              <span>🟢 Answered ({answeredTotal})</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-full bg-slate-200 border border-slate-300"></span>
              <span>⚪ Not Answered ({questions.length - answeredTotal})</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-full bg-amber-400"></span>
              <span>🟡 Current Question (#{currentIndex + 1})</span>
            </div>
          </div>

          {/* Submit Action */}
          <Button
            onClick={() => setShowSubmitModal(true)}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 font-bold shadow-md flex items-center justify-center gap-2"
          >
            <Send className="w-4 h-4" />
            <span>Submit Quiz</span>
          </Button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
              <Send className="w-6 h-6" />
            </div>

            <div className="text-center">
              <h3 className="text-xl font-bold text-slate-900">Submit Assessment?</h3>
              <p className="text-xs text-slate-500 mt-1">
                You have answered <strong>{answeredTotal}</strong> out of <strong>{questions.length}</strong> questions.
              </p>
              {answeredTotal < questions.length && (
                <p className="text-xs text-amber-600 font-medium mt-2 bg-amber-50 p-2 rounded-xl border border-amber-200">
                  ⚠️ You still have {questions.length - answeredTotal} unanswered questions!
                </p>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => setShowSubmitModal(false)}
                className="w-1/2"
              >
                Keep Testing
              </Button>
              <Button
                onClick={handleSubmitQuiz}
                disabled={submitting}
                className="w-1/2 bg-emerald-600 hover:bg-emerald-700 font-bold"
              >
                {submitting ? 'Grading...' : 'Yes, Submit'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizAttempt;
