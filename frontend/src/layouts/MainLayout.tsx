import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Shield, LayoutDashboard, FolderKanban, Users, Building2,
  Car, Smartphone, MapPin, Archive, FileText, Search, Network,
  Clock, Database, Info, Menu, ChevronRight, RefreshCw,
  UserCheck, LogOut
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
          sql: { status: 'connected', engine: 'SQLite (Fallback)' },
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
      group: 'Workspace',
      items: [
        { name: 'Dashboard', path: '/', icon: LayoutDashboard },
        { name: 'Cases', path: '/cases', icon: FolderKanban },
      ],
    },
    {
      group: 'Entities',
      items: [
        { name: 'People', path: '/people', icon: Users },
        { name: 'Organizations', path: '/organizations', icon: Building2 },
        { name: 'Vehicles', path: '/vehicles', icon: Car },
        { name: 'Devices', path: '/devices', icon: Smartphone },
        { name: 'Locations', path: '/locations', icon: MapPin },
      ],
    },
    {
      group: 'Records & Analysis',
      items: [
        { name: 'Evidence & Custody', path: '/evidence', icon: Archive },
        { name: 'Documents', path: '/documents', icon: FileText, badge: 'NoSQL' },
        { name: 'Search', path: '/search', icon: Search },
        { name: 'Relationships', path: '/relationships', icon: Network },
        { name: 'Timeline', path: '/analytics', icon: Clock },
      ],
    },
    {
      group: 'System',
      items: [
        { name: 'Officers & Access', path: '/users', icon: UserCheck, badge: officer?.role === 'ADMIN' ? 'Admin' : undefined },
        { name: 'DBMS Sandbox', path: '/dbms-concepts', icon: Database },
        { name: 'Project Info', path: '/about', icon: Info },
      ],
    },
  ];

  const getBreadcrumb = () => {
    const p = location.pathname;
    if (p === '/') return { section: 'Workspace', title: 'Dashboard' };
    if (p.startsWith('/cases/')) return { section: 'Cases', title: p.split('/')[2] || 'Case Detail' };
    if (p === '/cases') return { section: 'Workspace', title: 'Cases' };
    if (p === '/people') return { section: 'Entities', title: 'People' };
    if (p === '/organizations') return { section: 'Entities', title: 'Organizations' };
    if (p === '/vehicles') return { section: 'Entities', title: 'Vehicles' };
    if (p === '/devices') return { section: 'Entities', title: 'Devices' };
    if (p === '/locations') return { section: 'Entities', title: 'Locations' };
    if (p === '/evidence') return { section: 'Records', title: 'Evidence & Custody' };
    if (p === '/documents') return { section: 'Records', title: 'Documents' };
    if (p === '/search') return { section: 'Records', title: 'Search' };
    if (p === '/relationships') return { section: 'Analysis', title: 'Relationships' };
    if (p === '/analytics') return { section: 'Analysis', title: 'Timeline' };
    if (p === '/users') return { section: 'System', title: 'Officers & Access' };
    if (p === '/dbms-concepts') return { section: 'System', title: 'DBMS Sandbox' };
    if (p === '/about') return { section: 'System', title: 'Project Info' };
    return { section: 'System', title: 'Case Management' };
  };

  const breadcrumb = getBreadcrumb();

  const isSqlConnected = dbHealth?.databases?.sql?.status === 'connected';
  const sqlEngine = dbHealth?.databases?.sql?.engine || 'SQLite Fallback';
  const isMongoConnected = dbHealth?.databases?.nosql?.status === 'connected';

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#070A0F] text-[#E2E8F0] font-sans antialiased">
      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
        />
      )}

      {/* Persistent Left Sidebar */}
      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 z-50 flex flex-col flex-shrink-0 bg-[#0B0F17] border-r border-[#1E2638] select-none ${
          sidebarCollapsed ? 'w-16' : 'w-60'
        } ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Brand Header */}
        <div className="h-12 flex items-center justify-between px-3.5 border-b border-[#1E2638] bg-[#0E1420]">
          <div className="flex items-center gap-2 min-w-0">
            <Shield className="w-4 h-4 text-blue-400 flex-shrink-0" />
            {!sidebarCollapsed && (
              <div className="min-w-0">
                <div className="text-xs font-semibold text-slate-100 truncate">
                  Case Management
                </div>
                <div className="text-[10px] text-slate-400 font-mono leading-none">
                  UE24CS395
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="hidden lg:flex items-center justify-center w-6 h-6 rounded text-slate-400 hover:text-slate-200 hover:bg-[#141C2B] transition-colors duration-150"
            title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <ChevronRight className={`w-3.5 h-3.5 transform transition-transform ${sidebarCollapsed ? '' : 'rotate-180'}`} />
          </button>
        </div>

        {/* Navigation Groups */}
        <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-3">
          {navGroups.map((group) => (
            <div key={group.group} className="space-y-0.5">
              {!sidebarCollapsed && (
                <div className="px-2 pb-1 text-[11px] font-medium text-slate-500">
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
                    className={`flex items-center h-8 rounded text-xs transition-colors duration-150 ${
                      sidebarCollapsed ? 'justify-center px-0' : 'justify-between px-2.5'
                    } ${
                      isActive
                        ? 'bg-blue-600/15 text-blue-300 font-medium border-l-2 border-blue-500'
                        : 'text-slate-400 hover:bg-[#141C2B] hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon className={`w-3.5 h-3.5 flex-shrink-0 ${isActive ? 'text-blue-400' : 'text-slate-500'}`} />
                      {!sidebarCollapsed && (
                        <span className="truncate">{item.name}</span>
                      )}
                    </div>

                    {!sidebarCollapsed && item.badge && (
                      <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-[#141C2B] text-slate-400 border border-[#1E2638]">
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Bottom Attribution */}
        <div className="p-2.5 border-t border-[#1E2638] bg-[#070A0F] text-[11px] text-slate-400">
          {!sidebarCollapsed ? (
            <div className="space-y-0.5">
              <div className="text-slate-300 font-medium">PES University</div>
              <div className="text-[10px] text-slate-500 truncate">Saatvik G. • Satyam G.</div>
            </div>
          ) : (
            <div className="text-center font-mono text-[10px] text-slate-500">PES</div>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden bg-[#070A0F]">
        {/* Slim Top Bar */}
        <header className="h-12 border-b border-[#1E2638] bg-[#0B0F17] px-4 flex items-center justify-between flex-shrink-0 z-20">
          {/* Left: Mobile Toggle + Breadcrumb */}
          <div className="flex items-center gap-2.5 min-w-0">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-1 rounded text-slate-400 hover:text-slate-200"
            >
              <Menu className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-slate-500">{breadcrumb.section}</span>
              <span className="text-slate-600">/</span>
              <span className="font-medium text-slate-200 truncate">{breadcrumb.title}</span>
            </div>
          </div>

          {/* Center: Search Input */}
          <form
            onSubmit={handleSearchSubmit}
            className="hidden md:flex items-center relative w-72 lg:w-80 mx-4"
          >
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search records, suspects, cases..."
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
              className="w-full bg-[#0E1420] border border-[#1E2638] rounded pl-8 pr-3 py-1 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors duration-150"
            />
          </form>

          {/* Right: DB Status & Officer */}
          <div className="flex items-center gap-3 flex-shrink-0 text-xs">
            {/* Database Status */}
            <div className="hidden sm:flex items-center gap-2 px-2 py-0.5 rounded bg-[#0E1420] border border-[#1E2638] text-[11px] font-mono">
              <div className="flex items-center gap-1.5">
                <span className={`w-1.5 h-1.5 rounded-full ${isSqlConnected ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                <span className="text-slate-400">SQL:</span>
                <span className={isSqlConnected ? 'text-slate-200' : 'text-amber-400'}>
                  {sqlEngine.includes('PostgreSQL') ? 'Postgres' : 'SQLite'}
                </span>
              </div>
              <span className="text-slate-600">|</span>
              <div className="flex items-center gap-1.5">
                <span className={`w-1.5 h-1.5 rounded-full ${isMongoConnected ? 'bg-emerald-500' : 'bg-slate-600'}`} />
                <span className="text-slate-400">NoSQL:</span>
                <span className={isMongoConnected ? 'text-slate-200' : 'text-slate-400'}>
                  {isMongoConnected ? 'Live' : 'Standby'}
                </span>
              </div>
              <button
                onClick={fetchHealth}
                disabled={isRefreshing}
                className="text-slate-500 hover:text-slate-300 transition-colors duration-150 ml-0.5"
                title="Refresh health check"
              >
                <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {/* Officer Context */}
            <div className="flex items-center gap-2 pl-2 border-l border-[#1E2638]">
              <div className="text-right hidden sm:block">
                <div className="text-xs font-medium text-slate-200 leading-tight">
                  {officer?.full_name || 'Officer'}
                </div>
                <div className="text-[10px] text-slate-400 font-mono leading-none">
                  {officer?.badge_number || 'CID-001'} • {officer?.role || 'INVESTIGATOR'}
                </div>
              </div>

              <button
                onClick={handleLogout}
                title="Sign out"
                className="p-1.5 rounded text-slate-400 hover:text-red-400 hover:bg-[#141C2B] transition-colors duration-150"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </header>

        {/* Main Content Workspace */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-5 bg-[#070A0F]">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
