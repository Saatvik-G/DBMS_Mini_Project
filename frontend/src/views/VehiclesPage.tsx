import React, { useState, useEffect } from 'react';
import { Plus, Search, Trash2 } from 'lucide-react';
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
    <div className="space-y-4 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#1E2638] gap-3">
        <div>
          <h1 className="text-lg font-semibold text-slate-100">Vehicles</h1>
          <p className="text-xs text-slate-400">
            Automobiles, registration numbers, VIN identifiers, and surveillance track logs
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-medium flex items-center gap-1.5 transition-colors duration-150 self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Vehicle</span>
        </button>
      </div>

      {/* Filter and Search */}
      <div className="p-3 bg-[#0B0F17] border border-[#1E2638] rounded flex items-center">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by license plate, make, model, or VIN..."
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
              Loading vehicles...
            </div>
          ) : vehicles.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs">No vehicles found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#1E2638] bg-[#0E1420] text-slate-400 text-[11px]">
                    <th className="py-2.5 px-3">Vehicle ID</th>
                    <th className="py-2.5 px-3">Make & Model</th>
                    <th className="py-2.5 px-3">Registration Plate</th>
                    <th className="py-2.5 px-3">Color / Type</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#161D2B]">
                  {vehicles.map((v) => (
                    <tr
                      key={v.vehicle_id}
                      onClick={() => viewDetail(v.vehicle_id)}
                      className={`hover:bg-[#141C2B] cursor-pointer transition-colors duration-150 ${
                        selectedVehicle?.vehicle_id === v.vehicle_id ? 'bg-[#141C2B]' : ''
                      }`}
                    >
                      <td className="py-2.5 px-3 font-mono font-medium text-blue-400 whitespace-nowrap">
                        {v.vehicle_id}
                      </td>
                      <td className="py-2.5 px-3 font-medium text-slate-200">
                        {v.make} {v.model}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-200 whitespace-nowrap">
                        {v.registration_number || '—'}
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap text-slate-400">
                        {v.color} • {v.vehicle_type}
                      </td>
                      <td className="py-2.5 px-3 text-right whitespace-nowrap">
                        <button
                          onClick={(e) => handleDelete(v.vehicle_id, e)}
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

        {/* Selected Vehicle Detail Panel */}
        <div className="bg-[#0B0F17] border border-[#1E2638] rounded p-4 space-y-3">
          {selectedVehicle ? (
            <>
              <div className="pb-2 border-b border-[#1E2638]">
                <span className="font-mono text-blue-400 text-xs font-medium">{selectedVehicle.vehicle_id}</span>
                <h2 className="text-sm font-semibold text-slate-100 mt-0.5">{selectedVehicle.make} {selectedVehicle.model}</h2>
                <div className="font-mono text-[11px] text-slate-400">{selectedVehicle.registration_number}</div>
              </div>

              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-slate-500 text-[11px] block">Specifications:</span>
                  <span className="text-slate-300">{selectedVehicle.color} • {selectedVehicle.vehicle_type}</span>
                </div>

                <div>
                  <span className="text-slate-500 text-[11px] block">Description:</span>
                  <p className="text-slate-300 text-xs m-0 leading-relaxed bg-[#0E1420] p-2 rounded border border-[#1E2638]">
                    {selectedVehicle.description || 'No description recorded.'}
                  </p>
                </div>

                {selectedVehicle.cases && selectedVehicle.cases.length > 0 && (
                  <div className="pt-2 border-t border-[#1E2638]">
                    <span className="text-slate-500 text-[11px] block mb-1">Associated Cases (case_vehicles):</span>
                    <div className="space-y-1">
                      {selectedVehicle.cases.map((c: any) => (
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
              Select a vehicle to inspect details.
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-[#0B0F17] border border-[#1E2638] rounded w-full max-w-md p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#1E2638]">
              <h2 className="text-sm font-semibold text-slate-100">Add Vehicle</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-200 text-xs">
                Close
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1">Registration / Plate Number</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. KA-01-MJ-4091"
                  value={reg}
                  onChange={(e) => setReg(e.target.value)}
                  className="w-full bg-[#0E1420] border border-[#1E2638] rounded px-3 py-1.5 text-slate-100 font-mono uppercase focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">Make</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Toyota"
                    value={make}
                    onChange={(e) => setMake(e.target.value)}
                    className="w-full bg-[#0E1420] border border-[#1E2638] rounded px-3 py-1.5 text-slate-100 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1">Model</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Innova Crysta"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    className="w-full bg-[#0E1420] border border-[#1E2638] rounded px-3 py-1.5 text-slate-100 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">Color</label>
                  <input
                    type="text"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-full bg-[#0E1420] border border-[#1E2638] rounded px-3 py-1.5 text-slate-100 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1">Vehicle Type</label>
                  <input
                    type="text"
                    value={vtype}
                    onChange={(e) => setVtype(e.target.value)}
                    className="w-full bg-[#0E1420] border border-[#1E2638] rounded px-3 py-1.5 text-slate-100 focus:outline-none focus:border-blue-500"
                  />
                </div>
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
                  Save Vehicle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
