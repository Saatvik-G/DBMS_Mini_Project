import React, { useState, useEffect } from 'react';
import {
  Users, Shield, ShieldCheck, Plus, Search, Filter,
  Lock, CheckCircle2, AlertTriangle, KeyRound, Mail, Building
} from 'lucide-react';
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
    department: 'Special Cyber & Intelligence Fusion Command',
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
        department: 'Special Cyber & Intelligence Fusion Command',
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
      o.contact_email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = departmentFilter === 'All' || o.department === departmentFilter;
    return matchesSearch && matchesDept;
  });

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      {/* Page Title & Breadcrumb Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#212836] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-slate-100 m-0">
              Users & Access Control
            </h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#1c2433] text-slate-300 border border-[#2b374d]">
              RBAC
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 font-normal">
            Directory of authorized personnel, badge assignments, and role-based permissions
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isAdmin ? (
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Register Officer</span>
            </button>
          ) : (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#161c28] border border-[#263145] text-amber-400 text-xs">
              <Lock className="w-3.5 h-3.5" />
              <span className="font-mono text-[11px]">Read-Only (Investigator Role)</span>
            </div>
          )}
        </div>
      </div>

      {/* Role-Based Access Control Notice for Investigator */}
      {!isAdmin && (
        <div className="p-3.5 rounded-lg bg-[#141822] border border-[#263145] flex items-start gap-3">
          <Shield className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-slate-300 space-y-1">
            <div className="font-semibold text-slate-200">
              Role-Based Access Control Active: You are logged in as {currentOfficer?.full_name || 'Lead Inspector'} ({currentOfficer?.role || 'INVESTIGATOR'})
            </div>
            <div className="text-slate-400 leading-relaxed text-[11px]">
              User creation and credential management are restricted to users with <span className="text-amber-400 font-mono">ADMIN</span> clearance (Badge <span className="font-mono text-slate-200">CID-001</span>). As an investigator, you have read-only visibility into active personnel for evidence custody transfers and case assignment.
            </div>
          </div>
        </div>
      )}

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 rounded-lg bg-[#141824] border border-[#212a3b]">
          <div className="text-[11px] text-slate-400 font-medium">Total Registered Officers</div>
          <div className="text-lg font-bold text-slate-100 font-mono mt-0.5">{officers.length}</div>
          <div className="text-[10px] text-slate-500 mt-1">Active in relational directory</div>
        </div>

        <div className="p-3 rounded-lg bg-[#141824] border border-[#212a3b]">
          <div className="text-[11px] text-slate-400 font-medium">Administrators</div>
          <div className="text-lg font-bold text-amber-400 font-mono mt-0.5">
            {officers.filter(o => o.role === 'ADMIN').length}
          </div>
          <div className="text-[10px] text-slate-500 mt-1">Full system authority</div>
        </div>

        <div className="p-3 rounded-lg bg-[#141824] border border-[#212a3b]">
          <div className="text-[11px] text-slate-400 font-medium">Investigators</div>
          <div className="text-lg font-bold text-blue-400 font-mono mt-0.5">
            {officers.filter(o => o.role === 'INVESTIGATOR').length}
          </div>
          <div className="text-[10px] text-slate-500 mt-1">Case & evidence custody</div>
        </div>

        <div className="p-3 rounded-lg bg-[#141824] border border-[#212a3b]">
          <div className="text-[11px] text-slate-400 font-medium">Account Status</div>
          <div className="text-lg font-bold text-emerald-400 font-mono mt-0.5">
            {officers.filter(o => o.account_status === 'Active').length} Active
          </div>
          <div className="text-[10px] text-slate-500 mt-1">All accounts operational</div>
        </div>
      </div>

      {/* Filters & Search Bar */}
      <div className="p-3 rounded-lg bg-[#141824] border border-[#212a3b] flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, badge, email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#0d111a] border border-[#212836] rounded pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-[11px] text-slate-400 whitespace-nowrap">Department:</span>
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="bg-[#0d111a] border border-[#212836] rounded px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-blue-500"
          >
            {departments.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Officers Table */}
      <div className="rounded-lg bg-[#141824] border border-[#212a3b] overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-xs text-slate-400 font-mono">
            Querying officer records from database...
          </div>
        ) : error ? (
          <div className="p-4 text-xs text-rose-400 font-mono">
            Error: {error}
          </div>
        ) : filteredOfficers.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            No matching officers found for the selected query.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#212836] bg-[#0f131d] text-slate-400 font-mono text-[11px]">
                  <th className="py-2.5 px-3">Officer ID</th>
                  <th className="py-2.5 px-3">Badge</th>
                  <th className="py-2.5 px-3">Full Name</th>
                  <th className="py-2.5 px-3">Department</th>
                  <th className="py-2.5 px-3">Role</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Contact Email</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e2535]">
                {filteredOfficers.map((o) => (
                  <tr key={o.officer_id} className="hover:bg-[#182030]/50 transition-colors">
                    <td className="py-2.5 px-3 font-mono text-slate-400 text-[11px]">{o.officer_id}</td>
                    <td className="py-2.5 px-3 font-mono font-semibold text-slate-200">{o.badge_number}</td>
                    <td className="py-2.5 px-3 font-medium text-slate-100">{o.full_name}</td>
                    <td className="py-2.5 px-3 text-slate-300">{o.department}</td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono font-semibold ${
                          o.role === 'ADMIN'
                            ? 'bg-amber-950/60 text-amber-300 border border-amber-800/50'
                            : 'bg-blue-950/60 text-blue-300 border border-blue-800/50'
                        }`}
                      >
                        {o.role}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-mono">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        {o.account_status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-400 text-[11px]">{o.contact_email}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Registration Modal for Admin */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md rounded-lg bg-[#141824] border border-[#2b374d] p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#212836]">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-400" />
                <h3 className="text-sm font-semibold text-slate-100 m-0">Provision New Officer Account</h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-200 text-xs"
              >
                ✕
              </button>
            </div>

            {formError && (
              <div className="p-2.5 rounded bg-rose-950/50 border border-rose-800/60 text-rose-300 text-xs">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateOfficer} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1">Badge Identifier (e.g. CID-006 or B-9012)</label>
                <input
                  type="text"
                  required
                  placeholder="CID-006"
                  value={newOfficer.badge_number}
                  onChange={(e) => setNewOfficer({ ...newOfficer, badge_number: e.target.value })}
                  className="w-full bg-[#0d111a] border border-[#212836] rounded px-3 py-1.5 text-slate-200 font-mono focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Full Legal Name</label>
                <input
                  type="text"
                  required
                  placeholder="Inspector Ramesh Rao"
                  value={newOfficer.full_name}
                  onChange={(e) => setNewOfficer({ ...newOfficer, full_name: e.target.value })}
                  className="w-full bg-[#0d111a] border border-[#212836] rounded px-3 py-1.5 text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Department</label>
                <select
                  value={newOfficer.department}
                  onChange={(e) => setNewOfficer({ ...newOfficer, department: e.target.value })}
                  className="w-full bg-[#0d111a] border border-[#212836] rounded px-3 py-1.5 text-slate-200 focus:outline-none focus:border-blue-500"
                >
                  <option value="Special Cyber & Intelligence Fusion Command">Special Cyber & Intelligence Fusion Command</option>
                  <option value="Major Crimes & Cross-Border Investigations">Major Crimes & Cross-Border Investigations</option>
                  <option value="Tactical Field Operations">Tactical Field Operations</option>
                  <option value="Digital & Physical Forensics Lab">Digital & Physical Forensics Lab</option>
                  <option value="Evidence Control & Vault Management">Evidence Control & Vault Management</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">Assigned Role</label>
                  <select
                    value={newOfficer.role}
                    onChange={(e) => setNewOfficer({ ...newOfficer, role: e.target.value })}
                    className="w-full bg-[#0d111a] border border-[#212836] rounded px-3 py-1.5 text-slate-200 focus:outline-none focus:border-blue-500 font-mono"
                  >
                    <option value="INVESTIGATOR">INVESTIGATOR</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 mb-1">Initial Password</label>
                  <input
                    type="password"
                    required
                    value={newOfficer.password}
                    onChange={(e) => setNewOfficer({ ...newOfficer, password: e.target.value })}
                    className="w-full bg-[#0d111a] border border-[#212836] rounded px-3 py-1.5 text-slate-200 font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Official Contact Email</label>
                <input
                  type="email"
                  required
                  placeholder="ramesh.rao@fusion.gov.in"
                  value={newOfficer.contact_email}
                  onChange={(e) => setNewOfficer({ ...newOfficer, contact_email: e.target.value })}
                  className="w-full bg-[#0d111a] border border-[#212836] rounded px-3 py-1.5 text-slate-200 font-mono focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#212836]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 rounded bg-[#1e2535] hover:bg-[#252f44] text-slate-300 text-xs transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium transition"
                >
                  {saving ? 'Registering...' : 'Confirm Registration'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
