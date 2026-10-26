import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield, Lock, ArrowRight, ShieldCheck, UserCheck, AlertCircle,
  Eye, EyeOff, KeyRound, Building, CheckCircle2, ChevronRight
} from 'lucide-react';
import { ApiService } from '../services/api';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [badgeNumber, setBadgeNumber] = useState('CID-001');
  const [password, setPassword] = useState('Admin@123');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // If already authenticated, redirect straight to workstation overview
    const token = localStorage.getItem('fusion_auth_token');
    const stored = localStorage.getItem('fusion_officer');
    if (token && stored) {
      navigate('/');
    }
  }, []);

  const executeLogin = async (badge: string, pwd: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await ApiService.login(badge.trim(), pwd.trim());
      localStorage.setItem('fusion_auth_token', res.access_token);
      localStorage.setItem('fusion_officer', JSON.stringify(res.officer));
      navigate('/');
    } catch (err: any) {
      setError(
        err?.response?.data?.detail ||
        'Authentication failed. Please check credentials or use the 1-click demo access below.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeLogin(badgeNumber, password);
  };

  return (
    <div className="min-h-screen w-screen bg-[#070B14] text-slate-100 flex flex-col justify-between items-center p-4 sm:p-6 antialiased selection:bg-blue-600 selection:text-white">
      {/* Top Subtle Department Header */}
      <div className="w-full max-w-md pt-4 flex items-center justify-between text-[11px] text-slate-500 font-mono">
        <span className="flex items-center gap-1.5 text-slate-400">
          <Shield className="w-3.5 h-3.5 text-blue-400" />
          CENTRAL INVESTIGATION DIVISION
        </span>
        <span className="text-slate-500">PES UNIVERSITY</span>
      </div>

      {/* Main Authentication Container */}
      <div className="w-full max-w-md my-auto space-y-5">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-2xl bg-gradient-to-b from-blue-600/20 to-blue-900/10 border border-blue-500/30 text-blue-400 shadow-lg shadow-blue-950/40 mb-1">
            <ShieldCheck className="w-9 h-9" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white m-0">
              Intelligence Fusion Platform
            </h1>
            <p className="text-xs text-slate-400 mt-1 font-normal">
              Centralized Forensic & Investigation Management System
            </p>
          </div>
        </div>

        {/* Login Card */}
        <div className="rounded-2xl bg-[#0D1322] border border-slate-800/90 shadow-2xl shadow-black/80 p-6 sm:p-7 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h2 className="text-sm font-semibold text-slate-200 m-0">
                Officer Sign In
              </h2>
              <p className="text-[11px] text-slate-400 m-0">
                Authenticate with your badge ID or select a demo role
              </p>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/70 border border-emerald-800/50 px-2 py-0.5 rounded-full font-medium">
              ACID • JWT
            </span>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1 leading-relaxed">
                {error}
              </div>
            </div>
          )}

          {/* Manual Input Form */}
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Badge Number or Username
              </label>
              <div className="relative">
                <Shield className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="e.g. CID-001 or admin"
                  value={badgeNumber}
                  onChange={(e) => setBadgeNumber(e.target.value)}
                  className="w-full bg-[#080D18] border border-slate-700/80 rounded-xl pl-9 pr-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 font-mono focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#080D18] border border-slate-700/80 rounded-xl pl-9 pr-10 py-2 text-xs text-slate-100 placeholder-slate-500 font-mono focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Workstation</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick One-Click Demo Access Section */}
          <div className="pt-4 border-t border-slate-800/80 space-y-2.5">
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span className="font-semibold uppercase tracking-wider text-[10px] text-slate-400">
                1-Click Demonstration Access
              </span>
              <span className="text-[10px] text-slate-500 font-mono">Academic Evaluation</span>
            </div>

            <div className="grid grid-cols-1 gap-2">
              {/* Admin 1-Click Card */}
              <button
                type="button"
                onClick={() => executeLogin('CID-001', 'Admin@123')}
                disabled={loading}
                className="w-full p-3 rounded-xl bg-[#080D18] hover:bg-[#121B2F] border border-slate-800 hover:border-blue-500/50 text-left transition-all flex items-center justify-between group"
              >
                <div className="min-w-0 pr-2">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-semibold text-slate-200 group-hover:text-blue-300 transition">
                      Administrator (Rajesh Sharma)
                    </span>
                    <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-950/60 text-amber-300 border border-amber-800/40 font-bold">
                      ADMIN
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    Badge: <span className="text-slate-300">CID-001</span> • Full authority & user control
                  </div>
                </div>
                <div className="flex items-center gap-1 text-[11px] font-medium text-blue-400 group-hover:translate-x-0.5 transition-transform flex-shrink-0">
                  <span>Sign In</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </button>

              {/* Investigator 1-Click Card */}
              <button
                type="button"
                onClick={() => executeLogin('CID-002', 'Investigator@123')}
                disabled={loading}
                className="w-full p-3 rounded-xl bg-[#080D18] hover:bg-[#121B2F] border border-slate-800 hover:border-blue-500/50 text-left transition-all flex items-center justify-between group"
              >
                <div className="min-w-0 pr-2">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-semibold text-slate-200 group-hover:text-blue-300 transition">
                      Lead Inspector (Ananya Roy)
                    </span>
                    <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-blue-950/60 text-blue-300 border border-blue-800/40 font-bold">
                      INVESTIGATOR
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    Badge: <span className="text-slate-300">CID-002</span> • Case dossiers & evidence custody
                  </div>
                </div>
                <div className="flex items-center gap-1 text-[11px] font-medium text-blue-400 group-hover:translate-x-0.5 transition-transform flex-shrink-0">
                  <span>Sign In</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Academic Team Attribution Pill */}
        <div className="p-3 rounded-xl bg-[#0D1322]/80 border border-slate-800/80 text-center space-y-1">
          <div className="text-[10px] uppercase tracking-wider font-semibold text-slate-500 font-mono">
            DBMS Mini Project • UE24CS395
          </div>
          <div className="text-xs text-slate-300 flex items-center justify-center gap-3">
            <span>Saatvik Gupta <span className="text-slate-500 font-mono text-[11px]">PES1UG24CS395</span></span>
            <span className="text-slate-600">•</span>
            <span>Satyam Goyal <span className="text-slate-500 font-mono text-[11px]">PES1UG24CS424</span></span>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="w-full max-w-md pb-2 text-center text-[10px] font-mono text-slate-500">
        Database Management Systems • PES University (2026–2027)
      </div>
    </div>
  );
};
