import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldAlert, Lock, ArrowRight, ShieldCheck, UserCheck, AlertCircle
} from 'lucide-react';
import { ApiService } from '../services/api';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [badgeNumber, setBadgeNumber] = useState('CID-001');
  const [password, setPassword] = useState('Admin@123');
  const [demoAccounts, setDemoAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // If already authenticated, redirect straight to workstation overview
    const token = localStorage.getItem('fusion_auth_token');
    const stored = localStorage.getItem('fusion_officer');
    if (token && stored) {
      navigate('/');
      return;
    }
    loadDemoAccounts();
  }, []);

  const loadDemoAccounts = async () => {
    try {
      const data = await ApiService.getDemoAccounts();
      if (data && data.length > 0) {
        setDemoAccounts(data);
      } else {
        // Fallback default demonstration credentials
        setDemoAccounts([
          {
            badge_number: 'CID-001',
            full_name: 'Administrator Rajesh Sharma',
            role: 'ADMIN',
            department: 'Special Cyber & Intelligence Fusion Command',
            demo_password: 'Admin@123',
            description: 'System Administrator — User management, system audit, policy configuration'
          },
          {
            badge_number: 'CID-002',
            full_name: 'Lead Inspector Ananya Roy',
            role: 'INVESTIGATOR',
            department: 'Major Crimes & Cross-Border Investigations',
            demo_password: 'Investigator@123',
            description: 'Lead Inspector — Case dossier creation, entity linking, evidence custody'
          }
        ]);
      }
    } catch {
      setDemoAccounts([
        {
          badge_number: 'CID-001',
          full_name: 'Administrator Rajesh Sharma',
          role: 'ADMIN',
          department: 'Special Cyber & Intelligence Fusion Command',
          demo_password: 'Admin@123',
          description: 'System Administrator — User management, system audit, policy configuration'
        },
        {
          badge_number: 'CID-002',
          full_name: 'Lead Inspector Ananya Roy',
          role: 'INVESTIGATOR',
          department: 'Major Crimes & Cross-Border Investigations',
          demo_password: 'Investigator@123',
          description: 'Lead Inspector — Case dossier creation, entity linking, evidence custody'
        }
      ]);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await ApiService.login(badgeNumber.trim(), password);
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
    <div className="min-h-screen w-screen bg-[#070A0F] text-[#E2E8F0] flex flex-col justify-center items-center p-4 antialiased">
      <div className="w-full max-w-md space-y-4">
        {/* Brand Header */}
        <div className="text-center space-y-1.5">
          <div className="inline-flex p-2.5 rounded border border-amber-500/40 bg-amber-500/10 text-amber-400 mb-1">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <h1 className="text-xl font-bold text-slate-100 tracking-wide uppercase m-0">
            Intelligence Fusion Platform
          </h1>
          <p className="text-[11px] font-mono text-amber-400/90 uppercase tracking-widest font-semibold m-0">
            SECURITY OPERATIONS WORKSTATION
          </p>

          {/* Academic Team Attribution */}
          <div className="mt-2 p-2 rounded bg-[#0B0F17] border border-[#1E2638] text-[10px] font-mono text-slate-400 flex items-center justify-around">
            <span>Saatvik Gupta (PES1UG24CS395)</span>
            <span>•</span>
            <span>Satyam Goyal (PES1UG24CS424)</span>
          </div>
        </div>

        {/* Login Card */}
        <div className="p-5 rounded bg-[#0B0F17] border border-[#1E2638] shadow-2xl space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#1E2638]">
            <span className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider">
              OFFICER CREDENTIAL VERIFICATION
            </span>
            <span className="text-[9px] font-mono text-emerald-400 bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-800/50">
              PBKDF2 + JWT
            </span>
          </div>

          {error && (
            <div className="p-2.5 rounded bg-red-950/50 border border-red-800/80 text-red-300 text-xs font-mono flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-3">
            <div>
              <label className="block text-[11px] font-mono text-slate-400 mb-1 uppercase">
                Officer Badge Identifier or Username
              </label>
              <div className="relative">
                <ShieldCheck className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="e.g. CID-001, CID-002, admin"
                  value={badgeNumber}
                  onChange={(e) => setBadgeNumber(e.target.value)}
                  className="w-full bg-[#0E1420] border border-[#1E2638] rounded pl-8 pr-3 py-1.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-500/70 focus:ring-1 focus:ring-amber-500/50 font-mono transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-mono text-slate-400 mb-1 uppercase">
                Password
              </label>
              <div className="relative">
                <Lock className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#0E1420] border border-[#1E2638] rounded pl-8 pr-3 py-1.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-500/70 focus:ring-1 focus:ring-amber-500/50 font-mono transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 px-3 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/50 text-amber-300 rounded text-xs font-mono font-bold tracking-wide transition flex items-center justify-center gap-2 disabled:opacity-50 mt-1"
            >
              {loading ? 'Authenticating...' : 'Sign In to Investigation Console'}
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Demonstration Accounts Quick-Selector for Academic Evaluation */}
          {demoAccounts.length > 0 && (
            <div className="pt-3 border-t border-[#1E2638] space-y-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block">
                Academic Evaluation Demonstration Accounts:
              </span>
              <div className="space-y-1.5">
                {demoAccounts.map((acc) => (
                  <button
                    key={acc.officer_id || acc.badge_number}
                    type="button"
                    onClick={() => handleSelectDemo(acc)}
                    className="w-full p-2 rounded bg-[#0E1420] hover:bg-[#131A26] border border-[#161D2B] hover:border-amber-500/40 text-left transition flex items-start justify-between group"
                  >
                    <div className="min-w-0 pr-2">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-slate-200 text-xs">{acc.full_name}</span>
                        <span className="text-[10px] text-amber-400/90 font-mono font-bold">({acc.badge_number})</span>
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono mt-0.5 line-clamp-1">
                        {acc.description}
                      </div>
                    </div>
                    <span
                      className={`text-[9px] font-mono px-1.5 py-0.5 rounded flex-shrink-0 ${
                        acc.role === 'ADMIN'
                          ? 'bg-amber-950/70 text-amber-300 border border-amber-800/40'
                          : 'bg-blue-950/70 text-blue-300 border border-blue-800/40'
                      }`}
                    >
                      {acc.role}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
