import React, { useState, useEffect } from 'react';
import { Car, Plus, Search, Trash2 } from 'lucide-react';
import { ApiService } from '../services/api';
import { Vehicle } from '../types';

export const VehiclesPage: React.FC = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form
  const [reg, setReg] = useState('');
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [color, setColor] = useState('Navy Blue');
  const [vtype, setVtype] = useState('Sedan');
  const [desc, setDesc] = useState('');

  useEffect(() => {
    loadVehicles();
  }, [search]);

  const loadVehicles = async () => {
    setLoading(true);
    try {
      const data = await ApiService.getVehicles({ search: search || undefined });
      setVehicles(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reg.trim() || !make.trim() || !model.trim()) return;
    try {
      await ApiService.createVehicle({
        registration_number: reg.toUpperCase(),
        make,
        model,
        color,
        vehicle_type: vtype,
        description: desc || undefined
      });
      setIsModalOpen(false);
      setReg('');
      setMake('');
      setModel('');
      setDesc('');
      loadVehicles();
    } catch (err: any) {
      alert(err?.response?.data?.detail || 'Failed to create vehicle.');
    }
  };

  const viewDetail = async (vid: string) => {
    try {
      const data = await ApiService.getVehicle(vid);
      setSelectedVehicle(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (vid: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm(`Delete vehicle ${vid}?`)) return;
    try {
      await ApiService.deleteVehicle(vid);
      if (selectedVehicle?.vehicle_id === vid) setSelectedVehicle(null);
      loadVehicles();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white tracking-tight m-0">Vehicles Database</h2>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-sky-950 text-sky-400 border border-sky-800">
              Relational: vehicles
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Tracked automobiles, commercial transport haulers, and suspect vehicles of interest.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-3.5 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-semibold flex items-center gap-2 shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          <span>Register Vehicle</span>
        </button>
      </div>

      <div className="p-4 rounded-xl bg-[#0F172A] border border-slate-800 flex items-center">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by registration (e.g. KA-01), make, model, or color..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
          />
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-400 text-xs">Loading vehicles...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {vehicles.map((v) => (
            <div
              key={v.vehicle_id}
              onClick={() => viewDetail(v.vehicle_id)}
              className="p-4 rounded-xl bg-[#0F172A] border border-slate-800 hover:border-slate-700 cursor-pointer transition flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-blue-400 font-bold text-xs">{v.vehicle_id}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-800/40">
                    {v.vehicle_type}
                  </span>
                </div>
                <h4 className="font-semibold text-slate-100 text-sm group-hover:text-sky-300 transition m-0">
                  {v.color} {v.make} {v.model}
                </h4>
                <div className="text-xs font-mono font-bold text-sky-400 mt-1">
                  {v.registration_number}
                </div>
                <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                  {v.description || 'No description notes.'}
                </p>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
                <span className="text-slate-400">Color: {v.color}</span>
                <button onClick={(e) => handleDelete(v.vehicle_id, e)} className="p-1 hover:text-red-400">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {selectedVehicle && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0F172A] border border-slate-800 rounded-xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex justify-between items-start mb-3">
              <div>
                <span className="font-mono text-blue-400 text-xs font-bold">{selectedVehicle.vehicle_id}</span>
                <h3 className="text-base font-bold text-white m-0">{selectedVehicle.color} {selectedVehicle.make} {selectedVehicle.model}</h3>
                <span className="text-xs font-mono text-sky-400 font-bold">{selectedVehicle.registration_number}</span>
              </div>
              <button onClick={() => setSelectedVehicle(null)} className="text-slate-400 hover:text-white text-xs">✕ Close</button>
            </div>
            <div className="space-y-2 text-xs text-slate-300 border-t border-slate-800 pt-3">
              <p className="m-0 leading-relaxed">{selectedVehicle.description}</p>
              {selectedVehicle.cases?.length > 0 && (
                <div className="pt-2 border-t border-slate-800">
                  <span className="text-slate-400 font-semibold block mb-1">Associated Cases (case_vehicles):</span>
                  {selectedVehicle.cases.map((c: any) => (
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
            <h3 className="text-sm font-bold text-white mb-3">Register Vehicle</h3>
            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Registration Number *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. KA-01-MJ-8821"
                  value={reg}
                  onChange={(e) => setReg(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white font-mono uppercase"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Make *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. BMW, Toyota"
                    value={make}
                    onChange={(e) => setMake(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Model *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 530d, Innova"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Color</label>
                  <input
                    type="text"
                    placeholder="e.g. Navy Blue, White"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Body Type</label>
                  <select
                    value={vtype}
                    onChange={(e) => setVtype(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white"
                  >
                    <option value="Sedan">Sedan</option>
                    <option value="SUV">SUV</option>
                    <option value="MPV">MPV</option>
                    <option value="Truck">Truck</option>
                    <option value="Light Commercial">Light Commercial</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Notes on vehicle modifications, origin..."
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-3 py-1.5 border border-slate-700 text-xs rounded text-slate-300">Cancel</button>
                <button type="submit" className="px-4 py-1.5 bg-sky-600 text-white text-xs font-semibold rounded">Save Vehicle</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
