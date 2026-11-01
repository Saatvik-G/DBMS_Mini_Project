import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import { ApiService } from '../services/api';

export const AnalyticsPage: React.FC = () => {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const res = await ApiService.getAnalytics();
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#64748B', '#0284C7', '#8B5CF6'];

  if (loading || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] text-slate-400 text-xs">
        <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-2" />
        <p>Loading database aggregates...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      {/* Header */}
      <div className="pb-3 border-b border-[#1E2638]">
        <h1 className="text-lg font-semibold text-slate-100">Database Analytics</h1>
        <p className="text-xs text-slate-400">
          Relational SQL aggregations and MongoDB document pipelines
        </p>
      </div>

      {/* Row 1: Case Status & Priority */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Cases by Status */}
        <div className="p-4 bg-[#0B0F17] border border-[#1E2638] rounded">
          <div className="text-xs font-medium text-slate-200 mb-0.5">Cases by Status</div>
          <div className="text-[11px] text-slate-500 mb-3 font-mono">SELECT status, COUNT(*) FROM cases GROUP BY status</div>

          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.cases_by_status}
                  dataKey="count"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  outerRadius={70}
                  innerRadius={42}
                  paddingAngle={2}
                >
                  {data.cases_by_status.map((_: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
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
            {data.cases_by_status.map((entry: any, idx: number) => (
              <div key={entry.status} className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-sm" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                <span className="text-slate-400">{entry.status}:</span>
                <span className="font-mono text-slate-200">{entry.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Priority Breakdown */}
        <div className="p-4 bg-[#0B0F17] border border-[#1E2638] rounded">
          <div className="text-xs font-medium text-slate-200 mb-0.5">Cases by Priority</div>
          <div className="text-[11px] text-slate-500 mb-3 font-mono">SELECT priority, COUNT(*) FROM cases GROUP BY priority</div>

          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.cases_by_priority} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#161D2B" vertical={false} />
                <XAxis dataKey="priority" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0E1420', borderColor: '#1E2638', borderRadius: '4px', fontSize: '11px', color: '#E2E8F0' }}
                  itemStyle={{ color: '#E2E8F0' }}
                />
                <Bar dataKey="count" fill="#3B82F6" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="text-center pt-2 border-t border-[#1E2638] text-[11px] text-slate-500">
            Priority distribution for resource allocation
          </div>
        </div>
      </div>

      {/* Row 2: Evidence by Type & Documents by Source */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Evidence by Modality */}
        <div className="p-4 bg-[#0B0F17] border border-[#1E2638] rounded">
          <div className="text-xs font-medium text-slate-200 mb-0.5">Evidence Records by Type</div>
          <div className="text-[11px] text-slate-500 mb-3 font-mono">Physical vs digital forensics categorization</div>

          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.evidence_by_type} layout="vertical" margin={{ top: 5, right: 15, left: 60, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#161D2B" horizontal={false} />
                <XAxis type="number" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis dataKey="evidence_type" type="category" stroke="#64748B" fontSize={10} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0E1420', borderColor: '#1E2638', borderRadius: '4px', fontSize: '11px', color: '#E2E8F0' }}
                  itemStyle={{ color: '#E2E8F0' }}
                />
                <Bar dataKey="count" fill="#10B981" radius={[0, 2, 2, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* MongoDB Documents by Source */}
        <div className="p-4 bg-[#0B0F17] border border-[#1E2638] rounded">
          <div className="text-xs font-medium text-slate-200 mb-0.5">Documents by Source (MongoDB)</div>
          <div className="text-[11px] text-slate-500 mb-3 font-mono">MongoDB aggregation pipeline: $group by source_type</div>

          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.docs_by_source} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#161D2B" vertical={false} />
                <XAxis dataKey="source_type" stroke="#64748B" fontSize={10} tickLine={false} interval={0} angle={-15} textAnchor="end" height={35} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0E1420', borderColor: '#1E2638', borderRadius: '4px', fontSize: '11px', color: '#E2E8F0' }}
                  itemStyle={{ color: '#E2E8F0' }}
                />
                <Bar dataKey="count" fill="#64748B" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Relational Table Tuples Summary */}
      <div className="p-4 bg-[#0B0F17] border border-[#1E2638] rounded">
        <div className="text-xs font-medium text-slate-200 mb-0.5">Relational Database Record Summary</div>
        <div className="text-[11px] text-slate-500 mb-3">Live tuple count across primary tables in schema.sql</div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {data.entity_totals.map((item: any) => (
            <div key={item.entity} className="p-2.5 rounded bg-[#0E1420] border border-[#1E2638] text-center">
              <span className="text-[11px] text-slate-400 block">{item.entity}</span>
              <span className="text-lg font-semibold font-mono text-slate-100 mt-0.5 block">{item.count}</span>
              <span className="text-[10px] text-slate-500 font-mono">records</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
