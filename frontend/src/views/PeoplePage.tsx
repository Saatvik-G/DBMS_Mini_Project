import React, { useState, useEffect } from 'react';
import {
  Users, Plus, Search, Filter, Trash2, Edit3, ShieldAlert,
  ChevronRight, Calendar, Phone, MapPin, AlertCircle
} from 'lucide-react';
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
    if (!window.confirm(`Delete person ${personId}? This will remove all case and vehicle junction associations.`)) return;
    try {
      await ApiService.deletePerson(personId);
      if (selectedPerson?.person_id === personId) setSelectedPerson(null);
      loadPeople();
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
            <h2 className="text-xl font-bold text-white tracking-tight m-0">Persons Directory</h2>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-indigo-950 text-indigo-400 border border-indigo-800">
              Relational: people
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Fictional records of subjects, witnesses, and reporting parties. Associations are strictly informational.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center gap-2 shadow-sm transition self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Register Person</span>
        </button>
      </div>

      {/* Filter and Search */}
      <div className="p-4 rounded-xl bg-[#0F172A] border border-slate-800 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, person ID, or notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700/80 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Category:</span>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-xs text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-indigo-500"
          >
            <option value="All">All Categories</option>
            <option value="Subject">Subject</option>
            <option value="Witness">Witness</option>
            <option value="Reporting Party">Reporting Party</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>

      {/* People Grid */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 text-xs">
          Loading persons directory...
        </div>
      ) : people.length === 0 ? (
        <div className="p-12 text-center rounded-xl bg-[#0F172A] border border-slate-800 text-slate-400">
          <Users className="w-8 h-8 text-slate-600 mx-auto mb-2" />
          <p className="text-xs">No person records matching criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {people.map((p) => (
            <div
              key={p.person_id}
              onClick={() => viewPersonDetail(p.person_id)}
              className="p-4 rounded-xl bg-[#0F172A] border border-slate-800 hover:border-slate-700 cursor-pointer transition flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-blue-400 font-bold text-xs">{p.person_id}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                    p.category === 'Subject' ? 'bg-red-950 text-red-300 border border-red-800/40' :
                    p.category === 'Witness' ? 'bg-blue-950 text-blue-300 border border-blue-800/40' :
                    p.category === 'Reporting Party' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/40' :
                    'bg-slate-800 text-slate-300'
                  }`}>
                    {p.category}
                  </span>
                </div>
                <h4 className="font-semibold text-slate-100 text-sm group-hover:text-indigo-300 transition m-0">
                  {p.full_name}
                </h4>
                <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                  {p.description || 'No descriptive narrative recorded.'}
                </p>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
                <span className="font-mono text-indigo-400">
                  {p.linked_cases_count || 0} Linked Cases
                </span>
                <button
                  onClick={(e) => handleDelete(p.person_id, e)}
                  className="p-1 text-slate-500 hover:text-red-400 transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Person Detail Drawer / Modal */}
      {selectedPerson && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0F172A] border border-slate-800 rounded-xl w-full max-w-lg p-6 shadow-2xl max-h-[85vh] overflow-y-auto">
            <div className="flex items-start justify-between mb-3">
              <div>
                <span className="text-xs font-mono text-blue-400 font-bold">{selectedPerson.person_id}</span>
                <h3 className="text-base font-bold text-white m-0">{selectedPerson.full_name}</h3>
                <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800 mt-1 inline-block">
                  {selectedPerson.category}
                </span>
              </div>
              <button onClick={() => setSelectedPerson(null)} className="text-slate-400 hover:text-white text-xs">
                ✕ Close
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300 border-t border-slate-800 pt-3">
              <div>
                <span className="text-slate-500 block font-medium">Description:</span>
                <p className="m-0 mt-0.5 text-slate-200">{selectedPerson.description || 'None'}</p>
              </div>
              <div>
                <span className="text-slate-500 block font-medium">Contact:</span>
                <span>{selectedPerson.contact_details || 'Unspecified'}</span>
              </div>
              <div>
                <span className="text-slate-500 block font-medium">Address:</span>
                <span>{selectedPerson.address || 'Unspecified'}</span>
              </div>

              {/* Linked Cases */}
              <div className="pt-2 border-t border-slate-800">
                <span className="text-slate-400 font-semibold block mb-1">Linked Cases (case_people):</span>
                {selectedPerson.cases?.length === 0 ? (
                  <p className="text-slate-500 italic">No linked cases.</p>
                ) : (
                  <div className="space-y-1">
                    {selectedPerson.cases?.map((c: any) => (
                      <div key={c.case_id} className="p-2 rounded bg-slate-900 border border-slate-800 flex justify-between">
                        <span className="font-mono text-blue-400 font-semibold">{c.case_id}</span>
                        <span className="text-slate-300 truncate max-w-[200px]">{c.title}</span>
                        <span className="text-slate-400 text-[10px]">{c.status}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Linked Vehicles */}
              <div className="pt-2 border-t border-slate-800">
                <span className="text-slate-400 font-semibold block mb-1">Associated Vehicles (person_vehicles):</span>
                {selectedPerson.vehicles?.length === 0 ? (
                  <p className="text-slate-500 italic">No vehicles associated.</p>
                ) : (
                  <div className="space-y-1">
                    {selectedPerson.vehicles?.map((v: any) => (
                      <div key={v.vehicle_id} className="p-2 rounded bg-slate-900 border border-slate-800 flex justify-between">
                        <span className="font-mono text-sky-400">{v.registration_number}</span>
                        <span>{v.make} {v.model}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Person Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0F172A] border border-slate-800 rounded-xl w-full max-w-md p-6 shadow-2xl">
            <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-400" />
              Register Person Record
            </h3>
            <form onSubmit={handleCreatePerson} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Chandra"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Date of Birth</label>
                  <input
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e: any) => setCategory(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white"
                  >
                    <option value="Witness">Witness</option>
                    <option value="Reporting Party">Reporting Party</option>
                    <option value="Subject">Subject</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Contact Details</label>
                <input
                  type="text"
                  placeholder="+91 98765 00000"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Address</label>
                <input
                  type="text"
                  placeholder="Flat / Building, Locality, City"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Description / Notes</label>
                <textarea
                  rows={2}
                  placeholder="Relevant background..."
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-700 text-xs text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
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
