import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FolderKanban, Users, Building2, Car, Smartphone, MapPin, Archive,
  FileText, ShieldCheck, Activity, Clock, Plus, ExternalLink, AlertTriangle,
  CheckCircle, ArrowUpRight, BarChart2
} from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis } from 'recharts';
import { ApiService } from '../services/api';
import { DashboardStats } from '../types';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const data = await ApiService.getDashboardStats();
      setStats(data);
      setError(null);
    } catch (err: any) {
      setError(err?.message || 'Failed to load dashboard metrics from backend.');
    } finally {
      setLoading(false);
    }
  };

  const STATUS_COLORS: Record<string, string> = {
    'Open': '#3B82F6',
    'Under Investigation': '#F59E0B',
    'On Hold': '#8B5CF6',
    'Closed': '#10B981'
  };

  const PRIORITY_COLORS: Record<string, string> = {
    'Low': '#64748B',
    'Medium': '#3B82F6',
    'High': '#F59E0B',
    'Critical': '#EF4444'
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-400">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="text-xs">Querying PostgreSQL and MongoDB databases for live stats...</p>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="p-6 bg-red-950/30 border border-red-800/50 rounded-xl text-red-200">
        <h3 className="text-sm font-semibold mb-1 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-400" /> Database Connection Error
        </h3>
        <p className="text-xs text-red-300">{error || 'Unable to retrieve dashboard dataset.'}</p>
        <button
          onClick={loadDashboard}
          className="mt-3 px-3 py-1.5 bg-red-800 hover:bg-red-700 rounded text-xs font-medium text-white transition"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  const statCards = [
    { label: 'Total Cases', value: stats.total_cases, sub: `${stats.open_cases} Open, ${stats.under_investigation_cases} Active`, icon: FolderKanban, color: 'text-blue-400', link: '/cases' },
    { label: 'Persons of Interest', value: stats.total_people, sub: 'Subjects, Witnesses, Informants', icon: Users, color: 'text-indigo-400', link: '/people' },
    { label: 'Organizations', value: stats.total_organizations, sub: 'Commercial, Financial & Freight', icon: Building2, color: 'text-cyan-400', link: '/organizations' },
    { label: 'Vehicles Tracked', value: stats.total_vehicles, sub: 'Sedans, Haulers, Commercial', icon: Car, color: 'text-sky-400', link: '/vehicles' },
    { label: 'Hardware & Devices', value: stats.total_devices, sub: 'Phones, Decoders, Wallets', icon: Smartphone, color: 'text-violet-400', link: '/devices' },
    { label: 'Locations of Interest', value: stats.total_locations, sub: 'Scenes, Depots, Infrastructure', icon: MapPin, color: 'text-amber-400', link: '/locations' },
    { label: 'Logged Evidence Items', value: stats.total_evidence, sub: 'Chain of Custody Verified', icon: Archive, color: 'text-emerald-400', link: '/evidence' },
    { label: 'NoSQL Investigation Docs', value: stats.total_documents, sub: 'MongoDB Document Store', icon: FileText, color: 'text-teal-400', link: '/documents', badge: 'MongoDB' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner / Academic Attribution */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-blue-950/40 via-slate-900 to-indigo-950/40 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-blue-900/60 text-blue-300 border border-blue-700/50">
              DBMS Mini Project • PES University
            </span>
            <span className="text-xs text-slate-400">Academic Prototype</span>
          </div>
          <h2 className="text-lg font-bold text-white tracking-tight m-0">
            Intelligence Fusion Platform
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            Centralized investigation command integrating normalized PostgreSQL relational tables with MongoDB polymorphic document store.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => navigate('/search?q=blue+sedan')}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs text-slate-200 flex items-center gap-1.5 transition"
          >
            <span>Demo: "blue sedan" Search</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-blue-400" />
          </button>
          <button
            onClick={() => navigate('/dbms-concepts')}
            className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium flex items-center gap-1.5 shadow transition"
          >
            <BarChart2 className="w-3.5 h-3.5" />
            <span>DBMS Viva Concepts</span>
          </button>
        </div>
      </div>

      {/* Summary Stat Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((c) => {
          const Icon = c.icon;
          return (
            <div
              key={c.label}
              onClick={() => navigate(c.link)}
              className="p-4 rounded-xl bg-[#0F172A] border border-slate-800/90 hover:border-slate-700 hover:bg-slate-800/50 cursor-pointer transition flex flex-col justify-between group"
            >
              <div className="flex items-start justify-between">
                <span className="text-xs text-slate-400 font-medium">{c.label}</span>
                <div className="p-2 rounded-lg bg-slate-800/80 group-hover:bg-slate-800 transition">
                  <Icon className={`w-4 h-4 ${c.color}`} />
                </div>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-bold font-mono text-white tracking-tight">
                  {c.value}
                </div>
                <div className="text-[11px] text-slate-400 truncate mt-0.5 flex items-center justify-between">
                  <span>{c.sub}</span>
                  {c.badge && (
                    <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/40">
                      {c.badge}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Section: Status & Priority Distributions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Case Status Distribution */}
        <div className="p-5 rounded-xl bg-[#0F172A] border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Case Status Distribution
              </h3>
              <p className="text-[11px] text-slate-400">Live SQL Group By Query: status</p>
            </div>
            <span className="text-[10px] font-mono text-blue-400 bg-blue-950/60 px-2 py-0.5 rounded border border-blue-900/40">
              SQL AGGREGATE
            </span>
          </div>

          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.case_status_distribution}
                  dataKey="count"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  outerRadius={75}
                  innerRadius={45}
                  paddingAngle={4}
                >
                  {stats.case_status_distribution.map((entry) => (
                    <Cell
                      key={`cell-${entry.status}`}
                      fill={STATUS_COLORS[entry.status] || '#3B82F6'}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0B1120', borderColor: '#1E293B', borderRadius: '8px', fontSize: '11px' }}
                  itemStyle={{ color: '#F1F5F9' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-center gap-4 flex-wrap pt-2 border-t border-slate-800/80 text-[11px]">
            {stats.case_status_distribution.map((entry) => (
              <div key={entry.status} className="flex items-center gap-1.5">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: STATUS_COLORS[entry.status] || '#3B82F6' }}
                ></span>
                <span className="text-slate-300">{entry.status}:</span>
                <span className="font-mono text-white font-semibold">{entry.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Case Priority Breakdown */}
        <div className="p-5 rounded-xl bg-[#0F172A] border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Case Priority Breakdown
              </h3>
              <p className="text-[11px] text-slate-400">SQL Group By: priority</p>
            </div>
            <span className="text-[10px] font-mono text-purple-400 bg-purple-950/60 px-2 py-0.5 rounded border border-purple-900/40">
              SQL AGGREGATE
            </span>
          </div>

          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.case_priority_distribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="priority" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0B1120', borderColor: '#1E293B', borderRadius: '8px', fontSize: '11px' }}
                  itemStyle={{ color: '#F1F5F9' }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {stats.case_priority_distribution.map((entry) => (
                    <Cell
                      key={`bar-${entry.priority}`}
                      fill={PRIORITY_COLORS[entry.priority] || '#3B82F6'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-center gap-4 flex-wrap pt-2 border-t border-slate-800/80 text-[11px]">
            {stats.case_priority_distribution.map((entry) => (
              <div key={entry.priority} className="flex items-center gap-1.5">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: PRIORITY_COLORS[entry.priority] || '#3B82F6' }}
                ></span>
                <span className="text-slate-300">{entry.priority}:</span>
                <span className="font-mono text-white font-semibold">{entry.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Split Lists: Recent Cases vs Recently Ingested MongoDB Documents */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Cases */}
        <div className="p-5 rounded-xl bg-[#0F172A] border border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <FolderKanban className="w-4 h-4 text-blue-400" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Recent Cases (PostgreSQL / Relational)
              </h3>
            </div>
            <button
              onClick={() => navigate('/cases')}
              className="text-[11px] text-blue-400 hover:text-blue-300 flex items-center gap-1 transition"
            >
              <span>View All</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-2.5">
            {stats.recent_cases.map((c) => (
              <div
                key={c.case_id}
                onClick={() => navigate(`/cases/${c.case_id}`)}
                className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 hover:border-slate-700 cursor-pointer transition flex items-center justify-between"
              >
                <div className="min-w-0 pr-3">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[11px] font-mono text-blue-400 font-bold">{c.case_id}</span>
                    <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-semibold ${
                      c.priority === 'Critical' ? 'bg-red-950 text-red-400 border border-red-800/50' :
                      c.priority === 'High' ? 'bg-amber-950 text-amber-400 border border-amber-800/50' :
                      'bg-blue-950 text-blue-400 border border-blue-800/50'
                    }`}>
                      {c.priority}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Lead: {c.lead_officer_name || 'Unassigned'}
                    </span>
                  </div>
                  <h4 className="text-xs font-medium text-slate-100 truncate m-0">{c.title}</h4>
                </div>

                <div className="text-right flex-shrink-0">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                    c.status === 'Open' ? 'bg-blue-950 text-blue-400 border border-blue-800' :
                    c.status === 'Under Investigation' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                    'bg-emerald-950 text-emerald-400 border border-emerald-800'
                  }`}>
                    {c.status}
                  </span>
                  <div className="text-[10px] text-slate-500 mt-1 font-mono">
                    {c.evidence_count || 0} Evd • {c.people_count || 0} People
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recently Ingested MongoDB Documents */}
        <div className="p-5 rounded-xl bg-[#0F172A] border border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-400" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Recent Investigation Documents (MongoDB)
              </h3>
            </div>
            <button
              onClick={() => navigate('/documents')}
              className="text-[11px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition"
            >
              <span>View All</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-2.5">
            {stats.recent_documents.map((doc) => (
              <div
                key={doc.id}
                onClick={() => navigate(`/documents`)}
                className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 hover:border-slate-700 cursor-pointer transition flex items-center justify-between"
              >
                <div className="min-w-0 pr-3">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/40">
                      {doc.document_type}
                    </span>
                    {doc.case_id && (
                      <span className="text-[10px] font-mono text-blue-400 font-medium">
                        Ref: {doc.case_id}
                      </span>
                    )}
                    <span className="text-[10px] text-slate-500 truncate max-w-[130px]">
                      Source: {doc.source_name}
                    </span>
                  </div>
                  <h4 className="text-xs font-medium text-slate-100 truncate m-0">{doc.title}</h4>
                </div>

                <div className="text-right flex-shrink-0">
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                    {doc.document_status}
                  </span>
                  <div className="text-[10px] text-slate-500 mt-1 font-mono">
                    {doc.tags?.slice(0, 2).join(', ')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Chronological Investigation Activity Panel */}
      <div className="p-5 rounded-xl bg-[#0F172A] border border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-purple-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Recent Chronological Activities Across Cases
            </h3>
          </div>
          <span className="text-[10px] font-mono text-slate-400">
            Audit Trail (case_activity)
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {stats.recent_activities.map((act) => (
            <div key={act.activity_id} className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs">
              <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                <span className="font-mono text-blue-400 font-semibold">{act.case_id}</span>
                <span className="text-slate-500 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {new Date(act.activity_timestamp).toLocaleDateString()}
                </span>
              </div>
              <div className="font-semibold text-slate-200 mb-0.5 truncate">{act.title}</div>
              <p className="text-[11px] text-slate-400 line-clamp-2 m-0 leading-relaxed">
                {act.description}
              </p>
              <div className="mt-2 pt-1.5 border-t border-slate-800/80 text-[10px] text-slate-400 flex items-center justify-between">
                <span>By: {act.officer_name || 'Investigator'}</span>
                <span className="text-purple-400 font-medium">{act.activity_type}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
