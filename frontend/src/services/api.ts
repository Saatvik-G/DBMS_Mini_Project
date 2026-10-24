import axios from 'axios';
import {
  Case, Person, Organization, Vehicle, Device, Location,
  Evidence, EvidenceCustody, CaseActivity, InvestigationDocument,
  UnifiedSearchResponse, TimelineEvent, RelationshipGraphResponse,
  DashboardStats, Officer
} from '../types';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor for JWT auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('fusion_auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const ApiService = {
  // Health
  getHealth: () => api.get('/health').then(res => res.data),

  // Auth
  login: (badge_number: string, password: string) =>
    api.post('/auth/login', { badge_number, password }).then(res => res.data),
  getDemoAccounts: () => api.get('/auth/demo-accounts').then(res => res.data),

  // Dashboard
  getDashboardStats: (): Promise<DashboardStats> =>
    api.get('/dashboard/stats').then(res => res.data),

  // Cases
  getCases: (params?: { search?: string; status?: string; priority?: string; officer_id?: string; skip?: number; limit?: number }) =>
    api.get<Case[]>('/cases', { params }).then(res => res.data),
  getCaseDetail: (caseId: string) =>
    api.get(`/cases/${caseId}`).then(res => res.data),
  createCase: (data: Partial<Case>) =>
    api.post<Case>('/cases', data).then(res => res.data),
  updateCase: (caseId: string, data: Partial<Case>) =>
    api.put<Case>(`/cases/${caseId}`, data).then(res => res.data),
  deleteCase: (caseId: string, force: boolean = false) =>
    api.delete(`/cases/${caseId}`, { params: { force } }).then(res => res.data),
  linkEntity: (caseId: string, payload: { entity_type: string; entity_id: string; relationship_role?: string; notes?: string }) =>
    api.post(`/cases/${caseId}/link`, payload).then(res => res.data),
  unlinkEntity: (caseId: string, payload: { entity_type: string; entity_id: string }) =>
    api.post(`/cases/${caseId}/unlink`, payload).then(res => res.data),
  addCaseActivity: (caseId: string, data: { activity_type: string; title: string; description: string; officer_id?: string }) =>
    api.post<CaseActivity>(`/cases/${caseId}/activities`, data).then(res => res.data),
  getCaseTimeline: (caseId: string, category?: string, source_type?: string): Promise<TimelineEvent[]> =>
    api.get(`/cases/${caseId}/timeline`, { params: { category, source_type } }).then(res => res.data),

  // People
  getPeople: (params?: { search?: string; category?: string; skip?: number; limit?: number }) =>
    api.get<Person[]>('/people', { params }).then(res => res.data),
  getPerson: (personId: string) =>
    api.get(`/people/${personId}`).then(res => res.data),
  createPerson: (data: Partial<Person>) =>
    api.post<Person>('/people', data).then(res => res.data),
  updatePerson: (personId: string, data: Partial<Person>) =>
    api.put<Person>(`/people/${personId}`, data).then(res => res.data),
  deletePerson: (personId: string) =>
    api.delete(`/people/${personId}`).then(res => res.data),

  // Organizations
  getOrganizations: (params?: { search?: string }) =>
    api.get<Organization[]>('/organizations', { params }).then(res => res.data),
  getOrganization: (orgId: string) =>
    api.get(`/organizations/${orgId}`).then(res => res.data),
  createOrganization: (data: Partial<Organization>) =>
    api.post<Organization>('/organizations', data).then(res => res.data),
  updateOrganization: (orgId: string, data: Partial<Organization>) =>
    api.put<Organization>(`/organizations/${orgId}`, data).then(res => res.data),
  deleteOrganization: (orgId: string) =>
    api.delete(`/organizations/${orgId}`).then(res => res.data),

  // Vehicles
  getVehicles: (params?: { search?: string }) =>
    api.get<Vehicle[]>('/vehicles', { params }).then(res => res.data),
  getVehicle: (vehicleId: string) =>
    api.get(`/vehicles/${vehicleId}`).then(res => res.data),
  createVehicle: (data: Partial<Vehicle>) =>
    api.post<Vehicle>('/vehicles', data).then(res => res.data),
  updateVehicle: (vehicleId: string, data: Partial<Vehicle>) =>
    api.put<Vehicle>(`/vehicles/${vehicleId}`, data).then(res => res.data),
  deleteVehicle: (vehicleId: string) =>
    api.delete(`/vehicles/${vehicleId}`).then(res => res.data),

  // Devices
  getDevices: (params?: { search?: string; device_type?: string }) =>
    api.get<Device[]>('/devices', { params }).then(res => res.data),
  getDevice: (deviceId: string) =>
    api.get(`/devices/${deviceId}`).then(res => res.data),
  createDevice: (data: Partial<Device>) =>
    api.post<Device>('/devices', data).then(res => res.data),
  updateDevice: (deviceId: string, data: Partial<Device>) =>
    api.put<Device>(`/devices/${deviceId}`, data).then(res => res.data),
  deleteDevice: (deviceId: string) =>
    api.delete(`/devices/${deviceId}`).then(res => res.data),

  // Locations
  getLocations: (params?: { search?: string; location_type?: string }) =>
    api.get<Location[]>('/locations', { params }).then(res => res.data),
  getLocation: (locationId: string) =>
    api.get(`/locations/${locationId}`).then(res => res.data),
  createLocation: (data: Partial<Location>) =>
    api.post<Location>('/locations', data).then(res => res.data),
  updateLocation: (locationId: string, data: Partial<Location>) =>
    api.put<Location>(`/locations/${locationId}`, data).then(res => res.data),
  deleteLocation: (locationId: string) =>
    api.delete(`/locations/${locationId}`).then(res => res.data),

  // Evidence & Custody
  getEvidenceList: (params?: { search?: string; case_id?: string; evidence_type?: string; status_filter?: string }) =>
    api.get<Evidence[]>('/evidence', { params }).then(res => res.data),
  getEvidence: (evidenceId: string): Promise<Evidence> =>
    api.get(`/evidence/${evidenceId}`).then(res => res.data),
  createEvidence: (data: Partial<Evidence>) =>
    api.post<Evidence>('/evidence', data).then(res => res.data),
  updateEvidence: (evidenceId: string, data: Partial<Evidence>) =>
    api.put<Evidence>(`/evidence/${evidenceId}`, data).then(res => res.data),
  deleteEvidence: (evidenceId: string) =>
    api.delete(`/evidence/${evidenceId}`).then(res => res.data),
  getCustodyHistory: (evidenceId: string): Promise<EvidenceCustody[]> =>
    api.get(`/evidence/${evidenceId}/custody`).then(res => res.data),
  addCustodyEvent: (evidenceId: string, data: { officer_id: string; event_type: string; notes?: string }) =>
    api.post<EvidenceCustody>(`/evidence/${evidenceId}/custody`, data).then(res => res.data),

  // Officers
  getOfficers: (params?: { search?: string; department?: string }) =>
    api.get<Officer[]>('/officers', { params }).then(res => res.data),
  getOfficer: (officerId: string) =>
    api.get(`/officers/${officerId}`).then(res => res.data),

  // MongoDB Documents
  getDocuments: (params?: { search?: string; document_type?: string; source_type?: string; case_id?: string; tag?: string }) =>
    api.get<InvestigationDocument[]>('/documents', { params }).then(res => res.data),
  getDocument: (documentId: string): Promise<InvestigationDocument> =>
    api.get(`/documents/${documentId}`).then(res => res.data),
  createDocument: (data: Partial<InvestigationDocument>) =>
    api.post<InvestigationDocument>('/documents', data).then(res => res.data),
  updateDocument: (documentId: string, data: Partial<InvestigationDocument>) =>
    api.put<InvestigationDocument>(`/documents/${documentId}`, data).then(res => res.data),
  deleteDocument: (documentId: string) =>
    api.delete(`/documents/${documentId}`).then(res => res.data),

  // Unified Search
  unifiedSearch: (q: string, category: string = 'all', caseId?: string): Promise<UnifiedSearchResponse> =>
    api.get('/search', { params: { q, category, case_id: caseId } }).then(res => res.data),

  // Relationship Graph
  getRelationships: (entityType: string, entityId: string): Promise<RelationshipGraphResponse> =>
    api.get(`/relationships/${entityType}/${entityId}`).then(res => res.data),

  // Analytics
  getAnalytics: () => api.get('/analytics').then(res => res.data),

  // DBMS Concepts Demonstration
  getDemoQueries: () => api.get('/dbms-concepts/queries').then(res => res.data),
  executeConceptQuery: (queryId: string) =>
    api.post(`/dbms-concepts/execute/${queryId}`).then(res => res.data)
};
