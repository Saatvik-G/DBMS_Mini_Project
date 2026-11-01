import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter } from 'lucide-react';
import { ApiService } from '../services/api';
import { Officer } from '../types';

export const UsersPage: React.FC = () => {
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentOfficer, setCurrentOfficer] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // New Officer Form
  const [newOfficer, setNewOfficer] = useState({
    badge_number: '',
    full_name: '',
    department: 'Special Operations',
    role: 'INVESTIGATOR',
    contact_email: '',
    password: 'password123'
  });

  useEffect(() => {
    const stored = localStorage.getItem('fusion_officer');
    if (stored) {
      try {
        setCurrentOfficer(JSON.parse(stored));
      } catch {}
    }
    loadOfficers();
  }, []);

  const loadOfficers = async () => {
    setLoading(true);
    try {
      const data = await ApiService.getOfficers();
      setOfficers(data);
      setError(null);
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to retrieve officer directory.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOfficer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOfficer.badge_number.trim() || !newOfficer.full_name.trim() || !newOfficer.contact_email.trim() || !newOfficer.password) {
      setFormError('All fields including initial password are required.');
      return;
    }

    setSaving(true);
    setFormError(null);
    try {
      await ApiService.createOfficer({
        badge_number: newOfficer.badge_number.trim(),
        full_name: newOfficer.full_name.trim(),
        department: newOfficer.department,
        role: newOfficer.role,
        contact_email: newOfficer.contact_email.trim(),
        password: newOfficer.password
      });
      setShowAddModal(false);
      setNewOfficer({
        badge_number: '',
        full_name: '',
        department: 'Special Operations',
        role: 'INVESTIGATOR',
        contact_email: '',
        password: 'password123'
      });
      await loadOfficers();
    } catch (err: any) {
      setFormError(err?.response?.data?.detail || 'Failed to provision officer credential.');
    } finally {
      setSaving(false);
    }
  };

  const isAdmin = currentOfficer?.role === 'ADMIN';
  const departments = ['All', ...Array.from(new Set(officers.map(o => o.department).filter(Boolean)))];

  const filteredOfficers = officers.filter(o => {
    const matchesSearch =
      o.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.badge_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.officer_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (o.contact_email && o.contact_email.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesDept = departmentFilter === 'All' || o.department === departmentFilter;
    return matchesSearch && matchesDept;
  });

  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#1E2638] gap-3">
        <div>
          <h1 className="text-lg font-semibold text-slate-100">Officers & Role-Based Access Control</h1>
          <p className="text-xs text-slate-400">
            Personnel registry, badge identifiers, and role permissions (ADMIN / INVESTIGATOR)
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => setShowAddModal(true)}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-medium flex items-center gap-1.5 transition-colors duration-150 self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Officer</span>
          </button>
        )}
      </div>

      {error && (
        <div className="p-3 bg-red-950/40 border border-red-800 text-red-300 text-xs rounded">
          {error}
        </div>
      )}

      {/* Filter Bar */}
      <div className="p-3 bg-[#0B0F17] border border-[#1E2638] rounded flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by badge, name, email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#0E1420] border border-[#1E2638] rounded pl-8 pr-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors duration-150"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <div className="flex items-center gap-1.5 text-slate-400">
            <Filter className="w-3 h-3" />
            <span>Department:</span>
          </div>
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="bg-[#0E1420] border border-[#1E2638] text-xs text-slate-200 rounded px-2.5 py-1 focus:outline-none focus:border-blue-500"
          >
            {departments.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Officers Table */}
      <div className="bg-[#0B0F17] border border-[#1E2638] rounded overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            Loading officer directory...
          </div>
        ) : filteredOfficers.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs">No officer records found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#1E2638] bg-[#0E1420] text-slate-400 text-[11px]">
                  <th className="py-2.5 px-3">Officer ID</th>
                  <th className="py-2.5 px-3">Badge</th>
                  <th className="py-2.5 px-3">Full Name</th>
                  <th className="py-2.5 px-3">Role</th>
                  <th className="py-2.5 px-3">Department</th>
                  <th className="py-2.5 px-3">Contact Email</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#161D2B]">
                {filteredOfficers.map((o) => (
                  <tr key={o.officer_id} className="hover:bg-[#141C2B] transition-colors duration-150">
                    <td className="py-2.5 px-3 font-mono text-slate-400 whitespace-nowrap">
                      {o.officer_id}
                    </td>
                    <td className="py-2.5 px-3 font-mono font-medium text-blue-400 whitespace-nowrap">
                      {o.badge_number}
                    </td>
                    <td className="py-2.5 px-3 font-medium text-slate-200">
                      {o.full_name}
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${
                        o.role === 'ADMIN'
                          ? 'bg-amber-950 text-amber-300 border border-amber-900'
                          : 'bg-blue-950 text-blue-300 border border-blue-900'
                      }`}>
                        {o.role}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-400">
                      {o.department}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-400 text-[11px]">
                      {o.contact_email || '—'}
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span className="text-[11px] text-emerald-400">Active</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Officer Modal (Admin only) */}
      {showAddModal && isAdmin && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-[#0B0F17] border border-[#1E2638] rounded w-full max-w-md p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#1E2638]">
              <h2 className="text-sm font-semibold text-slate-100">Provision New Officer</h2>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-200 text-xs">
                Close
              </button>
            </div>

            {formError && (
              <div className="p-2.5 rounded bg-red-950/40 border border-red-800 text-red-300 text-xs">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateOfficer} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">Badge Identifier</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. CID-010"
                    value={newOfficer.badge_number}
                    onChange={(e) => setNewOfficer({ ...newOfficer, badge_number: e.target.value })}
                    className="w-full bg-[#0E1420] border border-[#1E2638] rounded px-3 py-1.5 text-slate-100 font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1">Role</label>
                  <select
                    value={newOfficer.role}
                    onChange={(e) => setNewOfficer({ ...newOfficer, role: e.target.value })}
                    className="w-full bg-[#0E1420] border border-[#1E2638] rounded px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-blue-500"
                  >
                    <option value="INVESTIGATOR">INVESTIGATOR</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Inspector John Doe"
                  value={newOfficer.full_name}
                  onChange={(e) => setNewOfficer({ ...newOfficer, full_name: e.target.value })}
                  className="w-full bg-[#0E1420] border border-[#1E2638] rounded px-3 py-1.5 text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Department</label>
                <input
                  type="text"
                  required
                  value={newOfficer.department}
                  onChange={(e) => setNewOfficer({ ...newOfficer, department: e.target.value })}
                  className="w-full bg-[#0E1420] border border-[#1E2638] rounded px-3 py-1.5 text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Email</label>
                <input
                  type="email"
                  required
                  placeholder="officer@cid.gov.in"
                  value={newOfficer.contact_email}
                  onChange={(e) => setNewOfficer({ ...newOfficer, contact_email: e.target.value })}
                  className="w-full bg-[#0E1420] border border-[#1E2638] rounded px-3 py-1.5 text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Initial Password</label>
                <input
                  type="password"
                  required
                  value={newOfficer.password}
                  onChange={(e) => setNewOfficer({ ...newOfficer, password: e.target.value })}
                  className="w-full bg-[#0E1420] border border-[#1E2638] rounded px-3 py-1.5 text-slate-100 font-mono focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#1E2638]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 bg-[#0E1420] hover:bg-[#141C2B] border border-[#1E2638] text-slate-300 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded font-medium disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Officer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
