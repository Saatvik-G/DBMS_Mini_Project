import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Trash2 } from 'lucide-react';
import { ApiService } from '../services/api';
import { Person } from '../types';

export const PeoplePage: React.FC = () => {
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [selectedPerson, setSelectedPerson] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [dob, setDob] = useState('');
  const [contact, setContact] = useState('');
  const [address, setAddress] = useState('');
  const [category, setCategory] = useState<'Witness' | 'Reporting Party' | 'Subject' | 'Other'>('Witness');
  const [desc, setDesc] = useState('');

  useEffect(() => {
    loadPeople();
  }, [search, categoryFilter]);

  const loadPeople = async () => {
    setLoading(true);
    try {
      const data = await ApiService.getPeople({
        search: search || undefined,
        category: categoryFilter !== 'All' ? categoryFilter : undefined
      });
      setPeople(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePerson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      await ApiService.createPerson({
        full_name: name,
        date_of_birth: dob || undefined,
        contact_details: contact || undefined,
        address: address || undefined,
        category,
        description: desc || undefined
      });
      setIsModalOpen(false);
      setName('');
      setDob('');
      setContact('');
      setAddress('');
      setDesc('');
      loadPeople();
    } catch (err: any) {
      alert(err?.response?.data?.detail || 'Failed to create person.');
    }
  };

  const viewPersonDetail = async (personId: string) => {
    try {
      const data = await ApiService.getPerson(personId);
      setSelectedPerson(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (personId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm(`Delete person ${personId}? This will remove associated junction entries.`)) return;
    try {
      await ApiService.deletePerson(personId);
      if (selectedPerson?.person_id === personId) setSelectedPerson(null);
      loadPeople();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#1E2638] gap-3">
        <div>
          <h1 className="text-lg font-semibold text-slate-100">Persons of Interest</h1>
          <p className="text-xs text-slate-400">
            Subjects, witnesses, informants, and associated individuals
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-medium flex items-center gap-1.5 transition-colors duration-150 self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Person</span>
        </button>
      </div>

      {/* Filter and Search */}
      <div className="p-3 bg-[#0B0F17] border border-[#1E2638] rounded flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, person ID, or notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#0E1420] border border-[#1E2638] rounded pl-8 pr-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors duration-150"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <div className="flex items-center gap-1.5 text-slate-400">
            <Filter className="w-3 h-3" />
            <span>Category:</span>
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-[#0E1420] border border-[#1E2638] text-xs text-slate-200 rounded px-2.5 py-1 focus:outline-none focus:border-blue-500"
          >
            <option value="All">All Categories</option>
            <option value="Subject">Subject</option>
            <option value="Witness">Witness</option>
            <option value="Reporting Party">Reporting Party</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>

      {/* Main Grid: Table + Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Table */}
        <div className="lg:col-span-2 bg-[#0B0F17] border border-[#1E2638] rounded overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              Loading records...
            </div>
          ) : people.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs">No person records found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#1E2638] bg-[#0E1420] text-slate-400 text-[11px]">
                    <th className="py-2.5 px-3">Person ID</th>
                    <th className="py-2.5 px-3">Full Name</th>
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3">Linked Cases</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#161D2B]">
                  {people.map((p) => (
                    <tr
                      key={p.person_id}
                      onClick={() => viewPersonDetail(p.person_id)}
                      className={`hover:bg-[#141C2B] cursor-pointer transition-colors duration-150 ${
                        selectedPerson?.person_id === p.person_id ? 'bg-[#141C2B]' : ''
                      }`}
                    >
                      <td className="py-2.5 px-3 font-mono font-medium text-blue-400 whitespace-nowrap">
                        {p.person_id}
                      </td>
                      <td className="py-2.5 px-3 font-medium text-slate-200">
                        {p.full_name}
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                          p.category === 'Subject' ? 'bg-red-950 text-red-400 border border-red-900' :
                          p.category === 'Witness' ? 'bg-blue-950 text-blue-400 border border-blue-900' :
                          'bg-slate-900 text-slate-400 border border-slate-700'
                        }`}>
                          {p.category}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-400 text-[11px] whitespace-nowrap">
                        {p.linked_cases_count || 0} cases
                      </td>
                      <td className="py-2.5 px-3 text-right whitespace-nowrap">
                        <button
                          onClick={(e) => handleDelete(p.person_id, e)}
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

        {/* Selected Person Detail Panel */}
        <div className="bg-[#0B0F17] border border-[#1E2638] rounded p-4 space-y-3">
          {selectedPerson ? (
            <>
              <div className="pb-2 border-b border-[#1E2638]">
                <span className="font-mono text-blue-400 text-xs font-medium">{selectedPerson.person_id}</span>
                <h2 className="text-sm font-semibold text-slate-100 mt-0.5">{selectedPerson.full_name}</h2>
                <span className="text-[10px] text-slate-400">Category: {selectedPerson.category}</span>
              </div>

              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-slate-500 text-[11px] block">Description:</span>
                  <p className="text-slate-300 text-xs m-0 leading-relaxed bg-[#0E1420] p-2 rounded border border-[#1E2638]">
                    {selectedPerson.description || 'No descriptive notes recorded.'}
                  </p>
                </div>

                <div>
                  <span className="text-slate-500 text-[11px] block">Contact Details:</span>
                  <span className="text-slate-300 font-mono text-[11px]">{selectedPerson.contact_details || 'Unspecified'}</span>
                </div>

                <div>
                  <span className="text-slate-500 text-[11px] block">Address:</span>
                  <span className="text-slate-300">{selectedPerson.address || 'Unspecified'}</span>
                </div>

                {selectedPerson.cases && selectedPerson.cases.length > 0 && (
                  <div className="pt-2 border-t border-[#1E2638]">
                    <span className="text-slate-500 text-[11px] block mb-1">Associated Cases:</span>
                    <div className="space-y-1">
                      {selectedPerson.cases.map((c: any) => (
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
              Select an individual from the list to inspect dossier details.
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-[#0B0F17] border border-[#1E2638] rounded w-full max-w-md p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#1E2638]">
              <h2 className="text-sm font-semibold text-slate-100">Add Person Record</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-200 text-xs">
                Close
              </button>
            </div>

            <form onSubmit={handleCreatePerson} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Kumar"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#0E1420] border border-[#1E2638] rounded px-3 py-1.5 text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full bg-[#0E1420] border border-[#1E2638] rounded px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-blue-500"
                  >
                    <option value="Subject">Subject</option>
                    <option value="Witness">Witness</option>
                    <option value="Reporting Party">Reporting Party</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 mb-1">Date of Birth</label>
                  <input
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="w-full bg-[#0E1420] border border-[#1E2638] rounded px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Contact Details</label>
                <input
                  type="text"
                  placeholder="e.g. +91 98450 12345 / ramesh@example.com"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  className="w-full bg-[#0E1420] border border-[#1E2638] rounded px-3 py-1.5 text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Address</label>
                <input
                  type="text"
                  placeholder="Street address or location reference"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
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
                  Save Person
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
