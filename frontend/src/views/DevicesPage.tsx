import React, { useState, useEffect } from 'react';
import { Plus, Search, Trash2 } from 'lucide-react';
import { ApiService } from '../services/api';
import { Device } from '../types';

export const DevicesPage: React.FC = () => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form
  const [dtype, setDtype] = useState('Key Programmer');
  const [mfr, setMfr] = useState('');
  const [model, setModel] = useState('');
  const [sn, setSn] = useState('');
  const [desc, setDesc] = useState('');

  useEffect(() => {
    loadDevices();
  }, [search]);

  const loadDevices = async () => {
    setLoading(true);
    try {
      const data = await ApiService.getDevices({ search: search || undefined });
      setDevices(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mfr.trim() || !model.trim() || !sn.trim()) return;
    try {
      await ApiService.createDevice({
        device_type: dtype,
        manufacturer: mfr,
        model,
        serial_number: sn,
        description: desc || undefined
      });
      setIsModalOpen(false);
      setMfr('');
      setModel('');
      setSn('');
      setDesc('');
      loadDevices();
    } catch (err: any) {
      alert(err?.response?.data?.detail || 'Failed to create device.');
    }
  };

  const handleDelete = async (did: string) => {
    if (!window.confirm(`Delete device ${did}?`)) return;
    try {
      await ApiService.deleteDevice(did);
      loadDevices();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#1E2638] gap-3">
        <div>
          <h1 className="text-lg font-semibold text-slate-100">Devices & Hardware</h1>
          <p className="text-xs text-slate-400">
            Seized electronics, phones, GPS transponders, hardware tokens, and crypto keys
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-medium flex items-center gap-1.5 transition-colors duration-150 self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Device</span>
        </button>
      </div>

      {/* Search */}
      <div className="p-3 bg-[#0B0F17] border border-[#1E2638] rounded flex items-center">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by device type, serial number, or manufacturer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#0E1420] border border-[#1E2638] rounded pl-8 pr-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors duration-150"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#0B0F17] border border-[#1E2638] rounded overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            Loading devices...
          </div>
        ) : devices.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs">No devices found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#1E2638] bg-[#0E1420] text-slate-400 text-[11px]">
                  <th className="py-2.5 px-3">Device ID</th>
                  <th className="py-2.5 px-3">Manufacturer & Model</th>
                  <th className="py-2.5 px-3">Device Type</th>
                  <th className="py-2.5 px-3">Serial / IMEI</th>
                  <th className="py-2.5 px-3">Description</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#161D2B]">
                {devices.map((d) => (
                  <tr key={d.device_id} className="hover:bg-[#141C2B] transition-colors duration-150">
                    <td className="py-2.5 px-3 font-mono font-medium text-blue-400 whitespace-nowrap">
                      {d.device_id}
                    </td>
                    <td className="py-2.5 px-3 font-medium text-slate-200">
                      {d.manufacturer} {d.model}
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap text-slate-400">
                      {d.device_type}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-300 text-[11px] whitespace-nowrap">
                      {d.serial_number || '—'}
                    </td>
                    <td className="py-2.5 px-3 text-slate-400 truncate max-w-xs">
                      {d.description || '—'}
                    </td>
                    <td className="py-2.5 px-3 text-right whitespace-nowrap">
                      <button
                        onClick={() => handleDelete(d.device_id)}
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

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-[#0B0F17] border border-[#1E2638] rounded w-full max-w-md p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#1E2638]">
              <h2 className="text-sm font-semibold text-slate-100">Add Device</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-200 text-xs">
                Close
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">Manufacturer</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Autel"
                    value={mfr}
                    onChange={(e) => setMfr(e.target.value)}
                    className="w-full bg-[#0E1420] border border-[#1E2638] rounded px-3 py-1.5 text-slate-100 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1">Model</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. MaxiIM IM608"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    className="w-full bg-[#0E1420] border border-[#1E2638] rounded px-3 py-1.5 text-slate-100 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">Device Type</label>
                  <input
                    type="text"
                    value={dtype}
                    onChange={(e) => setDtype(e.target.value)}
                    className="w-full bg-[#0E1420] border border-[#1E2638] rounded px-3 py-1.5 text-slate-100 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1">Serial Number / IMEI</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. IM608-2026-X88"
                    value={sn}
                    onChange={(e) => setSn(e.target.value)}
                    className="w-full bg-[#0E1420] border border-[#1E2638] rounded px-3 py-1.5 text-slate-100 font-mono focus:outline-none focus:border-blue-500"
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
                  Save Device
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
