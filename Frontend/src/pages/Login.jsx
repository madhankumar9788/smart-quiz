import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Mail, Lock, LogIn, AlertCircle, Sparkles, Shield, User, ArrowRight } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const cleanEmail = email.trim().toLowerCase();
      const cleanPassword = password.trim();
      const res = await api.post('/auth/login', { email: cleanEmail, password: cleanPassword });
      if (res.data.success) {
        login(res.data.token, res.data.user);
        if (res.data.user.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/quizzes');
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoFill = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError('');
  };

  return (
    <div className="relative -mx-6 -my-6 min-h-[calc(100vh-64px)] flex items-center justify-center p-4 sm:p-6 overflow-hidden">
      {/* Modern Game Cyber Arena Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-700 scale-105"
        style={{ backgroundImage: "url('/game_bg.jpg')" }}
      ></div>

      {/* Cyber Glassmorphism Dark Vignette Overlays */}
      <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-md pointer-events-none"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-indigo-950/60 pointer-events-none"></div>

      {/* Ambient Neon Glow Spheres */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none animate-pulse"></div>
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none animate-pulse"></div>

      {/* Modern Glassmorphic Login Card */}
      <div className="relative z-10 w-full max-w-md">
        <div className="rounded-3xl bg-slate-900/85 backdrop-blur-2xl border border-indigo-500/30 p-7 sm:p-8 shadow-[0_0_50px_-10px_rgba(99,102,241,0.35)] space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-[11px] font-bold uppercase tracking-wider font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              <span>CSE Technical Examination Portal</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Sign In to Account
            </h1>
            <p className="text-xs text-slate-400">
              Access your single-attempt quiz modules and live results
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="p-3.5 bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs rounded-2xl flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
              <span className="font-medium">{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5 font-mono">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-indigo-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-950/80 border border-indigo-500/30 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition"
                  placeholder="student@smartquiz.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5 font-mono">
                Password *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-indigo-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-950/80 border border-indigo-500/30 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 disabled:opacity-50 text-white font-black rounded-xl text-xs uppercase tracking-wider shadow-lg shadow-indigo-600/30 hover:shadow-cyan-500/30 transition flex items-center justify-center gap-2 group"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Portal</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Logins (Admin & Student Only — Teacher Role Removed) */}
          <div className="pt-4 border-t border-indigo-500/20 space-y-2.5">
            <p className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest font-black text-center">
              Quick Demo Accounts (One-Click)
            </p>

            <div className="grid grid-cols-2 gap-2.5 text-xs">
              {/* Admin Button */}
              <button
                type="button"
                onClick={() => handleDemoFill('admin@smartquiz.com', 'admin123')}
                className="p-3 rounded-2xl bg-slate-950/80 border border-amber-500/30 hover:border-amber-400 hover:bg-amber-500/10 transition text-left group"
              >
                <div className="flex items-center gap-2 mb-1">
                  <Shield className="w-3.5 h-3.5 text-amber-400" />
                  <span className="font-bold text-xs text-amber-300">Admin</span>
                </div>
                <span className="text-[10px] text-slate-400 truncate block font-mono">admin@smartquiz.com</span>
                <span className="text-[9px] text-amber-400/80 block font-mono mt-0.5">pass: admin123</span>
              </button>

              {/* Student Button */}
              <button
                type="button"
                onClick={() => handleDemoFill('student@smartquiz.com', 'student123')}
                className="p-3 rounded-2xl bg-slate-950/80 border border-emerald-500/30 hover:border-emerald-400 hover:bg-emerald-500/10 transition text-left group"
              >
                <div className="flex items-center gap-2 mb-1">
                  <User className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="font-bold text-xs text-emerald-300">Student</span>
                </div>
                <span className="text-[10px] text-slate-400 truncate block font-mono">student@smartquiz.com</span>
                <span className="text-[9px] text-emerald-400/80 block font-mono mt-0.5">pass: student123</span>
              </button>
            </div>
          </div>

          {/* Protocol Badge */}
          <div className="p-3 rounded-xl bg-slate-950/60 border border-indigo-500/20 text-center">
            <p className="text-[10px] text-slate-400 font-mono">
              Academic Assessment System • Strictly 1 Attempt per Module
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
