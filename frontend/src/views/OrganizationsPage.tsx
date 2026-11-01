import React, { useState, useEffect } from 'react';
import { Plus, Search, Trash2 } from 'lucide-react';
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
    <div className="space-y-4 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#1E2638] gap-3">
        <div>
          <h1 className="text-lg font-semibold text-slate-100">Organizations</h1>
          <p className="text-xs text-slate-400">
            Corporate entities, workshops, shell companies, and financial institutions
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-medium flex items-center gap-1.5 transition-colors duration-150 self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Organization</span>
        </button>
      </div>

      {/* Filter and Search */}
      <div className="p-3 bg-[#0B0F17] border border-[#1E2638] rounded flex items-center">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search organizations by name, type, or address..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#0E1420] border border-[#1E2638] rounded pl-8 pr-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors duration-150"
          />
        </div>
      </div>

      {/* Main Grid: Table + Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Table */}
        <div className="lg:col-span-2 bg-[#0B0F17] border border-[#1E2638] rounded overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              Loading organizations...
            </div>
          ) : orgs.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs">No organizations found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#1E2638] bg-[#0E1420] text-slate-400 text-[11px]">
                    <th className="py-2.5 px-3">Org ID</th>
                    <th className="py-2.5 px-3">Name</th>
                    <th className="py-2.5 px-3">Type</th>
                    <th className="py-2.5 px-3">Address</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#161D2B]">
                  {orgs.map((o) => (
                    <tr
                      key={o.organization_id}
                      onClick={() => viewDetail(o.organization_id)}
                      className={`hover:bg-[#141C2B] cursor-pointer transition-colors duration-150 ${
                        selectedOrg?.organization_id === o.organization_id ? 'bg-[#141C2B]' : ''
                      }`}
                    >
                      <td className="py-2.5 px-3 font-mono font-medium text-blue-400 whitespace-nowrap">
                        {o.organization_id}
                      </td>
                      <td className="py-2.5 px-3 font-medium text-slate-200">
                        {o.name}
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap text-slate-400">
                        {o.organization_type}
                      </td>
                      <td className="py-2.5 px-3 text-slate-400 truncate max-w-xs">
                        {o.address || '—'}
                      </td>
                      <td className="py-2.5 px-3 text-right whitespace-nowrap">
                        <button
                          onClick={(e) => handleDelete(o.organization_id, e)}
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

        {/* Selected Org Detail Panel */}
        <div className="bg-[#0B0F17] border border-[#1E2638] rounded p-4 space-y-3">
          {selectedOrg ? (
            <>
              <div className="pb-2 border-b border-[#1E2638]">
                <span className="font-mono text-blue-400 text-xs font-medium">{selectedOrg.organization_id}</span>
                <h2 className="text-sm font-semibold text-slate-100 mt-0.5">{selectedOrg.name}</h2>
                <span className="text-[10px] text-slate-400">Type: {selectedOrg.organization_type}</span>
              </div>

              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-slate-500 text-[11px] block">Description:</span>
                  <p className="text-slate-300 text-xs m-0 leading-relaxed bg-[#0E1420] p-2 rounded border border-[#1E2638]">
                    {selectedOrg.description || 'No description recorded.'}
                  </p>
                </div>

                <div>
                  <span className="text-slate-500 text-[11px] block">Address:</span>
                  <span className="text-slate-300">{selectedOrg.address || 'Unlisted'}</span>
                </div>

                <div>
                  <span className="text-slate-500 text-[11px] block">Contact Details:</span>
                  <span className="text-slate-300 font-mono text-[11px]">{selectedOrg.contact_details || 'Unlisted'}</span>
                </div>

                {selectedOrg.cases && selectedOrg.cases.length > 0 && (
                  <div className="pt-2 border-t border-[#1E2638]">
                    <span className="text-slate-500 text-[11px] block mb-1">Linked Cases (case_organizations):</span>
                    <div className="space-y-1">
                      {selectedOrg.cases.map((c: any) => (
                        <div key={c.case_id} className="p-1.5 rounded bg-[#0E1420] border border-[#1E2638] text-[11px]">
                          <span className="font-mono text-blue-400">{c.case_id}</span>: {c.title}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="p-8 text-center text-slate-500 text-xs">
              Select an organization to inspect details.
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-[#0B0F17] border border-[#1E2638] rounded w-full max-w-md p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#1E2638]">
              <h2 className="text-sm font-semibold text-slate-100">Add Organization</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-200 text-xs">
                Close
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1">Organization Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. BlueStar Logistics Pvt Ltd"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#0E1420] border border-[#1E2638] rounded px-3 py-1.5 text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Organization Type</label>
                <input
                  type="text"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full bg-[#0E1420] border border-[#1E2638] rounded px-3 py-1.5 text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Address</label>
                <input
                  type="text"
                  placeholder="Registered office or facility address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-[#0E1420] border border-[#1E2638] rounded px-3 py-1.5 text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Contact Details</label>
                <input
                  type="text"
                  placeholder="Phone, email, or registry number"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  className="w-full bg-[#0E1420] border border-[#1E2638] rounded px-3 py-1.5 text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Description / Notes</label>
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
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 bg-[#0E1420] hover:bg-[#141C2B] border border-[#1E2638] text-slate-300 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded font-medium"
                >
                  Save Organization
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
