import React, { useState, useEffect } from 'react';
import { Building2, Plus, Search, Trash2, MapPin, Phone, Briefcase } from 'lucide-react';
import { ApiService } from '../services/api';
import { Organization } from '../types';

export const OrganizationsPage: React.FC = () => {
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedOrg, setSelectedOrg] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [type, setType] = useState('Commercial Enterprise');
  const [address, setAddress] = useState('');
  const [contact, setContact] = useState('');
  const [desc, setDesc] = useState('');

  useEffect(() => {
    loadOrgs();
  }, [search]);

  const loadOrgs = async () => {
    setLoading(true);
    try {
      const data = await ApiService.getOrganizations({ search: search || undefined });
      setOrgs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      await ApiService.createOrganization({
        name,
        organization_type: type,
        address: address || undefined,
        contact_details: contact || undefined,
        description: desc || undefined
      });
      setIsModalOpen(false);
      setName('');
      setAddress('');
      setContact('');
      setDesc('');
      loadOrgs();
    } catch (err: any) {
      alert(err?.response?.data?.detail || 'Failed to create organization.');
    }
  };

  const viewDetail = async (orgId: string) => {
    try {
      const data = await ApiService.getOrganization(orgId);
      setSelectedOrg(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (orgId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm(`Delete organization ${orgId}?`)) return;
    try {
      await ApiService.deleteOrganization(orgId);
      if (selectedOrg?.organization_id === orgId) setSelectedOrg(null);
      loadOrgs();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white tracking-tight m-0">Organizations Registry</h2>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-950 text-cyan-400 border border-cyan-800">
              Relational: organizations
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Corporate entities, workshops, financial institutions, and freight forwarders involved in investigations.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-3.5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-semibold flex items-center gap-2 shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          <span>Register Organization</span>
        </button>
      </div>

      <div className="p-4 rounded-xl bg-[#0F172A] border border-slate-800 flex items-center">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search organizations by name or type..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-400 text-xs">Loading organizations...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {orgs.map((o) => (
            <div
              key={o.organization_id}
              onClick={() => viewDetail(o.organization_id)}
              className="p-4 rounded-xl bg-[#0F172A] border border-slate-800 hover:border-slate-700 cursor-pointer transition flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-cyan-400 font-bold text-xs">{o.organization_id}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                    {o.organization_type}
                  </span>
                </div>
                <h4 className="font-semibold text-slate-100 text-sm group-hover:text-cyan-300 transition m-0">
                  {o.name}
                </h4>
                <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                  {o.description || o.address || 'No description.'}
                </p>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
                <span className="truncate max-w-[180px]">{o.address || 'Address unlisted'}</span>
                <button onClick={(e) => handleDelete(o.organization_id, e)} className="p-1 hover:text-red-400">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {selectedOrg && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0F172A] border border-slate-800 rounded-xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex justify-between items-start mb-3">
              <div>
                <span className="font-mono text-cyan-400 text-xs font-bold">{selectedOrg.organization_id}</span>
                <h3 className="text-base font-bold text-white m-0">{selectedOrg.name}</h3>
                <span className="text-[10px] text-slate-400">{selectedOrg.organization_type}</span>
              </div>
              <button onClick={() => setSelectedOrg(null)} className="text-slate-400 hover:text-white text-xs">✕ Close</button>
            </div>
            <div className="space-y-2 text-xs text-slate-300 border-t border-slate-800 pt-3">
              <p className="m-0 leading-relaxed">{selectedOrg.description}</p>
              <div className="text-[11px] text-slate-400 pt-1">
                <div><span className="text-slate-500 font-medium">Address:</span> {selectedOrg.address || 'N/A'}</div>
                <div><span className="text-slate-500 font-medium">Contact:</span> {selectedOrg.contact_details || 'N/A'}</div>
              </div>
              {selectedOrg.cases?.length > 0 && (
                <div className="pt-2 border-t border-slate-800">
                  <span className="text-slate-400 font-semibold block mb-1">Linked Cases (case_organizations):</span>
                  {selectedOrg.cases.map((c: any) => (
                    <div key={c.case_id} className="p-1.5 rounded bg-slate-900 text-[11px] flex justify-between">
                      <span className="font-mono text-blue-400">{c.case_id}</span>
                      <span className="truncate max-w-[200px]">{c.title}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0F172A] border border-slate-800 rounded-xl w-full max-w-md p-6 shadow-2xl">
            <h3 className="text-sm font-bold text-white mb-3">Register Organization</h3>
            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Organization Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apex Auto Bodyworks"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Organization Type</label>
                <input
                  type="text"
                  placeholder="e.g. Logistics Freight Yard, Hospitality"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Address</label>
                <input
                  type="text"
                  placeholder="Location address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Background notes..."
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-3 py-1.5 border border-slate-700 text-xs rounded text-slate-300">Cancel</button>
                <button type="submit" className="px-4 py-1.5 bg-cyan-600 text-white text-xs font-semibold rounded">Save Organization</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
