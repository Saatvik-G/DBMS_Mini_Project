import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Trash2 } from 'lucide-react';
import { ApiService } from '../services/api';
import { InvestigationDocument, Case } from '../types';

export const DocumentsPage: React.FC = () => {
  const [docs, setDocs] = useState<InvestigationDocument[]>([]);
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [selectedDoc, setSelectedDoc] = useState<any | null>(null);

  // Create Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [docType, setDocType] = useState('Witness statements');
  const [content, setContent] = useState('');
  const [summary, setSummary] = useState('');
  const [sourceType, setSourceType] = useState('Field Interview');
  const [sourceName, setSourceName] = useState('');
  const [caseId, setCaseId] = useState('');
  const [tagsStr, setTagsStr] = useState('');
  const [metadataJson, setMetadataJson] = useState('{\n  "witness_credibility": "High",\n  "verified": true\n}');
  const [jsonError, setJsonError] = useState<string | null>(null);

  const DOCUMENT_TYPES = [
    'Witness statements',
    'Investigation notes',
    'Social media posts',
    'Chat exports',
    'Image metadata',
    'CCTV metadata',
    'PDF reports',
    'Email archives',
    'JSON API responses'
  ];

  useEffect(() => {
    loadData();
  }, [search, typeFilter]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [dList, cList] = await Promise.all([
        ApiService.getDocuments({
          search: search || undefined,
          document_type: typeFilter !== 'All' ? typeFilter : undefined
        }),
        ApiService.getCases()
      ]);
      setDocs(dList);
      setCases(cList);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim() || !sourceName.trim()) return;

    let parsedMeta = {};
    if (metadataJson.trim()) {
      try {
        parsedMeta = JSON.parse(metadataJson);
        setJsonError(null);
      } catch (err: any) {
        setJsonError('Invalid JSON format: ' + err.message);
        return;
      }
    }

    const tags = tagsStr.split(',').map(t => t.trim()).filter(Boolean);

    try {
      await ApiService.createDocument({
        document_type: docType,
        title,
        content,
        summary: summary || title,
        source_type: sourceType,
        source_name: sourceName,
        case_id: caseId || undefined,
        tags,
        metadata: parsedMeta
      });
      setIsModalOpen(false);
      setTitle('');
      setContent('');
      setSummary('');
      setSourceName('');
      setTagsStr('');
      loadData();
    } catch (err: any) {
      alert(err?.response?.data?.detail || 'Failed to ingest document.');
    }
  };

  const handleDelete = async (docId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Delete this intelligence document from MongoDB?')) return;
    try {
      await ApiService.deleteDocument(docId);
      if (selectedDoc?.id === docId) setSelectedDoc(null);
      loadData();
    } catch (err: any) {
      alert(err?.response?.data?.detail || 'Failed to delete document.');
    }
  };

  const viewDetail = async (docId: string) => {
    try {
      const data = await ApiService.getDocument(docId);
      setSelectedDoc(data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#1E2638] gap-3">
        <div>
          <h1 className="text-lg font-semibold text-slate-100">Intelligence Documents (MongoDB)</h1>
          <p className="text-xs text-slate-400">
            Unstructured records, CCTV logs, interview transcripts, and digital dumps
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-medium flex items-center gap-1.5 transition-colors duration-150 self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Upload Document</span>
        </button>
      </div>

      {/* Filter and Search */}
      <div className="p-3 bg-[#0B0F17] border border-[#1E2638] rounded flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Full-text search in MongoDB (title, content, tags)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#0E1420] border border-[#1E2638] rounded pl-8 pr-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors duration-150"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <div className="flex items-center gap-1.5 text-slate-400">
            <Filter className="w-3 h-3" />
            <span>Type:</span>
          </div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-[#0E1420] border border-[#1E2638] text-xs text-slate-200 rounded px-2.5 py-1 focus:outline-none focus:border-blue-500"
          >
            <option value="All">All Types</option>
            {DOCUMENT_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Grid: Table + Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Table */}
        <div className="lg:col-span-2 bg-[#0B0F17] border border-[#1E2638] rounded overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              Querying MongoDB collection...
            </div>
          ) : docs.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs">No documents found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#1E2638] bg-[#0E1420] text-slate-400 text-[11px]">
                    <th className="py-2.5 px-3">Type</th>
                    <th className="py-2.5 px-3">Title</th>
                    <th className="py-2.5 px-3">Case ID</th>
                    <th className="py-2.5 px-3">Source</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#161D2B]">
                  {docs.map((d) => (
                    <tr
                      key={d.id}
                      onClick={() => viewDetail(d.id)}
                      className={`hover:bg-[#141C2B] cursor-pointer transition-colors duration-150 ${
                        selectedDoc?.id === d.id ? 'bg-[#141C2B]' : ''
                      }`}
                    >
                      <td className="py-2.5 px-3 whitespace-nowrap font-mono text-[10px] text-slate-400">
                        {d.document_type}
                      </td>
                      <td className="py-2.5 px-3 max-w-xs">
                        <div className="font-medium text-slate-200 truncate">{d.title}</div>
                        <div className="text-[11px] text-slate-500 truncate">{d.summary}</div>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-blue-400 whitespace-nowrap">
                        {d.case_id || '—'}
                      </td>
                      <td className="py-2.5 px-3 text-slate-400 truncate max-w-[120px]">
                        {d.source_name}
                      </td>
                      <td className="py-2.5 px-3 text-right whitespace-nowrap">
                        <button
                          onClick={(e) => handleDelete(d.id, e)}
                          className="text-slate-500 hover:text-red-400 p-1 transition-colors duration-150"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Selected Document Detail Panel */}
        <div className="bg-[#0B0F17] border border-[#1E2638] rounded p-4 space-y-3">
          {selectedDoc ? (
            <>
              <div className="pb-2 border-b border-[#1E2638]">
                <span className="font-mono text-[10px] text-slate-400 uppercase">{selectedDoc.document_type}</span>
                <h2 className="text-sm font-semibold text-slate-100 mt-0.5">{selectedDoc.title}</h2>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Source: {selectedDoc.source_name} ({selectedDoc.source_type})
                </div>
              </div>

              <div className="space-y-2 text-xs">
                {selectedDoc.case_id && (
                  <div>
                    <span className="text-slate-500 text-[11px] block">Case:</span>
                    <span className="font-mono text-blue-400">{selectedDoc.case_id}</span>
                  </div>
                )}

                <div>
                  <span className="text-slate-500 text-[11px] block">Content:</span>
                  <p className="text-slate-300 text-xs bg-[#0E1420] p-2.5 rounded border border-[#1E2638] max-h-48 overflow-y-auto whitespace-pre-wrap font-sans leading-relaxed m-0">
                    {selectedDoc.content}
                  </p>
                </div>

                {selectedDoc.tags && selectedDoc.tags.length > 0 && (
                  <div>
                    <span className="text-slate-500 text-[11px] block mb-1">Tags:</span>
                    <div className="flex gap-1 flex-wrap">
                      {selectedDoc.tags.map((t: string) => (
                        <span key={t} className="px-1.5 py-0.2 rounded bg-[#0E1420] text-slate-400 border border-[#1E2638] font-mono text-[10px]">
                          #{t}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {selectedDoc.metadata && Object.keys(selectedDoc.metadata).length > 0 && (
                  <div>
                    <span className="text-slate-500 text-[11px] block mb-1">Raw Document Metadata (JSON):</span>
                    <pre className="p-2 bg-[#070A0F] font-mono text-[10px] text-blue-300 border border-[#1E2638] rounded overflow-x-auto max-h-36 m-0">
                      {JSON.stringify(selectedDoc.metadata, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="p-8 text-center text-slate-500 text-xs">
              Select a document to inspect full content and JSON metadata.
            </div>
          )}
        </div>
      </div>

      {/* Ingest Document Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-[#0B0F17] border border-[#1E2638] rounded w-full max-w-lg p-5 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-[#1E2638]">
              <h2 className="text-sm font-semibold text-slate-100">Upload Document</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-200 text-xs">
                Close
              </button>
            </div>

            {jsonError && (
              <div className="p-2.5 rounded bg-red-950/40 border border-red-800 text-red-300 text-xs">
                {jsonError}
              </div>
            )}

            <form onSubmit={handleCreateDocument} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1">Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. CCTV Surveillance Log - Terminal B"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-[#0E1420] border border-[#1E2638] rounded px-3 py-1.5 text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">Document Type</label>
                  <select
                    value={docType}
                    onChange={(e) => setDocType(e.target.value)}
                    className="w-full bg-[#0E1420] border border-[#1E2638] rounded px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-blue-500"
                  >
                    {DOCUMENT_TYPES.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 mb-1">Related Case</label>
                  <select
                    value={caseId}
                    onChange={(e) => setCaseId(e.target.value)}
                    className="w-full bg-[#0E1420] border border-[#1E2638] rounded px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-blue-500 font-mono text-[11px]"
                  >
                    <option value="">-- None (Standalone) --</option>
                    {cases.map((c) => (
                      <option key={c.case_id} value={c.case_id}>{c.case_id}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">Source Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Traffic Cam Station 14"
                    value={sourceName}
                    onChange={(e) => setSourceName(e.target.value)}
                    className="w-full bg-[#0E1420] border border-[#1E2638] rounded px-3 py-1.5 text-slate-100 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1">Source Type</label>
                  <input
                    type="text"
                    value={sourceType}
                    onChange={(e) => setSourceType(e.target.value)}
                    className="w-full bg-[#0E1420] border border-[#1E2638] rounded px-3 py-1.5 text-slate-100 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Content</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Document body, extraction notes, transcript..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full bg-[#0E1420] border border-[#1E2638] rounded px-3 py-1.5 text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Tags (comma-separated)</label>
                <input
                  type="text"
                  placeholder="surveillance, cctv, suspect, wiretap"
                  value={tagsStr}
                  onChange={(e) => setTagsStr(e.target.value)}
                  className="w-full bg-[#0E1420] border border-[#1E2638] rounded px-3 py-1.5 text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Polymorphic Metadata (JSON)</label>
                <textarea
                  rows={3}
                  value={metadataJson}
                  onChange={(e) => setMetadataJson(e.target.value)}
                  className="w-full bg-[#070A0F] border border-[#1E2638] rounded px-3 py-1.5 text-slate-100 font-mono text-[11px] focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#1E2638]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 bg-[#0E1420] hover:bg-[#141C2B] border border-[#1E2638] text-slate-300 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded font-medium"
                >
                  Save Document
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
