import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowRight, Lock, GraduationCap } from 'lucide-react';

const Register = () => {
  return (
    <div className="max-w-lg mx-auto my-12 p-8 rounded-3xl bg-white/90 backdrop-blur-xl border border-slate-200/80 shadow-xl text-center space-y-6">
      <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200/60 flex items-center justify-center mx-auto shadow-sm">
        <ShieldAlert className="w-8 h-8" />
      </div>

      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold uppercase tracking-wider">
          <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />
          <span>CSE Department Academic Policy</span>
        </div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">
          Public Registration Closed
        </h2>
        <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
          In accordance with College Examination Committee regulations, candidate accounts cannot be self-registered. All student profiles and roll numbers are provisioned directly by the Department Administrator.
        </p>
      </div>

      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60 text-left space-y-2 text-xs text-slate-600">
        <div className="flex items-center gap-2 font-bold text-slate-900">
          <Lock className="w-4 h-4 text-indigo-600" />
          <span>Candidate Information</span>
        </div>
        <ul className="list-disc pl-5 space-y-1 text-[11px] text-slate-500">
          <li>Check your registered college email for official assessment credentials.</li>
          <li>Default password format or one-time keys are distributed by your class coordinator.</li>
          <li>For credential issues or reset requests, contact the CSE Examination Cell.</li>
        </ul>
      </div>

      <div className="pt-2">
        <Link
          to="/login"
          className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-500/25 transition flex items-center justify-center gap-2"
        >
          <span>Proceed to Candidate Login</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};

export default Register;
