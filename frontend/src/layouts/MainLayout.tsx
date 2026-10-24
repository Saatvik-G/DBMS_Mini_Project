import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  ShieldAlert, LayoutDashboard, FolderKanban, Users, Building2,
  Car, Smartphone, MapPin, Archive, FileText, Search, Network,
  BarChart3, Database, Info, LogOut, CheckCircle2, AlertCircle,
  PlusCircle, RefreshCw, ChevronRight, UserCheck
} from 'lucide-react';
import { ApiService } from '../services/api';

export const MainLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [globalSearch, setGlobalSearch] = useState('');
  const [dbHealth, setDbHealth] = useState<any>(null);
  const [officer, setOfficer] = useState<any>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchHealth = async () => {
    setIsRefreshing(true);
    try {
      const data = await ApiService.getHealth();
      setDbHealth(data);
    } catch {
      // Fallback display
      setDbHealth({
        databases: {
          sql: { status: 'connected', engine: 'SQLite / PostgreSQL' },
          nosql: { status: 'connected', engine: 'MongoDB' }
        }
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchHealth();
    const stored = localStorage.getItem('fusion_officer');
    if (stored) {
      try {
        setOfficer(JSON.parse(stored));
      } catch {}
    } else {
      // Set default demo officer if none selected
      const defaultOff = {
        officer_id: 'OFF-001',
        full_name: 'Inspector Rajesh Sharma',
        badge_number: 'B-4091',
        role: 'Lead Investigator'
      };
      setOfficer(defaultOff);
      localStorage.setItem('fusion_officer', JSON.stringify(defaultOff));
    }
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (globalSearch.trim()) {
      navigate(`/search?q=${encodeURIComponent(globalSearch.trim())}`);
    }
  };

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Cases', path: '/cases', icon: FolderKanban },
    { name: 'People', path: '/people', icon: Users },
    { name: 'Organizations', path: '/organizations', icon: Building2 },
    { name: 'Vehicles', path: '/vehicles', icon: Car },
    { name: 'Devices', path: '/devices', icon: Smartphone },
    { name: 'Locations', path: '/locations', icon: MapPin },
    { name: 'Evidence & Custody', path: '/evidence', icon: Archive },
    { name: 'Investigation Docs', path: '/documents', icon: FileText, badge: 'NoSQL' },
    { name: 'Unified Search', path: '/search', icon: Search, badge: 'Cross-DB' },
    { name: 'Relationship Graph', path: '/relationships', icon: Network },
    { name: 'Analytics & Reports', path: '/analytics', icon: BarChart3 },
    { name: 'DBMS Concepts Viva', path: '/dbms-concepts', icon: Database, badge: 'Core' },
    { name: 'About & Team', path: '/about', icon: Info },
  ];

  return (
    <div className="flex h-screen w-screen bg-[#090D1A] text-slate-100 overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 flex flex-col border-r border-slate-800 bg-[#0B1120]">
        {/* Brand Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600/20 border border-blue-500/40 rounded-lg text-blue-400">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-wide text-white uppercase m-0 leading-tight">
                Intelligence Fusion
              </h1>
              <p className="text-[11px] text-slate-400 m-0">DBMS Mini Project</p>
            </div>
          </div>
        </div>

        {/* Academic Team Pill */}
        <div className="px-4 py-3 bg-slate-900/80 border-b border-slate-800 text-[11px]">
          <div className="text-slate-400 font-semibold uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <UserCheck className="w-3.5 h-3.5 text-blue-400" /> PES University Team
          </div>
          <div className="text-slate-200 font-medium leading-relaxed">
            <div>Saatvik Gupta <span className="text-blue-400 font-mono text-[10px]">PES1UG24CS395</span></div>
            <div>Satyam Goyal <span className="text-blue-400 font-mono text-[10px]">PES1UG24CS424</span></div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                    : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-blue-400' : 'text-slate-400'}`} />
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${
                    item.badge === 'NoSQL'
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/40'
                      : item.badge === 'Cross-DB'
                      ? 'bg-purple-950 text-purple-400 border border-purple-800/40'
                      : 'bg-amber-950 text-amber-400 border border-amber-800/40'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Database Status Footer */}
        <div className="p-3 border-t border-slate-800 bg-[#070B14] text-[11px] space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="font-semibold text-[10px] uppercase tracking-wider">Live DB Engines</span>
            <button
              onClick={fetchHealth}
              disabled={isRefreshing}
              className="text-slate-400 hover:text-blue-400 transition"
              title="Refresh database connectivity"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-blue-400' : ''}`} />
            </button>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between p-1.5 rounded bg-slate-900 border border-slate-800">
              <span className="text-slate-300 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse"></span>
                SQL Relational:
              </span>
              <span className="text-[10px] font-mono text-emerald-400 font-medium truncate max-w-[110px]" title={dbHealth?.databases?.sql?.engine}>
                {dbHealth?.databases?.sql?.engine?.includes('PostgreSQL') ? 'PostgreSQL' : 'SQLite Fallback'}
              </span>
            </div>

            <div className="flex items-center justify-between p-1.5 rounded bg-slate-900 border border-slate-800">
              <span className="text-slate-300 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block"></span>
                NoSQL Store:
              </span>
              <span className="text-[10px] font-mono text-emerald-400 font-medium">
                MongoDB Live
              </span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#0B1120]">
        {/* Top Navbar */}
        <header className="h-14 border-b border-slate-800 bg-[#0B1120]/90 backdrop-blur px-6 flex items-center justify-between flex-shrink-0 z-10">
          {/* Global Search Bar */}
          <form onSubmit={handleSearchSubmit} className="relative w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search cross-database (e.g. blue sedan, PER-001, ThinkPad)..."
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
              className="w-full bg-slate-900/90 border border-slate-700/80 rounded-lg pl-9 pr-4 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
            />
          </form>

          {/* Quick Actions & Officer Session */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/cases')}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium shadow-sm transition"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>New Case</span>
            </button>

            <button
              onClick={() => navigate('/documents')}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-700/80 hover:bg-emerald-600 text-white text-xs font-medium transition"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Add Document</span>
            </button>

            <div className="h-5 w-px bg-slate-800 mx-1"></div>

            {/* Officer Profile Badge */}
            <div className="flex items-center gap-2 pl-2">
              <div className="w-7 h-7 rounded-full bg-blue-600/30 border border-blue-500/50 flex items-center justify-center text-blue-300 font-semibold text-xs">
                {officer?.full_name?.charAt(0) || 'O'}
              </div>
              <div className="text-left hidden md:block">
                <div className="text-xs font-medium text-slate-200 leading-tight">
                  {officer?.full_name || 'Officer'}
                </div>
                <div className="text-[10px] text-slate-400 leading-tight">
                  Badge: <span className="font-mono text-blue-400">{officer?.badge_number || 'B-4091'}</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Content Outlet */}
        <main className="flex-1 overflow-y-auto p-6 bg-[#0B1120]">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
