import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Search, Database, FileText, FolderKanban, Users, Car,
  Smartphone, MapPin, Archive, ArrowRight, Sparkles, Filter, ExternalLink
} from 'lucide-react';
import { ApiService } from '../services/api';
import { UnifiedSearchResponse, SearchResultItem } from '../types';

export const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryParam = searchParams.get('q') || '';

  const [query, setQuery] = useState(queryParam);
  const [category, setCategory] = useState('all');
  const [results, setResults] = useState<UnifiedSearchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    if (queryParam) {
      setQuery(queryParam);
      executeSearch(queryParam, category);
    }
  }, [queryParam]);

  const executeSearch = async (term: string, cat: string) => {
    if (!term.trim()) return;
    setLoading(true);
    setHasSearched(true);
    try {
      const data = await ApiService.unifiedSearch(term, cat);
      setResults(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setSearchParams({ q: query.trim() });
      executeSearch(query.trim(), category);
    }
  };

  const handleQuickSearch = (term: string) => {
    setQuery(term);
    setSearchParams({ q: term });
    executeSearch(term, category);
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'case': return <FolderKanban className="w-4 h-4 text-blue-400" />;
      case 'person': return <Users className="w-4 h-4 text-indigo-400" />;
      case 'vehicle': return <Car className="w-4 h-4 text-sky-400" />;
      case 'device': return <Smartphone className="w-4 h-4 text-violet-400" />;
      case 'location': return <MapPin className="w-4 h-4 text-amber-400" />;
      case 'evidence': return <Archive className="w-4 h-4 text-emerald-400" />;
      case 'document': return <FileText className="w-4 h-4 text-emerald-400" />;
      default: return <Database className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold text-white tracking-tight m-0">Unified Cross-Database Search</h2>
          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-purple-950 text-purple-300 border border-purple-800">
            PostgreSQL + MongoDB Hybrid Engine
          </span>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Simultaneously queries indexed relational tables and polymorphic MongoDB documents, normalizing responses into a unified intelligence result set.
        </p>
      </div>

      {/* Main Search Input Form */}
      <div className="p-5 rounded-xl bg-[#0F172A] border border-slate-800">
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Enter query (e.g. blue sedan, PER-001, ThinkPad, wiretap, Peenya, BMW)..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-11 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-semibold shadow transition flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Searching...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Execute Search</span>
                </>
              )}
            </button>
          </div>

          {/* Quick Filter Buttons / Suggestions */}
          <div className="flex items-center justify-between text-xs text-slate-400 flex-wrap gap-2 pt-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-slate-500">Quick Test Terms:</span>
              {[
                'blue sedan',
                'Devendra Joshi',
                'ThinkPad X1',
                'Peenya',
                'YubiKey',
                'telegram',
                'CASE-2026-001'
              ].map((term) => (
                <button
                  key={term}
                  type="button"
                  onClick={() => handleQuickSearch(term)}
                  className="px-2 py-0.5 rounded bg-slate-800/80 hover:bg-slate-700 border border-slate-700/60 text-slate-300 text-[11px] font-mono transition"
                >
                  "{term}"
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-slate-500" />
              <select
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  if (query) executeSearch(query, e.target.value);
                }}
                className="bg-slate-900 border border-slate-700 text-slate-300 text-xs rounded-lg px-2 py-1"
              >
                <option value="all">All DB Targets</option>
                <option value="sql">Only SQL Records</option>
                <option value="nosql">Only MongoDB Documents</option>
                <option value="cases">Cases</option>
                <option value="vehicles">Vehicles</option>
                <option value="people">People</option>
                <option value="evidence">Evidence</option>
              </select>
            </div>
          </div>
        </form>
      </div>

      {/* Results Section */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 text-xs">
          <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          Fusing records across PostgreSQL tables and MongoDB documents...
        </div>
      ) : hasSearched && results ? (
        <div className="space-y-6">
          {/* Metrics Bar */}
          <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
            <div className="text-slate-300">
              Query: <span className="font-mono text-purple-400 font-semibold">"{results.query}"</span>
            </div>
            <div className="flex items-center gap-4 text-[11px] font-mono">
              <span className="text-blue-400">
                SQL Records: <strong>{results.total_sql_results}</strong>
              </span>
              <span className="text-emerald-400">
                MongoDB Documents: <strong>{results.total_mongo_results}</strong>
              </span>
            </div>
          </div>

          {results.total_sql_results === 0 && results.total_mongo_results === 0 ? (
            <div className="p-12 text-center rounded-xl bg-[#0F172A] border border-slate-800 text-slate-400">
              <Search className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <p className="text-xs">No records matched query in either database.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column: SQL Relational Store Results */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Database className="w-4 h-4 text-blue-400" />
                    Structured Relational Entities ({results.total_sql_results})
                  </h3>
                  <span className="text-[10px] font-mono text-blue-400">PostgreSQL Store</span>
                </div>

                {results.sql_results.length === 0 ? (
                  <p className="text-xs text-slate-500 italic p-4 bg-[#0F172A] rounded-xl border border-slate-800">
                    No SQL entity records matched this query.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {results.sql_results.map((item) => (
                      <Link
                        key={`${item.category}-${item.id}`}
                        to={item.url}
                        className="p-4 rounded-xl bg-[#0F172A] border border-slate-800 hover:border-blue-700/60 block transition group"
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2">
                            {getCategoryIcon(item.category)}
                            <span className="font-mono text-xs font-bold text-blue-400">{item.id}</span>
                            <span className="text-[10px] font-mono uppercase px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                              {item.category}
                            </span>
                          </div>
                          <span className="text-[10px] font-mono text-slate-500">
                            {item.source_db}
                          </span>
                        </div>

                        <h4 className="text-xs font-semibold text-slate-100 group-hover:text-blue-300 transition m-0">
                          {item.title}
                        </h4>
                        {item.subtitle && (
                          <div className="text-[11px] text-slate-400 mt-0.5">
                            {item.subtitle}
                          </div>
                        )}
                        <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                          {item.snippet}
                        </p>

                        <div className="mt-2 pt-1.5 border-t border-slate-800 flex items-center justify-between text-[10px] text-blue-400">
                          <span>Matched in {item.matched_field}</span>
                          <span className="flex items-center gap-1 group-hover:translate-x-0.5 transition">
                            View Entity Dossier <ArrowRight className="w-3 h-3" />
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Right Column: MongoDB Unstructured Documents */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-emerald-400" />
                    Unstructured Field Documents ({results.total_mongo_results})
                  </h3>
                  <span className="text-[10px] font-mono text-emerald-400">MongoDB Collection</span>
                </div>

                {results.mongo_results.length === 0 ? (
                  <p className="text-xs text-slate-500 italic p-4 bg-[#0F172A] rounded-xl border border-slate-800">
                    No MongoDB documents matched this query.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {results.mongo_results.map((item) => (
                      <Link
                        key={item.id}
                        to={item.url}
                        className="p-4 rounded-xl bg-[#0F172A] border border-slate-800 hover:border-emerald-700/60 block transition group"
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2">
                            {getCategoryIcon(item.category)}
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800/40">
                              {item.subtitle?.split('|')[0]?.trim()}
                            </span>
                            {item.case_id && (
                              <span className="text-[10px] font-mono text-blue-400 font-semibold">
                                {item.case_id}
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] font-mono text-emerald-400">
                            MongoDB
                          </span>
                        </div>

                        <h4 className="text-xs font-semibold text-slate-100 group-hover:text-emerald-300 transition m-0">
                          {item.title}
                        </h4>
                        <p className="text-[11px] text-slate-300 mt-1 line-clamp-3 leading-relaxed">
                          {item.snippet}
                        </p>

                        {item.tags && item.tags.length > 0 && (
                          <div className="flex items-center gap-1 flex-wrap mt-2">
                            {item.tags.map((t) => (
                              <span key={t} className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                                #{t}
                              </span>
                            ))}
                          </div>
                        )}

                        <div className="mt-2 pt-1.5 border-t border-slate-800 flex items-center justify-between text-[10px] text-emerald-400">
                          <span>Matched in {item.matched_field}</span>
                          <span className="flex items-center gap-1 group-hover:translate-x-0.5 transition">
                            Inspect Document <ArrowRight className="w-3 h-3" />
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="p-12 text-center rounded-xl bg-[#0F172A] border border-slate-800 text-slate-400">
          <Sparkles className="w-8 h-8 text-purple-400 mx-auto mb-2" />
          <h3 className="text-sm font-semibold text-slate-200">Unified Cross-Database Query Engine</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
            Search across vehicle registrations, suspect names, serial numbers, case titles, witness statements, and metadata tags simultaneously.
          </p>
        </div>
      )}
    </div>
  );
};
