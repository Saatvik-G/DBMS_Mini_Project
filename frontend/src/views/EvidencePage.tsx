import React, { useState, useEffect } from 'react';
import {
  Archive, Plus, Search, Filter, ShieldCheck, Clock,
  ArrowRightLeft, AlertCircle, Trash2, ChevronRight, User, FolderKanban
} from 'lucide-react';
import { ApiService } from '../services/api';
import { Evidence, Officer, Case } from '../types';

export const EvidencePage: React.FC = () => {
  const [evidenceList, setEvidenceList] = useState<Evidence[]>([]);
  const [cases, setCases] = useState<Case[]>([]);
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [selectedItem, setSelectedItem] = useState<Evidence | null>(null);

  // Create Evidence Modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [etype, setEtype] = useState('Digital Hardware');
  const [desc, setDesc] = useState('');
  const [caseId, setCaseId] = useState('');
  const [officerId, setOfficerId] = useState('');
  const [storageRef, setStorageRef] = useState('Vault A / Bin 101');
  const [status, setStatus] = useState('Logged in Secure Storage');
  const [notes, setNotes] = useState('');

  // Log Custody Event Modal
  const [isCustodyModalOpen, setIsCustodyModalOpen] = useState(false);
  const [custodyEventType, setCustodyEventType] = useState('Checked Out for Analysis');
  const [custodyOfficerId, setCustodyOfficerId] = useState('');
  const [custodyNotes, setCustodyNotes] = useState('');

  useEffect(() => {
    loadData();
  }, [search, typeFilter]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [evList, cList, offList] = await Promise.all([
        ApiService.getEvidenceList({
          search: search || undefined,
          evidence_type: typeFilter !== 'All' ? typeFilter : undefined
        }),
        ApiService.getCases(),
        ApiService.getOfficers()
      ]);
      setEvidenceList(evList);
      setCases(cList);
      setOfficers(offList);
      if (cList.length > 0 && !caseId) setCaseId(cList[0].case_id);
      if (offList.length > 0 && !officerId) {
        setOfficerId(offList[0].officer_id);
        setCustodyOfficerId(offList[0].officer_id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !caseId || !storageRef) return;
    try {
      await ApiService.createEvidence({
        title,
        evidence_type: etype,
        description: desc,
        case_id: caseId,
        collected_by_officer_id: officerId || undefined,
        storage_reference: storageRef,
        status,
        notes: notes || undefined
      });
      setIsCreateModalOpen(false);
      setTitle('');
      setDesc('');
      setNotes('');
      loadData();
    } catch (err: any) {
      alert(err?.response?.data?.detail || 'Failed to register evidence.');
    }
  };

  const viewDetail = async (eid: string) => {
    try {
      const data = await ApiService.getEvidence(eid);
      setSelectedItem(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddCustodyEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem || !custodyOfficerId) return;
    try {
      await ApiService.addCustodyEvent(selectedItem.evidence_id, {
        officer_id: custodyOfficerId,
        event_type: custodyEventType,
        notes: custodyNotes || undefined
      });
      setIsCustodyModalOpen(false);
      setCustodyNotes('');
      // Reload selected item to show updated history
      viewDetail(selectedItem.evidence_id);
      loadData();
    } catch (err: any) {
      alert(err?.response?.data?.detail || 'Failed to record custody event.');
    }
  };

  const handleDelete = async (eid: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm(`Delete evidence item ${eid}? This will permanently remove its chain of custody history.`)) return;
    try {
      await ApiService.deleteEvidence(eid);
      if (selectedItem?.evidence_id === eid) setSelectedItem(null);
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
            <h2 className="text-xl font-bold text-white tracking-tight m-0">Evidence & Chain of Custody</h2>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950 text-emerald-400 border border-emerald-800">
              Relational: evidence & evidence_custody
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Physical tools, digital forensics, and documentary items with strict chronological transfer audits.
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center gap-2 shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          <span>Log Evidence Item</span>
        </button>
      </div>

      {/* Disclaimers & Info */}
      <div className="px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
        <span className="flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          Academic Prototype tracking custody events — demonstrates 1:N subtable audit patterns in relational design.
        </span>
        <span className="font-mono text-emerald-400">PRAGMA foreign_keys = ON</span>
      </div>

      {/* Filters */}
      <div className="p-4 rounded-xl bg-[#0F172A] border border-slate-800 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search evidence by title, ID, or storage reference..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Type:</span>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-xs text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-emerald-500"
          >
            <option value="All">All Types</option>
            <option value="Digital Hardware">Digital Hardware</option>
            <option value="Digital Forensics">Digital Forensics</option>
            <option value="Physical Tool">Physical Tool</option>
            <option value="Physical Vehicle">Physical Vehicle</option>
            <option value="Telecommunications Hardware">Telecommunications Hardware</option>
            <option value="Documentary">Documentary</option>
          </select>
        </div>
      </div>

      {/* Evidence Table */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 text-xs">Loading evidence repository...</div>
      ) : (
        <div className="bg-[#0F172A] border border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/60 text-slate-400 text-[11px] font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Evidence ID</th>
                <th className="py-3 px-4">Item Title & Type</th>
                <th className="py-3 px-4">Associated Case</th>
                <th className="py-3 px-4">Vault Location</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {evidenceList.map((e) => (
                <tr
                  key={e.evidence_id}
                  onClick={() => viewDetail(e.evidence_id)}
                  className="hover:bg-slate-800/40 cursor-pointer transition group"
                >
                  <td className="py-3.5 px-4 font-mono font-bold text-emerald-400 whitespace-nowrap">
                    {e.evidence_id}
                  </td>
                  <td className="py-3.5 px-4 max-w-xs">
                    <div className="font-semibold text-slate-100 group-hover:text-emerald-300 transition truncate">
                      {e.title}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5 font-mono">{e.evidence_type}</div>
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className="font-mono text-blue-400">{e.case_id}</span>
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap text-slate-300 font-mono text-[11px]">
                    {e.storage_reference}
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-200 border border-slate-700">
                      {e.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={(ev) => handleDelete(e.evidence_id, ev)}
                        className="p-1 text-slate-500 hover:text-red-400 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 transition" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Custody Drawer / Detail Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0F172A] border border-slate-800 rounded-xl w-full max-w-2xl p-6 shadow-2xl max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="font-mono text-emerald-400 text-xs font-bold">{selectedItem.evidence_id}</span>
                <h3 className="text-base font-bold text-white m-0">{selectedItem.title}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                    {selectedItem.evidence_type}
                  </span>
                  <span className="text-xs text-blue-400 font-mono">
                    Case: {selectedItem.case_id}
                  </span>
                </div>
              </div>
              <button onClick={() => setSelectedItem(null)} className="text-slate-400 hover:text-white text-xs">
                ✕ Close
              </button>
            </div>

            <div className="p-3.5 rounded-lg bg-slate-900 border border-slate-800 text-xs space-y-1 text-slate-300 mb-4">
              <p className="m-0 leading-relaxed">{selectedItem.description}</p>
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
                <div><span className="text-slate-500 font-medium">Storage Location:</span> {selectedItem.storage_reference}</div>
                <div><span className="text-slate-500 font-medium">Logged Status:</span> {selectedItem.status}</div>
                <div><span className="text-slate-500 font-medium">Collected By:</span> {selectedItem.collected_by_name || 'Officer'}</div>
                <div><span className="text-slate-500 font-medium">Collection Date:</span> {selectedItem.collection_date ? new Date(selectedItem.collection_date).toLocaleDateString() : 'N/A'}</div>
              </div>
            </div>

            {/* Chain of Custody History Sub-Table */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <ArrowRightLeft className="w-3.5 h-3.5 text-emerald-400" />
                  Sequential Chain of Custody Audit Log (evidence_custody)
                </h4>
                <button
                  onClick={() => setIsCustodyModalOpen(true)}
                  className="px-2.5 py-1 rounded bg-purple-600 hover:bg-purple-500 text-white text-[11px] font-medium flex items-center gap-1 transition"
                >
                  <Plus className="w-3 h-3" />
                  <span>Transfer / Audit Action</span>
                </button>
              </div>

              {(!selectedItem.custody_history || selectedItem.custody_history.length === 0) ? (
                <p className="text-xs text-slate-500 italic">No custody transfer events recorded.</p>
              ) : (
                <div className="border border-slate-800 rounded-lg overflow-hidden">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-slate-900 text-slate-400 text-[10px] uppercase font-semibold">
                      <tr className="border-b border-slate-800">
                        <th className="py-2 px-3">Timestamp</th>
                        <th className="py-2 px-3">Event Action</th>
                        <th className="py-2 px-3">Handling Officer</th>
                        <th className="py-2 px-3">Operational Notes</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/80 text-[11px]">
                      {selectedItem.custody_history.map((cust) => (
                        <tr key={cust.custody_event_id} className="hover:bg-slate-900/40">
                          <td className="py-2 px-3 font-mono text-slate-400 whitespace-nowrap">
                            {new Date(cust.event_timestamp).toLocaleString()}
                          </td>
                          <td className="py-2 px-3 font-medium text-emerald-400">
                            {cust.event_type}
                          </td>
                          <td className="py-2 px-3 text-slate-300">
                            {cust.officer_name || 'Investigator'}
                          </td>
                          <td className="py-2 px-3 text-slate-400">
                            {cust.notes || '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Create Evidence Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0F172A] border border-slate-800 rounded-xl w-full max-w-md p-6 shadow-2xl">
            <h3 className="text-sm font-bold text-white mb-3">Log Evidence Record</h3>
            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Item Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Cloned Transponder Smart Key"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Evidence Type</label>
                  <select
                    value={etype}
                    onChange={(e) => setEtype(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white"
                  >
                    <option value="Digital Hardware">Digital Hardware</option>
                    <option value="Digital Forensics">Digital Forensics</option>
                    <option value="Physical Tool">Physical Tool</option>
                    <option value="Physical Vehicle">Physical Vehicle</option>
                    <option value="Telecommunications Hardware">Telecommunications Hardware</option>
                    <option value="Documentary">Documentary</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Associated Case *</label>
                  <select
                    required
                    value={caseId}
                    onChange={(e) => setCaseId(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white"
                  >
                    {cases.map((c) => (
                      <option key={c.case_id} value={c.case_id}>{c.case_id} - {c.title.substring(0, 20)}...</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Storage Reference *</label>
                  <input
                    type="text"
                    required
                    placeholder="Vault A / Bin 101"
                    value={storageRef}
                    onChange={(e) => setStorageRef(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Collecting Officer</label>
                  <select
                    value={officerId}
                    onChange={(e) => setOfficerId(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white"
                  >
                    {officers.map((o) => (
                      <option key={o.officer_id} value={o.officer_id}>{o.full_name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Description *</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Seizure details, condition..."
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button type="button" onClick={() => setIsCreateModalOpen(false)} className="px-3 py-1.5 border border-slate-700 text-xs rounded text-slate-300">Cancel</button>
                <button type="submit" className="px-4 py-1.5 bg-emerald-600 text-white text-xs font-semibold rounded">Log Item</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Log Custody Event Modal */}
      {isCustodyModalOpen && selectedItem && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0F172A] border border-slate-800 rounded-xl w-full max-w-md p-6 shadow-2xl">
            <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
              <ArrowRightLeft className="w-4 h-4 text-purple-400" />
              Log Chain of Custody Transfer
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Item: {selectedItem.evidence_id} — {selectedItem.title}
            </p>

            <form onSubmit={handleAddCustodyEvent} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Custody Action Event *</label>
                <select
                  value={custodyEventType}
                  onChange={(e) => setCustodyEventType(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white"
                >
                  <option value="Transferred">Transferred</option>
                  <option value="Checked Out for Analysis">Checked Out for Analysis</option>
                  <option value="Returned to Secure Storage">Returned to Secure Storage</option>
                  <option value="Submitted to Lab for Analysis">Submitted to Lab for Analysis</option>
                  <option value="Court Presentation">Court Presentation</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Handling Officer *</label>
                <select
                  value={custodyOfficerId}
                  onChange={(e) => setCustodyOfficerId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white"
                >
                  {officers.map((o) => (
                    <option key={o.officer_id} value={o.officer_id}>{o.full_name} ({o.role})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Procedure Notes</label>
                <textarea
                  rows={2}
                  placeholder="Reason for checkout / laboratory testing reference..."
                  value={custodyNotes}
                  onChange={(e) => setCustodyNotes(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button type="button" onClick={() => setIsCustodyModalOpen(false)} className="px-3 py-1.5 border border-slate-700 text-xs rounded text-slate-300">Cancel</button>
                <button type="submit" className="px-4 py-1.5 bg-purple-600 text-white text-xs font-semibold rounded">Record Custody Event</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
