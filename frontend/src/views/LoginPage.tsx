import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock, ArrowRight, AlertCircle, Eye, EyeOff, KeyRound, CheckCircle2 } from 'lucide-react';
import { ApiService } from '../services/api';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [badgeNumber, setBadgeNumber] = useState('CID-001');
  const [password, setPassword] = useState('Admin@123');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // If already authenticated, redirect to workspace
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
        'Authentication failed. Please check the badge identifier or password.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeLogin(badgeNumber, password);
  };

  const quickFill = (badge: string, pwd: string, autoSubmit: boolean = false) => {
    setBadgeNumber(badge);
    setPassword(pwd);
    setError(null);
    if (autoSubmit) {
      executeLogin(badge, pwd);
    }
  };

  return (
    <div className="min-h-screen w-screen bg-[#0e1219] text-slate-100 flex flex-col justify-between items-center p-4 sm:p-6 antialiased">
      {/* Top Academic Department Header */}
      <div className="w-full max-w-md pt-3 flex items-center justify-between text-[11px] text-slate-400 font-mono border-b border-[#1f2737] pb-2">
        <span className="flex items-center gap-1.5 text-slate-300">
          <Shield className="w-3.5 h-3.5 text-blue-400" />
          CENTRAL INVESTIGATION DIVISION
        </span>
        <span className="text-slate-400">PES UNIVERSITY</span>
      </div>

      {/* Main Authentication Card */}
      <div className="w-full max-w-md my-auto space-y-4">
        {/* Title block */}
        <div className="text-center space-y-1">
          <h1 className="text-xl font-bold tracking-tight text-white m-0">
            Intelligence Fusion Platform
          </h1>
          <p className="text-xs text-slate-400 m-0">
            Digital Forensics & Multi-Agency Investigation Case Management
          </p>
        </div>

        {/* Form Container */}
        <div className="rounded-lg bg-[#141923] border border-[#232c3d] p-6 space-y-4 shadow-lg">
          <div className="flex items-center justify-between pb-3 border-b border-[#212a3b]">
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-200 m-0">
                Officer Sign In
              </h2>
              <p className="text-[11px] text-slate-400 m-0 mt-0.5">
                Role-based access via badge ID or username
              </p>
            </div>
            <span className="text-[10px] font-mono text-slate-300 bg-[#1c2331] border border-[#2b364c] px-2 py-0.5 rounded">
              JWT • PBKDF2
            </span>
          </div>

          {error && (
            <div className="p-3 rounded bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1 leading-relaxed">{error}</div>
            </div>
          )}

          <form onSubmit={handleFormSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Badge Identifier or Username
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="e.g. CID-001 or admin"
                  value={badgeNumber}
                  onChange={(e) => setBadgeNumber(e.target.value)}
                  className="w-full bg-[#0d1118] border border-[#232c3d] rounded px-3 py-2 text-xs text-slate-100 placeholder-slate-500 font-mono focus:outline-none focus:border-blue-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#0d1118] border border-[#232c3d] rounded pl-3 pr-9 py-2 text-xs text-slate-100 placeholder-slate-500 font-mono focus:outline-none focus:border-blue-500 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 px-3 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-medium transition flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Verifying credentials...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Workstation</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demonstration Evaluation Fillers */}
          <div className="pt-3 border-t border-[#212a3b] space-y-2">
            <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
              <span className="font-semibold uppercase tracking-wider text-[10px]">Evaluation Demo Accounts</span>
              <span className="text-slate-500">1-Click Sign In</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-left">
              {/* Administrator Quick Card */}
              <button
                type="button"
                onClick={() => quickFill('CID-001', 'Admin@123', true)}
                disabled={loading}
                className="p-2.5 rounded bg-[#0d1118] hover:bg-[#18202d] border border-[#232c3d] hover:border-blue-500 text-left transition"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-semibold text-slate-200">Administrator</span>
                  <span className="text-[9px] font-mono px-1 rounded bg-amber-950/60 text-amber-300 border border-amber-800/40">ADMIN</span>
                </div>
                <div className="text-[10px] font-mono text-slate-400 truncate">Badge: CID-001</div>
                <div className="text-[10px] font-mono text-slate-500">Pwd: Admin@123</div>
              </button>

              {/* Lead Inspector Quick Card */}
              <button
                type="button"
                onClick={() => quickFill('CID-002', 'Investigator@123', true)}
                disabled={loading}
                className="p-2.5 rounded bg-[#0d1118] hover:bg-[#18202d] border border-[#232c3d] hover:border-blue-500 text-left transition"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-semibold text-slate-200">Lead Inspector</span>
                  <span className="text-[9px] font-mono px-1 rounded bg-blue-950/60 text-blue-300 border border-blue-800/40">INVESTIGATOR</span>
                </div>
                <div className="text-[10px] font-mono text-slate-400 truncate">Badge: CID-002</div>
                <div className="text-[10px] font-mono text-slate-500">Pwd: Investigator@123</div>
              </button>
            </div>
          </div>
        </div>

        {/* Academic Project Attribution Box */}
        <div className="p-3 rounded bg-[#141923]/90 border border-[#212a3b] text-center space-y-1">
          <div className="text-[10px] uppercase font-mono text-slate-400 tracking-wider font-semibold">
            DBMS Mini Project • UE24CS395
          </div>
          <div className="text-xs text-slate-300 flex items-center justify-center gap-2">
            <span>Saatvik Gupta <span className="text-slate-500 font-mono text-[11px]">PES1UG24CS395</span></span>
            <span className="text-slate-600">•</span>
            <span>Satyam Goyal <span className="text-slate-500 font-mono text-[11px]">PES1UG24CS424</span></span>
          </div>
        </div>
      </div>

      {/* Bottom Legal/Academic Footer */}
      <div className="w-full max-w-md pb-2 text-center text-[10px] font-mono text-slate-500">
        Department of Computer Science & Engineering • PES University
      </div>
    </div>
  );
};
