import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Trash2, ArrowRightLeft } from 'lucide-react';
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
        event_type: custodyEventType,
        officer_id: custodyOfficerId,
        notes: custodyNotes
      });
      setIsCustodyModalOpen(false);
      setCustodyNotes('');
      viewDetail(selectedItem.evidence_id);
      loadData();
    } catch (err: any) {
      alert(err?.response?.data?.detail || 'Failed to record custody transfer.');
    }
  };

  const handleDeleteEvidence = async (eid: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm(`Delete evidence item ${eid}? Custody history will be archived.`)) return;
    try {
      await ApiService.deleteEvidence(eid);
      if (selectedItem?.evidence_id === eid) setSelectedItem(null);
      loadData();
    } catch (err: any) {
      alert(err?.response?.data?.detail || 'Failed to delete evidence item.');
    }
  };

  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#1E2638] gap-3">
        <div>
          <h1 className="text-lg font-semibold text-slate-100">Evidence & Chain of Custody</h1>
          <p className="text-xs text-slate-400">
            Physical and digital artifacts with SHA-256 verification and transfer logs
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-medium flex items-center gap-1.5 transition-colors duration-150 self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Register Evidence</span>
        </button>
      </div>

      {/* Search & Filters */}
      <div className="p-3 bg-[#0B0F17] border border-[#1E2638] rounded flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by evidence ID, title, storage ref..."
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
            <option value="Digital Hardware">Digital Hardware</option>
            <option value="Document">Document</option>
            <option value="Physical Contraband">Physical Contraband</option>
            <option value="Forensic Extraction">Forensic Extraction</option>
          </select>
        </div>
      </div>

      {/* Main Grid: Evidence Table + Detail Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Evidence Table */}
        <div className="lg:col-span-2 bg-[#0B0F17] border border-[#1E2638] rounded overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              Loading evidence...
            </div>
          ) : evidenceList.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">No evidence records found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#1E2638] bg-[#0E1420] text-slate-400 text-[11px]">
                    <th className="py-2.5 px-3">Evidence ID</th>
                    <th className="py-2.5 px-3">Item Title & Type</th>
                    <th className="py-2.5 px-3">Case</th>
                    <th className="py-2.5 px-3">Storage Ref</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#161D2B]">
                  {evidenceList.map((ev) => (
                    <tr
                      key={ev.evidence_id}
                      onClick={() => viewDetail(ev.evidence_id)}
                      className={`hover:bg-[#141C2B] cursor-pointer transition-colors duration-150 ${
                        selectedItem?.evidence_id === ev.evidence_id ? 'bg-[#141C2B]' : ''
                      }`}
                    >
                      <td className="py-2.5 px-3 font-mono font-medium text-blue-400 whitespace-nowrap">
                        {ev.evidence_id}
                      </td>
                      <td className="py-2.5 px-3 max-w-xs">
                        <div className="font-medium text-slate-200 truncate">{ev.title}</div>
                        <div className="text-[11px] text-slate-500">{ev.evidence_type}</div>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-400 whitespace-nowrap">
                        {ev.case_id}
                      </td>
                      <td className="py-2.5 px-3 text-slate-300 font-mono text-[11px] whitespace-nowrap">
                        {ev.storage_reference}
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap text-[11px] text-slate-300">
                        {ev.status}
                      </td>
                      <td className="py-2.5 px-3 text-right whitespace-nowrap">
                        <button
                          onClick={(e) => handleDeleteEvidence(ev.evidence_id, e)}
                          className="text-slate-500 hover:text-red-400 p-1 transition-colors duration-150"
                          title="Delete item"
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

        {/* Selected Item Detail Panel */}
        <div className="bg-[#0B0F17] border border-[#1E2638] rounded p-4 space-y-3">
          {selectedItem ? (
            <>
              <div className="flex items-center justify-between pb-2 border-b border-[#1E2638]">
                <div>
                  <span className="font-mono text-xs text-blue-400 font-medium">{selectedItem.evidence_id}</span>
                  <div className="text-sm font-semibold text-slate-100">{selectedItem.title}</div>
                </div>
                <button
                  onClick={() => setIsCustodyModalOpen(true)}
                  className="px-2.5 py-1 bg-[#0E1420] hover:bg-[#141C2B] border border-[#1E2638] rounded text-xs text-slate-200 flex items-center gap-1 transition-colors duration-150"
                >
                  <ArrowRightLeft className="w-3 h-3 text-blue-400" />
                  <span>Transfer</span>
                </button>
              </div>

              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-slate-500 text-[11px] block">Case:</span>
                  <span className="font-mono text-slate-200">{selectedItem.case_id}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[11px] block">Type & Storage:</span>
                  <span className="text-slate-200">{selectedItem.evidence_type} • {selectedItem.storage_reference}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[11px] block">Storage Reference:</span>
                  <span className="font-mono text-slate-300">{selectedItem.storage_reference}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[11px] block">Description:</span>
                  <p className="text-slate-300 text-xs m-0 leading-relaxed">{selectedItem.description || 'No description provided.'}</p>
                </div>
                {selectedItem.notes && (
                  <div>
                    <span className="text-slate-500 text-[11px] block">Investigative Notes:</span>
                    <p className="text-slate-400 text-xs m-0">{selectedItem.notes}</p>
                  </div>
                )}
              </div>

              {/* Custody Log */}
              <div className="pt-2 border-t border-[#1E2638] space-y-2">
                <div className="text-xs font-medium text-slate-200">Custody Audit Trail</div>
                {(!selectedItem.custody_history || selectedItem.custody_history.length === 0) ? (
                  <div className="text-slate-500 text-xs">No transfer history recorded.</div>
                ) : (
                  <div className="space-y-2 max-h-56 overflow-y-auto">
                    {selectedItem.custody_history.map((log: any) => (
                      <div key={log.custody_event_id || log.custody_id} className="p-2 bg-[#0E1420] border border-[#1E2638] rounded text-xs">
                        <div className="flex justify-between text-[11px] text-slate-500 mb-0.5">
                          <span className="font-medium text-slate-300">{log.event_type}</span>
                          <span className="font-mono">{new Date(log.event_timestamp).toLocaleDateString()}</span>
                        </div>
                        <div className="text-slate-400 text-[11px]">Officer: {log.officer_name || log.officer_id}</div>
                        {log.notes && <p className="text-slate-400 text-[11px] m-0 mt-0.5">{log.notes}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="p-8 text-center text-slate-500 text-xs">
              Select an evidence item from the table to inspect details and custody history.
            </div>
          )}
        </div>
      </div>

      {/* Register Evidence Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-[#0B0F17] border border-[#1E2638] rounded w-full max-w-md p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#1E2638]">
              <h2 className="text-sm font-semibold text-slate-100">Register Evidence</h2>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-slate-400 hover:text-slate-200 text-xs">
                Close
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1">Item Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Encrypted SSD Drive (Seagate 2TB)"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-[#0E1420] border border-[#1E2638] rounded px-3 py-1.5 text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">Associated Case</label>
                  <select
                    value={caseId}
                    onChange={(e) => setCaseId(e.target.value)}
                    className="w-full bg-[#0E1420] border border-[#1E2638] rounded px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-blue-500 font-mono text-[11px]"
                  >
                    {cases.map((c) => (
                      <option key={c.case_id} value={c.case_id}>{c.case_id}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 mb-1">Evidence Type</label>
                  <select
                    value={etype}
                    onChange={(e) => setEtype(e.target.value)}
                    className="w-full bg-[#0E1420] border border-[#1E2638] rounded px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-blue-500"
                  >
                    <option value="Digital Hardware">Digital Hardware</option>
                    <option value="Document">Document</option>
                    <option value="Physical Contraband">Physical Contraband</option>
                    <option value="Forensic Extraction">Forensic Extraction</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Storage Reference</label>
                <input
                  type="text"
                  required
                  value={storageRef}
                  onChange={(e) => setStorageRef(e.target.value)}
                  className="w-full bg-[#0E1420] border border-[#1E2638] rounded px-3 py-1.5 text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  className="w-full bg-[#0E1420] border border-[#1E2638] rounded px-3 py-1.5 text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#1E2638]">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-3 py-1.5 bg-[#0E1420] hover:bg-[#141C2B] border border-[#1E2638] text-slate-300 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded font-medium"
                >
                  Register
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Custody Transfer Modal */}
      {isCustodyModalOpen && selectedItem && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-[#0B0F17] border border-[#1E2638] rounded w-full max-w-md p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#1E2638]">
              <h2 className="text-sm font-semibold text-slate-100">Log Custody Transfer</h2>
              <button onClick={() => setIsCustodyModalOpen(false)} className="text-slate-400 hover:text-slate-200 text-xs">
                Close
              </button>
            </div>

            <form onSubmit={handleAddCustodyEvent} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1">Transfer Action</label>
                <select
                  value={custodyEventType}
                  onChange={(e) => setCustodyEventType(e.target.value)}
                  className="w-full bg-[#0E1420] border border-[#1E2638] rounded px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-blue-500"
                >
                  <option value="Checked Out for Analysis">Checked Out for Analysis</option>
                  <option value="Returned to Secure Storage">Returned to Secure Storage</option>
                  <option value="Transferred to Forensics Lab">Transferred to Forensics Lab</option>
                  <option value="Presented in Court Exhibit">Presented in Court Exhibit</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Responsible Officer</label>
                <select
                  value={custodyOfficerId}
                  onChange={(e) => setCustodyOfficerId(e.target.value)}
                  className="w-full bg-[#0E1420] border border-[#1E2638] rounded px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-blue-500"
                >
                  {officers.map((o) => (
                    <option key={o.officer_id} value={o.officer_id}>
                      {o.full_name} ({o.badge_number})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Transfer Notes</label>
                <textarea
                  rows={2}
                  value={custodyNotes}
                  onChange={(e) => setCustodyNotes(e.target.value)}
                  placeholder="Reason for transfer, lab docket number, or destination..."
                  className="w-full bg-[#0E1420] border border-[#1E2638] rounded px-3 py-1.5 text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#1E2638]">
                <button
                  type="button"
                  onClick={() => setIsCustodyModalOpen(false)}
                  className="px-3 py-1.5 bg-[#0E1420] hover:bg-[#141C2B] border border-[#1E2638] text-slate-300 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded font-medium"
                >
                  Record Transfer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
