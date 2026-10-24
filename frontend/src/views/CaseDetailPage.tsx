import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  FolderKanban, ChevronRight, User, Calendar, Shield, Clock,
  Users, Building2, Car, Smartphone, MapPin, Archive, FileText,
  Activity, Plus, Trash2, ArrowLeft, Network, AlertCircle, Link as LinkIcon
} from 'lucide-react';
import { ApiService } from '../services/api';
import { Case, Person, Organization, Vehicle, Device, Location, Evidence, CaseActivity, InvestigationDocument, TimelineEvent } from '../types';

export const CaseDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [caseData, setCaseData] = useState<any | null>(null);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'timeline' | 'documents' | 'activities' | 'graph'>('overview');

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

  useEffect(() => {
    if (id) {
      loadCaseData();
    }
  }, [id]);

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
    if (!id || !window.confirm(`Unlink this ${entityType} from the case?`)) return;
    try {
      await ApiService.unlinkEntity(id, { entity_type: entityType, entity_id: entityId });
      loadCaseData();
    } catch (err: any) {
      alert(err?.response?.data?.detail || 'Failed to unlink entity.');
    }
  };

  const handleAddActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !actTitle || !actDesc) return;
    try {
      await ApiService.addCaseActivity(id, {
        activity_type: actType,
        title: actTitle,
        description: actDesc
      });
      setIsActivityModalOpen(false);
      setActTitle('');
      setActDesc('');
      loadCaseData();
    } catch (err: any) {
      alert(err?.response?.data?.detail || 'Failed to add activity.');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-400">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="text-xs">Loading case dossier from PostgreSQL & MongoDB...</p>
      </div>
    );
  }

  if (!caseData) {
    return (
      <div className="p-8 text-center bg-[#0F172A] border border-slate-800 rounded-xl text-slate-400">
        <AlertCircle className="w-8 h-8 text-amber-400 mx-auto mb-2" />
        <h3 className="text-sm font-semibold text-slate-200">Case not found</h3>
        <button onClick={() => navigate('/cases')} className="mt-3 px-3 py-1.5 bg-blue-600 text-white rounded text-xs">
          Return to Cases
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs text-slate-400">
        <Link to="/cases" className="hover:text-blue-400 transition flex items-center gap-1">
          <FolderKanban className="w-3.5 h-3.5" /> Cases
        </Link>
        <ChevronRight className="w-3 h-3 text-slate-600" />
        <span className="font-mono text-blue-400 font-semibold">{caseData.case_id}</span>
      </div>

      {/* Case Header Dossier Card */}
      <div className="p-5 rounded-xl bg-[#0F172A] border border-slate-800">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="text-base font-mono font-bold text-blue-400">{caseData.case_id}</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                caseData.status === 'Open' ? 'bg-blue-950 text-blue-400 border border-blue-800' :
                caseData.status === 'Under Investigation' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                'bg-emerald-950 text-emerald-400 border border-emerald-800'
              }`}>
                {caseData.status}
              </span>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold ${
                caseData.priority === 'Critical' ? 'bg-red-950 text-red-400 border border-red-800' :
                caseData.priority === 'High' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                'bg-blue-950 text-blue-400 border border-blue-800'
              }`}>
                Priority: {caseData.priority}
              </span>
              <span className="text-xs text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                {caseData.case_type}
              </span>
            </div>
            <h2 className="text-lg font-bold text-white tracking-tight m-0">{caseData.title}</h2>
            <p className="text-xs text-slate-300 mt-2 leading-relaxed max-w-4xl">{caseData.description}</p>
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col gap-2 flex-shrink-0">
            <button
              onClick={handleOpenLinkModal}
              className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium flex items-center justify-center gap-1.5 transition"
            >
              <LinkIcon className="w-3.5 h-3.5" />
              <span>Link Entity (Junction)</span>
            </button>
            <button
              onClick={() => setIsActivityModalOpen(true)}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white text-xs font-medium flex items-center justify-center gap-1.5 transition"
            >
              <Activity className="w-3.5 h-3.5 text-purple-400" />
              <span>Log Activity Event</span>
            </button>
            <button
              onClick={() => navigate(`/relationships`)}
              className="px-3 py-1.5 rounded-lg bg-purple-950/60 hover:bg-purple-900/60 border border-purple-800 text-purple-300 text-xs font-medium flex items-center justify-center gap-1.5 transition"
            >
              <Network className="w-3.5 h-3.5" />
              <span>Graph View</span>
            </button>
          </div>
        </div>

        {/* Metadata Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-3 border-t border-slate-800/80 text-[11px] text-slate-400">
          <div>
            <span className="text-slate-500 block">Lead Investigator:</span>
            <span className="text-slate-200 font-medium">{caseData.lead_officer_name || 'Unassigned'}</span>
          </div>
          <div>
            <span className="text-slate-500 block">Incident Date:</span>
            <span className="text-slate-200 font-mono">
              {caseData.incident_date ? new Date(caseData.incident_date).toLocaleDateString() : 'Unspecified'}
            </span>
          </div>
          <div>
            <span className="text-slate-500 block">Created Timestamp:</span>
            <span className="text-slate-200 font-mono">{new Date(caseData.created_at).toLocaleString()}</span>
          </div>
          <div>
            <span className="text-slate-500 block">Relational Junctions:</span>
            <span className="text-blue-400 font-mono font-semibold">
              {caseData.people?.length || 0} People • {caseData.evidence_items?.length || 0} Evidence • {caseData.documents?.length || 0} Docs
            </span>
          </div>
        </div>
      </div>

      {/* Tabs Header */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        {[
          { key: 'overview', label: `Linked Entities (${(caseData.people?.length || 0) + (caseData.organizations?.length || 0) + (caseData.vehicles?.length || 0) + (caseData.devices?.length || 0) + (caseData.locations?.length || 0) + (caseData.evidence_items?.length || 0)})`, icon: Users },
          { key: 'documents', label: `Investigation Docs (${caseData.documents?.length || 0})`, icon: FileText, badge: 'MongoDB' },
          { key: 'timeline', label: `Timeline (${timeline.length})`, icon: Clock },
          { key: 'activities', label: `Activity Log (${caseData.activities?.length || 0})`, icon: Activity },
        ].map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key as any)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{t.label}</span>
              {t.badge && (
                <span className="text-[9px] font-mono px-1 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/40">
                  {t.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab 1: Overview & Linked Entities */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* People Section */}
          <div className="p-4 rounded-xl bg-[#0F172A] border border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-400" /> Associated People (case_people)
              </h3>
              <span className="text-[10px] font-mono text-slate-400">Junction Table: case_people</span>
            </div>

            {(!caseData.people || caseData.people.length === 0) ? (
              <p className="text-xs text-slate-500 italic">No people associated with this case yet.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {caseData.people.map((p: Person) => (
                  <div key={p.person_id} className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-blue-400 font-semibold">{p.person_id}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-950 text-indigo-300 border border-indigo-800/40">
                          {p.category}
                        </span>
                      </div>
                      <Link to={`/people`} className="font-semibold text-slate-200 hover:text-blue-400">
                        {p.full_name}
                      </Link>
                      <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{p.description || p.address}</p>
                    </div>
                    <button
                      onClick={() => handleUnlink('person', p.person_id)}
                      title="Unlink from case"
                      className="p-1 text-slate-500 hover:text-red-400 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Evidence Section */}
          <div className="p-4 rounded-xl bg-[#0F172A] border border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Archive className="w-4 h-4 text-emerald-400" /> Logged Evidence Items & Chain of Custody
              </h3>
              <span className="text-[10px] font-mono text-slate-400">Relational FK: evidence.case_id</span>
            </div>

            {(!caseData.evidence_items || caseData.evidence_items.length === 0) ? (
              <p className="text-xs text-slate-500 italic">No evidence items registered under this case.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {caseData.evidence_items.map((e: Evidence) => (
                  <div key={e.evidence_id} className="p-3.5 rounded-lg bg-slate-900 border border-slate-800 text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono text-emerald-400 font-bold">{e.evidence_id}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                        {e.status}
                      </span>
                    </div>
                    <Link to="/evidence" className="font-semibold text-slate-200 hover:text-emerald-400">
                      {e.title}
                    </Link>
                    <p className="text-[11px] text-slate-400 mt-1">{e.description}</p>
                    <div className="mt-2 pt-1.5 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-500">
                      <span>Vault Ref: {e.storage_reference}</span>
                      <span className="font-mono">{e.custody_history?.length || 0} Custody Transfer Logs</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Vehicles & Devices Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Vehicles */}
            <div className="p-4 rounded-xl bg-[#0F172A] border border-slate-800">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                <Car className="w-4 h-4 text-sky-400" /> Vehicles of Interest (case_vehicles)
              </h3>
              {(!caseData.vehicles || caseData.vehicles.length === 0) ? (
                <p className="text-xs text-slate-500 italic">No vehicles associated.</p>
              ) : (
                <div className="space-y-2">
                  {caseData.vehicles.map((v: Vehicle) => (
                    <div key={v.vehicle_id} className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs flex justify-between items-center">
                      <div>
                        <div className="font-bold text-slate-200">{v.color} {v.make} {v.model}</div>
                        <div className="text-[11px] font-mono text-sky-400">{v.registration_number} ({v.vehicle_type})</div>
                      </div>
                      <button onClick={() => handleUnlink('vehicle', v.vehicle_id)} className="text-slate-500 hover:text-red-400">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Devices */}
            <div className="p-4 rounded-xl bg-[#0F172A] border border-slate-800">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-violet-400" /> Digital Hardware & Devices (case_devices)
              </h3>
              {(!caseData.devices || caseData.devices.length === 0) ? (
                <p className="text-xs text-slate-500 italic">No devices associated.</p>
              ) : (
                <div className="space-y-2">
                  {caseData.devices.map((d: Device) => (
                    <div key={d.device_id} className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs flex justify-between items-center">
                      <div>
                        <div className="font-bold text-slate-200">{d.manufacturer} {d.model}</div>
                        <div className="text-[11px] font-mono text-violet-400">SN: {d.serial_number} • {d.device_type}</div>
                      </div>
                      <button onClick={() => handleUnlink('device', d.device_id)} className="text-slate-500 hover:text-red-400">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Investigation Documents (MongoDB) */}
      {activeTab === 'documents' && (
        <div className="p-5 rounded-xl bg-[#0F172A] border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-400" />
                Unstructured Documents Linked to this Case (MongoDB)
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Polymorphic investigation documents referencing case_id = "{caseData.case_id}".
              </p>
            </div>
            <Link
              to="/documents"
              className="px-3 py-1.5 rounded-lg bg-emerald-700/80 hover:bg-emerald-600 text-white text-xs font-medium transition"
            >
              Document Manager
            </Link>
          </div>

          {(!caseData.documents || caseData.documents.length === 0) ? (
            <p className="text-xs text-slate-500 italic">No MongoDB documents currently reference this case.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {caseData.documents.map((doc: any) => (
                <div key={doc.id} className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/40">
                      {doc.document_type}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      Source: {doc.source_name}
                    </span>
                  </div>
                  <h4 className="text-sm font-semibold text-slate-100 m-0">{doc.title}</h4>
                  <p className="text-[11px] text-slate-300 leading-relaxed line-clamp-3">{doc.content}</p>

                  {doc.tags && doc.tags.length > 0 && (
                    <div className="flex items-center gap-1.5 flex-wrap pt-2">
                      {doc.tags.map((t: string) => (
                        <span key={t} className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                          #{t}
                        </span>
                      ))}
                    </div>
                  )}

                  {doc.metadata && Object.keys(doc.metadata).length > 0 && (
                    <div className="p-2 rounded bg-slate-950 font-mono text-[10px] text-emerald-400 overflow-x-auto">
                      {JSON.stringify(doc.metadata, null, 2)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Investigation Timeline */}
      {activeTab === 'timeline' && (
        <div className="p-5 rounded-xl bg-[#0F172A] border border-slate-800 space-y-4">
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-400" />
              Chronological Investigation Timeline (Cross-Database Fusion)
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Consolidates alleged incident date, SQL case milestones, evidence collection & custody transfers, and MongoDB document creation vs ingestion timestamps.
            </p>
          </div>

          <div className="relative border-l-2 border-slate-800 ml-4 space-y-6 py-2">
            {timeline.map((event) => (
              <div key={event.id} className="relative pl-6">
                {/* Dot */}
                <div className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 border-[#0F172A] ${
                  event.source_type === 'MongoDB' ? 'bg-emerald-400' :
                  event.category === 'Chain of Custody' ? 'bg-purple-400' :
                  event.category === 'Evidence Log' ? 'bg-amber-400' :
                  'bg-blue-400'
                }`} />

                <div className="p-3.5 rounded-lg bg-slate-900 border border-slate-800/90 text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-[11px] text-blue-400 font-semibold">{event.timestamp_str}</span>
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-semibold ${
                        event.source_type === 'MongoDB'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/40'
                          : 'bg-blue-950 text-blue-400 border border-blue-800/40'
                      }`}>
                        {event.source_type}
                      </span>
                      <span className="text-[10px] text-slate-400">{event.badge_label}</span>
                    </div>
                  </div>
                  <h4 className="font-semibold text-slate-100 text-xs mt-1 mb-0.5">{event.title}</h4>
                  <p className="text-[11px] text-slate-300 leading-relaxed m-0">{event.description}</p>
                  {event.officer_name && (
                    <div className="text-[10px] text-slate-500 mt-1 font-mono">
                      Logged by: {event.officer_name}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Activities */}
      {activeTab === 'activities' && (
        <div className="p-5 rounded-xl bg-[#0F172A] border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-4 h-4 text-purple-400" /> Case Activity Log (case_activity)
            </h3>
            <button
              onClick={() => setIsActivityModalOpen(true)}
              className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-medium flex items-center gap-1.5 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Activity</span>
            </button>
          </div>

          <div className="space-y-3">
            {caseData.activities?.map((a: CaseActivity) => (
              <div key={a.activity_id} className="p-3.5 rounded-lg bg-slate-900 border border-slate-800 text-xs">
                <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                  <span className="font-mono text-purple-400 font-semibold">{a.activity_type}</span>
                  <span>{new Date(a.activity_timestamp).toLocaleString()}</span>
                </div>
                <h4 className="font-semibold text-slate-200 text-xs mb-1">{a.title}</h4>
                <p className="text-[11px] text-slate-300 m-0 leading-relaxed">{a.description}</p>
                <div className="mt-2 text-[10px] text-slate-500 font-mono">
                  Recorded by: {a.officer_name || 'Investigator'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Link Entity Modal */}
      {isLinkModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0F172A] border border-slate-800 rounded-xl w-full max-w-md p-6 shadow-2xl">
            <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
              <LinkIcon className="w-4 h-4 text-blue-400" />
              Link Entity into Case Junction Table
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Select an entity to associate via SQL Many-to-Many junction tables.
            </p>

            <form onSubmit={handleLinkSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Entity Category
                </label>
                <select
                  value={linkEntityType}
                  onChange={(e) => {
                    setLinkEntityType(e.target.value);
                    setLinkEntityId('');
                  }}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white"
                >
                  <option value="person">Person (case_people)</option>
                  <option value="organization">Organization (case_organizations)</option>
                  <option value="vehicle">Vehicle (case_vehicles)</option>
                  <option value="device">Device (case_devices)</option>
                  <option value="location">Location (case_locations)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Target Entity Record *
                </label>
                <select
                  required
                  value={linkEntityId}
                  onChange={(e) => setLinkEntityId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white"
                >
                  <option value="">-- Choose Record --</option>
                  {linkEntityType === 'person' && allPeople.map((p) => (
                    <option key={p.person_id} value={p.person_id}>{p.person_id}: {p.full_name} ({p.category})</option>
                  ))}
                  {linkEntityType === 'organization' && allOrgs.map((o) => (
                    <option key={o.organization_id} value={o.organization_id}>{o.organization_id}: {o.name}</option>
                  ))}
                  {linkEntityType === 'vehicle' && allVehicles.map((v) => (
                    <option key={v.vehicle_id} value={v.vehicle_id}>{v.vehicle_id}: {v.registration_number} - {v.color} {v.make}</option>
                  ))}
                  {linkEntityType === 'device' && allDevices.map((d) => (
                    <option key={d.device_id} value={d.device_id}>{d.device_id}: {d.device_type} - {d.manufacturer} {d.model}</option>
                  ))}
                  {linkEntityType === 'location' && allLocations.map((l) => (
                    <option key={l.location_id} value={l.location_id}>{l.location_id}: {l.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Relationship Role / Note
                </label>
                <input
                  type="text"
                  placeholder="e.g. Eyewitness, Suspect Vehicle, Wiretap Junction"
                  value={linkRole}
                  onChange={(e) => setLinkRole(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsLinkModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-700 text-xs text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold"
                >
                  Save Junction Link
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Activity Modal */}
      {isActivityModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0F172A] border border-slate-800 rounded-xl w-full max-w-md p-6 shadow-2xl">
            <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
              <Activity className="w-4 h-4 text-purple-400" />
              Log Case Activity Event
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Records an investigative milestone or field activity in the audit trail.
            </p>

            <form onSubmit={handleAddActivity} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Activity Type
                </label>
                <select
                  value={actType}
                  onChange={(e) => setActType(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white"
                >
                  <option value="Surveillance Note">Surveillance Note</option>
                  <option value="Witness Interrogation">Witness Interrogation</option>
                  <option value="Search & Seizure">Search & Seizure</option>
                  <option value="Forensic Analysis">Forensic Analysis</option>
                  <option value="Court Presentation">Court Presentation</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Activity Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Stakeout at Peenya Junction"
                  value={actTitle}
                  onChange={(e) => setActTitle(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Detailed Notes *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Document factual findings..."
                  value={actDesc}
                  onChange={(e) => setActDesc(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsActivityModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-700 text-xs text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold"
                >
                  Save Activity Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
