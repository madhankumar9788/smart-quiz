import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  User,
  LogOut,
  ShieldCheck,
  LayoutDashboard,
  Trophy,
  Award
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Ensure default clean light theme
  useEffect(() => {
    document.documentElement.classList.remove('dark');
    localStorage.removeItem('smartquiz_theme');
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="glass-panel border-b border-slate-200/80 px-4 sm:px-6 py-3.5 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand Logo */}
        <Link to={user?.role === 'student' ? '/dashboard' : '/'} className="flex items-center gap-2.5 font-black text-xl text-indigo-600 hover:text-indigo-700 tracking-tight">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white flex items-center justify-center shadow-md shadow-indigo-200">
            <BookOpen className="w-5 h-5" />
          </div>
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-700 to-indigo-600">
            SmartQuiz
          </span>
        </Link>

        {/* Navigation Links */}
        <div className="flex items-center gap-4 sm:gap-6">
          {/* Quizzes & Leaderboard ONLY visible when logged in */}
          {user && (
            <>
              <Link to="/quizzes" className="text-slate-600 hover:text-indigo-600 font-semibold text-xs sm:text-sm transition flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-indigo-500" />
                <span>Quizzes</span>
              </Link>
              <Link to="/leaderboard" className="text-slate-600 hover:text-indigo-600 font-semibold text-xs sm:text-sm transition flex items-center gap-1.5">
                <Trophy className="w-4 h-4 text-amber-500" />
                <span>Leaderboard</span>
              </Link>
            </>
          )}

          {/* User Profile or Candidate Sign In Button */}
          {user ? (
            <div className="flex items-center gap-3 pl-2 sm:pl-3 border-l border-slate-200">
              {user.role === 'admin' ? (
                <Link
                  to="/admin"
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-800 border border-amber-200 rounded-xl text-xs font-bold hover:bg-amber-100 transition shadow-xs"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                  <span>Admin Panel</span>
                </Link>
              ) : (
                <Link
                  to="/dashboard"
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold hover:bg-indigo-100 transition shadow-xs"
                >
                  <LayoutDashboard className="w-3.5 h-3.5 text-indigo-600" />
                  <span>My Portal</span>
                </Link>
              )}

              <div className="hidden sm:flex flex-col text-right">
                <span className="text-xs font-bold text-slate-800 leading-tight">{user.name}</span>
                <span className="text-[10px] font-semibold text-slate-400 capitalize">{user.role}</span>
              </div>

              <button
                onClick={handleLogout}
                title="Sign Out"
                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-indigo-500/20 transition flex items-center gap-1.5"
              >
                <User className="w-3.5 h-3.5" />
                <span>Candidate Login</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
