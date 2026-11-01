import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ChevronRight, Plus, Trash2, Link as LinkIcon
} from 'lucide-react';
import { ApiService } from '../services/api';
import { Person, Organization, Vehicle, Device, Location, TimelineEvent } from '../types';

export const CaseDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [caseData, setCaseData] = useState<any | null>(null);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'timeline' | 'documents' | 'activities'>('overview');

  // Modals state
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [linkEntityType, setLinkEntityType] = useState('person');
  const [linkEntityId, setLinkEntityId] = useState('');
  const [linkRole, setLinkRole] = useState('');
  const [allPeople, setAllPeople] = useState<Person[]>([]);
  const [allOrgs, setAllOrgs] = useState<Organization[]>([]);
  const [allVehicles, setAllVehicles] = useState<Vehicle[]>([]);
  const [allDevices, setAllDevices] = useState<Device[]>([]);
  const [allLocations, setAllLocations] = useState<Location[]>([]);

  // Add Activity state
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  const [actType, setActType] = useState('Surveillance Note');
  const [actTitle, setActTitle] = useState('');
  const [actDesc, setActDesc] = useState('');

  const loadCaseData = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [detail, tl] = await Promise.all([
        ApiService.getCaseDetail(id),
        ApiService.getCaseTimeline(id)
      ]);
      setCaseData(detail);
      setTimeline(tl);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      loadCaseData();
    }
  }, [id]);

  const handleOpenLinkModal = async () => {
    try {
      const [p, o, v, d, l] = await Promise.all([
        ApiService.getPeople(),
        ApiService.getOrganizations(),
        ApiService.getVehicles(),
        ApiService.getDevices(),
        ApiService.getLocations()
      ]);
      setAllPeople(p);
      setAllOrgs(o);
      setAllVehicles(v);
      setAllDevices(d);
      setAllLocations(l);
      setIsLinkModalOpen(true);
    } catch (err) {
      console.error(err);
    }
  };

  const handleLinkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !linkEntityId) return;
    try {
      await ApiService.linkEntity(id, {
        entity_type: linkEntityType,
        entity_id: linkEntityId,
        relationship_role: linkRole || undefined
      });
      setIsLinkModalOpen(false);
      setLinkEntityId('');
      setLinkRole('');
      loadCaseData();
    } catch (err: any) {
      alert(err?.response?.data?.detail || 'Failed to link entity.');
    }
  };

  const handleUnlink = async (entityType: string, entityId: string) => {
    if (!id) return;
    if (!window.confirm(`Unlink this ${entityType} from case ${id}?`)) return;
    try {
      await ApiService.unlinkEntity(id, {
        entity_type: entityType,
        entity_id: entityId
      });
      loadCaseData();
    } catch (err: any) {
      alert(err?.response?.data?.detail || 'Failed to unlink entity.');
    }
  };

  const handleCreateActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !actTitle.trim() || !actDesc.trim()) return;
    try {
      await ApiService.addCaseActivity(id, {
        activity_type: actType,
        title: actTitle.trim(),
        description: actDesc.trim()
      });
      setIsActivityModalOpen(false);
      setActTitle('');
      setActDesc('');
      loadCaseData();
    } catch (err: any) {
      alert(err?.response?.data?.detail || 'Failed to log activity.');
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-400 text-xs">
        <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        Loading case details...
      </div>
    );
  }

  if (!caseData) {
    return (
      <div className="p-6 bg-[#0B0F17] border border-red-900/60 rounded text-xs text-red-300">
        <div className="font-semibold text-red-200 mb-1">Case Not Found</div>
        <p className="text-slate-400 mb-3">Case identifier {id} could not be retrieved.</p>
        <button
          onClick={() => navigate('/cases')}
          className="px-3 py-1.5 bg-blue-600 text-white rounded text-xs"
        >
          Return to Cases
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-1.5 text-xs text-slate-400">
        <Link to="/cases" className="hover:text-blue-400 transition-colors duration-150">
          Cases
        </Link>
        <ChevronRight className="w-3 h-3 text-slate-600" />
        <span className="font-mono text-blue-400 font-medium">{caseData.case_id}</span>
      </div>

      {/* Case Header Dossier Panel */}
      <div className="p-4 rounded bg-[#0B0F17] border border-[#1E2638] space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-3">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap text-xs">
              <span className="font-mono font-medium text-blue-400">{caseData.case_id}</span>
              <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                caseData.status === 'Open' ? 'bg-blue-950 text-blue-400 border border-blue-900' :
                caseData.status === 'Under Investigation' ? 'bg-amber-950 text-amber-400 border border-amber-900' :
                'bg-emerald-950 text-emerald-400 border border-emerald-900'
              }`}>
                {caseData.status}
              </span>
              <span className="font-mono text-[10px] text-slate-400">
                Priority: {caseData.priority}
              </span>
              <span className="text-[10px] text-slate-400 bg-[#0E1420] px-1.5 py-0.5 rounded border border-[#1E2638]">
                {caseData.case_type}
              </span>
            </div>
            <h1 className="text-base font-semibold text-slate-100">{caseData.title}</h1>
            <p className="text-xs text-slate-300 leading-relaxed max-w-4xl">{caseData.description}</p>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={handleOpenLinkModal}
              className="px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium flex items-center gap-1.5 transition-colors duration-150"
            >
              <LinkIcon className="w-3.5 h-3.5" />
              <span>Link Entity</span>
            </button>
            <button
              onClick={() => setIsActivityModalOpen(true)}
              className="px-3 py-1.5 rounded bg-[#0E1420] hover:bg-[#141C2B] border border-[#1E2638] text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-colors duration-150"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Log Activity</span>
            </button>
            <button
              onClick={() => navigate('/relationships')}
              className="px-3 py-1.5 rounded bg-[#0E1420] hover:bg-[#141C2B] border border-[#1E2638] text-slate-200 text-xs font-medium transition-colors duration-150"
            >
              Graph View
            </button>
          </div>
        </div>

        {/* Metadata Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-[#1E2638] text-xs text-slate-400">
          <div>
            <span className="text-slate-500 block text-[11px]">Lead Investigator:</span>
            <span className="text-slate-200 font-medium">{caseData.lead_officer_name || 'Unassigned'}</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[11px]">Incident Date:</span>
            <span className="text-slate-200 font-mono">
              {caseData.incident_date ? new Date(caseData.incident_date).toLocaleDateString() : 'Unspecified'}
            </span>
          </div>
          <div>
            <span className="text-slate-500 block text-[11px]">Created At:</span>
            <span className="text-slate-200 font-mono">{new Date(caseData.created_at).toLocaleString()}</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[11px]">Linked Relations:</span>
            <span className="text-blue-400 font-mono">
              {caseData.people?.length || 0} People • {caseData.evidence_items?.length || 0} Evidence • {caseData.documents?.length || 0} Docs
            </span>
          </div>
        </div>
      </div>

      {/* Tabs Header */}
      <div className="flex items-center gap-1 border-b border-[#1E2638]">
        {[
          { key: 'overview', label: `Linked Entities (${(caseData.people?.length || 0) + (caseData.organizations?.length || 0) + (caseData.vehicles?.length || 0) + (caseData.devices?.length || 0) + (caseData.locations?.length || 0) + (caseData.evidence_items?.length || 0)})` },
          { key: 'documents', label: `Documents (${caseData.documents?.length || 0})` },
          { key: 'timeline', label: `Timeline (${timeline.length})` },
          { key: 'activities', label: `Activity Log (${caseData.activities?.length || 0})` },
        ].map((t) => {
          const isActive = activeTab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key as any)}
              className={`px-3 py-2 text-xs font-medium transition-colors duration-150 border-b-2 -mb-px ${
                isActive
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Tab 1: Linked Entities */}
      {activeTab === 'overview' && (
        <div className="space-y-4">
          {/* People Junction Table */}
          <div className="bg-[#0B0F17] border border-[#1E2638] rounded">
            <div className="p-3 border-b border-[#1E2638] flex items-center justify-between">
              <span className="text-xs font-medium text-slate-200">Persons of Interest (case_people junction)</span>
              <span className="text-[11px] font-mono text-slate-500">{caseData.people?.length || 0} records</span>
            </div>
            {(!caseData.people || caseData.people.length === 0) ? (
              <div className="p-3 text-slate-500 text-xs">No people linked to this case.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-[#1E2638] text-slate-400 text-[11px]">
                      <th className="py-2 px-3">Person ID</th>
                      <th className="py-2 px-3">Full Name</th>
                      <th className="py-2 px-3">Role</th>
                      <th className="py-2 px-3">Notes</th>
                      <th className="py-2 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#161D2B]">
                    {caseData.people.map((p: any) => (
                      <tr key={p.person_id} className="hover:bg-[#141C2B] transition-colors duration-150">
                        <td className="py-2 px-3 font-mono text-blue-400 whitespace-nowrap">{p.person_id}</td>
                        <td className="py-2 px-3 font-medium text-slate-200">{p.full_name}</td>
                        <td className="py-2 px-3 whitespace-nowrap">
                          <span className="px-1.5 py-0.5 rounded text-[10px] bg-[#0E1420] border border-[#1E2638] text-slate-300">
                            {p.role_in_case || 'Associated'}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-slate-400 truncate max-w-xs">{p.notes || '—'}</td>
                        <td className="py-2 px-3 text-right">
                          <button
                            onClick={() => handleUnlink('people', p.person_id)}
                            className="text-slate-500 hover:text-red-400 p-1 transition-colors duration-150"
                            title="Unlink"
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

          {/* Evidence Items Table */}
          <div className="bg-[#0B0F17] border border-[#1E2638] rounded">
            <div className="p-3 border-b border-[#1E2638] flex items-center justify-between">
              <span className="text-xs font-medium text-slate-200">Evidence Records (evidence table)</span>
              <span className="text-[11px] font-mono text-slate-500">{caseData.evidence_items?.length || 0} records</span>
            </div>
            {(!caseData.evidence_items || caseData.evidence_items.length === 0) ? (
              <div className="p-3 text-slate-500 text-xs">No evidence logged for this case.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-[#1E2638] text-slate-400 text-[11px]">
                      <th className="py-2 px-3">Evidence ID</th>
                      <th className="py-2 px-3">Title & Type</th>
                      <th className="py-2 px-3">Storage Reference</th>
                      <th className="py-2 px-3">Notes</th>
                      <th className="py-2 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#161D2B]">
                    {caseData.evidence_items.map((ev: any) => (
                      <tr key={ev.evidence_id} className="hover:bg-[#141C2B] transition-colors duration-150">
                        <td className="py-2 px-3 font-mono text-blue-400 whitespace-nowrap">{ev.evidence_id}</td>
                        <td className="py-2 px-3">
                          <div className="font-medium text-slate-200">{ev.title}</div>
                          <div className="text-[11px] text-slate-500">{ev.evidence_type}</div>
                        </td>
                        <td className="py-2 px-3 text-slate-300 font-mono text-[11px]">{ev.storage_reference}</td>
                        <td className="py-2 px-3 text-slate-400 truncate max-w-xs">{ev.notes || '—'}</td>
                        <td className="py-2 px-3 text-[11px] text-slate-300">{ev.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Documents */}
      {activeTab === 'documents' && (
        <div className="bg-[#0B0F17] border border-[#1E2638] rounded">
          <div className="p-3 border-b border-[#1E2638] text-xs font-medium text-slate-200">
            Linked Intelligence Documents (MongoDB)
          </div>
          {(!caseData.documents || caseData.documents.length === 0) ? (
            <div className="p-4 text-center text-xs text-slate-500">No documents linked to this case.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#1E2638] text-slate-400 text-[11px]">
                    <th className="py-2 px-3">Type</th>
                    <th className="py-2 px-3">Title</th>
                    <th className="py-2 px-3">Source</th>
                    <th className="py-2 px-3">Status</th>
                    <th className="py-2 px-3">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#161D2B]">
                  {caseData.documents.map((d: any) => (
                    <tr key={d.id} className="hover:bg-[#141C2B] transition-colors duration-150">
                      <td className="py-2 px-3 font-mono text-[10px] text-slate-400">{d.document_type}</td>
                      <td className="py-2 px-3 text-slate-200 font-medium">{d.title}</td>
                      <td className="py-2 px-3 text-slate-400">{d.source_name || '—'}</td>
                      <td className="py-2 px-3 text-slate-300 text-[11px]">{d.document_status}</td>
                      <td className="py-2 px-3 font-mono text-slate-500 text-[11px]">
                        {d.created_at ? new Date(d.created_at).toLocaleDateString() : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Timeline */}
      {activeTab === 'timeline' && (
        <div className="bg-[#0B0F17] border border-[#1E2638] rounded p-4 space-y-3">
          <div className="text-xs font-medium text-slate-200 mb-2">Chronological Case Timeline</div>
          {timeline.length === 0 ? (
            <div className="text-slate-500 text-xs">No chronological events found.</div>
          ) : (
            <div className="space-y-2 border-l border-[#1E2638] pl-3 ml-2">
              {timeline.map((item, idx) => (
                <div key={idx} className="relative text-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 absolute -left-[17px] top-1.5" />
                  <div className="font-mono text-[11px] text-slate-500">
                    {item.timestamp ? new Date(item.timestamp).toLocaleString() : item.timestamp_str}
                  </div>
                  <div className="font-medium text-slate-200 text-xs">{item.title}</div>
                  <div className="text-slate-400 text-[11px]">{item.description}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Activities */}
      {activeTab === 'activities' && (
        <div className="bg-[#0B0F17] border border-[#1E2638] rounded p-4 space-y-3">
          <div className="text-xs font-medium text-slate-200 mb-2">Audit & Investigation Activities</div>
          {(!caseData.activities || caseData.activities.length === 0) ? (
            <div className="text-slate-500 text-xs">No activity entries recorded.</div>
          ) : (
            <div className="space-y-2">
              {caseData.activities.map((act: any) => (
                <div key={act.activity_id} className="p-2.5 bg-[#0E1420] border border-[#1E2638] rounded text-xs">
                  <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                    <span className="font-mono text-slate-400">{act.activity_type}</span>
                    <span className="font-mono">{new Date(act.activity_timestamp).toLocaleString()}</span>
                  </div>
                  <div className="font-medium text-slate-200 text-xs mb-0.5">{act.title}</div>
                  <p className="text-slate-400 text-[11px] m-0">{act.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Link Entity Modal */}
      {isLinkModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-[#0B0F17] border border-[#1E2638] rounded w-full max-w-md p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#1E2638]">
              <h2 className="text-sm font-semibold text-slate-100">Link Entity to Case</h2>
              <button onClick={() => setIsLinkModalOpen(false)} className="text-slate-400 hover:text-slate-200 text-xs">
                Close
              </button>
            </div>

            <form onSubmit={handleLinkSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1">Entity Type</label>
                <select
                  value={linkEntityType}
                  onChange={(e) => {
                    setLinkEntityType(e.target.value);
                    setLinkEntityId('');
                  }}
                  className="w-full bg-[#0E1420] border border-[#1E2638] rounded px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-blue-500"
                >
                  <option value="person">Person</option>
                  <option value="organization">Organization</option>
                  <option value="vehicle">Vehicle</option>
                  <option value="device">Device</option>
                  <option value="location">Location</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Select Record</label>
                <select
                  required
                  value={linkEntityId}
                  onChange={(e) => setLinkEntityId(e.target.value)}
                  className="w-full bg-[#0E1420] border border-[#1E2638] rounded px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-blue-500 font-mono text-[11px]"
                >
                  <option value="">-- Choose entity --</option>
                  {linkEntityType === 'person' && allPeople.map((p) => (
                    <option key={p.person_id} value={p.person_id}>{p.person_id} - {p.full_name}</option>
                  ))}
                  {linkEntityType === 'organization' && allOrgs.map((o) => (
                    <option key={o.organization_id} value={o.organization_id}>{o.organization_id} - {o.name}</option>
                  ))}
                  {linkEntityType === 'vehicle' && allVehicles.map((v) => (
                    <option key={v.vehicle_id} value={v.vehicle_id}>{v.vehicle_id} - {v.make} {v.model} ({v.registration_number})</option>
                  ))}
                  {linkEntityType === 'device' && allDevices.map((d) => (
                    <option key={d.device_id} value={d.device_id}>{d.device_id} - {d.device_type} ({d.model})</option>
                  ))}
                  {linkEntityType === 'location' && allLocations.map((l) => (
                    <option key={l.location_id} value={l.location_id}>{l.location_id} - {l.address}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Role / Association</label>
                <input
                  type="text"
                  placeholder="e.g. Primary Suspect, Crime Scene, Transport"
                  value={linkRole}
                  onChange={(e) => setLinkRole(e.target.value)}
                  className="w-full bg-[#0E1420] border border-[#1E2638] rounded px-3 py-1.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#1E2638]">
                <button
                  type="button"
                  onClick={() => setIsLinkModalOpen(false)}
                  className="px-3 py-1.5 bg-[#0E1420] hover:bg-[#141C2B] border border-[#1E2638] text-slate-300 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded font-medium"
                >
                  Link
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Log Activity Modal */}
      {isActivityModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-[#0B0F17] border border-[#1E2638] rounded w-full max-w-md p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#1E2638]">
              <h2 className="text-sm font-semibold text-slate-100">Log Case Activity</h2>
              <button onClick={() => setIsActivityModalOpen(false)} className="text-slate-400 hover:text-slate-200 text-xs">
                Close
              </button>
            </div>

            <form onSubmit={handleCreateActivity} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1">Activity Type</label>
                <input
                  type="text"
                  required
                  value={actType}
                  onChange={(e) => setActType(e.target.value)}
                  className="w-full bg-[#0E1420] border border-[#1E2638] rounded px-3 py-1.5 text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Event Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Wiretap Intercept Authorization"
                  value={actTitle}
                  onChange={(e) => setActTitle(e.target.value)}
                  className="w-full bg-[#0E1420] border border-[#1E2638] rounded px-3 py-1.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Description</label>
                <textarea
                  required
                  rows={3}
                  value={actDesc}
                  onChange={(e) => setActDesc(e.target.value)}
                  placeholder="Details of investigative action taken..."
                  className="w-full bg-[#0E1420] border border-[#1E2638] rounded px-3 py-1.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#1E2638]">
                <button
                  type="button"
                  onClick={() => setIsActivityModalOpen(false)}
                  className="px-3 py-1.5 bg-[#0E1420] hover:bg-[#141C2B] border border-[#1E2638] text-slate-300 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded font-medium"
                >
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
