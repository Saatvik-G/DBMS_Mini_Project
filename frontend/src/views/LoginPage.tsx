import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { ApiService } from '../services/api';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [badgeNumber, setBadgeNumber] = useState('CID-001');
  const [password, setPassword] = useState('Admin@123');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
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
        'Authentication failed. Please check your badge identifier and password.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeLogin(badgeNumber, password);
  };

  const quickFill = (badge: string, pwd: string) => {
    setBadgeNumber(badge);
    setPassword(pwd);
    setError(null);
    executeLogin(badge, pwd);
  };

  return (
    <div className="min-h-screen w-screen bg-[#070A0F] text-slate-100 flex flex-col justify-between items-center p-4 sm:p-6 antialiased">
      {/* Top Header */}
      <div className="w-full max-w-sm pt-4 flex items-center justify-between text-xs text-slate-400 border-b border-[#1E2638] pb-2">
        <span className="flex items-center gap-1.5 text-slate-300 font-medium">
          <Shield className="w-3.5 h-3.5 text-blue-400" />
          Case Management System
        </span>
        <span className="text-slate-500 font-mono">UE24CS395</span>
      </div>

      {/* Centered Sign-In Panel */}
      <div className="w-full max-w-sm my-auto space-y-4">
        <div>
          <h1 className="text-lg font-semibold text-slate-100">Sign In</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Authenticate with your badge identifier or username
          </p>
        </div>

        <div className="bg-[#0B0F17] border border-[#1E2638] rounded p-5 space-y-4">
          {error && (
            <div className="p-2.5 rounded bg-red-950/40 border border-red-800/60 text-red-300 text-xs flex items-start gap-2">
              <AlertCircle className="w-3.5 h-3.5 text-red-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1 leading-normal">{error}</div>
            </div>
          )}

          <form onSubmit={handleFormSubmit} className="space-y-3">
            <div>
              <label className="block text-xs text-slate-300 mb-1">
                Badge identifier or username
              </label>
              <input
                type="text"
                required
                placeholder="e.g. CID-001 or admin"
                value={badgeNumber}
                onChange={(e) => setBadgeNumber(e.target.value)}
                className="w-full bg-[#0E1420] border border-[#1E2638] rounded px-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 font-mono focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors duration-150"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-300 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#0E1420] border border-[#1E2638] rounded pl-3 pr-8 py-1.5 text-xs text-slate-100 placeholder-slate-500 font-mono focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors duration-150"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-1.5 px-3 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-medium transition-colors duration-150 flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>

          {/* Low-key Demo Account Notice */}
          <div className="pt-3 border-t border-[#1E2638] space-y-1.5 text-xs text-slate-400">
            <div className="text-[11px] text-slate-400">Evaluation accounts (click to sign in):</div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => quickFill('CID-001', 'Admin@123')}
                disabled={loading}
                className="flex-1 p-2 bg-[#0E1420] hover:bg-[#141C2B] border border-[#1E2638] rounded text-left transition-colors duration-150"
              >
                <div className="font-medium text-slate-200 text-xs">Administrator</div>
                <div className="font-mono text-[10px] text-slate-400">CID-001 / Admin@123</div>
              </button>

              <button
                type="button"
                onClick={() => quickFill('CID-002', 'Investigator@123')}
                disabled={loading}
                className="flex-1 p-2 bg-[#0E1420] hover:bg-[#141C2B] border border-[#1E2638] rounded text-left transition-colors duration-150"
              >
                <div className="font-medium text-slate-200 text-xs">Investigator</div>
                <div className="font-mono text-[10px] text-slate-400">CID-002 / Investigator@123</div>
              </button>
            </div>
          </div>
        </div>

        {/* Academic Attribution */}
        <div className="text-center text-xs text-slate-500 space-y-0.5">
          <div>PES University • Department of CSE</div>
          <div>Saatvik Gupta (PES1UG24CS395) & Satyam Goyal (PES1UG24CS424)</div>
        </div>
      </div>

      {/* Footer */}
      <div className="w-full max-w-sm pb-2 text-center text-[11px] text-slate-600 font-mono">
        Relational Core (PostgreSQL) + Document Store (MongoDB)
      </div>
    </div>
  );
};
