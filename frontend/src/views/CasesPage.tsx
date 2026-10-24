import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FolderKanban, Plus, Search, Filter, ArrowUpDown, ChevronRight,
  Shield, AlertTriangle, Calendar, CheckCircle2, User, Trash2, Edit3
} from 'lucide-react';
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
        if (window.confirm(`${detail}\n\nDo you want to override and permanently force delete this case and its associated evidence?`)) {
          await ApiService.deleteCase(caseId, true);
          loadData();
        }
      } else {
        alert(detail || 'Failed to delete case.');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white tracking-tight m-0">Case Management</h2>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-950 text-blue-400 border border-blue-800">
              PostgreSQL Relational
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Maintain centralized investigative dossiers, assigned officers, linked entities, and audit trails.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center gap-2 shadow-sm transition self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Open New Case</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl bg-[#0F172A] border border-slate-800 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Case ID, title, or keywords..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700/80 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Filter className="w-3.5 h-3.5" /> Status:
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-xs text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-blue-500"
          >
            <option value="All">All Statuses</option>
            <option value="Open">Open</option>
            <option value="Under Investigation">Under Investigation</option>
            <option value="On Hold">On Hold</option>
            <option value="Closed">Closed</option>
          </select>

          <div className="flex items-center gap-1.5 text-xs text-slate-400 ml-2">
            Priority:
          </div>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-xs text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-blue-500"
          >
            <option value="All">All Priorities</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Critical">Critical</option>
          </select>

          <div className="flex items-center gap-1.5 text-xs text-slate-400 ml-2">
            Officer:
          </div>
          <select
            value={officerFilter}
            onChange={(e) => setOfficerFilter(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-xs text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-blue-500 max-w-[150px]"
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

      {/* Case Table / Card Grid */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 text-xs">
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          Loading cases from relational database...
        </div>
      ) : cases.length === 0 ? (
        <div className="p-12 text-center rounded-xl bg-[#0F172A] border border-slate-800 text-slate-400">
          <FolderKanban className="w-10 h-10 text-slate-600 mx-auto mb-2" />
          <h4 className="text-sm font-semibold text-slate-300">No matching cases found</h4>
          <p className="text-xs text-slate-500 mt-1">Try resetting your search query or status filter.</p>
        </div>
      ) : (
        <div className="bg-[#0F172A] border border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/60 text-slate-400 text-[11px] font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Case ID</th>
                  <th className="py-3 px-4">Case Title & Type</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Lead Officer</th>
                  <th className="py-3 px-4">Linked Relational Entities</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {cases.map((c) => (
                  <tr
                    key={c.case_id}
                    onClick={() => navigate(`/cases/${c.case_id}`)}
                    className="hover:bg-slate-800/40 cursor-pointer transition group"
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-400 whitespace-nowrap">
                      {c.case_id}
                    </td>
                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="font-semibold text-slate-100 group-hover:text-blue-300 transition truncate">
                        {c.title}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {c.case_type}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                        c.status === 'Open' ? 'bg-blue-950 text-blue-400 border border-blue-800' :
                        c.status === 'Under Investigation' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                        c.status === 'On Hold' ? 'bg-purple-950 text-purple-400 border border-purple-800' :
                        'bg-emerald-950 text-emerald-400 border border-emerald-800'
                      }`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-semibold ${
                        c.priority === 'Critical' ? 'bg-red-950 text-red-400 border border-red-800/60' :
                        c.priority === 'High' ? 'bg-amber-950 text-amber-400 border border-amber-800/60' :
                        c.priority === 'Medium' ? 'bg-blue-950 text-blue-400 border border-blue-800/60' :
                        'bg-slate-800 text-slate-400'
                      }`}>
                        {c.priority}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap text-slate-300">
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-slate-500" />
                        <span>{c.lead_officer_name || 'Unassigned'}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap text-slate-400 text-[11px] font-mono">
                      <span className="text-slate-300 font-semibold">{c.evidence_count || 0}</span> Evidence • <span className="text-slate-300 font-semibold">{c.people_count || 0}</span> People
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={(e) => handleDeleteCase(c.case_id, e)}
                          title="Delete Case (Enforces referential integrity)"
                          className="p-1 rounded hover:bg-red-950 text-slate-400 hover:text-red-400 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-blue-400 transition" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* New Case Creation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0F172A] border border-slate-800 rounded-xl w-full max-w-lg p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
              <FolderKanban className="w-4 h-4 text-blue-400" />
              Open New Case Dossier
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Registers a new investigation record in PostgreSQL with relational constraints and an initialization activity event.
            </p>

            {formError && (
              <div className="p-3 mb-4 rounded-lg bg-red-950/40 border border-red-800/60 text-red-200 text-xs">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateCase} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Case Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Operation Blue Mirage: Luxury Vehicle Theft"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Case Category / Classification *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Organized Vehicle Theft, Financial Cybercrime"
                  value={newType}
                  onChange={(e) => setNewType(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Initial Status
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e: any) => setNewStatus(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="Open">Open</option>
                    <option value="Under Investigation">Under Investigation</option>
                    <option value="On Hold">On Hold</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Priority Level
                  </label>
                  <select
                    value={newPriority}
                    onChange={(e: any) => setNewPriority(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Assigned Lead Investigator (Officer)
                </label>
                <select
                  value={newOfficerId}
                  onChange={(e) => setNewOfficerId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="">-- Select Lead Officer --</option>
                  {officers.map((o) => (
                    <option key={o.officer_id} value={o.officer_id}>
                      {o.full_name} ({o.badge_number} - {o.role})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Investigation Description & Scope *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Summarize the core premise, preliminary facts, and scope of inquiry..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-700 text-xs text-slate-300 hover:bg-slate-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow transition disabled:opacity-50"
                >
                  {isSubmitting ? 'Opening Case...' : 'Create Case File'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
