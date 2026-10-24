import React, { useState, useEffect } from 'react';
import {
  FileText, Plus, Search, Filter, Trash2, Edit3, ExternalLink,
  Code, AlertCircle, Database, CheckCircle2, Tag, Calendar
} from 'lucide-react';
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
        setJsonError('Invalid JSON format in metadata field: ' + err.message);
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
      alert(err?.response?.data?.detail || 'Failed to ingest document into MongoDB.');
    }
  };

  const viewDetail = async (id: string) => {
    try {
      const detail = await ApiService.getDocument(id);
      setSelectedDoc(detail);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Permanently remove this unstructured document from MongoDB collection?')) return;
    try {
      await ApiService.deleteDocument(id);
      if (selectedDoc?.id === id) setSelectedDoc(null);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white tracking-tight m-0">Investigation Documents</h2>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950 text-emerald-400 border border-emerald-800">
              MongoDB NoSQL Collection: investigation_documents
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Polymorphic, schemaless documents including witness transcripts, chat exports, sensor JSON, and forensic reports.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center gap-2 shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          <span>Ingest New Document</span>
        </button>
      </div>

      {/* Filter and Search */}
      <div className="p-4 rounded-xl bg-[#0F172A] border border-slate-800 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Full-text search in MongoDB (title, content, tags, sources)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Document Type:</span>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-xs text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-emerald-500"
          >
            <option value="All">All 9 Types</option>
            {DOCUMENT_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Documents Grid */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 text-xs">Querying MongoDB cluster...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {docs.map((d) => (
            <div
              key={d.id}
              onClick={() => viewDetail(d.id)}
              className="p-4 rounded-xl bg-[#0F172A] border border-slate-800 hover:border-slate-700 cursor-pointer transition flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800/40">
                    {d.document_type}
                  </span>
                  {d.case_id && (
                    <span className="text-[10px] font-mono text-blue-400 font-semibold">
                      {d.case_id}
                    </span>
                  )}
                </div>
                <h4 className="font-semibold text-slate-100 text-sm group-hover:text-emerald-300 transition m-0">
                  {d.title}
                </h4>
                <p className="text-[11px] text-slate-400 mt-1 line-clamp-3 leading-relaxed">
                  {d.content}
                </p>

                {d.tags && d.tags.length > 0 && (
                  <div className="flex items-center gap-1 flex-wrap mt-2.5">
                    {d.tags.slice(0, 3).map((t) => (
                      <span key={t} className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                        #{t}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
                <span className="truncate max-w-[170px]">Source: {d.source_name}</span>
                <button onClick={(e) => handleDelete(d.id, e)} className="p-1 hover:text-red-400">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Document Detail Drawer */}
      {selectedDoc && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0F172A] border border-slate-800 rounded-xl w-full max-w-2xl p-6 shadow-2xl max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-3">
              <div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                  {selectedDoc.document_type}
                </span>
                <h3 className="text-base font-bold text-white m-0 mt-1">{selectedDoc.title}</h3>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Source: <span className="text-slate-200">{selectedDoc.source_name}</span> ({selectedDoc.source_type})
                </div>
              </div>
              <button onClick={() => setSelectedDoc(null)} className="text-slate-400 hover:text-white text-xs">
                ✕ Close
              </button>
            </div>

            <div className="space-y-4 text-xs text-slate-300 border-t border-slate-800 pt-3">
              {/* SQL Cross-Database Resolution */}
              {selectedDoc.case_detail && (
                <div className="p-3 rounded-lg bg-blue-950/40 border border-blue-900/60 text-xs">
                  <div className="font-semibold text-blue-300 mb-1 flex items-center gap-1.5">
                    <Database className="w-3.5 h-3.5" />
                    Resolved SQL Relational Case Context (Foreign Key Reference)
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-mono text-blue-400 font-bold">{selectedDoc.case_detail.case_id}</span>: {selectedDoc.case_detail.title}
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-blue-900 text-blue-200">
                      {selectedDoc.case_detail.status}
                    </span>
                  </div>
                </div>
              )}

              {/* Document Content */}
              <div>
                <span className="text-slate-500 font-medium block mb-1">Document Content Body:</span>
                <div className="p-3.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 leading-relaxed font-sans whitespace-pre-wrap">
                  {selectedDoc.content}
                </div>
              </div>

              {/* Dynamic Nested JSON Metadata */}
              <div>
                <span className="text-slate-500 font-medium block mb-1 flex items-center gap-1.5">
                  <Code className="w-3.5 h-3.5 text-emerald-400" />
                  Flexible Nested JSON Metadata (MongoDB Polymorphic Schema):
                </span>
                <pre className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-[11px] font-mono text-emerald-400 overflow-x-auto m-0">
                  {JSON.stringify(selectedDoc.metadata, null, 2)}
                </pre>
              </div>

              <div className="grid grid-cols-2 gap-3 text-[11px] text-slate-400 pt-2 border-t border-slate-800">
                <div>
                  <span className="text-slate-500">Document Timestamp:</span>{' '}
                  {selectedDoc.created_at ? new Date(selectedDoc.created_at).toLocaleString() : 'N/A'}
                </div>
                <div>
                  <span className="text-slate-500">System Ingestion Time:</span>{' '}
                  {selectedDoc.ingested_at ? new Date(selectedDoc.ingested_at).toLocaleString() : 'N/A'}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Ingest Document Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0F172A] border border-slate-800 rounded-xl w-full max-w-lg p-6 shadow-2xl max-h-[88vh] overflow-y-auto">
            <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-400" />
              Ingest Document into MongoDB Store
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Add polymorphic document with arbitrary nested JSON metadata and optional SQL foreign keys.
            </p>

            {jsonError && (
              <div className="p-2.5 mb-3 rounded bg-red-950/60 border border-red-800 text-red-200 text-xs">
                {jsonError}
              </div>
            )}

            <form onSubmit={handleCreateDocument} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Document Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Valet Key Drop Transcript"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Document Type *</label>
                  <select
                    value={docType}
                    onChange={(e) => setDocType(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white"
                  >
                    {DOCUMENT_TYPES.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Related SQL Case</label>
                  <select
                    value={caseId}
                    onChange={(e) => setCaseId(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white"
                  >
                    <option value="">-- Optional: Link Case --</option>
                    {cases.map((c) => (
                      <option key={c.case_id} value={c.case_id}>{c.case_id} ({c.title.substring(0, 20)}...)</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Source Type</label>
                  <select
                    value={sourceType}
                    onChange={(e) => setSourceType(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white"
                  >
                    <option value="Field Interview">Field Interview</option>
                    <option value="Digital Forensic Extraction">Digital Forensic Extraction</option>
                    <option value="Public OSINT">Public OSINT</option>
                    <option value="Sensor Log">Sensor Log</option>
                    <option value="Surveillance">Surveillance</option>
                    <option value="Formal Filing">Formal Filing</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Source Name / Reference *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. CCTV Camera 4, Telegram Feed"
                    value={sourceName}
                    onChange={(e) => setSourceName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Tags (Comma-separated)</label>
                <input
                  type="text"
                  placeholder="e.g. blue sedan, key cloning, valet"
                  value={tagsStr}
                  onChange={(e) => setTagsStr(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Content Body *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Enter full text content, transcript, or log snippet..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Nested JSON Metadata (Valid JSON)</label>
                <textarea
                  rows={3}
                  value={metadataJson}
                  onChange={(e) => setMetadataJson(e.target.value)}
                  className="w-full bg-slate-950 font-mono border border-slate-700 rounded-lg p-2 text-xs text-emerald-400"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-3 py-1.5 border border-slate-700 text-xs rounded text-slate-300">Cancel</button>
                <button type="submit" className="px-4 py-1.5 bg-emerald-600 text-white text-xs font-semibold rounded">Save to MongoDB</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
