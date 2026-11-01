import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, ArrowRight } from 'lucide-react';
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
    'On Hold': '#64748B',
    'Closed': '#10B981',
  };

  const PRIORITY_COLORS: Record<string, string> = {
    'Low': '#64748B',
    'Medium': '#3B82F6',
    'High': '#F59E0B',
    'Critical': '#EF4444',
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] text-slate-400 text-xs">
        <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-2" />
        <span>Loading metrics...</span>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="p-4 bg-[#0E1420] border border-red-900/60 rounded text-xs text-red-300">
        <div className="font-semibold text-red-200 mb-1">Failed to load data</div>
        <p className="text-slate-400 mb-3">{error || 'Unable to connect to the backend API.'}</p>
        <button
          onClick={loadDashboard}
          className="px-2.5 py-1 bg-red-900/40 hover:bg-red-900/70 border border-red-800 rounded text-xs text-white transition-colors duration-150"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#1E2638] gap-3">
        <div>
          <h1 className="text-lg font-semibold text-slate-100">Overview</h1>
          <p className="text-xs text-slate-400">
            Case metrics, database records, and recent audit activity
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/cases')}
            className="px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium transition-colors duration-150 flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Case</span>
          </button>
          <button
            onClick={() => navigate('/evidence')}
            className="px-3 py-1.5 rounded bg-[#0B0F17] hover:bg-[#141C2B] border border-[#1E2638] text-slate-300 text-xs font-medium transition-colors duration-150"
          >
            Evidence Log
          </button>
        </div>
      </div>

      {/* Summary Metrics Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div
          onClick={() => navigate('/cases')}
          className="p-3.5 bg-[#0B0F17] border border-[#1E2638] rounded cursor-pointer hover:border-slate-700 transition-colors duration-150"
        >
          <div className="text-xs text-slate-400">Total Cases</div>
          <div className="text-xl font-semibold text-slate-100 font-mono mt-1">
            {stats.total_cases}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            {stats.open_cases} open • {stats.under_investigation_cases} investigating
          </div>
        </div>

        <div
          onClick={() => navigate('/evidence')}
          className="p-3.5 bg-[#0B0F17] border border-[#1E2638] rounded cursor-pointer hover:border-slate-700 transition-colors duration-150"
        >
          <div className="text-xs text-slate-400">Evidence Items</div>
          <div className="text-xl font-semibold text-slate-100 font-mono mt-1">
            {stats.total_evidence}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            Chain of custody recorded
          </div>
        </div>

        <div
          onClick={() => navigate('/people')}
          className="p-3.5 bg-[#0B0F17] border border-[#1E2638] rounded cursor-pointer hover:border-slate-700 transition-colors duration-150"
        >
          <div className="text-xs text-slate-400">Persons of Interest</div>
          <div className="text-xl font-semibold text-slate-100 font-mono mt-1">
            {stats.total_people}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            Suspects, witnesses, victims
          </div>
        </div>

        <div
          onClick={() => navigate('/documents')}
          className="p-3.5 bg-[#0B0F17] border border-[#1E2638] rounded cursor-pointer hover:border-slate-700 transition-colors duration-150"
        >
          <div className="text-xs text-slate-400">Documents (NoSQL)</div>
          <div className="text-xl font-semibold text-slate-100 font-mono mt-1">
            {stats.total_documents}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            MongoDB unstructured telemetry
          </div>
        </div>
      </div>

      {/* Secondary Entity Counts Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-[#0B0F17] p-2.5 border border-[#1E2638] rounded text-xs">
        <div onClick={() => navigate('/organizations')} className="cursor-pointer hover:text-slate-200 text-slate-400 px-2 py-1">
          <span className="text-slate-500">Organizations: </span>
          <span className="font-mono font-medium text-slate-200">{stats.total_organizations}</span>
        </div>
        <div onClick={() => navigate('/vehicles')} className="cursor-pointer hover:text-slate-200 text-slate-400 px-2 py-1">
          <span className="text-slate-500">Vehicles: </span>
          <span className="font-mono font-medium text-slate-200">{stats.total_vehicles}</span>
        </div>
        <div onClick={() => navigate('/devices')} className="cursor-pointer hover:text-slate-200 text-slate-400 px-2 py-1">
          <span className="text-slate-500">Devices: </span>
          <span className="font-mono font-medium text-slate-200">{stats.total_devices}</span>
        </div>
        <div onClick={() => navigate('/locations')} className="cursor-pointer hover:text-slate-200 text-slate-400 px-2 py-1">
          <span className="text-slate-500">Locations: </span>
          <span className="font-mono font-medium text-slate-200">{stats.total_locations}</span>
        </div>
      </div>

      {/* Charts Section: 2 simple charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Status Distribution */}
        <div className="p-3.5 bg-[#0B0F17] border border-[#1E2638] rounded">
          <div className="text-xs font-medium text-slate-200 mb-0.5">Case Status Distribution</div>
          <div className="text-[11px] text-slate-500 mb-3">Grouped by status in relational database</div>

          <div className="h-40 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.case_status_distribution}
                  dataKey="count"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  outerRadius={60}
                  innerRadius={36}
                  paddingAngle={2}
                >
                  {stats.case_status_distribution.map((entry) => (
                    <Cell
                      key={`cell-${entry.status}`}
                      fill={STATUS_COLORS[entry.status] || '#3B82F6'}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0E1420', borderColor: '#1E2638', borderRadius: '4px', fontSize: '11px', color: '#E2E8F0' }}
                  itemStyle={{ color: '#E2E8F0' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-center gap-3 flex-wrap pt-2 border-t border-[#1E2638] text-[11px]">
            {stats.case_status_distribution.map((entry) => (
              <div key={entry.status} className="flex items-center gap-1.5">
                <span
                  className="w-2 h-2 rounded-sm"
                  style={{ backgroundColor: STATUS_COLORS[entry.status] || '#3B82F6' }}
                />
                <span className="text-slate-400">{entry.status}:</span>
                <span className="font-mono text-slate-200">{entry.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Priority Breakdown */}
        <div className="p-3.5 bg-[#0B0F17] border border-[#1E2638] rounded">
          <div className="text-xs font-medium text-slate-200 mb-0.5">Case Priority Breakdown</div>
          <div className="text-[11px] text-slate-500 mb-3">Cases by triage priority level</div>

          <div className="h-40 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.case_priority_distribution} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                <XAxis dataKey="priority" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0E1420', borderColor: '#1E2638', borderRadius: '4px', fontSize: '11px', color: '#E2E8F0' }}
                  itemStyle={{ color: '#E2E8F0' }}
                />
                <Bar dataKey="count" radius={[2, 2, 0, 0]}>
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

          <div className="flex items-center justify-center gap-3 flex-wrap pt-2 border-t border-[#1E2638] text-[11px]">
            {stats.case_priority_distribution.map((entry) => (
              <div key={entry.priority} className="flex items-center gap-1.5">
                <span
                  className="w-2 h-2 rounded-sm"
                  style={{ backgroundColor: PRIORITY_COLORS[entry.priority] || '#3B82F6' }}
                />
                <span className="text-slate-400">{entry.priority}:</span>
                <span className="font-mono text-slate-200">{entry.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Dense Tables: Recent Cases & Recent Documents */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Recent Cases Table */}
        <div className="bg-[#0B0F17] border border-[#1E2638] rounded">
          <div className="p-3 border-b border-[#1E2638] flex items-center justify-between">
            <div className="text-xs font-medium text-slate-200">Recent Cases</div>
            <button
              onClick={() => navigate('/cases')}
              className="text-xs text-blue-400 hover:text-blue-300 transition-colors duration-150 flex items-center gap-1"
            >
              <span>View all</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {stats.recent_cases.length === 0 ? (
            <div className="p-4 text-center text-xs text-slate-500">No cases recorded.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#1E2638] text-slate-400 text-[11px]">
                    <th className="py-2 px-3">Case ID</th>
                    <th className="py-2 px-3">Title</th>
                    <th className="py-2 px-3">Status</th>
                    <th className="py-2 px-3">Priority</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#161D2B]">
                  {stats.recent_cases.map((c) => (
                    <tr
                      key={c.case_id}
                      onClick={() => navigate(`/cases/${c.case_id}`)}
                      className="hover:bg-[#141C2B] cursor-pointer transition-colors duration-150"
                    >
                      <td className="py-2 px-3 font-mono text-blue-400 font-medium whitespace-nowrap">
                        {c.case_id}
                      </td>
                      <td className="py-2 px-3 max-w-[180px] truncate text-slate-200">
                        {c.title}
                      </td>
                      <td className="py-2 px-3 whitespace-nowrap">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                          c.status === 'Open' ? 'bg-blue-950 text-blue-400 border border-blue-900' :
                          c.status === 'Under Investigation' ? 'bg-amber-950 text-amber-400 border border-amber-900' :
                          'bg-emerald-950 text-emerald-400 border border-emerald-900'
                        }`}>
                          {c.status}
                        </span>
                      </td>
                      <td className="py-2 px-3 whitespace-nowrap">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${
                          c.priority === 'Critical' ? 'text-red-400' :
                          c.priority === 'High' ? 'text-amber-400' : 'text-slate-400'
                        }`}>
                          {c.priority}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Recent Documents Table */}
        <div className="bg-[#0B0F17] border border-[#1E2638] rounded">
          <div className="p-3 border-b border-[#1E2638] flex items-center justify-between">
            <div className="text-xs font-medium text-slate-200">Recent Documents (MongoDB)</div>
            <button
              onClick={() => navigate('/documents')}
              className="text-xs text-blue-400 hover:text-blue-300 transition-colors duration-150 flex items-center gap-1"
            >
              <span>View all</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {stats.recent_documents.length === 0 ? (
            <div className="p-4 text-center text-xs text-slate-500">No documents found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#1E2638] text-slate-400 text-[11px]">
                    <th className="py-2 px-3">Type</th>
                    <th className="py-2 px-3">Title</th>
                    <th className="py-2 px-3">Case</th>
                    <th className="py-2 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#161D2B]">
                  {stats.recent_documents.map((doc) => (
                    <tr
                      key={doc.id}
                      onClick={() => navigate('/documents')}
                      className="hover:bg-[#141C2B] cursor-pointer transition-colors duration-150"
                    >
                      <td className="py-2 px-3 whitespace-nowrap font-mono text-[10px] text-slate-400">
                        {doc.document_type}
                      </td>
                      <td className="py-2 px-3 max-w-[180px] truncate text-slate-200">
                        {doc.title}
                      </td>
                      <td className="py-2 px-3 font-mono text-slate-400 whitespace-nowrap">
                        {doc.case_id || '—'}
                      </td>
                      <td className="py-2 px-3 whitespace-nowrap text-[10px] text-slate-400">
                        {doc.document_status}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Activity Log Table */}
      <div className="bg-[#0B0F17] border border-[#1E2638] rounded">
        <div className="p-3 border-b border-[#1E2638] flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-slate-200">Recent Investigation Activity</div>
            <div className="text-[11px] text-slate-500">Chronological audit log from case_activity table</div>
          </div>
        </div>

        {stats.recent_activities.length === 0 ? (
          <div className="p-4 text-center text-xs text-slate-500">No activity recorded.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#1E2638] text-slate-400 text-[11px]">
                  <th className="py-2 px-3">Timestamp</th>
                  <th className="py-2 px-3">Case ID</th>
                  <th className="py-2 px-3">Type</th>
                  <th className="py-2 px-3">Description</th>
                  <th className="py-2 px-3">Officer</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#161D2B]">
                {stats.recent_activities.map((act) => (
                  <tr key={act.activity_id} className="hover:bg-[#141C2B] transition-colors duration-150">
                    <td className="py-2 px-3 font-mono text-slate-500 whitespace-nowrap text-[11px]">
                      {new Date(act.activity_timestamp).toLocaleDateString()}
                    </td>
                    <td className="py-2 px-3 font-mono text-blue-400 whitespace-nowrap font-medium">
                      {act.case_id}
                    </td>
                    <td className="py-2 px-3 font-mono text-slate-300 text-[11px] whitespace-nowrap">
                      {act.activity_type}
                    </td>
                    <td className="py-2 px-3 text-slate-300 max-w-md truncate">
                      {act.title}: {act.description}
                    </td>
                    <td className="py-2 px-3 text-slate-400 whitespace-nowrap text-[11px]">
                      {act.officer_name || 'Investigator'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
