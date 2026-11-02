import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, Compass, Database } from 'lucide-react';
import { ApiService } from '../services/api';
import { UnifiedSearchResponse, SearchResultItem } from '../types';

interface SemanticResultItem {
  id: string;
  score: number;
  similarity_percent: string;
  title: string;
  document_type: string;
  summary: string;
  case_id?: string;
  source_name?: string;
  tags?: string[];
}

interface SemanticResponse {
  query: string;
  search_mode: string;
  vector_dimensions: number;
  total_documents_scanned: number;
  total_matches: number;
  results: SemanticResultItem[];
}

export const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryParam = searchParams.get('q') || '';

  const [query, setQuery] = useState(queryParam);
  const [searchMode, setSearchMode] = useState<'federated' | 'semantic'>('federated');
  const [category, setCategory] = useState('all');
  const [results, setResults] = useState<UnifiedSearchResponse | null>(null);
  const [semanticResults, setSemanticResults] = useState<SemanticResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    if (queryParam) {
      setQuery(queryParam);
      executeSearch(queryParam, searchMode, category);
    }
  }, [queryParam]);

  const executeSearch = async (term: string, mode: 'federated' | 'semantic', cat: string) => {
    if (!term.trim()) return;
    setLoading(true);
    setHasSearched(true);
    try {
      if (mode === 'federated') {
        const data = await ApiService.unifiedSearch(term, cat);
        setResults(data);
        setSemanticResults(null);
      } else {
        const data = await ApiService.searchSemantic(term);
        setSemanticResults(data);
        setResults(null);
      }
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
      executeSearch(query.trim(), searchMode, category);
    }
  };

  const handleQuickSearch = (term: string) => {
    setQuery(term);
    setSearchParams({ q: term });
    executeSearch(term, searchMode, category);
  };

  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      {/* Header */}
      <div className="pb-3 border-b border-[#1E2638] flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-lg font-semibold text-slate-100">Cross-Database Search & Vector Intelligence</h1>
          <p className="text-xs text-slate-400">
            Parallel search engine supporting multi-table SQL joins, MongoDB document full-text, and 64-dim vector embeddings
          </p>
        </div>

        {/* Search Mode Toggle */}
        <div className="flex items-center bg-[#0B0F17] border border-[#1E2638] rounded p-0.5 text-xs">
          <button
            type="button"
            onClick={() => {
              setSearchMode('federated');
              if (query.trim()) executeSearch(query.trim(), 'federated', category);
            }}
            className={`px-3 py-1 rounded transition-colors duration-150 flex items-center gap-1.5 ${
              searchMode === 'federated'
                ? 'bg-blue-600 text-white font-medium'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Federated (SQL + Mongo)</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setSearchMode('semantic');
              if (query.trim()) executeSearch(query.trim(), 'semantic', category);
            }}
            className={`px-3 py-1 rounded transition-colors duration-150 flex items-center gap-1.5 ${
              searchMode === 'semantic'
                ? 'bg-blue-600 text-white font-medium'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Vector Semantic (Cosine Similarity)</span>
          </button>
        </div>
      </div>

      {/* Search Input Box */}
      <div className="p-4 bg-[#0B0F17] border border-[#1E2638] rounded">
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={
                  searchMode === 'federated'
                    ? "Search keywords across cases, suspects, vehicles, devices, documents..."
                    : "Enter natural language description (e.g. 'stolen blue sedan hotel valet' or 'clandestine crypto transfer')..."
                }
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
              <span>{loading ? 'Searching...' : searchMode === 'semantic' ? 'Vector Match' : 'Search'}</span>
            </button>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 flex-wrap gap-2 pt-1">
            {searchMode === 'federated' ? (
              <div className="flex items-center gap-1.5">
                <span>Filter entity:</span>
                <select
                  value={category}
                  onChange={(e) => {
                    setCategory(e.target.value);
                    if (query.trim()) executeSearch(query.trim(), 'federated', e.target.value);
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
            ) : (
              <div className="text-[11px] text-blue-400 flex items-center gap-1 font-mono">
                <span>Metric: Cosine Similarity over 64-dim L2-normalized embeddings</span>
              </div>
            )}

            <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
              <span>Quick queries:</span>
              {(searchMode === 'federated' 
                ? ['crypto', 'sedan', 'PER-001', 'wiretap', 'cyber'] 
                : ['stolen luxury vehicle', 'crypto transfer log', 'cctv suspect frame', 'offshore wire']
              ).map((tag) => (
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
          {searchMode === 'semantic' ? 'Computing vector embeddings & calculating cosine similarities...' : 'Querying relational tables and document store...'}
        </div>
      ) : searchMode === 'semantic' && semanticResults ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400 px-1">
            <div>
              Vector matches for query <span className="font-mono text-blue-400">"{semanticResults.query}"</span>
            </div>
            <div className="font-mono text-[11px] text-slate-500">
              Scanned {semanticResults.total_documents_scanned} documents • Matched {semanticResults.total_matches}
            </div>
          </div>

          {semanticResults.results.length === 0 ? (
            <div className="p-8 text-center bg-[#0B0F17] border border-[#1E2638] rounded text-slate-400 text-xs">
              No vector matches found with positive similarity. Try broader conceptual keywords.
            </div>
          ) : (
            <div className="bg-[#0B0F17] border border-[#1E2638] rounded overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#1E2638] bg-[#0E1420] text-slate-400 text-[11px]">
                    <th className="py-2.5 px-3">Similarity</th>
                    <th className="py-2.5 px-3">Score</th>
                    <th className="py-2.5 px-3">Document Title</th>
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3">Linked Case</th>
                    <th className="py-2.5 px-3">Content Excerpt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#161D2B]">
                  {semanticResults.results.map((item, idx) => (
                    <tr key={`${item.id}-${idx}`} className="hover:bg-[#141C2B] transition-colors duration-150">
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <span className="px-1.5 py-0.5 rounded font-mono text-[10px] bg-blue-950/60 text-blue-400 border border-blue-800">
                          {item.similarity_percent}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                        {item.score}
                      </td>
                      <td className="py-2.5 px-3 font-medium text-slate-200 max-w-xs">
                        <Link to={`/documents/${item.id}`} className="hover:text-blue-400 transition-colors duration-150">
                          {item.title}
                        </Link>
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap font-mono text-[11px] text-slate-400">
                        {item.document_type}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-blue-400 text-[11px] whitespace-nowrap">
                        {item.case_id ? (
                          <Link to={`/cases/${item.case_id}`} className="hover:underline">
                            {item.case_id}
                          </Link>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-slate-400 truncate max-w-sm">
                        {item.summary}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
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
