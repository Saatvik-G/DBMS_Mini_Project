export interface Officer {
  officer_id: string;
  full_name: string;
  badge_number: string;
  department: string;
  contact_email: string;
  role: string;
  account_status: string;
  created_at?: string;
  updated_at?: string;
}

export interface Case {
  case_id: string;
  title: string;
  description: string;
  case_type: string;
  status: 'Open' | 'Under Investigation' | 'On Hold' | 'Closed';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  lead_officer_id?: string;
  lead_officer_name?: string;
  incident_date?: string;
  created_at?: string;
  updated_at?: string;
  evidence_count?: number;
  people_count?: number;
}

export interface Person {
  person_id: string;
  full_name: string;
  date_of_birth?: string;
  contact_details?: string;
  address?: string;
  category: 'Witness' | 'Reporting Party' | 'Subject' | 'Other';
  description?: string;
  created_at?: string;
  updated_at?: string;
  linked_cases_count?: number;
}

export interface Organization {
  organization_id: string;
  name: string;
  organization_type: string;
  address?: string;
  contact_details?: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Vehicle {
  vehicle_id: string;
  registration_number: string;
  make: string;
  model: string;
  color: string;
  vehicle_type: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Device {
  device_id: string;
  device_type: string;
  manufacturer: string;
  model: string;
  serial_number: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Location {
  location_id: string;
  name: string;
  address: string;
  location_type: string;
  latitude?: number;
  longitude?: number;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface EvidenceCustody {
  custody_event_id: number;
  evidence_id: string;
  officer_id: string;
  officer_name?: string;
  event_type: string;
  event_timestamp: string;
  notes?: string;
}

export interface Evidence {
  evidence_id: string;
  title: string;
  evidence_type: string;
  description: string;
  case_id: string;
  case_title?: string;
  collected_by_officer_id?: string;
  collected_by_name?: string;
  storage_reference: string;
  status: string;
  notes?: string;
  collection_date?: string;
  created_at?: string;
  updated_at?: string;
  custody_history?: EvidenceCustody[];
}

export interface CaseActivity {
  activity_id: number;
  case_id: string;
  officer_id?: string;
  officer_name?: string;
  activity_type: string;
  title: string;
  description: string;
  activity_timestamp: string;
}

export interface InvestigationDocument {
  id: string;
  document_type: string;
  title: string;
  content: string;
  summary: string;
  source_type: string;
  source_name: string;
  case_id?: string;
  related_entity_ids: Array<{ entity_type: string; entity_id: string; note?: string; resolved_name?: string }>;
  tags: string[];
  metadata: Record<string, any>;
  file_name?: string;
  mime_type?: string;
  language?: string;
  document_status: string;
  created_at?: string;
  ingested_at?: string;
  case_detail?: { case_id: string; title: string; status: string; priority: string };
  resolved_entities?: Array<{ entity_type: string; entity_id: string; resolved_name: string; note?: string }>;
}

export interface SearchResultItem {
  source_db: string;
  category: string;
  id: string;
  title: string;
  subtitle?: string;
  snippet?: string;
  case_id?: string;
  tags?: string[];
  matched_field?: string;
  url: string;
}

export interface UnifiedSearchResponse {
  query: string;
  total_sql_results: number;
  total_mongo_results: number;
  sql_results: SearchResultItem[];
  mongo_results: SearchResultItem[];
}

export interface TimelineEvent {
  id: string;
  timestamp?: string;
  timestamp_str: string;
  date_type: string;
  category: string;
  title: string;
  description: string;
  source_record_id: string;
  source_type: string;
  officer_name?: string;
  badge_label?: string;
}

export interface GraphNode {
  id: string;
  label: string;
  entity_type: string;
  sublabel?: string;
  details?: Record<string, any>;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  label: string;
  relationship_type: string;
}

export interface RelationshipGraphResponse {
  root_entity: { id: string; label: string; type: string };
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface DashboardStats {
  total_cases: number;
  open_cases: number;
  under_investigation_cases: number;
  closed_cases: number;
  total_people: number;
  total_organizations: number;
  total_vehicles: number;
  total_devices: number;
  total_locations: number;
  total_evidence: number;
  total_documents: number;
  total_officers: number;
  sql_engine: string;
  mongo_status: string;
  recent_cases: Case[];
  recent_documents: InvestigationDocument[];
  case_status_distribution: Array<{ status: string; count: number }>;
  case_priority_distribution: Array<{ priority: string; count: number }>;
  recent_activities: CaseActivity[];
}
