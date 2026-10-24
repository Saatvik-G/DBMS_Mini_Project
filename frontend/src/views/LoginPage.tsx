import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldAlert, UserCheck, Lock, Key, ArrowRight, CheckCircle2,
  AlertCircle, ShieldCheck
} from 'lucide-react';
import { ApiService } from '../services/api';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [badgeNumber, setBadgeNumber] = useState('B-4091');
  const [password, setPassword] = useState('password123');
  const [demoAccounts, setDemoAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDemoAccounts();
  }, []);

  const loadDemoAccounts = async () => {
    try {
      const data = await ApiService.getDemoAccounts();
      setDemoAccounts(data);
    } catch {}
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await ApiService.login(badgeNumber, password);
      localStorage.setItem('fusion_auth_token', res.access_token);
      localStorage.setItem('fusion_officer', JSON.stringify(res.officer));
      navigate('/');
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectDemo = (account: any) => {
    setBadgeNumber(account.badge_number);
    setPassword(account.demo_password);
  };

  return (
    <div className="min-h-screen w-screen bg-[#070B14] flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-2xl bg-blue-600/20 border border-blue-500/40 text-blue-400 mb-2">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight m-0">
            Intelligence Fusion Platform
          </h1>
          <p className="text-xs text-slate-400">
            College DBMS Mini Project • PES University
          </p>

          {/* Academic Team Attribution */}
          <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-slate-300">
            <div className="font-semibold text-blue-400 mb-0.5">Project Team Members:</div>
            <div>Saatvik Gupta (PES1UG24CS395)</div>
            <div>Satyam Goyal (PES1UG24CS424)</div>
          </div>
        </div>

        {/* Login Card */}
        <div className="p-6 rounded-2xl bg-[#0F172A] border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider m-0">
              Officer Portal Authentication
            </h2>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
              BCRYPT + JWT
            </span>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-950/50 border border-red-800/80 text-red-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-3.5">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Officer Badge Identifier
              </label>
              <div className="relative">
                <ShieldCheck className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="e.g. B-4091"
                  value={badgeNumber}
                  onChange={(e) => setBadgeNumber(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : 'Sign In to Investigation Dashboard'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Accounts Clicker */}
          {demoAccounts.length > 0 && (
            <div className="pt-3 border-t border-slate-800 space-y-2">
              <span className="text-[11px] text-slate-400 font-semibold block">
                Quick Demo Switcher (Click to populate credentials):
              </span>
              <div className="space-y-1">
                {demoAccounts.map((acc) => (
                  <button
                    key={acc.officer_id}
                    type="button"
                    onClick={() => handleSelectDemo(acc)}
                    className="w-full p-2 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-left transition flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-semibold text-slate-200">{acc.full_name}</span>
                      <span className="text-[10px] text-slate-400 ml-2 font-mono">({acc.badge_number})</span>
                    </div>
                    <span className="text-[10px] text-blue-400 font-mono">{acc.role}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="text-center">
          <button
            onClick={() => navigate('/')}
            className="text-xs text-slate-400 hover:text-white transition"
          >
            ← Skip Login and Access Dashboard Directly (Demo Mode)
          </button>
        </div>
      </div>
    </div>
  );
};
