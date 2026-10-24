import React, { useState, useEffect } from 'react';
import {
  Database, Play, CheckCircle2, Clock, Code, Layers,
  Server, Shield, Sparkles, BookOpen, ChevronRight, AlertCircle
} from 'lucide-react';
import { ApiService } from '../services/api';

export const DBMSConceptsPage: React.FC = () => {
  const [queries, setQueries] = useState<any[]>([]);
  const [selectedQueryId, setSelectedQueryId] = useState('q1_three_way_join');
  const [executionResult, setExecutionResult] = useState<any | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);

  useEffect(() => {
    loadQueries();
  }, []);

  const loadQueries = async () => {
    try {
      const qList = await ApiService.getDemoQueries();
      setQueries(qList);
      if (qList.length > 0) {
        handleExecute(qList[0].id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleExecute = async (queryId: string) => {
    setSelectedQueryId(queryId);
    setIsExecuting(true);
    try {
      const res = await ApiService.executeConceptQuery(queryId);
      setExecutionResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsExecuting(false);
    }
  };

  const concepts = [
    {
      title: '1. Relational Modeling & Normalization (1NF to BCNF)',
      badge: 'Relational Design',
      desc: 'The relational database is decomposed into 11 primary entity tables and 11 bridge junction tables to eliminate functional and transitive dependencies.',
      points: [
        '1NF: All attributes are atomic (no arrays or comma-delimited values inside SQL columns).',
        '2NF: Every non-key attribute is fully functionally dependent on the entire primary key.',
        '3NF / BCNF: Removed transitive dependencies by extracting independent entities (Officers, Locations, Devices, Organizations) into standalone tables.'
      ]
    },
    {
      title: '2. Primary Keys, Foreign Keys & Referential Integrity',
      badge: 'Integrity Rules',
      desc: 'Foreign key constraints ensure relational consistency across all entity boundaries.',
      points: [
        'ON DELETE CASCADE: Applied strictly on junction tables (case_people, person_vehicles) so removing an entity automatically cleans associations without leaving orphaned foreign keys.',
        'ON DELETE RESTRICT: Enforced on evidence.case_id to prevent accidental deletion of cases that hold active legal evidence history.',
        'ON DELETE SET NULL: Used for lead_officer_id and collected_by_officer_id to preserve cases and evidence when an investigator profile is retired.'
      ]
    },
    {
      title: '3. Many-to-Many Associations via Bridge / Junction Tables',
      badge: 'M:N Relationships',
      desc: 'Solves complex academic M:N relationships cleanly using composite primary key bridge tables.',
      points: [
        'case_people: Links cases and persons with relationship roles (e.g. Eyewitness, Suspect, Reporting Party).',
        'person_vehicles: Maps individuals to owned, leased, or operated automobiles.',
        'evidence_devices: Correlates digital evidence extractions back to physical hardware units.'
      ]
    },
    {
      title: '4. SQL vs NoSQL Architectural Trade-offs',
      badge: 'Hybrid Fusion Architecture',
      desc: 'Why did we choose both PostgreSQL and MongoDB in a single system?',
      points: [
        'PostgreSQL (SQL): Strict schema, transactional ACID guarantees, complex multi-table joins, and foreign key cascades make it ideal for structured entity master data.',
        'MongoDB (NoSQL): Polymorphic schema allows storing 9 different document types (CCTV telemetry, forensic transcripts, WhatsApp/Signal chats, raw JSON payloads) with varying nested structures without schema migrations.',
        'Fusion Layer: Fast full-text regex and text indexing in MongoDB referencing SQL Case IDs.'
      ]
    }
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="p-5 rounded-xl bg-gradient-to-r from-blue-950/60 via-slate-900 to-purple-950/60 border border-slate-800">
        <div className="flex items-center gap-2 mb-1">
          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-900 text-blue-300 border border-blue-700">
            PES University • DBMS Mini Project Viva
          </span>
          <span className="text-xs text-slate-400">Team: Saatvik Gupta & Satyam Goyal</span>
        </div>
        <h2 className="text-xl font-bold text-white tracking-tight m-0">
          DBMS Core Concepts Demonstration
        </h2>
        <p className="text-xs text-slate-300 mt-1 max-w-4xl leading-relaxed">
          This interactive module enables examiners and students to inspect the normalized schema, review relational integrity rules, and execute safe real-time benchmark queries against live PostgreSQL and MongoDB engines.
        </p>
      </div>

      {/* Interactive Viva Query Runner Section */}
      <div className="p-5 rounded-xl bg-[#0F172A] border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-blue-400" />
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider m-0">
                Interactive Predefined Query Benchmark Runner
              </h3>
              <p className="text-[11px] text-slate-400 m-0">
                Executes safe, parameterized queries with real database execution timing.
              </p>
            </div>
          </div>
          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
            LIVE DB EXECUTION
          </span>
        </div>

        {/* Query Selector Tabs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
          {queries.map((q) => {
            const isSelected = selectedQueryId === q.id;
            return (
              <button
                key={q.id}
                onClick={() => handleExecute(q.id)}
                className={`p-3 rounded-lg text-left transition border flex flex-col justify-between ${
                  isSelected
                    ? 'bg-blue-600/20 border-blue-500 text-white'
                    : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-semibold ${
                      q.type === 'SQL' ? 'bg-blue-950 text-blue-300 border border-blue-800/40' :
                      q.type === 'MongoDB' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/40' :
                      'bg-purple-950 text-purple-300 border border-purple-800/40'
                    }`}>
                      {q.type}
                    </span>
                    {isSelected && <Play className="w-3 h-3 text-blue-400 fill-current" />}
                  </div>
                  <h4 className="text-xs font-semibold text-slate-100 m-0 line-clamp-1">{q.title}</h4>
                </div>
                <p className="text-[10px] text-slate-400 mt-1 line-clamp-2">{q.concept}</p>
              </button>
            );
          })}
        </div>

        {/* Query Output View */}
        {executionResult && (
          <div className="space-y-3 pt-3 border-t border-slate-800">
            {/* Query details strip */}
            <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
                <span className="font-semibold text-white">{executionResult.title}</span>
                <div className="flex items-center gap-3 font-mono text-[11px]">
                  <span className="text-slate-400">Target Engine: <strong className="text-blue-400">{executionResult.engine}</strong></span>
                  <span className="text-emerald-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {executionResult.execution_time_ms} ms
                  </span>
                  <span className="text-purple-400">
                    {executionResult.row_count} rows returned
                  </span>
                </div>
              </div>

              <div className="text-[11px] text-slate-300">
                <span className="text-slate-500 font-medium">DBMS Concept:</span> {executionResult.concept}
              </div>

              {/* Code snippet of query */}
              <div className="pt-1">
                <span className="text-[10px] font-mono text-slate-500 block mb-1">EXECUTED QUERY SYNTAX:</span>
                <pre className="p-2.5 rounded bg-[#070B14] font-mono text-[11px] text-blue-300 border border-slate-800 overflow-x-auto m-0 leading-relaxed">
                  {executionResult.executed_query}
                </pre>
              </div>
            </div>

            {/* Results Table */}
            <div className="border border-slate-800 rounded-lg overflow-hidden shadow-sm">
              <div className="overflow-x-auto max-h-72">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-900 sticky top-0 text-slate-300 font-mono text-[10px] uppercase">
                    <tr className="border-b border-slate-800">
                      {executionResult.columns.map((col: string) => (
                        <th key={col} className="py-2.5 px-3 whitespace-nowrap">{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/70 text-[11px]">
                    {executionResult.rows.map((row: any, idx: number) => (
                      <tr key={idx} className="hover:bg-slate-900/50 font-sans">
                        {executionResult.columns.map((col: string) => (
                          <td key={col} className="py-2 px-3 whitespace-nowrap text-slate-200">
                            {row[col] !== undefined ? String(row[col]) : ''}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Core Academic DBMS Theory Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {concepts.map((c) => (
          <div key={c.title} className="p-5 rounded-xl bg-[#0F172A] border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800/40 font-semibold">
                  {c.badge}
                </span>
              </div>
              <h3 className="text-sm font-bold text-white mb-2">{c.title}</h3>
              <p className="text-xs text-slate-300 mb-3 leading-relaxed">{c.desc}</p>
              <ul className="space-y-1.5 pl-0 text-xs text-slate-400 list-none m-0">
                {c.points.map((pt, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 flex-shrink-0 mt-0.5" />
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
