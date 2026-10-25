import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FolderKanban, Users, Building2, Car, Smartphone, MapPin, Archive,
  FileText, Activity, Clock, Plus, ExternalLink, AlertTriangle,
  ArrowUpRight, Network, Search, Database, ShieldAlert
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
      setError(err?.message || 'Failed to retrieve telemetry from backend API.');
    } finally {
      setLoading(false);
    }
  };

  const STATUS_COLORS: Record<string, string> = {
    'Open': '#38BDF8',
    'Under Investigation': '#F59E0B',
    'On Hold': '#94A3B8',
    'Closed': '#10B981',
  };

  const PRIORITY_COLORS: Record<string, string> = {
    'Low': '#64748B',
    'Medium': '#38BDF8',
    'High': '#F59E0B',
    'Critical': '#EF4444',
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[420px] text-slate-400">
        <div className="w-7 h-7 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="text-xs font-mono text-slate-400">Querying live SQL and MongoDB instances...</p>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="p-5 bg-[#120B0B] border border-red-900/40 rounded text-red-200">
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle className="w-4 h-4 text-red-400" />
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-red-300">
            Telemetry Feed Disconnected
          </h3>
        </div>
        <p className="text-xs text-red-400 font-mono">{error || 'Unable to load investigation metrics.'}</p>
        <button
          onClick={loadDashboard}
          className="mt-3 px-3 py-1 bg-red-900/60 hover:bg-red-800 border border-red-700/60 rounded text-xs font-mono text-white transition"
        >
          Re-establish Connection
        </button>
      </div>
    );
  }

  const telemetryMetrics = [
    { label: 'Active Cases', value: stats.total_cases, sub: `${stats.open_cases} Open • ${stats.under_investigation_cases} In-Progress`, icon: FolderKanban, link: '/cases', badge: 'SQL' },
    { label: 'Persons of Interest', value: stats.total_people, sub: 'Suspects, associates, victims', icon: Users, link: '/people', badge: 'SQL' },
    { label: 'Evidence Items', value: stats.total_evidence, sub: 'Chain of custody tracked', icon: Archive, link: '/evidence', badge: 'SQL' },
    { label: 'Intelligence Docs', value: stats.total_documents, sub: 'Polymorphic NoSQL records', icon: FileText, link: '/documents', badge: 'MongoDB' },
    { label: 'Organizations', value: stats.total_organizations, sub: 'Corporate & shell entities', icon: Building2, link: '/organizations' },
    { label: 'Vehicles', value: stats.total_vehicles, sub: 'Plates, VINs, surveillance', icon: Car, link: '/vehicles' },
    { label: 'Hardware & Devices', value: stats.total_devices, sub: 'Phones, drives, crypto wallets', icon: Smartphone, link: '/devices' },
    { label: 'Locations Tracked', value: stats.total_locations, sub: 'Scenes, depots, safehouses', icon: MapPin, link: '/locations' },
  ];

  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      {/* Forensic Station Quick Header & Action Console */}
      <div className="p-3.5 rounded bg-[#0B0F17] border border-[#1E2638] flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="px-1.5 py-0.5 rounded text-[9px] font-mono uppercase bg-amber-500/10 text-amber-400 border border-amber-500/30 font-bold">
              CONSOLE READY
            </span>
            <span className="text-[11px] font-mono text-slate-400">
              Station ID: <span className="text-slate-300">BLR-CENTRAL-01</span>
            </span>
          </div>
          <h2 className="text-sm font-bold text-slate-100 tracking-wide uppercase mt-1 mb-0.5">
            Operational Intelligence Overview
          </h2>
          <p className="text-[11px] text-slate-400 m-0">
            Cross-database telemetry fusing relational 3NF records with unstructured document extractions.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap flex-shrink-0">
          <button
            onClick={() => navigate('/cases')}
            className="px-2.5 py-1.5 rounded bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-mono font-medium flex items-center gap-1.5 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Investigation</span>
          </button>
          <button
            onClick={() => navigate('/documents')}
            className="px-2.5 py-1.5 rounded bg-[#131A26] hover:bg-[#1A2333] border border-[#1E2638] text-slate-300 text-xs font-mono font-medium flex items-center gap-1.5 transition"
          >
            <FileText className="w-3.5 h-3.5 text-emerald-400" />
            <span>Ingest Document</span>
          </button>
          <button
            onClick={() => navigate('/relationships')}
            className="px-2.5 py-1.5 rounded bg-[#131A26] hover:bg-[#1A2333] border border-[#1E2638] text-slate-300 text-xs font-mono font-medium flex items-center gap-1.5 transition"
          >
            <Network className="w-3.5 h-3.5 text-cyan-400" />
            <span>Link Analysis</span>
          </button>
        </div>
      </div>

      {/* 8-Panel High-Density Telemetry Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
        {telemetryMetrics.map((m) => {
          const Icon = m.icon;
          return (
            <div
              key={m.label}
              onClick={() => navigate(m.link)}
              className="p-3 rounded bg-[#0B0F17] border border-[#1E2638] hover:border-amber-500/40 hover:bg-[#0E1420] cursor-pointer transition group flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono text-slate-400 font-medium uppercase truncate pr-1">
                  {m.label}
                </span>
                <Icon className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-400 transition" />
              </div>

              <div className="mt-2 flex items-baseline justify-between">
                <div className="text-xl font-mono font-bold text-slate-100 tracking-tight">
                  {m.value}
                </div>
                {m.badge && (
                  <span
                    className={`text-[9px] font-mono px-1 py-0.2 rounded leading-none ${
                      m.badge === 'MongoDB'
                        ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/40'
                        : 'bg-amber-950/80 text-amber-400 border border-amber-800/40'
                    }`}
                  >
                    {m.badge}
                  </span>
                )}
              </div>

              <div className="text-[10px] text-slate-500 font-mono truncate mt-1">
                {m.sub}
              </div>
            </div>
          );
        })}
      </div>

      {/* Analytical Breakdown: Case Distribution & Priority (SQL Aggregations) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Case Status Distribution */}
        <div className="p-3.5 rounded bg-[#0B0F17] border border-[#1E2638] flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div>
              <div className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wide">
                Case Status Distribution
              </div>
              <p className="text-[10px] font-mono text-slate-500 m-0">SQL GROUP BY status</p>
            </div>
            <span className="text-[9px] font-mono text-slate-400 bg-[#131A26] px-1.5 py-0.5 rounded border border-[#1E2638]">
              RELATIONAL AGGREGATE
            </span>
          </div>

          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.case_status_distribution}
                  dataKey="count"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  outerRadius={65}
                  innerRadius={40}
                  paddingAngle={3}
                >
                  {stats.case_status_distribution.map((entry) => (
                    <Cell
                      key={`cell-${entry.status}`}
                      fill={STATUS_COLORS[entry.status] || '#38BDF8'}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0B0F17', borderColor: '#1E2638', borderRadius: '4px', fontSize: '11px', fontFamily: 'monospace' }}
                  itemStyle={{ color: '#E2E8F0' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-center gap-3 flex-wrap pt-2 border-t border-[#1E2638] text-[10px] font-mono">
            {stats.case_status_distribution.map((entry) => (
              <div key={entry.status} className="flex items-center gap-1.5">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: STATUS_COLORS[entry.status] || '#38BDF8' }}
                />
                <span className="text-slate-400">{entry.status}:</span>
                <span className="text-slate-200 font-bold">{entry.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Case Priority Breakdown */}
        <div className="p-3.5 rounded bg-[#0B0F17] border border-[#1E2638] flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div>
              <div className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wide">
                Case Priority Hierarchy
              </div>
              <p className="text-[10px] font-mono text-slate-500 m-0">SQL GROUP BY priority</p>
            </div>
            <span className="text-[9px] font-mono text-slate-400 bg-[#131A26] px-1.5 py-0.5 rounded border border-[#1E2638]">
              RELATIONAL AGGREGATE
            </span>
          </div>

          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.case_priority_distribution} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <XAxis dataKey="priority" stroke="#64748B" fontSize={10} tickLine={false} fontFamily="monospace" />
                <YAxis stroke="#64748B" fontSize={10} tickLine={false} fontFamily="monospace" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0B0F17', borderColor: '#1E2638', borderRadius: '4px', fontSize: '11px', fontFamily: 'monospace' }}
                  itemStyle={{ color: '#E2E8F0' }}
                />
                <Bar dataKey="count" radius={[2, 2, 0, 0]}>
                  {stats.case_priority_distribution.map((entry) => (
                    <Cell
                      key={`bar-${entry.priority}`}
                      fill={PRIORITY_COLORS[entry.priority] || '#38BDF8'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-center gap-3 flex-wrap pt-2 border-t border-[#1E2638] text-[10px] font-mono">
            {stats.case_priority_distribution.map((entry) => (
              <div key={entry.priority} className="flex items-center gap-1.5">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: PRIORITY_COLORS[entry.priority] || '#38BDF8' }}
                />
                <span className="text-slate-400">{entry.priority}:</span>
                <span className="text-slate-200 font-bold">{entry.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Primary Activity Feeds: Active Relational Cases & Ingested NoSQL Telemetry */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Active SQL Cases */}
        <div className="p-3.5 rounded bg-[#0B0F17] border border-[#1E2638]">
          <div className="flex items-center justify-between mb-2.5 pb-2 border-b border-[#1E2638]">
            <div className="flex items-center gap-2">
              <FolderKanban className="w-3.5 h-3.5 text-amber-400" />
              <div className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wide">
                Recent Investigation Cases (SQL)
              </div>
            </div>
            <button
              onClick={() => navigate('/cases')}
              className="text-[10px] font-mono text-amber-400/90 hover:text-amber-300 flex items-center gap-1 transition"
            >
              <span>View Dossier</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-1.5">
            {stats.recent_cases.length === 0 ? (
              <div className="p-4 text-center text-xs font-mono text-slate-500">
                No active investigation cases recorded. Use the "New Investigation" button above.
              </div>
            ) : (
              stats.recent_cases.map((c) => (
                <div
                  key={c.case_id}
                  onClick={() => navigate(`/cases/${c.case_id}`)}
                  className="p-2.5 rounded bg-[#0E1420] border border-[#161D2B] hover:border-amber-500/40 cursor-pointer transition flex items-center justify-between"
                >
                  <div className="min-w-0 pr-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-mono text-amber-400 font-bold">{c.case_id}</span>
                      <span
                        className={`text-[9px] font-mono px-1 rounded font-semibold ${
                          c.priority === 'Critical'
                            ? 'bg-red-950/80 text-red-400 border border-red-800/40'
                            : c.priority === 'High'
                            ? 'bg-amber-950/80 text-amber-400 border border-amber-800/40'
                            : 'bg-blue-950/80 text-blue-400 border border-blue-800/40'
                        }`}
                      >
                        {c.priority}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono truncate">
                        Lead: {c.lead_officer_name || 'Unassigned'}
                      </span>
                    </div>
                    <div className="text-xs font-medium text-slate-200 truncate">{c.title}</div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <span
                      className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-medium ${
                        c.status === 'Open'
                          ? 'bg-blue-950/80 text-blue-400 border border-blue-800/40'
                          : c.status === 'Under Investigation'
                          ? 'bg-amber-950/80 text-amber-400 border border-amber-800/40'
                          : 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/40'
                      }`}
                    >
                      {c.status}
                    </span>
                    <div className="text-[9px] text-slate-500 font-mono mt-1">
                      {c.evidence_count || 0} Evd • {c.people_count || 0} Entities
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Ingested NoSQL Documents */}
        <div className="p-3.5 rounded bg-[#0B0F17] border border-[#1E2638]">
          <div className="flex items-center justify-between mb-2.5 pb-2 border-b border-[#1E2638]">
            <div className="flex items-center gap-2">
              <FileText className="w-3.5 h-3.5 text-emerald-400" />
              <div className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wide">
                Ingested Intelligence Telemetry (MongoDB)
              </div>
            </div>
            <button
              onClick={() => navigate('/documents')}
              className="text-[10px] font-mono text-emerald-400/90 hover:text-emerald-300 flex items-center gap-1 transition"
            >
              <span>View Repository</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-1.5">
            {stats.recent_documents.length === 0 ? (
              <div className="p-4 text-center text-xs font-mono text-slate-500">
                No intelligence documents found. Document store is ready for ingestion.
              </div>
            ) : (
              stats.recent_documents.map((doc) => (
                <div
                  key={doc.id}
                  onClick={() => navigate('/documents')}
                  className="p-2.5 rounded bg-[#0E1420] border border-[#161D2B] hover:border-emerald-500/40 cursor-pointer transition flex items-center justify-between"
                >
                  <div className="min-w-0 pr-3">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-emerald-950/70 text-emerald-400 border border-emerald-800/40">
                        {doc.document_type}
                      </span>
                      {doc.case_id && (
                        <span className="text-[10px] font-mono text-slate-400">
                          Case: <span className="text-amber-400/90">{doc.case_id}</span>
                        </span>
                      )}
                      <span className="text-[10px] text-slate-500 font-mono truncate max-w-[120px]">
                        {doc.source_name}
                      </span>
                    </div>
                    <div className="text-xs font-medium text-slate-200 truncate">{doc.title}</div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#131A26] border border-[#1E2638] text-slate-400">
                      {doc.document_status}
                    </span>
                    <div className="text-[9px] text-slate-500 font-mono mt-1">
                      {doc.tags?.slice(0, 2).join(', ') || 'verified'}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Chronological Investigation Audit Activity Feed */}
      <div className="p-3.5 rounded bg-[#0B0F17] border border-[#1E2638]">
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#1E2638]">
          <div className="flex items-center gap-2">
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            <div className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wide">
              Investigation Audit Log & Event Timeline
            </div>
          </div>
          <span className="text-[9px] font-mono text-slate-500">
            PostgreSQL Table: case_activity
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
          {stats.recent_activities.length === 0 ? (
            <div className="col-span-3 p-4 text-center text-xs font-mono text-slate-500">
              No audit activities recorded.
            </div>
          ) : (
            stats.recent_activities.map((act) => (
              <div key={act.activity_id} className="p-2.5 rounded bg-[#0E1420] border border-[#161D2B] text-xs">
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-1">
                  <span className="text-amber-400 font-semibold">{act.case_id}</span>
                  <span className="text-slate-500 flex items-center gap-1">
                    <Clock className="w-2.5 h-2.5" />
                    {new Date(act.activity_timestamp).toLocaleDateString()}
                  </span>
                </div>
                <div className="font-medium text-slate-200 truncate mb-1 text-[11px]">{act.title}</div>
                <p className="text-[10px] text-slate-400 line-clamp-2 m-0 leading-relaxed font-sans">
                  {act.description}
                </p>
                <div className="mt-2 pt-1.5 border-t border-[#161D2B] text-[9px] font-mono text-slate-500 flex items-center justify-between">
                  <span>Officer: {act.officer_name || 'Investigator'}</span>
                  <span className="text-amber-400/90">{act.activity_type}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
