import React, { useState, useEffect } from 'react';
import { Smartphone, Plus, Search, Trash2, Cpu, HardDrive } from 'lucide-react';
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
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white tracking-tight m-0">Hardware & Devices</h2>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-violet-950 text-violet-400 border border-violet-800">
              Relational: devices
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Seized digital electronics, crypto hardware wallets, key programmers, laptops, and cellular devices.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-3.5 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-lg text-xs font-semibold flex items-center gap-2 shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          <span>Register Device</span>
        </button>
      </div>

      <div className="p-4 rounded-xl bg-[#0F172A] border border-slate-800 flex items-center">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by serial number, device type, or manufacturer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
          />
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-400 text-xs">Loading hardware inventory...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {devices.map((d) => (
            <div
              key={d.device_id}
              className="p-4 rounded-xl bg-[#0F172A] border border-slate-800 flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-blue-400 font-bold text-xs">{d.device_id}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-violet-950 text-violet-300 border border-violet-800/40">
                    {d.device_type}
                  </span>
                </div>
                <h4 className="font-semibold text-slate-100 text-sm m-0">
                  {d.manufacturer} {d.model}
                </h4>
                <div className="text-[11px] font-mono text-slate-400 mt-1">
                  SN: <span className="text-violet-400 font-bold">{d.serial_number}</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                  {d.description || 'No descriptive technical notes.'}
                </p>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
                <span>{d.device_type}</span>
                <button onClick={() => handleDelete(d.device_id)} className="p-1 hover:text-red-400">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0F172A] border border-slate-800 rounded-xl w-full max-w-md p-6 shadow-2xl">
            <h3 className="text-sm font-bold text-white mb-3">Register Hardware Device</h3>
            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Device Category *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Encrypted Laptop, Key Programmer, Crypto Wallet"
                  value={dtype}
                  onChange={(e) => setDtype(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Manufacturer *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Apple, Lenovo, Autel"
                    value={mfr}
                    onChange={(e) => setMfr(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Model *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. ThinkPad X1 Carbon"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Serial Number / Unique Identifier *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. LNV-TP-992817"
                  value={sn}
                  onChange={(e) => setSn(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Hardware state, seized conditions..."
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-3 py-1.5 border border-slate-700 text-xs rounded text-slate-300">Cancel</button>
                <button type="submit" className="px-4 py-1.5 bg-violet-600 text-white text-xs font-semibold rounded">Save Device</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
