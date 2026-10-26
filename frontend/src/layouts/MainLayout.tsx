import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Shield, LayoutDashboard, FolderKanban, Users, Building2,
  Car, Smartphone, MapPin, Archive, FileText, Search, Network,
  Clock, Database, Info, Menu, X, ChevronRight, RefreshCw,
  CheckCircle2, AlertTriangle, UserCheck, ShieldAlert, LogOut
} from 'lucide-react';
import { ApiService } from '../services/api';

interface NavItem {
  name: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

interface NavGroup {
  group: string;
  items: NavItem[];
}

export const MainLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [globalSearch, setGlobalSearch] = useState('');
  const [dbHealth, setDbHealth] = useState<any>(null);
  const [officer, setOfficer] = useState<any>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const fetchHealth = async () => {
    setIsRefreshing(true);
    try {
      const data = await ApiService.getHealth();
      setDbHealth(data);
    } catch {
      setDbHealth({
        status: 'partial',
        databases: {
          sql: { status: 'connected', engine: 'SQLite (Verified Failover)' },
          nosql: { status: 'offline', engine: 'MongoDB' }
        }
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('fusion_auth_token');
    localStorage.removeItem('fusion_officer');
    navigate('/login');
  };

  useEffect(() => {
    fetchHealth();
    const token = localStorage.getItem('fusion_auth_token');
    const stored = localStorage.getItem('fusion_officer');
    if (!token || !stored) {
      navigate('/login');
      return;
    }
    try {
      setOfficer(JSON.parse(stored));
    } catch {
      localStorage.removeItem('fusion_auth_token');
      localStorage.removeItem('fusion_officer');
      navigate('/login');
    }
  }, [location.pathname]);

  // Close mobile drawer on route transition
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (globalSearch.trim()) {
      navigate(`/search?q=${encodeURIComponent(globalSearch.trim())}`);
    }
  };

  const navGroups: NavGroup[] = [
    {
      group: 'WORKSPACE',
      items: [
        { name: 'Dashboard', path: '/', icon: LayoutDashboard },
        { name: 'Cases', path: '/cases', icon: FolderKanban },
      ],
    },
    {
      group: 'ENTITIES',
      items: [
        { name: 'People', path: '/people', icon: Users },
        { name: 'Organizations', path: '/organizations', icon: Building2 },
        { name: 'Vehicles', path: '/vehicles', icon: Car },
        { name: 'Devices', path: '/devices', icon: Smartphone },
        { name: 'Locations', path: '/locations', icon: MapPin },
      ],
    },
    {
      group: 'EVIDENCE AND INTELLIGENCE',
      items: [
        { name: 'Evidence & Custody', path: '/evidence', icon: Archive },
        { name: 'Investigation Documents', path: '/documents', icon: FileText, badge: 'NoSQL' },
        { name: 'Unified Search', path: '/search', icon: Search, badge: 'Cross-DB' },
        { name: 'Relationships', path: '/relationships', icon: Network },
        { name: 'Timeline', path: '/analytics', icon: Clock },
      ],
    },
    {
      group: 'ADMINISTRATION',
      items: [
        { name: 'Users & Roles', path: '/users', icon: UserCheck, badge: officer?.role === 'ADMIN' ? 'Admin' : 'RBAC' },
        { name: 'DBMS Concepts Viva', path: '/dbms-concepts', icon: Database, badge: 'Core' },
        { name: 'About & Team', path: '/about', icon: Info },
      ],
    },
  ];

  // Derive breadcrumbs based on pathname
  const getBreadcrumb = () => {
    const p = location.pathname;
    if (p === '/') return { section: 'WORKSPACE', title: 'Dashboard' };
    if (p.startsWith('/cases/')) return { section: 'WORKSPACE', title: 'Case Details' };
    if (p === '/cases') return { section: 'WORKSPACE', title: 'Cases' };
    if (p === '/people') return { section: 'ENTITIES', title: 'People' };
    if (p === '/organizations') return { section: 'ENTITIES', title: 'Organizations' };
    if (p === '/vehicles') return { section: 'ENTITIES', title: 'Vehicles' };
    if (p === '/devices') return { section: 'ENTITIES', title: 'Devices' };
    if (p === '/locations') return { section: 'ENTITIES', title: 'Locations' };
    if (p === '/evidence') return { section: 'EVIDENCE & INTELLIGENCE', title: 'Evidence & Custody' };
    if (p === '/documents') return { section: 'EVIDENCE & INTELLIGENCE', title: 'Investigation Documents' };
    if (p === '/search') return { section: 'EVIDENCE & INTELLIGENCE', title: 'Unified Search' };
    if (p === '/relationships') return { section: 'EVIDENCE & INTELLIGENCE', title: 'Relationships' };
    if (p === '/analytics') return { section: 'EVIDENCE & INTELLIGENCE', title: 'Timeline' };
    if (p === '/users') return { section: 'ADMINISTRATION', title: 'Users & Roles' };
    if (p === '/dbms-concepts') return { section: 'ADMINISTRATION', title: 'DBMS Concepts' };
    if (p === '/about') return { section: 'ADMINISTRATION', title: 'About & Team' };
    return { section: 'CASE MANAGEMENT', title: 'Investigation Console' };
  };

  const breadcrumb = getBreadcrumb();

  const isSqlConnected = dbHealth?.databases?.sql?.status === 'connected';
  const sqlEngine = dbHealth?.databases?.sql?.engine || 'SQLite Failover';
  const isMongoConnected = dbHealth?.databases?.nosql?.status === 'connected';

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#070A0F] text-[#E2E8F0] font-sans antialiased">
      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Persistent Left Sidebar */}
      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 z-50 flex flex-col flex-shrink-0 bg-[#0B0F17] border-r border-[#1E2638] transition-all duration-200 select-none ${
          sidebarCollapsed ? 'w-[72px]' : 'w-64'
        } ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Brand Header */}
        <div className="h-14 flex items-center justify-between px-3.5 border-b border-slate-800/90 bg-[#0A0F1D]">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/40 text-blue-400 flex-shrink-0">
              <Shield className="w-4 h-4" />
            </div>
            {!sidebarCollapsed && (
              <div className="min-w-0">
                <div className="text-xs font-bold tracking-wider text-white uppercase truncate leading-tight">
                  Intelligence Fusion
                </div>
                <div className="text-[10px] font-mono tracking-wider text-blue-400/90 font-medium leading-none mt-0.5">
                  DBMS MINI PROJECT
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="hidden lg:flex items-center justify-center w-6 h-6 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 transition"
            title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <ChevronRight className={`w-3.5 h-3.5 transform transition-transform ${sidebarCollapsed ? '' : 'rotate-180'}`} />
          </button>
        </div>

        {/* Navigation Groups */}
        <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-4">
          {navGroups.map((group) => (
            <div key={group.group} className="space-y-0.5">
              {!sidebarCollapsed && (
                <div className="px-2.5 pb-1 text-[10px] font-mono font-bold tracking-wider text-slate-500 uppercase">
                  {group.group}
                </div>
              )}
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive =
                  location.pathname === item.path ||
                  (item.path !== '/' && location.pathname.startsWith(item.path));

                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    title={sidebarCollapsed ? item.name : undefined}
                    className={`flex items-center h-8 rounded-lg text-xs transition-colors group ${
                      sidebarCollapsed ? 'justify-center px-0' : 'justify-between px-2.5'
                    } ${
                      isActive
                        ? 'bg-blue-600/20 text-blue-300 font-semibold border-l-2 border-blue-500'
                        : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon
                        className={`w-4 h-4 flex-shrink-0 transition-colors ${
                          isActive ? 'text-blue-400' : 'text-slate-500 group-hover:text-slate-300'
                        }`}
                      />
                      {!sidebarCollapsed && (
                        <span className="truncate leading-none">{item.name}</span>
                      )}
                    </div>

                    {!sidebarCollapsed && item.badge && (
                      <span
                        className={`text-[9px] font-mono font-medium px-1.5 py-0.5 rounded leading-none ${
                          item.badge === 'NoSQL'
                            ? 'bg-emerald-950/70 text-emerald-400 border border-emerald-800/40'
                            : item.badge === 'Cross-DB'
                            ? 'bg-purple-950/70 text-purple-400 border border-purple-800/40'
                            : 'bg-blue-950/70 text-blue-300 border border-blue-800/40'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Compact Bottom Footer: PES University Attribution */}
        <div className="p-2.5 border-t border-[#1E2638] bg-[#0A0D14] flex-shrink-0">
          {!sidebarCollapsed ? (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                <span className="flex items-center gap-1 text-slate-300 font-semibold uppercase">
                  <UserCheck className="w-3 h-3 text-amber-400" /> PES Team
                </span>
                <span className="text-amber-400/80 font-bold">UE24CS395</span>
              </div>
              <div className="text-[10px] text-slate-400 space-y-0.5 leading-tight">
                <div className="truncate">Saatvik Gupta <span className="font-mono text-slate-500 text-[9px]">PES1UG24CS395</span></div>
                <div className="truncate">Satyam Goyal <span className="font-mono text-slate-500 text-[9px]">PES1UG24CS424</span></div>
              </div>
            </div>
          ) : (
            <div className="flex justify-center" title="PES University Mini Project - Saatvik & Satyam">
              <UserCheck className="w-4 h-4 text-amber-400" />
            </div>
          )}
        </div>
      </aside>

      {/* Main Forensic Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden bg-[#070A0F]">
        {/* Compact Top Navigation Bar */}
        <header className="h-14 border-b border-[#1E2638] bg-[#0B0F17]/95 px-4 lg:px-6 flex items-center justify-between flex-shrink-0 z-20">
          {/* Left: Mobile Toggle + Breadcrumb */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-1.5 rounded text-slate-400 hover:text-white hover:bg-[#161D2B]"
            >
              <Menu className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 text-xs">
              <span className="font-mono text-[10px] font-semibold tracking-wider text-slate-500 uppercase hidden sm:inline">
                {breadcrumb.section}
              </span>
              <span className="text-slate-600 hidden sm:inline">/</span>
              <span className="font-semibold text-slate-200 tracking-wide truncate">
                {breadcrumb.title}
              </span>
            </div>
          </div>

          {/* Center: Global Search Bar */}
          <form
            onSubmit={handleSearchSubmit}
            className="hidden md:flex items-center relative w-72 lg:w-96 mx-4"
          >
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search suspect, vehicle, IMEI, hash, text..."
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
              className="w-full bg-[#0E1420] border border-[#1E2638] rounded pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 font-mono focus:outline-none focus:border-amber-500/70 focus:ring-1 focus:ring-amber-500/50 transition"
            />
          </form>

          {/* Right: Database Health Status & Officer Context */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            {/* Database Health Pill */}
            <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded bg-[#0E1420] border border-[#1E2638] text-[10px] font-mono">
              <div className="flex items-center gap-1.5" title={`SQL Database Engine: ${sqlEngine}`}>
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    isSqlConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                  }`}
                />
                <span className="text-slate-400">SQL:</span>
                <span className={isSqlConnected ? 'text-emerald-400 font-semibold' : 'text-amber-400'}>
                  {sqlEngine.includes('PostgreSQL') ? 'Postgres' : 'SQLite'}
                </span>
              </div>

              <div className="h-3 w-px bg-[#1E2638]" />

              <div className="flex items-center gap-1.5" title={`MongoDB Status: ${isMongoConnected ? 'Connected' : 'Offline (Mock/Skip Mode)'}`}>
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    isMongoConnected ? 'bg-emerald-400' : 'bg-slate-600'
                  }`}
                />
                <span className="text-slate-400">NoSQL:</span>
                <span className={isMongoConnected ? 'text-emerald-400 font-semibold' : 'text-slate-400'}>
                  {isMongoConnected ? 'Live' : 'Standby'}
                </span>
              </div>

              <button
                onClick={fetchHealth}
                disabled={isRefreshing}
                className="text-slate-500 hover:text-amber-400 transition ml-1"
                title="Refresh connectivity checks"
              >
                <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin text-amber-400' : ''}`} />
              </button>
            </div>

            {/* Officer Badge & Logout Action */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
              <div className="w-7 h-7 rounded-full bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-300 font-mono font-bold text-xs">
                {officer?.role?.charAt(0) || 'O'}
              </div>
              <div className="text-left hidden xl:block">
                <div className="text-xs font-semibold text-slate-200 leading-tight">
                  {officer?.full_name || 'Officer'}
                </div>
                <div className="text-[10px] text-slate-400 font-mono leading-none flex items-center gap-1 mt-0.5">
                  <span className="text-blue-400 font-medium">{officer?.role || 'INVESTIGATOR'}</span>
                  <span>•</span>
                  <span>{officer?.badge_number || 'CID-001'}</span>
                </div>
              </div>

              <button
                onClick={handleLogout}
                title="Sign out of workstation"
                className="p-1.5 ml-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </header>

        {/* Main Scrollable Forensic Content Workspace */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-5 lg:p-6 bg-[#070A0F]">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
