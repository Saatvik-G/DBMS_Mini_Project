import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search } from 'lucide-react';
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

  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      {/* Header */}
      <div className="pb-3 border-b border-[#1E2638]">
        <h1 className="text-lg font-semibold text-slate-100">Cross-Database Search</h1>
        <p className="text-xs text-slate-400">
          Federated query engine searching PostgreSQL relational tables and MongoDB documents in parallel
        </p>
      </div>

      {/* Search Input Box */}
      <div className="p-4 bg-[#0B0F17] border border-[#1E2638] rounded">
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search across cases, suspects, vehicles, devices, documents..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full bg-[#0E1420] border border-[#1E2638] rounded pl-9 pr-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors duration-150"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-medium transition-colors duration-150 flex items-center gap-1.5 disabled:opacity-50"
            >
              <Search className="w-3.5 h-3.5" />
              <span>{loading ? 'Searching...' : 'Search'}</span>
            </button>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 flex-wrap gap-2 pt-1">
            <div className="flex items-center gap-1.5">
              <span>Filter entity:</span>
              <select
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  if (query.trim()) executeSearch(query.trim(), e.target.value);
                }}
                className="bg-[#0E1420] border border-[#1E2638] text-xs text-slate-200 rounded px-2 py-1 focus:outline-none focus:border-blue-500"
              >
                <option value="all">All Records</option>
                <option value="case">Cases</option>
                <option value="person">People</option>
                <option value="vehicle">Vehicles</option>
                <option value="device">Devices</option>
                <option value="location">Locations</option>
                <option value="evidence">Evidence</option>
                <option value="document">Documents (MongoDB)</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
              <span>Quick queries:</span>
              {['crypto', 'sedan', 'PER-001', 'wiretap', 'cyber'].map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleQuickSearch(tag)}
                  className="px-1.5 py-0.5 bg-[#0E1420] hover:bg-[#141C2B] border border-[#1E2638] text-slate-300 rounded font-mono text-[10px] transition-colors duration-150"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </form>
      </div>

      {/* Results Section */}
      {loading ? (
        <div className="p-8 text-center text-slate-400 text-xs">
          <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          Querying relational tables and document store...
        </div>
      ) : results ? (
        (() => {
          const allResults: SearchResultItem[] = [...(results.sql_results || []), ...(results.mongo_results || [])];
          const totalCount = (results.total_sql_results || 0) + (results.total_mongo_results || 0);

          return (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                <div>
                  Found <span className="font-semibold text-slate-200">{totalCount}</span> matching records for query{' '}
                  <span className="font-mono text-blue-400">"{results.query}"</span>
                </div>
                <div className="font-mono text-[11px] text-slate-500">
                  SQL: {results.total_sql_results} • MongoDB: {results.total_mongo_results}
                </div>
              </div>

              {allResults.length === 0 ? (
                <div className="p-8 text-center bg-[#0B0F17] border border-[#1E2638] rounded text-slate-400 text-xs">
                  No results found matching "{results.query}". Try a different keyword or expand the category filter.
                </div>
              ) : (
                <div className="bg-[#0B0F17] border border-[#1E2638] rounded overflow-hidden">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-[#1E2638] bg-[#0E1420] text-slate-400 text-[11px]">
                        <th className="py-2.5 px-3">Engine</th>
                        <th className="py-2.5 px-3">Type</th>
                        <th className="py-2.5 px-3">Title / Name</th>
                        <th className="py-2.5 px-3">Identifiers</th>
                        <th className="py-2.5 px-3">Summary / Details</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#161D2B]">
                      {allResults.map((item: SearchResultItem, idx: number) => (
                        <tr key={`${item.id}-${idx}`} className="hover:bg-[#141C2B] transition-colors duration-150">
                          <td className="py-2.5 px-3 whitespace-nowrap">
                            <span className={`px-1 py-0.2 rounded font-mono text-[10px] ${
                              item.source_db === 'MongoDB'
                                ? 'bg-[#0E1420] text-emerald-400 border border-emerald-900'
                                : 'bg-[#0E1420] text-blue-400 border border-blue-900'
                            }`}>
                              {item.source_db}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 whitespace-nowrap font-mono text-[11px] text-slate-400 capitalize">
                            {item.category}
                          </td>
                          <td className="py-2.5 px-3">
                            <Link
                              to={item.url}
                              className="font-medium text-slate-200 hover:text-blue-400 transition-colors duration-150"
                            >
                              {item.title}
                            </Link>
                          </td>
                          <td className="py-2.5 px-3 font-mono text-slate-400 text-[11px] whitespace-nowrap">
                            {item.id}
                          </td>
                          <td className="py-2.5 px-3 text-slate-400 truncate max-w-md">
                            {item.subtitle || item.snippet || '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          );
        })()
      ) : hasSearched ? (
        <div className="p-8 text-center text-slate-500 text-xs">No query executed.</div>
      ) : null}
    </div>
  );
};
