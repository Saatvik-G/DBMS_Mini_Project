import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Filter, Trash2 } from 'lucide-react';
import { ApiService } from '../services/api';
import { Case, Officer } from '../types';

export const CasesPage: React.FC = () => {
  const navigate = useNavigate();
  const [cases, setCases] = useState<Case[]>([]);
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [officerFilter, setOfficerFilter] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New Case Form State
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newType, setNewType] = useState('Organized Vehicle Theft');
  const [newStatus, setNewStatus] = useState<'Open' | 'Under Investigation' | 'On Hold' | 'Closed'>('Open');
  const [newPriority, setNewPriority] = useState<'Low' | 'Medium' | 'High' | 'Critical'>('Medium');
  const [newOfficerId, setNewOfficerId] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, [search, statusFilter, priorityFilter, officerFilter]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [caseData, officerData] = await Promise.all([
        ApiService.getCases({
          search: search || undefined,
          status: statusFilter !== 'All' ? statusFilter : undefined,
          priority: priorityFilter !== 'All' ? priorityFilter : undefined,
          officer_id: officerFilter !== 'All' ? officerFilter : undefined
        }),
        ApiService.getOfficers()
      ]);
      setCases(caseData);
      setOfficers(officerData);
      if (officerData.length > 0 && !newOfficerId) {
        setNewOfficerId(officerData[0].officer_id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDescription.trim()) {
      setFormError('Title and description are required.');
      return;
    }
    setIsSubmitting(true);
    setFormError(null);
    try {
      const created = await ApiService.createCase({
        title: newTitle,
        description: newDescription,
        case_type: newType,
        status: newStatus,
        priority: newPriority,
        lead_officer_id: newOfficerId || undefined
      });
      setIsModalOpen(false);
      setNewTitle('');
      setNewDescription('');
      loadData();
      navigate(`/cases/${created.case_id}`);
    } catch (err: any) {
      setFormError(err?.response?.data?.detail || 'Failed to create case.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCase = async (caseId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm(`Are you sure you want to delete case ${caseId}? This will remove case junction associations.`)) {
      return;
    }
    try {
      await ApiService.deleteCase(caseId, false);
      loadData();
    } catch (err: any) {
      const detail = err?.response?.data?.detail;
      if (detail && detail.includes('force=true')) {
        if (window.confirm(`${detail}\n\nForce delete this case and its associated evidence?`)) {
          await ApiService.deleteCase(caseId, true);
          loadData();
        }
      } else {
        alert(detail || 'Failed to delete case.');
      }
    }
  };

  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#1E2638] gap-3">
        <div>
          <h1 className="text-lg font-semibold text-slate-100">Cases</h1>
          <p className="text-xs text-slate-400">
            Investigative dossiers, assigned officers, and linked entities
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-medium flex items-center gap-1.5 transition-colors duration-150 self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Case</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-3 bg-[#0B0F17] border border-[#1E2638] rounded flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by case ID, title, or keywords..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#0E1420] border border-[#1E2638] rounded pl-8 pr-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors duration-150"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap text-xs">
          <div className="flex items-center gap-1.5 text-slate-400">
            <Filter className="w-3 h-3" />
            <span>Status:</span>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#0E1420] border border-[#1E2638] text-xs text-slate-200 rounded px-2 py-1 focus:outline-none focus:border-blue-500"
          >
            <option value="All">All Statuses</option>
            <option value="Open">Open</option>
            <option value="Under Investigation">Under Investigation</option>
            <option value="On Hold">On Hold</option>
            <option value="Closed">Closed</option>
          </select>

          <span className="text-slate-500 ml-1">Priority:</span>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="bg-[#0E1420] border border-[#1E2638] text-xs text-slate-200 rounded px-2 py-1 focus:outline-none focus:border-blue-500"
          >
            <option value="All">All Priorities</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Critical">Critical</option>
          </select>

          <span className="text-slate-500 ml-1">Officer:</span>
          <select
            value={officerFilter}
            onChange={(e) => setOfficerFilter(e.target.value)}
            className="bg-[#0E1420] border border-[#1E2638] text-xs text-slate-200 rounded px-2 py-1 focus:outline-none focus:border-blue-500 max-w-[150px]"
          >
            <option value="All">All Officers</option>
            {officers.map((o) => (
              <option key={o.officer_id} value={o.officer_id}>
                {o.full_name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Case Table */}
      {loading ? (
        <div className="p-8 text-center text-slate-400 text-xs">
          <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          Loading cases...
        </div>
      ) : cases.length === 0 ? (
        <div className="p-8 text-center bg-[#0B0F17] border border-[#1E2638] rounded text-slate-400 text-xs">
          No matching cases found. Adjust the filter criteria or create a new case.
        </div>
      ) : (
        <div className="bg-[#0B0F17] border border-[#1E2638] rounded overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#1E2638] bg-[#0E1420] text-slate-400 text-[11px]">
                  <th className="py-2.5 px-3">Case ID</th>
                  <th className="py-2.5 px-3">Title & Type</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Priority</th>
                  <th className="py-2.5 px-3">Lead Officer</th>
                  <th className="py-2.5 px-3">Linked Entities</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#161D2B]">
                {cases.map((c) => (
                  <tr
                    key={c.case_id}
                    onClick={() => navigate(`/cases/${c.case_id}`)}
                    className="hover:bg-[#141C2B] cursor-pointer transition-colors duration-150"
                  >
                    <td className="py-2.5 px-3 font-mono font-medium text-blue-400 whitespace-nowrap">
                      {c.case_id}
                    </td>
                    <td className="py-2.5 px-3 max-w-xs">
                      <div className="font-medium text-slate-200 truncate">{c.title}</div>
                      <div className="text-[11px] text-slate-500">{c.case_type}</div>
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                        c.status === 'Open' ? 'bg-blue-950 text-blue-400 border border-blue-900' :
                        c.status === 'Under Investigation' ? 'bg-amber-950 text-amber-400 border border-amber-900' :
                        c.status === 'On Hold' ? 'bg-slate-900 text-slate-400 border border-slate-700' :
                        'bg-emerald-950 text-emerald-400 border border-emerald-900'
                      }`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span className={`text-[11px] font-mono ${
                        c.priority === 'Critical' ? 'text-red-400 font-semibold' :
                        c.priority === 'High' ? 'text-amber-400' : 'text-slate-400'
                      }`}>
                        {c.priority}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap text-slate-300">
                      {c.lead_officer_name || 'Unassigned'}
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap font-mono text-[11px] text-slate-400">
                      {c.people_count || 0} People • {c.evidence_count || 0} Evd
                    </td>
                    <td className="py-2.5 px-3 text-right whitespace-nowrap">
                      <button
                        onClick={(e) => handleDeleteCase(c.case_id, e)}
                        className="p-1 text-slate-500 hover:text-red-400 rounded transition-colors duration-150"
                        title="Delete case"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* New Case Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-[#0B0F17] border border-[#1E2638] rounded w-full max-w-lg p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#1E2638]">
              <h2 className="text-sm font-semibold text-slate-100">Create New Case</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-200 text-xs"
              >
                Close
              </button>
            </div>

            {formError && (
              <div className="p-2.5 rounded bg-red-950/40 border border-red-800 text-red-300 text-xs">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateCase} className="space-y-3">
              <div>
                <label className="block text-xs text-slate-300 mb-1">Case Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Operation Silk Road FinTech"
                  className="w-full bg-[#0E1420] border border-[#1E2638] rounded px-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-300 mb-1">Description</label>
                <textarea
                  required
                  rows={3}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Initial incident summary and scope..."
                  className="w-full bg-[#0E1420] border border-[#1E2638] rounded px-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-300 mb-1">Case Type</label>
                  <input
                    type="text"
                    value={newType}
                    onChange={(e) => setNewType(e.target.value)}
                    className="w-full bg-[#0E1420] border border-[#1E2638] rounded px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-300 mb-1">Lead Officer</label>
                  <select
                    value={newOfficerId}
                    onChange={(e) => setNewOfficerId(e.target.value)}
                    className="w-full bg-[#0E1420] border border-[#1E2638] rounded px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                  >
                    {officers.map((o) => (
                      <option key={o.officer_id} value={o.officer_id}>
                        {o.full_name} ({o.badge_number})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-300 mb-1">Status</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as any)}
                    className="w-full bg-[#0E1420] border border-[#1E2638] rounded px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                  >
                    <option value="Open">Open</option>
                    <option value="Under Investigation">Under Investigation</option>
                    <option value="On Hold">On Hold</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-slate-300 mb-1">Priority</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as any)}
                    className="w-full bg-[#0E1420] border border-[#1E2638] rounded px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#1E2638]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 bg-[#0E1420] hover:bg-[#141C2B] border border-[#1E2638] text-slate-300 rounded text-xs transition-colors duration-150"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-medium transition-colors duration-150 disabled:opacity-50"
                >
                  {isSubmitting ? 'Creating...' : 'Create Case'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
