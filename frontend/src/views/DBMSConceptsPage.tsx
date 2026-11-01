import React, { useState, useEffect } from 'react';
import { Play } from 'lucide-react';
import { ApiService } from '../services/api';

export const DBMSConceptsPage: React.FC = () => {
  const [queries, setQueries] = useState<any[]>([]);
  const [selectedQueryId, setSelectedQueryId] = useState('q1_three_way_join');
  const [executionResult, setExecutionResult] = useState<any | null>(null);
  const [_loading, setLoading] = useState(false);

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
    setLoading(true);
    try {
      const res = await ApiService.executeConceptQuery(queryId);
      setExecutionResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const concepts = [
    {
      title: 'Relational Modeling & Normalization (1NF to BCNF)',
      badge: 'Relational Design',
      desc: 'The database is decomposed into 10 primary entity tables and 12 associative junction tables to eliminate functional and transitive dependencies.',
      points: [
        '1NF: Every attribute contains atomic scalar values (no repeating groups or arrays in relational columns).',
        '2NF: Every non-key attribute is fully functionally dependent on the primary key, eliminating partial dependencies.',
        '3NF / BCNF: All transitive functional dependencies removed by isolating independent entities (Officers, Locations, Devices, Organizations) into standalone tables.'
      ]
    },
    {
      title: 'Primary Keys, Foreign Keys & Referential Integrity',
      badge: 'Integrity Rules',
      desc: 'Foreign key constraints ensure relational consistency across all entity boundaries.',
      points: [
        'ON DELETE CASCADE: Applied on junction tables (case_people, person_vehicles) so removing an entity automatically cleans associations without leaving orphaned foreign keys.',
        'ON DELETE RESTRICT: Enforced on evidence.case_id to prevent accidental deletion of cases that hold active legal evidence history.',
        'ON DELETE SET NULL: Used for lead_officer_id and collected_by_officer_id to preserve cases and evidence when an investigator profile is retired.'
      ]
    },
    {
      title: 'Many-to-Many Associations via 12 Junction Tables',
      badge: 'M:N Relationships',
      desc: 'Resolves complex real-world many-to-many relationships using composite primary key bridge tables.',
      points: [
        'case_people: Maps cases to suspects, witnesses, victims, and informants.',
        'person_vehicles: Correlates individuals to registered or operated vehicles.',
        'evidence_devices: Correlates digital evidence extractions back to physical hardware units.'
      ]
    },
    {
      title: 'SQL vs NoSQL Persistence Architecture',
      badge: 'Hybrid Persistence',
      desc: 'Technical rationale for polyglot persistence combining PostgreSQL and MongoDB in one platform.',
      points: [
        'PostgreSQL (SQL Core): 22-table relational core provides ACID guarantees, check constraints, and foreign key cascades for legal evidence custody.',
        'MongoDB (NoSQL Document Store): Stores polymorphic intelligence documents (CCTV logs, phone extractions, audio transcripts) with varying schemas without DDL migrations.',
        'Integration: Federated search and foreign entity ID cross-referencing between relational tables and document collections.'
      ]
    }
  ];

  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="pb-3 border-b border-[#1E2638]">
        <h1 className="text-lg font-semibold text-slate-100">DBMS Concepts & Live Sandbox</h1>
        <p className="text-xs text-slate-400">
          Relational normalization proofs, foreign key integrity rules, and live query execution runner
        </p>
      </div>

      {/* Interactive Query Runner */}
      <div className="p-4 bg-[#0B0F17] border border-[#1E2638] rounded space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xs font-semibold text-slate-200">Predefined Benchmark Queries</h2>
            <p className="text-[11px] text-slate-500">
              Select any query to execute it against the connected database engine
            </p>
          </div>
          <span className="text-[10px] font-mono text-slate-400 bg-[#0E1420] px-2 py-0.5 rounded border border-[#1E2638]">
            Live DB Execution
          </span>
        </div>

        {/* Query Selector Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
          {queries.map((q) => {
            const isSelected = selectedQueryId === q.id;
            return (
              <button
                key={q.id}
                onClick={() => handleExecute(q.id)}
                className={`p-2.5 rounded text-left transition-colors duration-150 border flex flex-col justify-between ${
                  isSelected
                    ? 'bg-[#141C2B] border-blue-500 text-slate-100'
                    : 'bg-[#0E1420] border-[#1E2638] text-slate-400 hover:text-slate-200 hover:bg-[#111723]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-mono px-1 rounded bg-[#070A0F] text-slate-400 border border-[#1E2638]">
                      {q.type}
                    </span>
                    {isSelected && <Play className="w-3 h-3 text-blue-400 fill-current" />}
                  </div>
                  <div className="text-xs font-medium text-slate-200 truncate">{q.title}</div>
                </div>
                <div className="text-[10px] text-slate-500 mt-1 line-clamp-1">{q.concept}</div>
              </button>
            );
          })}
        </div>

        {/* Execution Output */}
        {executionResult && (
          <div className="space-y-3 pt-3 border-t border-[#1E2638]">
            <div className="p-3 rounded bg-[#0E1420] border border-[#1E2638] space-y-2">
              <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
                <span className="font-medium text-slate-200">{executionResult.title}</span>
                <div className="flex items-center gap-3 font-mono text-[11px] text-slate-400">
                  <span>Engine: <strong className="text-blue-400 font-normal">{executionResult.engine}</strong></span>
                  <span>Time: <strong className="text-slate-300 font-normal">{executionResult.execution_time_ms} ms</strong></span>
                  <span>Rows: <strong className="text-slate-300 font-normal">{executionResult.row_count}</strong></span>
                </div>
              </div>

              <div className="text-[11px] text-slate-400">
                <span className="text-slate-500">DBMS Concept:</span> {executionResult.concept}
              </div>

              <div>
                <span className="text-[10px] font-mono text-slate-500 block mb-1">Executed query:</span>
                <pre className="p-2 rounded bg-[#070A0F] font-mono text-[11px] text-blue-300 border border-[#1E2638] overflow-x-auto m-0 leading-relaxed">
                  {executionResult.executed_query}
                </pre>
              </div>
            </div>

            {/* Results Table */}
            <div className="border border-[#1E2638] rounded overflow-hidden">
              <div className="overflow-x-auto max-h-64">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-[#0E1420] sticky top-0 text-slate-400 font-mono text-[10px]">
                    <tr className="border-b border-[#1E2638]">
                      {executionResult.columns.map((col: string) => (
                        <th key={col} className="py-2 px-3 whitespace-nowrap">{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#161D2B]">
                    {executionResult.rows.map((row: any, idx: number) => (
                      <tr key={idx} className="hover:bg-[#141C2B] transition-colors duration-150">
                        {executionResult.columns.map((col: string) => (
                          <td key={col} className="py-1.5 px-3 whitespace-nowrap text-slate-300 font-mono text-[11px]">
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

      {/* DBMS Concept Reference Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {concepts.map((c) => (
          <div key={c.title} className="p-4 rounded bg-[#0B0F17] border border-[#1E2638] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#0E1420] text-slate-400 border border-[#1E2638]">
                {c.badge}
              </span>
            </div>
            <h2 className="text-xs font-semibold text-slate-100">{c.title}</h2>
            <p className="text-xs text-slate-400 leading-relaxed m-0">{c.desc}</p>
            <ul className="space-y-1 pl-3 text-xs text-slate-400 list-disc m-0 pt-1">
              {c.points.map((pt, idx) => (
                <li key={idx} className="leading-normal">{pt}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};
