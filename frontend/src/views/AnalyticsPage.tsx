import React, { useState, useEffect } from 'react';
import {
  BarChart3, PieChart as PieIcon, Database, ArrowUpRight,
  TrendingUp, Layers, CheckCircle2, FileText, Archive
} from 'lucide-react';
import {
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend
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

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4', '#64748B'];

  if (loading || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-400">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="text-xs">Computing SQL aggregate queries & MongoDB pipeline stats...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold text-white tracking-tight m-0">Investigation Analytics & Reports</h2>
          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-950 text-blue-400 border border-blue-800">
            SQL Group By & MongoDB Aggregation Pipelines
          </span>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Aggregated relational case distribution metrics, physical vs digital evidence classifications, and unstructured document ingestion breakdown.
        </p>
      </div>

      {/* Row 1: Case Status and Priority */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <div className="p-5 rounded-xl bg-[#0F172A] border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Cases By Current Status (SQL Relational)
              </h3>
              <p className="text-[11px] text-slate-400">SELECT status, COUNT(*) FROM cases GROUP BY status</p>
            </div>
            <span className="text-[10px] font-mono text-blue-400 bg-blue-950 px-2 py-0.5 rounded border border-blue-900">
              SQL AGGREGATE
            </span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.cases_by_status}
                  dataKey="count"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  outerRadius={85}
                  innerRadius={50}
                  paddingAngle={5}
                >
                  {data.cases_by_status.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
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
            {data.cases_by_status.map((entry: any, idx: number) => (
              <div key={entry.status} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
                <span className="text-slate-300">{entry.status}:</span>
                <span className="font-mono text-white font-semibold">{entry.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Priority Breakdown */}
        <div className="p-5 rounded-xl bg-[#0F172A] border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Cases By Priority Severity
              </h3>
              <p className="text-[11px] text-slate-400">SELECT priority, COUNT(*) FROM cases GROUP BY priority</p>
            </div>
            <span className="text-[10px] font-mono text-purple-400 bg-purple-950 px-2 py-0.5 rounded border border-purple-900">
              SQL AGGREGATE
            </span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.cases_by_priority} margin={{ top: 15, right: 15, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                <XAxis dataKey="priority" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0B1120', borderColor: '#1E293B', borderRadius: '8px', fontSize: '11px' }}
                  itemStyle={{ color: '#F1F5F9' }}
                />
                <Bar dataKey="count" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="text-center pt-2 border-t border-slate-800/80 text-[11px] text-slate-400 font-mono">
            Critical priority cases require immediate forensic and tactical officer allocation.
          </div>
        </div>
      </div>

      {/* Row 2: Evidence by Type and Documents by Source */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Evidence Counts by Type */}
        <div className="p-5 rounded-xl bg-[#0F172A] border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Archive className="w-4 h-4 text-emerald-400" />
                Evidence Records By Technical Modality
              </h3>
              <p className="text-[11px] text-slate-400">Physical vs Digital Forensics Classification</p>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-900">
              SQL GROUP BY
            </span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.evidence_by_type} layout="vertical" margin={{ top: 5, right: 20, left: 60, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" horizontal={false} />
                <XAxis type="number" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis dataKey="evidence_type" type="category" stroke="#64748B" fontSize={10} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0B1120', borderColor: '#1E293B', borderRadius: '8px', fontSize: '11px' }}
                  itemStyle={{ color: '#F1F5F9' }}
                />
                <Bar dataKey="count" fill="#10B981" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* MongoDB Documents by Source Type */}
        <div className="p-5 rounded-xl bg-[#0F172A] border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-teal-400" />
                Investigation Documents By Ingestion Source
              </h3>
              <p className="text-[11px] text-slate-400">MongoDB Aggregation Pipeline: $group by source_type</p>
            </div>
            <span className="text-[10px] font-mono text-teal-400 bg-teal-950 px-2 py-0.5 rounded border border-teal-900">
              MongoDB PIPELINE
            </span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.docs_by_source} margin={{ top: 15, right: 15, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                <XAxis dataKey="source_type" stroke="#64748B" fontSize={10} tickLine={false} interval={0} angle={-15} textAnchor="end" height={45} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0B1120', borderColor: '#1E293B', borderRadius: '8px', fontSize: '11px' }}
                  itemStyle={{ color: '#F1F5F9' }}
                />
                <Bar dataKey="count" fill="#0D9488" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 3: Entity Count Distribution Bar */}
      <div className="p-5 rounded-xl bg-[#0F172A] border border-slate-800">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-2">
          Relational Database Population Summary
        </h3>
        <p className="text-[11px] text-slate-400 mb-4">
          Total tuple count across all major normalized relational tables in the DBMS schema.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {data.entity_totals.map((item: any) => (
            <div key={item.entity} className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-center">
              <span className="text-xs text-slate-400 font-medium block">{item.entity}</span>
              <span className="text-xl font-bold font-mono text-white mt-1 block">{item.count}</span>
              <span className="text-[10px] text-slate-500 font-mono">tuples</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
